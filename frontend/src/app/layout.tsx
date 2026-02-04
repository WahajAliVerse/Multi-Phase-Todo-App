import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import ClientWrapper from './client-wrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Multi-Phase Todo App',
  description: 'A feature-rich todo application with recurrence, reminders, and tags',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} h-full antialias`}
        suppressHydrationWarning={true}
      >
        <ClientWrapper>
          <div
            id="root-container"
            className="min-h-screen flex flex-col bg-gray-50"
            role="main"
          >
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ClientWrapper>
      </body>
    </html>
  );
}