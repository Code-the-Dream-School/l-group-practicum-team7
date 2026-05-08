import type { TrendPoint } from '../types/wellness';

export const chartWidth = 320;
export const chartHeight = 190;
export const chartPadding = 18;

export function pointsFor(trendData: TrendPoint[], metric: 'stress' | 'workload') {
  const maxScore = 5;
  const stepX = (chartWidth - chartPadding * 2) / (trendData.length - 1);

  return trendData
    .map((point, index) => {
      const x = chartPadding + stepX * index;
      const y =
        chartHeight -
        chartPadding -
        (point[metric] / maxScore) * (chartHeight - chartPadding * 2);

      return `${x},${y}`;
    })
    .join(' ');
}

export function getChartPosition(value: number, index: number, totalPoints: number) {
  const maxScore = 5;
  const stepX = (chartWidth - chartPadding * 2) / (totalPoints - 1);
  const x = chartPadding + stepX * index;
  const y = chartHeight - chartPadding - (value / maxScore) * (chartHeight - chartPadding * 2);

  return { x, y };
}
