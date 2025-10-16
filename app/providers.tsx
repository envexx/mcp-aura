'use client';

import { AppProviders } from './wagmi';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      {children}
    </AppProviders>
  );
}
