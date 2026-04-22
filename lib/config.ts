/**
 * App configuration. Values are hard-coded for v1 per IOS_APP_SPEC.md §3.
 * Keep all environment-dependent values here so they're easy to change.
 */
export const AppConfig = {
  supabaseURL: "https://uguvepoqmkauovjljytn.supabase.co",
  supabaseAnonKey: "sb_publishable_Z5e3UZno3wIAea5SVVI1zg_ukkD6HYr",
  apiBaseURL: "https://litlab-delta.vercel.app/api",
  webURL: "https://litlab-delta.vercel.app",
  requestTimeoutMs: 30_000,
  appVersionLabel: "LitLab iOS v1 · © 2026",
} as const;
