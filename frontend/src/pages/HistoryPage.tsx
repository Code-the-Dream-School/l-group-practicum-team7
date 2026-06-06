import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Battery,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Moon,
  Pencil,
  Trash2,
  X,
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

type EntryDraft = {
  stress: string;
  energy: string;
  workload: string;
  sleepHours: string;
  date: string;
};

type FilterMode = '7' | '30' | 'custom';

function toIsoDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toDateInputValue(value?: string) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return toIsoDateValue(date);
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

function createDraft(entry: Entry): EntryDraft {
  return {
    stress: String(entry.stress ?? 1),
    energy: String(entry.energy ?? 1),
    workload: String(entry.workload ?? 1),
    sleepHours: String(entry.sleepHours ?? 8),
    date: toDateInputValue(entry.date || entry.createdAt),
  };
}

async function updateEntryRequest(id: string, token: string, payload: unknown) {
  const makeRequest = (method: 'PUT' | 'PATCH') =>
    fetch(`${API}/api/entries/${id}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

  const putResponse = await makeRequest('PUT');

  if (putResponse.status !== 404 && putResponse.status !== 405) {
    return putResponse;
  }

  return makeRequest('PATCH');
}

function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('7');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [authRefreshKey, setAuthRefreshKey] = useState(0);
  const [editingId, setEditingId] = useState('');
  const [editDraft, setEditDraft] = useState<EntryDraft | null>(null);
  const [savingId, setSavingId] = useState('');
  const [editError, setEditError] = useState('');

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

  function startEditing(entry: Entry) {
    setEditingId(entry._id);
    setEditDraft(createDraft(entry));
    setEditError('');
  }

  function cancelEditing() {
    setEditingId('');
    setEditDraft(null);
    setSavingId('');
    setEditError('');
  }

  function updateDraft(field: keyof EntryDraft, value: string) {
    setEditDraft((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  async function saveEntry(id: string) {
    const token = localStorage.getItem('token');

    if (!token || !editDraft) return;

    const payload = {
      stress: Number(editDraft.stress),
      workload: Number(editDraft.workload),
      sleepHours: Number(editDraft.sleepHours),
      energy: Number(editDraft.energy),
      date: editDraft.date ? new Date(editDraft.date).toISOString() : undefined,
    };

    if (
      payload.stress < 1 ||
      payload.stress > 5 ||
      payload.workload < 1 ||
      payload.workload > 5 ||
      payload.energy < 1 ||
      payload.energy > 5 ||
      payload.sleepHours < 0 ||
      payload.sleepHours > 24
    ) {
      setEditError('Please keep stress, workload, and energy from 1 to 5. Sleep must be 0 to 24 hours.');
      return;
    }

    setSavingId(id);
    setEditError('');

    try {
      const response = await updateEntryRequest(id, token, payload);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update entry');
      }

      setEntries((current) =>
        current.map((entry) => (entry._id === id ? data : entry))
      );

      window.dispatchEvent(new Event('insights.entry'));
      cancelEditing();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update entry');
    } finally {
      setSavingId('');
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

      if (editingId === id) {
        cancelEditing();
      }

      window.dispatchEvent(new Event('insights.entry'));
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

        {!loading && error && (
          <div className="history-state error">{error}</div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="history-state">No entries found for this period.</div>
        )}

        {!loading && !error && entries.length > 0 && (
          <section className="history-list">
            {entries.map((entry) => {
              const displayDate = entry.date || entry.createdAt;
              const isEditing = editingId === entry._id;

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

                    <div className="history-card-actions">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className="history-action-button history-save"
                            onClick={() => saveEntry(entry._id)}
                            aria-label="Save entry"
                            disabled={savingId === entry._id}
                          >
                            <Check size={17} aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            className="history-action-button history-cancel"
                            onClick={cancelEditing}
                            aria-label="Cancel editing"
                            disabled={savingId === entry._id}
                          >
                            <X size={17} aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="history-action-button history-edit-button"
                            onClick={() => startEditing(entry)}
                            aria-label="Edit entry"
                          >
                            <Pencil size={17} aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            className="history-action-button history-delete"
                            onClick={() => deleteEntry(entry._id)}
                            aria-label="Delete entry"
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing && editDraft ? (
                    <div className="history-edit-form">
                      <label>
                        <span>Stress</span>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="1"
                          value={editDraft.stress}
                          onChange={(event) =>
                            updateDraft('stress', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        <span>Energy</span>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="1"
                          value={editDraft.energy}
                          onChange={(event) =>
                            updateDraft('energy', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        <span>Sleep</span>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={editDraft.sleepHours}
                          onChange={(event) =>
                            updateDraft('sleepHours', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        <span>Workload</span>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="1"
                          value={editDraft.workload}
                          onChange={(event) =>
                            updateDraft('workload', event.target.value)
                          }
                        />
                      </label>

                      <label>
                        <span>Date</span>
                        <input
                          type="date"
                          value={editDraft.date}
                          onChange={(event) =>
                            updateDraft('date', event.target.value)
                          }
                        />
                      </label>

                      {editError && (
                        <div className="history-edit-error">{editError}</div>
                      )}
                    </div>
                  ) : (
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
                  )}
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