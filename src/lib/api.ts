const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function apiUrl(path: string): string {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  });
}
