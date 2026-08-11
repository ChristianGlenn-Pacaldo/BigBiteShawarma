import './globals.css';
import type { Metadata, Viewport } from 'next';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Big Bite Shawarma - POS & Inventory',
  description: 'Installable Offline-First Point of Sale and Automatic Inventory System',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Big Bite POS',
  },
};

export const viewport: Viewport = {
  themeColor: '#e45719',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
