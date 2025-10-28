'use server'; // This component needs to run on the server to access cookies

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify, JWTPayload } from 'jose';
import { MantineProvider, ColorSchemeScript, AppShell, Burger, Group, Title } from '@mantine/core';
import { theme as baseTheme } from '../../theme'; // Corrected path relative to layout.tsx
import { ReactNode } from 'react';
import '@mantine/core/styles.css'; // Ensure core styles are imported

// Define expected payload structure
interface UserPayload extends JWTPayload {
  sub: string; // User ID
  name: string;
  schoolSlug: 'knn' | 'phenom';
  role: string; // e.g., 'diretor', 'lider', 'sr', 'jr'
}

// Define basic theme overrides per school (expand with actual branding)
const schoolThemes = {
  knn: { ...baseTheme, primaryColor: 'blue' },
  phenom: { ...baseTheme, primaryColor: 'pink', colorScheme: 'dark' },
};

async function verifyToken(token: string | undefined): Promise<UserPayload | null> {
  if (!token) return null;
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    console.error('JWT_SECRET_KEY is not set');
    return null;
  }
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify<UserPayload>(token, secretKey, {
      algorithms: ['HS256'], // Algorithm used in FastAPI
    });
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { schoolSlug: string };
}) {
  const tokenCookie = cookies().get('auth_token');
  const userPayload = await verifyToken(tokenCookie?.value);

  // Redirect if no valid token OR token school doesn't match URL slug
  if (!userPayload || userPayload.schoolSlug !== params.schoolSlug) {
    // Optionally clear cookie if mismatch? Maybe not, could be switching schools.
    // For now, just redirect if invalid token or wrong school context.
    redirect('/pin');
  }

  // Determine theme based on validated user payload
  const activeTheme = schoolThemes[userPayload.schoolSlug] || baseTheme;
  const defaultColorScheme = activeTheme.colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <html lang="pt-BR">
      <head>
        <ColorSchemeScript defaultColorScheme={defaultColorScheme} />
      </head>
      <body>
        <MantineProvider theme={activeTheme} defaultColorScheme={defaultColorScheme}>
          <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: true } }} // Example navbar config
            padding="md"
          >
            <AppShell.Header>
              <Group h="100%" px="md">
                {/* Burger for mobile nav - state needs to be managed */}
                {/* <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" /> */}
                <Title order={3}>CER SEVN - {userPayload.schoolSlug.toUpperCase()}</Title>
                <span style={{ marginLeft: 'auto' }}>{userPayload.name} ({userPayload.role})</span>
              </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
              {/* Navbar content (links based on role) will go here */}
              Navbar Placeholder
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}

