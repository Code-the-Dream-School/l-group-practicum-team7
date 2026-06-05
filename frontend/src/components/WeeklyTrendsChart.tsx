import { useMemo, useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import type { TrendPoint } from '../types/wellness';
import { chartHeight, chartWidth, getChartPosition, pointsFor } from '../utils/chart';

type WeeklyTrendsChartProps = {
  trendData: TrendPoint[];
};

const dayMs = 24 * 60 * 60 * 1000;

const rangeOptions = [
  { label: 'Last 3 days', value: 3 },
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 2 weeks', value: 14 },
  { label: 'Last month', value: 30 },
];

function WeeklyTrendsChart({ trendData }: WeeklyTrendsChartProps) {
  const [selectedRange, setSelectedRange] = useState(7);
  const selectedRangeLabel =
    rangeOptions.find((option) => option.value === selectedRange)?.label || 'Last 7 days';

  const visibleTrendData = useMemo(() => {
    if (!trendData.length) {
      return [];
    }

    const latestPoint = trendData[trendData.length - 1];
    const cutoffTime = latestPoint.date.getTime() - (selectedRange - 1) * dayMs;

    return trendData.filter((point) => point.date.getTime() >= cutoffTime);
  }, [selectedRange, trendData]);

  return (
    <section className="trend-card" aria-labelledby="trend-heading">
      <div className="trend-header">
        <h2 id="trend-heading">
          <TrendingUp aria-hidden="true" />
          Weekly Trends
        </h2>
        <label className="range-select">
          <span>Trend range</span>
          <select
            value={selectedRange}
            onChange={(event) => setSelectedRange(Number(event.target.value))}
            aria-label="Trend range"
          >
            {rangeOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" />
        </label>
      </div>

      <svg className="trend-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img">
        <title>{`Stress and workload trends for ${selectedRangeLabel.toLowerCase()}`}</title>
        {[40, 85, 130, 175].map((y) => (
          <line key={y} x1="18" x2="302" y1={y} y2={y} className="grid-line" />
        ))}
        <polyline points={pointsFor(visibleTrendData, 'stress')} className="stress-line" />
        <polyline points={pointsFor(visibleTrendData, 'workload')} className="workload-line" />
        {visibleTrendData.map((point, index) => {
          const stressPosition = getChartPosition(point.stress, index, visibleTrendData.length);
          const workloadPosition = getChartPosition(point.workload, index, visibleTrendData.length);

          return (
            <g key={`${point.date.toISOString()}-${index}`}>
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
