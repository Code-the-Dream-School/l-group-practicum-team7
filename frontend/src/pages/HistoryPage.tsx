import React from 'react';
import type { Entry } from '../types/wellness';

function formatDate(d: Date | string | undefined) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString();
}

type HistoryPageProps = {
  entries: Entry[];
  loading: boolean;
  error: string | null;
};

function HistoryPage({ entries, loading, error }: HistoryPageProps): React.ReactElement {
  return (
    <main className="page-content">
      <section className="page-section">
        <h1>History</h1>
        <p className="page-muted">Your recent wellness entries.</p>

        {loading && <p className="page-muted">Loading entries...</p>}
        {error && <p className="page-error">{error}</p>}
        {!loading && !error && entries.length === 0 && (
          <p className="page-muted">No entries yet. Add a daily log to begin your history.</p>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="history-list">
            {entries.map((entry, index) => (
              <article className="history-card" key={entry._id || String(entry.date) || index}>
                <div className="history-card-header">
                  <strong>{formatDate(entry.date) || `Entry ${index + 1}`}</strong>
                  <span>Energy: {entry.energy ?? 'N/A'}/5</span>
                </div>

                <div className="history-grid">
                  <div>
                    <span>Stress</span>
                    <strong>{entry.stress}/5</strong>
                  </div>
                  <div>
                    <span>Energy</span>
                    <strong>{entry.energy}/5</strong>
                  </div>
                  <div>
                    <span>Sleep</span>
                    <strong>{entry.sleepHours}h</strong>
                  </div>
                  <div>
                    <span>Workload</span>
                    <strong>{entry.workload}/5</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default HistoryPage;
