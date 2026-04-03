'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#242444',
            color: '#FFFFFF',
            border: '1px solid #3A3A5C',
          },
          success: {
            iconTheme: { primary: '#00C853', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#FF1744', secondary: '#FFFFFF' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
