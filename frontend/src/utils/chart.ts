import type { TrendPoint } from '../types/wellness';

export const chartWidth = 320;
export const chartHeight = 190;
export const chartPadding = 18;

function getChartX(index: number, totalPoints: number) {
  if (totalPoints <= 1) {
    return chartWidth / 2;
  }

  const stepX = (chartWidth - chartPadding * 2) / (totalPoints - 1);
  return chartPadding + stepX * index;
}

export function pointsFor(trendData: TrendPoint[], metric: 'stress' | 'workload') {
  const maxScore = 5;

  return trendData
    .map((point, index) => {
      const x = getChartX(index, trendData.length);
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
  const x = getChartX(index, totalPoints);
  const y = chartHeight - chartPadding - (value / maxScore) * (chartHeight - chartPadding * 2);

  return { x, y };
}
