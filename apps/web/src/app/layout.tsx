import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Vértice - Alojamiento Estudiantil',
  description: 'Encuentra el alojamiento estudiantil perfecto cerca de tu universidad',
  keywords: ['alojamiento', 'estudiantil', 'apartamentos', 'venezuela'],
  authors: [{ name: 'Vértice Team' }],
  creator: 'Vértice',
  publisher: 'Vértice',
  robots: {
    index: true,
    follow: true,
  },
};

import { NotificationProvider } from '@/components/providers/notification-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
