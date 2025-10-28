'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Container,
    Paper,
    TextInput,
    PasswordInput,
    Select,
    Button,
    Group,
    Title,
    Notification,
    LoadingOverlay,
    Stack,
    SegmentedControl // Note: SegmentedControl was imported but not used, kept for potential future use
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

// Assuming these types might eventually live in a shared package
type SchoolSlug = 'knn' | 'phenom';
type SectorKey = 'comercial' | 'pedagogico' | 'administrativo' | 'marketing';
type RoleKey = 'jr' | 'sr' | 'lider' | 'diretor'; // Using 'diretor' for Franqueado/Diretor

export default function CreateUserPage() {
    const router = useRouter();
    const params = useParams();
    const schoolSlug = params.schoolSlug as SchoolSlug;

    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [sector, setSector] = useState<SectorKey | ''>('');
    const [role, setRole] = useState<RoleKey | ''>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        if (!name || !pin || !sector || !role) {
            setError('Todos os campos são obrigatórios.');
            setLoading(false);
            return;
        }

        if (pin.length < 4) { // Example validation
             setError('O PIN deve ter pelo menos 4 dígitos.');
             setLoading(false);
             return;
         }

        try {
            const response = await fetch('/api/python/users/create', { // Calling our new API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // TODO: Include auth token if needed for the create endpoint itself
                },
                body: JSON.stringify({
                    name,
                    pin, // Sending plain PIN to backend for hashing
                    schoolSlug,
                    sectorKey: sector,
                    roleKey: role,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'Falha ao criar usuário');
            }

            // Redirect to a user list page or show success message
            // TODO: Create the user list page later
            alert('Usuário criado com sucesso!'); // Temporary success feedback
            // router.push(`/dashboard/${schoolSlug}/users`); // Assuming a user list page exists

        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="sm" pt="xl">
            <Title order={2} ta="center" mb="lg">
                Criar Novo Usuário ({schoolSlug.toUpperCase()})
            </Title>
            <Paper withBorder shadow="md" p="lg" radius="md" pos="relative"> {/* Added pos="relative" for LoadingOverlay */}
                <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />
                <form onSubmit={handleSubmit}>
                    <Stack>
                        {error && (
                            <Notification icon={<IconAlertCircle size="1.1rem" />} color="red" title="Erro" withCloseButton onClose={() => setError(null)}>
                                {error}
                            </Notification>
                        )}

                        <TextInput
                            label="Nome"
                            placeholder="Nome completo do funcionário"
                            value={name}
                            onChange={(event) => setName(event.currentTarget.value)}
                            required
                            disabled={loading} // Disable fields while loading
                        />

                        <PasswordInput
                            label="PIN (mínimo 4 dígitos)"
                            placeholder="PIN numérico"
                            value={pin}
                            onChange={(event) => setPin(event.currentTarget.value)}
                            required
                            type="password" // Use password type for masking
                            inputMode="numeric" // Helps mobile users get numeric keypad
                            pattern="\d*" // Allow only digits
                            disabled={loading}
                        />

                         <Select
                             label="Setor"
                             placeholder="Selecione o setor"
                             value={sector}
                             onChange={(value) => setSector(value as SectorKey | '')}
                             data={[
                                 { value: 'comercial', label: 'Comercial' },
                                 { value: 'pedagogico', label: 'Pedagógico' },
                                 { value: 'administrativo', label: 'Administrativo' },
                                 { value: 'marketing', label: 'Marketing' },
                             ]}
                             required
                             disabled={loading}
                         />

                        <Select
                            label="Cargo (Role)"
                            placeholder="Selecione o cargo"
                            value={role}
                            onChange={(value) => setRole(value as RoleKey | '')}
                            data={[
                                { value: 'jr', label: 'Jr.' },
                                { value: 'sr', label: 'Sr.' },
                                { value: 'lider', label: 'Líder' },
                                { value: 'diretor', label: 'Franqueado/Diretor' },
                            ]}
                            required
                            disabled={loading}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button type="submit" loading={loading}>
                                Criar Usuário
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}

