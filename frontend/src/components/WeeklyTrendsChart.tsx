import { ChevronDown, TrendingUp } from 'lucide-react';
import type { TrendPoint } from '../types/wellness';
import { chartHeight, chartWidth, getChartPosition, pointsFor } from '../utils/chart';

type WeeklyTrendsChartProps = {
  trendData: TrendPoint[];
};

function WeeklyTrendsChart({ trendData }: WeeklyTrendsChartProps) {
  return (
    <section className="trend-card" aria-labelledby="trend-heading">
      <div className="trend-header">
        <h2 id="trend-heading">
          <TrendingUp aria-hidden="true" />
          Weekly Trends
        </h2>
        <button type="button" className="range-button">
          Last 7 days
          <ChevronDown aria-hidden="true" />
        </button>
      </div>

      <svg className="trend-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img">
        <title>Stress and workload trends for the last seven days</title>
        {[40, 85, 130, 175].map((y) => (
          <line key={y} x1="18" x2="302" y1={y} y2={y} className="grid-line" />
        ))}
        <polyline points={pointsFor(trendData, 'stress')} className="stress-line" />
        <polyline points={pointsFor(trendData, 'workload')} className="workload-line" />
        {trendData.map((point, index) => {
          const stressPosition = getChartPosition(point.stress, index, trendData.length);
          const workloadPosition = getChartPosition(point.workload, index, trendData.length);

          return (
            <g key={point.day}>
              <circle
                cx={stressPosition.x}
                cy={stressPosition.y}
                r="4.7"
                className="stress-dot"
              />
              <circle
                cx={workloadPosition.x}
                cy={workloadPosition.y}
                r="4.7"
                className="workload-dot"
              />
            </g>
          );
        })}
      </svg>

      <div className="legend" aria-hidden="true">
        <span>
          <i className="stress-key" />
          Stress
        </span>
        <span>
          <i className="workload-key" />
          Workload
        </span>
      </div>
    </section>
  );
}

export default WeeklyTrendsChart;
