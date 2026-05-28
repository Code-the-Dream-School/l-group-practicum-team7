import { Moon, Zap } from 'lucide-react';
import type { Entry } from '../../types/wellness';
import { formatHours } from '../../utils/wellness';

type MetricCardsProps = {
  entry: Entry;
};

function MetricCards({ entry }: MetricCardsProps) {
  return (
    <section className="metric-grid" aria-label="Wellness metrics">
      <article className="metric-card sleep-card">
        <p className="metric-label">
          <Moon aria-hidden="true" />
          Sleep
        </p>
        <strong>{entry.sleepHours ? formatHours(entry.sleepHours) : 'No data'}</strong>
        <svg className="mini-chart" aria-hidden="true" viewBox="0 0 260 80">
          <path d="M8 38C60 48 103 58 149 56C194 55 222 47 252 34V74H8Z" />
          <path d="M8 38C60 48 103 58 149 56C194 55 222 47 252 34" />
        </svg>
      </article>

      <article className="metric-card energy-card">
        <p className="metric-label">
          <Zap aria-hidden="true" />
          Energy
        </p>
        <strong>{entry.energy ? `${entry.energy}/5` : 'No data'}</strong>
        <svg className="mini-chart" aria-hidden="true" viewBox="0 0 260 80">
          <path d="M8 48C58 62 105 68 151 68C196 67 225 59 252 40V74H8Z" />
          <path d="M8 48C58 62 105 68 151 68C196 67 225 59 252 40" />
        </svg>
      </article>
    </section>
  );
}

export default MetricCards;
