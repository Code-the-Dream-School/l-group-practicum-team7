import { useEffect, useMemo, useState } from 'react';
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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDateRange(mode: FilterMode, from: string, to: string) {
  if (mode === 'custom') {
    return { from, to };
  }

  const start = new Date();
  const end = new Date();

  start.setDate(end.getDate() - Number(mode) + 1);

  const tomorrow = new Date(end);
  tomorrow.setDate(end.getDate() + 1);

  return {
    from: toDateInputValue(start),
    to: toDateInputValue(tomorrow),
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

function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('7');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const range = useMemo(
    () => getDateRange(filterMode, from, to),
    [filterMode, from, to]
  );

  async function loadEntries() {
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
      const response = await fetch(`${API}/api/entries?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load entries');
      }

      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

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
    loadEntries();
  }, [range.from, range.to]);

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
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />

              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
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