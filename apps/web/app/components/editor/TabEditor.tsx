// apps/web/app/components/editor/TabEditor.tsx
'use client';

import {
  ActionIcon,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
  Center,
} from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { ContentSection, EditorTab } from '@/lib/definitions';
import { SectionPicker } from './SectionPicker';
import { TextSectionEditor } from './sections/TextSectionEditor';
import { HeaderSectionEditor } from './sections/HeaderSectionEditor';
import { QuoteSectionEditor } from './sections/QuoteSectionEditor';
import { ImageSectionEditor } from './sections/ImageSectionEditor';
// TODO: Add Drag and Drop context (e.g., dnd-kit)

interface TabEditorProps {
  tab: EditorTab;
  onChange: (sections: ContentSection[]) => void;
  schoolSlug: string; // <-- Add schoolSlug prop
}

export function TabEditor({ tab, onChange, schoolSlug }: TabEditorProps) {
  // <-- Receive schoolSlug

  const handleAddSection = (section: ContentSection) => {
    onChange([...tab.sections, section]);
  };

  const handleRemoveSection = (sectionId: string) => {
    onChange(tab.sections.filter((s) => s.id !== sectionId));
  };

  const handleSectionChange = (
    sectionId: string,
    newContent: ContentSection['content']
  ) => {
    onChange(
      tab.sections.map((s) =>
        s.id === sectionId ? { ...s, content: newContent } : s
      )
    );
  };

  const renderSectionEditor = (section: ContentSection) => {
    switch (section.kind) {
      case 'text':
        return (
          <TextSectionEditor
            section={section}
            onChange={(content) => handleSectionChange(section.id, content)}
          />
        );
      case 'header':
        return (
          <HeaderSectionEditor
            section={section}
            onChange={(content) => handleSectionChange(section.id, content)}
          />
        );
      case 'quote':
        return (
          <QuoteSectionEditor
            section={section}
            onChange={(content) => handleSectionChange(section.id, content)}
          />
        );
      case 'image':
        return (
          <ImageSectionEditor
            section={section}
            onChange={(content) => handleSectionChange(section.id, content)}
            schoolSlug={schoolSlug} // <-- Pass schoolSlug down
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Stack gap="md">
        {tab.sections.length === 0 && (
          <Paper withBorder p="xl" radius="md" style={{ minHeight: 200 }}>
            <Center>
              <Text c="dimmed">
                Esta aba está vazia. Comece adicionando um bloco de conteúdo.
              </Text>
            </Center>
          </Paper>
        )}

        {/* TODO: Wrap this in a drag-and-drop list */}
        {tab.sections.map((section) => (
          <Paper shadow="xs" p="md" withBorder key={section.id}>
            <Group gap="xs" align="flex-start">
              {/* Drag Handle Placeholder */}
              <ActionIcon
                variant="transparent"
                c="dimmed"
                style={{ cursor: 'grab' }}
              >
                <IconGripVertical size={18} />
              </ActionIcon>

              <Box style={{ flex: 1 }}>{renderSectionEditor(section)}</Box>

              <Tooltip label="Remover Bloco">
                <ActionIcon
                  variant="transparent"
                  color="red"
                  onClick={() => handleRemoveSection(section.id)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Paper>
        ))}
      </Stack>

      <SectionPicker onAddSection={handleAddSection} />
    </Box>
  );
}

