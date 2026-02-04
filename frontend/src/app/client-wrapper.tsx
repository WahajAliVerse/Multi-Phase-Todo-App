'use client';

import { ReduxProvider } from '@/providers/ReduxProvider';
import { ReactNode } from 'react';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return <ReduxProvider>{children}</ReduxProvider>;
}