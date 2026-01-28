import ClientProviders from './ClientProviders/ClientProviders';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      {children}
    </ClientProviders>
  );
}