// apps/web/app/actions/upload.ts
'use server';

import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// Define schema for validation
const UploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'O arquivo não pode estar vazio.')
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB limit
      'O arquivo deve ter no máximo 5MB.'
    )
    .refine(
      (file) =>
        ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
          file.type
        ),
      'Formato de arquivo inválido. Use JPG, PNG, WEBP ou GIF.'
    ),
  schoolSlug: z.string().min(1, 'School slug is required.'),
});

export type UploadState = {
  success: boolean;
  error?: string;
  url?: string;
};

export async function uploadImage(
  prevState: UploadState,
  formData: FormData
): Promise<UploadState> {
  // 1. Validate FormData
  const validatedFields = UploadSchema.safeParse({
    file: formData.get('file'),
    schoolSlug: formData.get('schoolSlug'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors.file?.[0],
    };
  }

  const { file, schoolSlug } = validatedFields.data;

  // 2. Generate a unique filename
  const fileExtension = file.name.split('.').pop();
  const uniqueFilename = `${nanoid(10)}.${fileExtension}`;
  const blobPath = `${schoolSlug}/uploads/images/${uniqueFilename}`;

  try {
    // 3. Upload to Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public', // Make the image publicly accessible
    });

    // 4. Return success state with the new URL
    return {
      success: true,
      url: blob.url,
    };
  } catch (error) {
    console.error('Erro no upload para o Vercel Blob:', error);
    return {
      success: false,
      error: 'Ocorreu um erro no servidor. Tente novamente.',
    };
  }
}
