// apps/web/app/components/editor/sections/TextSectionEditor.tsx
'use client';

import { Textarea } from '@mantine/core';
import { ContentSection } from '@/lib/definitions';

interface TextSectionEditorProps {
  section: ContentSection & { kind: 'text' };
  onChange: (content: ContentSection['content']) => void;
}

export function TextSectionEditor({
  section,
  onChange,
}: TextSectionEditorProps) {
  return (
    <Textarea
      placeholder="Digite seu texto aqui..."
      value={section.content.text}
      onChange={(e) => onChange({ text: e.currentTarget.value })}
      autosize
      minRows={3}
    />
  );
}