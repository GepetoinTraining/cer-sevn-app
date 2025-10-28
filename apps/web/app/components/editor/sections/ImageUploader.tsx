// apps/web/app/components/editor/sections/ImageUploader.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import {
  Box,
  Button,
  Center,
  Group,
  Image,
  Loader,
  Stack,
  Text,
  FileButton,
} from '@mantine/core';
import { IconUpload, IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { uploadImage, UploadState } from '@/actions/upload';

interface ImageUploaderProps {
  currentSrc: string | null;
  schoolSlug: string;
  onUploadComplete: (url: string) => void;
}

const initialState: UploadState = {
  success: false,
};

export function ImageUploader({
  currentSrc,
  schoolSlug,
  onUploadComplete,
}: ImageUploaderProps) {
  const [formState, formAction] = useFormState(uploadImage, initialState);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentSrc);
  const [isPending, setIsPending] = useState(false);

  const fileInputRef = useRef<HTMLFormElement>(null);

  // Handle file selection
  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      // Automatically submit the form when a file is selected
      // We wrap this in a timeout to ensure state has updated
      setTimeout(() => {
        fileInputRef.current?.requestSubmit();
        setIsPending(true);
      }, 0);
    }
  };

  // Handle Server Action response
  useEffect(() => {
    if (!isPending) return; // Only react after a submission

    setIsPending(false); // Submission finished

    if (formState.success && formState.url) {
      notifications.show({
        title: 'Upload Concluído',
        message: 'Sua imagem foi enviada com sucesso.',
        color: 'green',
        icon: <IconCheck />,
      });
      onUploadComplete(formState.url); // Pass URL up to the editor
      setPreviewUrl(formState.url); // Update preview to permanent URL
      setFile(null); // Clear file input
    } else if (formState.error) {
      notifications.show({
        title: 'Erro no Upload',
        message: formState.error,
        color: 'red',
        icon: <IconX />,
      });
      // Revert preview if it wasn't a permanent URL
      setPreviewUrl(currentSrc);
      setFile(null);
    }
  }, [formState]); // Dependency on formState

  return (
    <Box>
      <form ref={fileInputRef} action={formAction}>
        {/* Hidden inputs for the action */}
        <input type="hidden" name="schoolSlug" value={schoolSlug} />
        {file && <input type="hidden" name="file" value={file as any} />}

        <Center
          style={{
            minHeight: 200,
            border: '2px dashed var(--mantine-color-gray-3)',
            borderRadius: 'var(--mantine-radius-md)',
            padding: 'var(--mantine-spacing-md)',
          }}
        >
          {isPending ? (
            <Stack align="center" gap="sm">
              <Loader />
              <Text size="sm" c="dimmed">
                Enviando...
              </Text>
            </Stack>
          ) : previewUrl ? (
            <Image
              src={previewUrl}
              alt="Pré-visualização da imagem"
              mah={300}
              w="auto"
              fit="contain"
              radius="sm"
            />
          ) : (
            <Text size="sm" c="dimmed">
              Arraste uma imagem ou clique para selecionar
            </Text>
          )}
        </Center>
      </form>

      <Group justify="center" mt="md">
        <FileButton onChange={handleFileChange} accept="image/*">
          {(props) => (
            <Button
              {...props}
              variant="default"
              leftSection={<IconUpload size={14} />}
              disabled={isPending}
            >
              {previewUrl ? 'Trocar Imagem' : 'Selecionar Imagem'}
            </Button>
          )}
        </FileButton>
      </Group>
    </Box>
  );
}
