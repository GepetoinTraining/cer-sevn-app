// apps/web/app/lib/schemas.ts
import { z } from 'zod';
import { ItemType, ItemStatus } from '@prisma/client';

// Schemas for individual sections, matching definitions.ts
const TextContentSchema = z.object({
  text: z.string().min(1, 'O texto não pode estar vazio.'),
});

const HeaderContentSchema = z.object({
  text: z.string().min(1, 'O título não pode estar vazio.'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

const QuoteContentSchema = z.object({
  text: z.string().min(1, 'A citação não pode estar vazia.'),
  caption: z.string().optional(),
});

const ImageContentSchema = z.object({
  src: z.string().url('URL da imagem inválida.'),
  caption: z.string().optional(),
});

// Zod schema for the discriminated union
const ContentSectionSchema = z.discriminatedUnion('kind', [
  z.object({
    id: z.string(),
    kind: z.literal('text'),
    content: TextContentSchema,
  }),
  z.object({
    id: z.string(),
    kind: z.literal('header'),
    content: HeaderContentSchema,
  }),
  z.object({
    id: z.string(),
    kind: z.literal('quote'),
    content: QuoteContentSchema,
  }),
  z.object({
    id: z.string(),
    kind: z.literal('image'),
    content: ImageContentSchema,
  }),
]);

// Schema for a single Tab
const EditorTabSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'O título da aba é obrigatório.'),
  order: z.number(),
  sections: z.array(ContentSectionSchema),
});

// Schema for Event Details (if applicable)
const EventDetailsSchema = z.object({
  startAt: z.coerce.date({ required_error: 'Data de início é obrigatória.' }),
  endAt: z.coerce.date().nullable(),
  venue: z.string().optional(),
});

// Main schema for the entire item state
export const SaveItemSchema = z.object({
  itemId: z.string().cuid().nullable(), // CUID if editing, null if new
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres.'),
  type: z.nativeEnum(ItemType),
  status: z.nativeEnum(ItemStatus), // 'DRAFT' or 'PUBLISHED'
  tabs: z.array(EditorTabSchema).min(1, 'O item deve ter pelo menos uma aba.'),
  eventDetails: EventDetailsSchema.optional(),
});
