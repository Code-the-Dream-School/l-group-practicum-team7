import React from 'react';
import { mockEntryInputs } from '../services/mockEntries';

function formatDate(d: Date | string | undefined) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString();
}

function HistoryPage(): React.ReactElement {
  const entries = [...mockEntryInputs].reverse();

  return (
    <main className="page-content">
      <section className="page-section">
        <h1>History</h1>
        <p className="page-muted">Your recent wellness entries.</p>

        <div className="history-list">
          {entries.map((entry, index) => (
            <article className="history-card" key={(entry.date && String(entry.date)) || index}>
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
      </section>
    </main>
  );
}

export default HistoryPage;
