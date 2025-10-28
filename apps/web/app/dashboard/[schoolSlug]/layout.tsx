import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { MantineProvider, Container, AppShell, Burger, Group, Title } from '@mantine/core';
import { theme } from '../../theme'; // Assuming theme is in root app folder
import React from 'react';

// Define the secret key (MUST match the one used in FastAPI and middleware)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'YOUR_FALLBACK_SECRET');

// Define Brand Themes (Simplified - replace with your actual Mantine theme overrides)
const schoolThemes = {
    knn: { primaryColor: 'blue', other: { /* KNN specific theme overrides */ } },
    phenom: { primaryColor: 'pink', other: { /* Phenom specific theme overrides */ } },
};

// Function to decode JWT payload (example)
async function getUserDataFromToken(tokenValue: string) {
    try {
        const { payload } = await jwtVerify(tokenValue, JWT_SECRET);
        // Assuming your JWT payload contains school, role, name, etc.
        return payload as { schoolSlug: string; role: string; name: string; [key: string]: any };
    } catch (error) {
        console.error("Layout: Token verification failed:", error);
        return null;
    }
}

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { schoolSlug: string };
}) {
    const tokenCookie = cookies().get('auth_token');
    const schoolSlug = params.schoolSlug === 'knn' || params.schoolSlug === 'phenom'
        ? params.schoolSlug
        : 'knn'; // Default or handle error

    if (!tokenCookie || !tokenCookie.value) {
        // Should be caught by middleware, but good to double-check
        redirect('/pin');
    }

    const userData = await getUserDataFromToken(tokenCookie.value);

    if (!userData || userData.schoolSlug !== schoolSlug) {
        // Token invalid or doesn't match the URL slug, redirect to login
        console.warn("Layout: Invalid token or school mismatch, redirecting.");
        // Consider deleting the cookie here too if middleware didn't catch it
        redirect('/pin');
    }

    // Determine the theme based on the school slug from the *token* (more secure)
    const schoolThemeOverrides = schoolThemes[userData.schoolSlug as keyof typeof schoolThemes] || schoolThemes.knn;

    // Merge base theme with school-specific overrides (adjust Mantine theme merging as needed)
    const activeTheme = { ...theme, ...schoolThemeOverrides };

    // Basic AppShell structure - Navigation will be added later
    // In a real app, 'opened' and 'toggle' would use state for the mobile burger menu
    const opened = false;
    const toggle = () => {};

    return (
        <MantineProvider theme={activeTheme} defaultColorScheme="auto">
            <AppShell
                header={{ height: 60 }}
                navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
                padding="md"
            >
                <AppShell.Header>
                    <Group h="100%" px="md">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Title order={3}>CER SEVN - {userData.schoolSlug.toUpperCase()} Dashboard</Title>
                        {/* Add User Menu/Logout later */}
                    </Group>
                </AppShell.Header>

                <AppShell.Navbar p="md">
                    {/* Placeholder for Navigation Links */}
                    Navbar Placeholder <br />
                    Welcome, {userData.name} ({userData.role})
                </AppShell.Navbar>

                <AppShell.Main>
                    <Container fluid>
                        {children}
                    </Container>
                </AppShell.Main>
            </AppShell>
        </MantineProvider>
    );
}
