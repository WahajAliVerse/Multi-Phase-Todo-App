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
import { ChatAssistantProvider } from '@/components/providers/ChatAssistantProvider';

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
      <body className={`${inter.className} bg-background text-foreground antialiased`} suppressHydrationWarning>
        <Providers>
          <AuthInitializer />
          <ProtectedRouteHandler />
          <ModalProvider>
            <ChatAssistantProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col w-full">
                  <main className="flex-grow w-full">
                    {children}
                  </main>
                  <Footer />
                </div>
              </div>
              <ToastWrapper />
            </ChatAssistantProvider>
          </ModalProvider>
        </Providers>
      </body>
    </html>
  );
}