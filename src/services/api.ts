/**
 * API client
 *
 * Thin wrapper around fetch for the ScholarLogic backend. The base URL comes
 * from the Vite-injected VITE_API_URL env var (set in render.yaml for prod and
 * in .env for local dev). When empty, requests are made relative to the
 * current origin (useful if the API is served from the same host).
 *
 * The backend returns an envelope `{ success, message, data, metadata }`;
 * we unwrap `data` so callers get the typed payload directly.
 */

const API_BASE: string = import.meta.env.VITE_API_URL ?? '';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  metadata?: unknown;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  });

  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message = json?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return (json?.data ?? (json as unknown as T)) as T;
}
