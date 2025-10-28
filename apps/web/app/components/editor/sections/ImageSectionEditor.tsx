// apps/web/app/components/editor/sections/ImageSectionEditor.tsx
'use client';

import { TextInput, Stack } from '@mantine/core';
import { ContentSection } from '@/lib/definitions';
import { ImageUploader } from './ImageUploader'; // <-- Import new component

interface ImageSectionEditorProps {
  section: ContentSection & { kind: 'image' };
  onChange: (content: ContentSection['content']) => void;
  // We need the schoolSlug for the uploader
  schoolSlug: string; 
}

export function ImageSectionEditor({
  section,
  onChange,
  schoolSlug, // <-- Receive schoolSlug
}: ImageSectionEditorProps) {
  const handleUploadComplete = (url: string) => {
    onChange({ ...section.content, src: url });
  };

  return (
    <Stack>
      {/* Replace Paper/Placeholder with ImageUploader */}
      <ImageUploader
        currentSrc={section.content.src || null}
        schoolSlug={schoolSlug} // <-- Pass to uploader
        onUploadComplete={handleUploadComplete}
      />

      <TextInput
        placeholder="Legenda da imagem (opcional)"
        value={section.content.caption}
        onChange={(e) =>
          onChange({ ...section.content, caption: e.currentTarget.value })
        }
      />
    </Stack>
  );
}
