// apps/web/app/components/editor/sections/QuoteSectionEditor.tsx
'use client';

import { TextInput, Textarea, Stack } from '@mantine/core';
import { ContentSection } from '@/lib/definitions';

interface QuoteSectionEditorProps {
  section: ContentSection & { kind: 'quote' };
  onChange: (content: ContentSection['content']) => void;
}

export function QuoteSectionEditor({
  section,
  onChange,
}: QuoteSectionEditorProps) {
  return (
    <Stack>
      <Textarea
        placeholder="Digite a citação"
        value={section.content.text}
        onChange={(e) =>
          onChange({ ...section.content, text: e.currentTarget.value })
        }
        autosize
        minRows={2}
      />
      <TextInput
        placeholder="Autor ou fonte (opcional)"
        value={section.content.caption}
        onChange={(e) =>
          onChange({ ...section.content, caption: e.currentTarget.value })
        }
      />
    </Stack>
  );
}