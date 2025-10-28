// apps/web/app/lib/utils.ts
import { nanoid } from 'nanoid';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export async function createUniqueSlug(title: string, orgId: string) {
  const baseSlug = slugify(title);
  let uniqueSlug = baseSlug;
  let attempts = 0;

  // Check if slug already exists for this organization
  while (
    await prisma.item.findFirst({
      where: { slug: uniqueSlug, orgId: orgId },
      select: { id: true },
    })
  ) {
    attempts++;
    uniqueSlug = `${baseSlug}-${nanoid(5)}`;
  }

  return uniqueSlug;
}
