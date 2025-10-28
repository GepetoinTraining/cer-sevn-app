// apps/web/app/components/editor/SectionPicker.tsx
'use client';

import { Button, Group, Tooltip } from '@mantine/core';
import {
  IconPlus,
  IconLetterCase,
  IconQuote,
  IconPhoto,
  IconH1,
} from '@tabler/icons-react';
import { ContentSection, SectionKind } from '@/lib/definitions';
import { nanoid } from 'nanoid';

interface SectionPickerProps {
  onAddSection: (section: ContentSection) => void;
}

// Factory function to create new, empty sections
const createNewSection = (kind: SectionKind): ContentSection => {
  const id = nanoid(10);
  switch (kind) {
    case 'text':
      return { id, kind: 'text', content: { text: '' } };
    case 'header':
      return { id, kind: 'header', content: { text: '', level: 2 } };
    case 'quote':
      return { id, kind: 'quote', content: { text: '', caption: '' } };
    case 'image':
      return { id, kind: 'image', content: { src: '', caption: '' } };
    default:
      // Fallback, though this shouldn't be reachable with correct types
      return { id, kind: 'text', content: { text: '' } };
  }
};

export function SectionPicker({ onAddSection }: SectionPickerProps) {
  const handleAdd = (kind: SectionKind) => {
    onAddSection(createNewSection(kind));
  };

  return (
    <Group justify="center" my="md">
      <Tooltip label="Adicionar Texto">
        <Button
          leftSection={<IconLetterCase size={14} />}
          variant="default"
          onClick={() => handleAdd('text')}
        >
          Texto
        </Button>
      </Tooltip>
      <Tooltip label="Adicionar Título">
        <Button
          leftSection={<IconH1 size={14} />}
          variant="default"
          onClick={() => handleAdd('header')}
        >
          Título
        </Button>
      </Tooltip>
      <Tooltip label="Adicionar Citação">
        <Button
          leftSection={<IconQuote size={14} />}
          variant="default"
          onClick={() => handleAdd('quote')}
        >
          Citação
        </Button>
      </Tooltip>
      <Tooltip label="Adicionar Imagem">
        <Button
          leftSection={<IconPhoto size={14} />}
          variant="default"
          onClick={() => handleAdd('image')}
        >
          Imagem
        </Button>
      </Tooltip>
    </Group>
  );
}