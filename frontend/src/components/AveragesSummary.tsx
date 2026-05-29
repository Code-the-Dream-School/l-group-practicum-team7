import { BarChart3 } from 'lucide-react';
import type { InsightsResponse } from '../types/wellness';

type AveragesSummaryProps = {
  averages: InsightsResponse['averages'];
};

function formatAverage(value: number) {
  return value.toFixed(1);
}

function AveragesSummary({ averages }: AveragesSummaryProps) {
  const averageItems = [
    {
      label: '2-Day Stress',
      value: `${formatAverage(averages.last2DaysStress)}/5`,
    },
    {
      label: '7-Day Stress',
      value: `${formatAverage(averages.last7DaysStress)}/5`,
    },
    {
      label: '7-Day Energy',
      value: `${formatAverage(averages.last7DaysEnergy)}/5`,
    },
    {
      label: '7-Day Burnout',
      value: `${formatAverage(averages.last7DaysBurnout)}/5`,
    },
  ];

  return (
    <section className="averages-card" aria-labelledby="averages-heading">
      <div className="averages-header">
        <h2 id="averages-heading">
          <BarChart3 aria-hidden="true" />
          Averages
        </h2>
        <span>Backend insights</span>
      </div>

      <div className="averages-grid">
        {averageItems.map((item) => (
          <article className="average-item" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AveragesSummary;
