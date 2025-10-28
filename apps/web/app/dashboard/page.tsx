import { Title, Text } from '@mantine/core';
import Link from 'next/link';

export default function DashboardHomePage({ params }: { params: { schoolSlug: string } }) {
    return (
        <div>
            <Title order={2}>Welcome to the Dashboard</Title>
            <Text>Select an option from the navigation to get started.</Text>
            <Text mt="md">
                <Link href={`/dashboard/${params.schoolSlug}/items`}>
                    View Content Items
                </Link>
            </Text>
             <Text mt="md">
                <Link href={`/dashboard/${params.schoolSlug}/users/create`}>
                    Create New User (Admin Only Placeholder)
                </Link>
            </Text>
            {/* Add more links as features are built */}
        </div>
    );
}