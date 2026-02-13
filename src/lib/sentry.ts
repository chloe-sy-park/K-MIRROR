const dsn = import.meta.env.VITE_SENTRY_DSN;

let Sentry: typeof import('@sentry/react') | null = null;

export function initSentry() {
  if (!dsn || !import.meta.env.PROD) return;

  import('@sentry/react').then((mod) => {
    Sentry = mod;
    mod.init({
      dsn,
      environment: import.meta.env.MODE,
      enabled: true,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
    });
  });
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (!dsn || !Sentry) return;
  Sentry.captureException(error, { extra: context });
}
