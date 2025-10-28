'use client'; // This page needs client-side interaction for the form

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // For redirection
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Alert,
  Grid,
} from '@mantine/core'; // Core Mantine components
import { IconAlertCircle } from '@tabler/icons-react'; // Icon for alerts

// Basic styling for the split background - you might want to refine this
// ... (styling constants remain the same)

export default function PinLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Make API call to FastAPI backend
      const response = await fetch('/api/python/auth/login', { // Note the /api/python prefix from vercel.json
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Falha no login. Verifique o PIN.');
      }

      // On successful login, the API should set an httpOnly cookie.
      // We just need to redirect based on the response.
      // Assuming API returns { schoolSlug: 'knn' | 'phenom' }
      if (data.schoolSlug) {
        router.push(`/dashboard/${data.schoolSlug}/items`); // Redirect to dashboard
      } else {
        // Fallback if schoolSlug is missing, though API should always return it
        router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Basic split layout - adjust styling as needed
    <Grid gutter={0} style={{ minHeight: '100vh' }}>
        <Grid.Col span={6} style={{ background: '#e0f2fe' }}>
            {/* KNN Side - maybe add logo/branding */}
        </Grid.Col>
        <Grid.Col span={6} style={{ background: '#fef9c3' }}>
            {/* Phenom Side - maybe add logo/branding */}
        </Grid.Col>

        {/* Centered Login Form */}
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: '420px',
        }}>
            <Container size={420} my={40}>
                <Paper withBorder shadow="md" p={30} radius="md">
                    <Title ta="center" order={2} mb="md">
                        Acesso Restrito
                    </Title>
                    <Text c="dimmed" size="sm" ta="center" mb={20}>
                        Digite seu PIN para continuar
                    </Text>

                    {error && (
                        <Alert
                            icon={<IconAlertCircle size="1rem" />}
                            title="Erro de Login"
                            color="red"
                            withCloseButton
                            onClose={() => setError(null)}
                            mb="md"
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextInput
                            label="PIN"
                            placeholder="Seu PIN de acesso"
                            required
                            type="password" // Use password type to mask input
                            value={pin}
                            onChange={(event) => setPin(event.currentTarget.value)}
                            mb="md"
                        />
                        <Button type="submit" fullWidth loading={isLoading}>
                            Entrar
                        </Button>
                    </form>
                </Paper>
            </Container>
        </div>
    </Grid>
  );
}

