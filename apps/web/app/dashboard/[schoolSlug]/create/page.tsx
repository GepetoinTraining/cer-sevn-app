// apps/web/dashboard/[schoolSlug]/create/page.tsx

import { Container, Title, Paper } from '@mantine/core';
import { ContentEditor } from '@/components/editor/ContentEditor';

// This page is protected by middleware.ts, so we are guaranteed
// to have an authenticated user.

export default function CreateItemPage({
  params,
}: {
  params: { schoolSlug: string };
}) {
  return (
    <Container size="lg" my="md">
      <Paper shadow="sm" p="lg" withBorder>
        <Title order={2} mb="lg">
          Criar Novo Item
        </Title>
        <ContentEditor
          schoolSlug={params.schoolSlug}
          initialData={null} // Pass null for a new item
        />
      </Paper>
    </Container>
  );
}