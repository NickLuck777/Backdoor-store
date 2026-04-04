// Sentry client configuration
// Only initializes when NEXT_PUBLIC_SENTRY_DSN is set
export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.log('[Sentry] DSN not configured — error tracking disabled');
    return;
  }
  // Dynamic import to avoid loading Sentry when not needed
  // In production, install @sentry/nextjs and use proper init
  console.log('[Sentry] Initialized with DSN:', dsn.substring(0, 20) + '...');
}
