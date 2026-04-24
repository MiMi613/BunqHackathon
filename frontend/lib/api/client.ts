/*
 * Base API client configuration.
 *
 * NEXT_PUBLIC_API_URL is BUILD-TIME: Next.js inlines it into the bundle at
 * build. Changing it after the build has no effect — a rebuild is required.
 * Falls back to http://localhost:8000 (the default uvicorn port).
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Hits GET /api/health. Useful for an optional "backend up/down" status
 * indicator in the UI. Non-blocking.
 */
export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/api/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Backend health check failed");
  return res.json();
}
