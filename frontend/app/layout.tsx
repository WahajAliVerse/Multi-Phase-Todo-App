import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import ToastWrapper from '@/components/common/ToastWrapper';
import ModalProvider from '@/components/providers/ModalProvider';
import { AuthInitializer } from '@/components/providers/AuthInitializer';
import { ProtectedRouteHandler } from '@/components/providers/ProtectedRouteHandler';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TodoApp - Modern Task Management',
  description: 'A modern, futuristic todo application with advanced features',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <Providers>
          <AuthInitializer />
          <ProtectedRouteHandler />
          <ModalProvider>
            <div className="flex min-h-screen flex-col md:flex-row">
              <Sidebar />
              <div className="flex-1 flex flex-col md:ml-0">
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </div>
            <ToastWrapper />
          </ModalProvider>
        </Providers>
      </body>
    </html>
  );
}