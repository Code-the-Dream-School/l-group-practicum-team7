import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Battery,
  BriefcaseBusiness,
  CalendarDays,
  Moon,
  Trash2,
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

type Entry = {
  _id: string;
  stress: number;
  energy: number;
  workload: number;
  sleepHours: number;
  burnoutScore?: number;
  burnoutLevel?: string;
  date?: string;
  createdAt?: string;
};

type FilterMode = '7' | '30' | 'custom';

function toIsoDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseUsDateInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return '';

  const match = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

  if (!match) return '';

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
    return '';
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return '';
  }

  return toIsoDateValue(date);
}

function getDateRange(mode: FilterMode, from: string, to: string) {
  if (mode === 'custom') {
    return {
      from: parseUsDateInput(from),
      to: parseUsDateInput(to),
    };
  }

  const end = new Date();
  const start = new Date();

  start.setDate(end.getDate() - Number(mode) + 1);

  return {
    from: toIsoDateValue(start),
    to: toIsoDateValue(end),
  };
}

function formatDate(value?: string) {
  if (!value) return 'No date';

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(value?: string) {
  if (!value) return '';

  return new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeEntries(data: unknown): Entry[] {
  if (Array.isArray(data)) {
    return data as Entry[];
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const record = data as {
    entries?: Entry[];
    data?: Entry[];
  };

  if (Array.isArray(record.entries)) {
    return record.entries;
  }

  if (Array.isArray(record.data)) {
    return record.data;
  }

  return [];
}

function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('7');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [authRefreshKey, setAuthRefreshKey] = useState(0);

  const range = useMemo(
    () => getDateRange(filterMode, from, to),
    [filterMode, from, to]
  );

  const loadEntries = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setEntries([]);
      setError('Please log in to view history.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const params = new URLSearchParams();

    if (range.from) params.set('from', range.from);
    if (range.to) params.set('to', range.to);

    try {
      const queryString = params.toString();
      const url = queryString
        ? `${API}/api/entries?${queryString}`
        : `${API}/api/entries`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to load entries');
      }

      setEntries(normalizeEntries(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  async function deleteEntry(id: string) {
    const token = localStorage.getItem('token');

    if (!token) return;

    const confirmed = window.confirm('Delete this entry?');

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/api/entries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      setEntries((current) => current.filter((entry) => entry._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  }

  useEffect(() => {
    const refreshAfterAuthChange = () => {
      setAuthRefreshKey((current) => current + 1);
    };

    window.addEventListener('authChanged', refreshAfterAuthChange);
    window.addEventListener('storage', refreshAfterAuthChange);
    window.addEventListener('focus', refreshAfterAuthChange);

    return () => {
      window.removeEventListener('authChanged', refreshAfterAuthChange);
      window.removeEventListener('storage', refreshAfterAuthChange);
      window.removeEventListener('focus', refreshAfterAuthChange);
    };
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries, authRefreshKey]);

  return (
    <main className="mobile-page history-page" aria-label="History page">
      <section className="compact-page-shell">
        <section className="page-hero compact-hero">
          <p className="page-eyebrow">Wellness records</p>
          <h1>History</h1>
          <p>Your recent wellness entries.</p>
        </section>

        <section className="history-filters" aria-label="History filters">
          <button
            type="button"
            className={filterMode === '7' ? 'active' : ''}
            onClick={() => setFilterMode('7')}
          >
            Last 7 days
          </button>

          <button
            type="button"
            className={filterMode === '30' ? 'active' : ''}
            onClick={() => setFilterMode('30')}
          >
            Last 30 days
          </button>

          <button
            type="button"
            className={filterMode === 'custom' ? 'active' : ''}
            onClick={() => setFilterMode('custom')}
          >
            Custom
          </button>

          {filterMode === 'custom' && (
            <div className="date-filter-fields">
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/DD/YYYY"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                aria-label="Start date in MM/DD/YYYY format"
              />

              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/DD/YYYY"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                aria-label="End date in MM/DD/YYYY format"
              />
            </div>
          )}
        </section>

        {loading && <div className="history-state">Loading entries...</div>}

        {!loading && error && <div className="history-state error">{error}</div>}

        {!loading && !error && entries.length === 0 && (
          <div className="history-state">No entries found for this period.</div>
        )}

        {!loading && !error && entries.length > 0 && (
          <section className="history-list">
            {entries.map((entry) => {
              const displayDate = entry.date || entry.createdAt;

              return (
                <article className="history-card" key={entry._id}>
                  <div className="history-card-header">
                    <div className="history-date">
                      <CalendarDays size={17} aria-hidden="true" />

                      <div className="history-date-text">
                        <strong>{formatDate(displayDate)}</strong>
                        <span>{formatTime(displayDate)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="history-delete"
                      onClick={() => deleteEntry(entry._id)}
                      aria-label="Delete entry"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="history-metrics">
                    <div className="history-metric">
                      <Activity size={16} aria-hidden="true" />
                      <span>Stress</span>
                      <strong>{entry.stress}/5</strong>
                    </div>

                    <div className="history-metric">
                      <Battery size={16} aria-hidden="true" />
                      <span>Energy</span>
                      <strong>{entry.energy}/5</strong>
                    </div>

                    <div className="history-metric">
                      <Moon size={16} aria-hidden="true" />
                      <span>Sleep</span>
                      <strong>{entry.sleepHours}h</strong>
                    </div>

                    <div className="history-metric">
                      <BriefcaseBusiness size={16} aria-hidden="true" />
                      <span>Workload</span>
                      <strong>{entry.workload}/5</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}

export default HistoryPage;