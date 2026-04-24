const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchHello(name?: string): Promise<{ message: string }> {
  const url = name
    ? `${API_BASE_URL}/api/hello?name=${encodeURIComponent(name)}`
    : `${API_BASE_URL}/api/hello`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch from backend");
  return res.json();
}

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/api/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Backend health check failed");
  return res.json();
}
