// apps/web/app/components/editor/ContentEditor.tsx
'use-client';

import { useState } from 'react';
import {
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Tabs,
  ActionIcon,
  TextInputProps,
  rem,
} from '@mantine/core';
import { ItemType } from '@prisma/client';
import { EditorItemState, EditorTab } from '@/lib/definitions';
import { IconPlus, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { nanoid } from 'nanoid';
import { TabEditor } from './TabEditor';
// import { EventDetailsForm } from './EventDetailsForm'; // We will create this next

interface ContentEditorProps {
  schoolSlug: string;
  initialData: EditorItemState | null; // Null for new, data for editing
}

// Helper for default tab
const createDefaultTab = (): EditorTab => ({
  id: nanoid(10),
  title: 'Principal',
  order: 1,
  sections: [],
});

export function ContentEditor({
  schoolSlug,
  initialData,
}: ContentEditorProps) {
  // --- STATE ---
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('0'); // Index as string

  const [itemState, setItemState] = useState<EditorItemState>(
    initialData || {
      title: '',
      type: 'NOTICE',
      tabs: [createDefaultTab()],
      eventDetails: {
        startAt: null,
        endAt: null,
        venue: '',
      },
    }
  );

  // --- HANDLERS ---
  const handleStateChange = (field: keyof EditorItemState, value: any) => {
    setItemState((prev) => ({ ...prev, [field]: value }));
  };

  const handleTabTitleChange = (index: number, newTitle: string) => {
    const newTabs = [...itemState.tabs];
    newTabs[index].title = newTitle;
    handleStateChange('tabs', newTabs);
  };

  const addTab = () => {
    const newTab: EditorTab = {
      id: nanoid(10),
      title: `Nova Aba ${itemState.tabs.length + 1}`,
      order: itemState.tabs.length + 1,
      sections: [],
    };
    handleStateChange('tabs', [...itemState.tabs, newTab]);
    setActiveTab(String(itemState.tabs.length)); // Switch to new tab
  };

  const removeTab = (index: number) => {
    if (itemState.tabs.length <= 1) {
      notifications.show({
        color: 'red',
        title: 'Ação Inválida',
        message: 'O item deve ter pelo menos uma aba.',
      });
      return;
    }
    const newTabs = itemState.tabs.filter((_, i) => i !== index);
    // Re-order
    const reorderedTabs = newTabs.map((tab, i) => ({ ...tab, order: i + 1 }));
    handleStateChange('tabs', reorderedTabs);
    setActiveTab('0'); // Reset to first tab
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    console.log('Saving draft...', itemState);
    // TODO: Call Server Action: saveItem(schoolSlug, itemState, 'DRAFT')
    await new Promise((r) => setTimeout(r, 1000)); // Simulate API call
    notifications.show({
      title: 'Rascunho Salvo',
      message: 'Seu item foi salvo como rascunho.',
      color: 'blue',
    });
    setIsSaving(false);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    console.log('Publishing...', itemState);
    // TODO: Call Server Action: saveItem(schoolSlug, itemState, 'PUBLISHED')
    await new Promise((r) => setTimeout(r, 1000)); // Simulate API call
    notifications.show({
      title: 'Item Publicado',
      message: 'Seu item está agora disponível publicamente.',
      color: 'green',
    });
    setIsPublishing(false);
    // TODO: Redirect to dashboard or show QR code modal
  };

  // --- RENDER ---
  const tabTitleEditor = (
    index: number,
    props: TextInputProps & { value: string }
  ) => (
    <TextInput
      {...props}
      variant="unstyled"
      onChange={(e) => handleTabTitleChange(index, e.currentTarget.value)}
      rightSection={
        itemState.tabs.length > 1 ? (
          <ActionIcon
            size="xs"
            variant="transparent"
            onClick={() => removeTab(index)}
          >
            <IconX style={{ width: rem(12), height: rem(12) }} />
          </ActionIcon>
        ) : null
      }
    />
  );

  return (
    <Stack gap="lg">
      <Group grow>
        <TextInput
          label="Título Principal"
          placeholder="Ex: Reunião de Pais - 1º Bimestre"
          required
          value={itemState.title}
          onChange={(e) => handleStateChange('title', e.currentTarget.value)}
        />
        <Select
          label="Tipo de Item"
          required
          value={itemState.type}
          onChange={(value) => handleStateChange('type', value || 'NOTICE')}
          data={[
            { value: 'NOTICE', label: 'Aviso' },
            { value: 'EVENT', label: 'Evento' },
            { value: 'FORM', label: 'Formulário' },
            { value: 'CHOICE', label: 'Enquete' },
            // Add other types as needed
          ]}
        />
      </Group>

      {/* TODO: Implement EventDetailsForm 
      {itemState.type === 'EVENT' && (
        <EventDetailsForm 
          details={itemState.eventDetails}
          onChange={(newDetails) => handleStateChange('eventDetails', newDetails)}
        />
      )}
      */}

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="outline"
        mt="md"
      >
        <Tabs.List>
          {itemState.tabs
            .sort((a, b) => a.order - b.order)
            .map((tab, index) => (
              <Tabs.Tab key={tab.id} value={String(index)}>
                {tabTitleEditor(index, { value: tab.title })}
              </Tabs.Tab>
            ))}
          <Tabs.Tab
            value="add"
            onClick={addTab}
            leftSection={<IconPlus size={14} />}
          >
            Nova Aba
          </Tabs.Tab>
        </Tabs.List>

        {itemState.tabs
          .sort((a, b) => a.order - b.order)
          .map((tab, index) => (
            <Tabs.Panel key={tab.id} value={String(index)} pt="md">
              <TabEditor
                tab={tab}
                onChange={(newSections) => {
                  const newTabs = [...itemState.tabs];
                  newTabs[index].sections = newSections;
                  handleStateChange('tabs', newTabs);
                }}
              />
            </Tabs.Panel>
          ))}
      </Tabs>

      <Group justify="flex-end" mt="lg">
        <Button
          variant="default"
          onClick={handleSaveDraft}
          loading={isSaving}
          disabled={isPublishing}
        >
          Salvar Rascunho
        </Button>
        <Button
          onClick={handlePublish}
          loading={isPublishing}
          disabled={isSaving}
          color="green"
        >
          Publicar Item
        </Button>
      </Group>
    </Stack>
  );
}
