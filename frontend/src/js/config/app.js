export const config = Object.freeze({
  demo: import.meta.env.VITE_DEMO_MODE !== 'false',
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, ''),
  timeoutMs: 10_000,
});
