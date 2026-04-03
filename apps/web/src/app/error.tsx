'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-discount-red/15 border border-discount-red/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-discount-red" />
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-white mb-2">Что-то пошло не так</h1>
        <p className="text-muted text-sm leading-relaxed mb-8">
          Произошла ошибка при загрузке страницы. Попробуйте обновить или вернитесь на главную.
        </p>

        {/* Error details (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 rounded-xl bg-card border border-border text-left">
            <p className="text-xs text-discount-red font-mono break-all">{error.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="default" size="md" onClick={reset}>
            <RefreshCw size={15} />
            Попробовать снова
          </Button>
          <Link href="/">
            <Button variant="outline" size="md">
              На главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
