// apps/web/app/components/editor/sections/HeaderSectionEditor.tsx
'use client';

import { TextInput, Select, Group } from '@mantine/core';
import { ContentSection } from '@/lib/definitions';

interface HeaderSectionEditorProps {
  section: ContentSection & { kind: 'header' };
  onChange: (content: ContentSection['content']) => void;
}

export function HeaderSectionEditor({
  section,
  onChange,
}: HeaderSectionEditorProps) {
  return (
    <Group grow>
      <TextInput
        placeholder="Digite o título"
        value={section.content.text}
        onChange={(e) =>
          onChange({ ...section.content, text: e.currentTarget.value })
        }
        style={{ flex: 3 }}
      />
      <Select
        value={String(section.content.level)}
        onChange={(value) =>
          onChange({
            ...section.content,
            level: (value ? parseInt(value, 10) : 2) as 1 | 2 | 3,
          })
        }
        data={[
          { value: '1', label: 'Grande (H1)' },
          { value: '2', label: 'Médio (H2)' },
          { value: '3', label: 'Pequeno (H3)' },
        ]}
        style={{ flex: 1 }}
      />
    </Group>
  );
}