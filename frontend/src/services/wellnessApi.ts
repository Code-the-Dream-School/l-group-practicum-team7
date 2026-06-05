import type { Entry, InsightsResponse } from '../types/wellness';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

type ApiEntry = Omit<Entry, 'date' | 'createdAt'> & {
  date: string;
  createdAt: string;
};

type ApiError = {
  error?: string;
  message?: string;
};

async function getWithAuth<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(error?.message || error?.error || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getEntries(token: string): Promise<Entry[]> {
  const entries = await getWithAuth<ApiEntry[]>('/api/entries', token);

  return entries.map((entry) => ({
    ...entry,
    date: new Date(entry.date),
    createdAt: new Date(entry.createdAt),
  }));
}

export function getInsights(token: string): Promise<InsightsResponse> {
  return getWithAuth<InsightsResponse>('/api/insights', token);
}
