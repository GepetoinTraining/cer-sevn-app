// apps/web/app/actions/items.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getUserSession } from '../lib/session';
import { SaveItemSchema } from '../lib/schemas';
import { createUniqueSlug } from '../lib/utils';
import { prisma, ItemStatus } from '../lib/prisma';

export type SaveItemState = {
  success: boolean;
  error?: string;
  itemId?: string;
  slug?: string | null;
};

// We receive the raw state, not FormData
export async function saveItem(
  prevState: SaveItemState,
  data: z.infer<typeof SaveItemSchema>
): Promise<SaveItemState> {
  try {
    // 1. Get User Session (AuthN/AuthZ)
    const session = await getUserSession();
    // TODO: Add fine-grained role checks (e.g., Jr. can only save DRAFT)

    // 2. Validate Input
    const validatedData = SaveItemSchema.safeParse(data);
    if (!validatedData.success) {
      console.error(validatedData.error.flatten().fieldErrors);
      return {
        success: false,
        error: 'Dados inválidos. Verifique os campos.',
      };
    }

    const { itemId, title, type, status, tabs, eventDetails } =
      validatedData.data;

    let slug: string | null = null;

    // 3. Prepare Item Data
    const itemData = {
      title,
      type,
      status,
      orgId: session.organizationId,
      sectorId: session.sectorId,
      // createdById: session.userId, // Uncomment when relations are added
    };

    // 4. Handle Publishing (Slug generation)
    if (status === ItemStatus.PUBLISHED) {
      const existingItem = itemId
        ? await prisma.item.findUnique({
            where: { id: itemId },
            select: { slug: true },
          })
        : null;

      // Only generate a new slug if it's not already published
      if (!existingItem?.slug) {
        slug = await createUniqueSlug(title, session.organizationId);
      } else {
        slug = existingItem.slug;
      }
    }

    // 5. Execute Database Transaction
    let savedItem;
    if (itemId) {
      // --- UPDATE EXISTING ITEM ---
      savedItem = await prisma.$transaction(async (tx) => {
        // 5a. Update the main Item
        const updatedItem = await tx.item.update({
          where: { id: itemId, orgId: session.organizationId },
          data: {
            ...itemData,
            slug, // Add/update slug if publishing
          },
        });

        // 5b. Replace Tabs (Delete all existing, create new)
        await tx.tab.deleteMany({ where: { itemId: updatedItem.id } });
        await tx.tab.createMany({
          data: tabs.map((tab) => ({
            title: tab.title,
            order: tab.order,
            sections: tab.sections as any, // Cast as 'any' for Prisma JSON
            itemId: updatedItem.id,
          })),
        });

        // 5c. Handle Event (if applicable)
        if (type === 'EVENT' && eventDetails) {
          await tx.event.upsert({
            where: { itemId: updatedItem.id },
            create: {
              startAt: eventDetails.startAt,
              endAt: eventDetails.endAt,
              venue: eventDetails.venue,
              itemId: updatedItem.id,
              orgId: session.organizationId,
            },
            update: {
              startAt: eventDetails.startAt,
              endAt: eventDetails.endAt,
              venue: eventDetails.venue,
            },
          });
        }
        return updatedItem;
      });
    } else {
      // --- CREATE NEW ITEM ---
      savedItem = await prisma.$transaction(async (tx) => {
        // 5a. Create the main Item
        const newItem = await tx.item.create({
          data: {
            ...itemData,
            slug, // Add slug if publishing
          },
        });

        // 5b. Create the Tabs
        await tx.tab.createMany({
          data: tabs.map((tab) => ({
            title: tab.title,
            order: tab.order,
            sections: tab.sections as any, // Cast as 'any' for Prisma JSON
            itemId: newItem.id,
          })),
        });

        // 5c. Handle Event (if applicable)
        if (type === 'EVENT' && eventDetails) {
          await tx.event.create({
            data: {
              startAt: eventDetails.startAt,
              endAt: eventDetails.endAt,
              venue: eventDetails.venue,
              itemId: newItem.id,
              orgId: session.organizationId,
            },
          });
        }
        return newItem;
      });
    }

    // 6. Revalidate Paths & Return Success
    revalidatePath('/dashboard/[schoolSlug]', 'layout'); // Revalidate dashboard
    if (slug) {
      revalidatePath(`/p/${slug}`); // Revalidate public page
    }

    return {
      success: true,
      itemId: savedItem.id,
      slug: savedItem.slug,
    };
  } catch (error) {
    console.error('Falha ao salvar item:', error);
    // Check for specific errors if needed
    if (error instanceof Error && error.message.includes('autenticado')) {
      return { success: false, error: 'Sessão inválida. Faça login novamente.' };
    }
    return { success: false, error: 'Erro no servidor. Tente novamente.' };
  }
}
