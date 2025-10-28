import '@mantine/core/styles.css'; // Ensure core styles are imported
import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications'; // If you installed notifications
import { theme } from '../theme'; // Import your theme

export const metadata = {
  title: 'CER SEVN App',
  description: 'Notice Board System',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
           {/* If using Notifications */}
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}