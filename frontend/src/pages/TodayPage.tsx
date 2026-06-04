import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ChevronRight,
  CircleGauge,
  MessageCircle,
  Moon,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import AveragesSummary from '../components/dashboard/AveragesSummary';
import RiskSummaryCard from '../components/dashboard/RiskSummaryCard';
import type { Entry, InsightsResponse } from '../types/wellness';

import './TodayPage.css';

export type TodayCounts = {
  dialogueCount: number;
  toolCount: number;
};

export type TodayNavigateTarget = 'dialogues' | 'tools';

type TodayPageProps = {
  entries: Entry[];
  insights: InsightsResponse | null;
  loading: boolean;
  error: string | null;
  todayCounts?: TodayCounts;
  onNavigate?: (target: TodayNavigateTarget) => void;
};

type SeriesKey = 'burnout' | 'stress' | 'workload' | 'energy' | 'sleep';

type ChartRow = {
  date: Date;
  label: string;
  stress: number;
  workload: number;
  energy: number;
  sleepHours: number;
  sleepScore: number;
  burnout: number;
};

type ChartPoint = {
  key: SeriesKey;
  label: string;
  value: number;
  rawLabel: string;
  x: number;
  y: number;
};

type ActionTone = 'recovery' | 'sleep' | 'dialogue' | 'tools';

type ActionItem = {
  title: string;
  text: string;
  className: ActionTone;
  icon: LucideIcon;
  route?: TodayNavigateTarget;
};

const chartBox = {
  width: 860,
  height: 420,
  left: 78,
  right: 50,
  top: 66,
  bottom: 82,
};

const seriesConfig: Record<
  SeriesKey,
  {
    label: string;
    className: string;
    color: string;
    dashArray?: string;
  }
> = {
  burnout: {
    label: 'Burnout',
    className: 'burnout',
    color: '#5b4ee6',
  },
  stress: {
    label: 'Stress',
    className: 'stress',
    color: '#e15b6d',
    dashArray: '16 8',
  },
  workload: {
    label: 'Workload',
    className: 'workload',
    color: '#f59e0b',
    dashArray: '2 10',
  },
  energy: {
    label: 'Energy',
    className: 'energy',
    color: '#10b981',
    dashArray: '16 7 3 7',
  },
  sleep: {
    label: 'Sleep',
    className: 'sleep',
    color: '#0ea5e9',
    dashArray: '16 6 3 6 3 6',
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatNumber(value: number | undefined, fallback = '—') {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getEntryDate(entry: Entry) {
  const record = entry as unknown as Record<string, unknown>;
  const rawDate = record.date || record.createdAt || record.updatedAt;

  if (rawDate instanceof Date) {
    return Number.isNaN(rawDate.getTime()) ? null : rawDate;
  }

  if (typeof rawDate !== 'string' && typeof rawDate !== 'number') {
    return null;
  }

  const date = new Date(rawDate);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getNumberField(entry: Entry, key: string, fallback = 0) {
  const record = entry as unknown as Record<string, unknown>;
  const value = record[key];

  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function getEntrySleepHours(entry: Entry) {
  const sleepHours = getNumberField(entry, 'sleepHours', Number.NaN);

  if (!Number.isNaN(sleepHours)) return sleepHours;

  return getNumberField(entry, 'sleep', 0);
}

function getSleepScore(sleepHours: number) {
  return clamp((sleepHours / 8) * 5, 0, 5);
}

function getEntryBurnout(entry: Entry) {
  const record = entry as unknown as Record<string, unknown>;

  if (typeof record.burnoutScore === 'number') {
    return clamp(record.burnoutScore, 0, 5);
  }

  const stress = getNumberField(entry, 'stress');
  const workload = getNumberField(entry, 'workload', stress);
  const energy = getNumberField(entry, 'energy', 3);
  const inverseEnergy = 6 - energy;

  return clamp((stress + workload + inverseEnergy) / 3, 0, 5);
}

function getEntriesInRange(
  allEntries: Entry[],
  startDate: string,
  endDate: string,
) {
  const start = parseInputDate(startDate);
  const end = parseInputDate(endDate);

  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  return allEntries.filter((entry) => {
    const entryDate = getEntryDate(entry);

    if (!entryDate) return false;
    if (start && entryDate < start) return false;
    if (end && entryDate > end) return false;

    return true;
  });
}

function groupEntriesByDay(allEntries: Entry[]): ChartRow[] {
  const groups = new Map<string, Entry[]>();

  allEntries.forEach((entry) => {
    const entryDate = getEntryDate(entry);

    if (!entryDate) return;

    const key = toDateInputValue(entryDate);
    const current = groups.get(key) || [];

    groups.set(key, [...current, entry]);
  });

  return Array.from(groups.entries())
    .map(([dateKey, dayEntries]) => {
      const date = parseInputDate(dateKey) || new Date(dateKey);
      const sleepHours = average(dayEntries.map(getEntrySleepHours));

      return {
        date,
        label: formatShortDate(date),
        stress: average(dayEntries.map((entry) => getNumberField(entry, 'stress'))),
        workload: average(dayEntries.map((entry) => getNumberField(entry, 'workload'))),
        energy: average(dayEntries.map((entry) => getNumberField(entry, 'energy'))),
        sleepHours,
        sleepScore: getSleepScore(sleepHours),
        burnout: average(dayEntries.map(getEntryBurnout)),
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function getSeriesValue(row: ChartRow, key: SeriesKey) {
  if (key === 'sleep') return row.sleepScore;

  return row[key];
}

function getSeriesRawLabel(row: ChartRow, key: SeriesKey) {
  if (key === 'sleep') return `${formatNumber(row.sleepHours)}h`;

  return formatNumber(getSeriesValue(row, key));
}

function buildChartPoints(
  rows: ChartRow[],
  labels: string[],
  key: SeriesKey,
): ChartPoint[] {
  const innerWidth = chartBox.width - chartBox.left - chartBox.right;
  const innerHeight = chartBox.height - chartBox.top - chartBox.bottom;

  return rows.map((row, index) => {
    const value = clamp(getSeriesValue(row, key), 0, 5);
    const x =
      chartBox.left + (innerWidth / Math.max(rows.length - 1, 1)) * index;
    const y = chartBox.top + ((5 - value) / 5) * innerHeight;

    return {
      key,
      label: labels[index] || `D${index + 1}`,
      value,
      rawLabel: getSeriesRawLabel(row, key),
      x,
      y,
    };
  });
}

function buildPolyline(points: ChartPoint[]) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function yToSvg(value: number) {
  const innerHeight = chartBox.height - chartBox.top - chartBox.bottom;

  return chartBox.top + ((5 - value) / 5) * innerHeight;
}

function getPointLabelX(point: ChartPoint) {
  return clamp(point.x, chartBox.left + 30, chartBox.width - chartBox.right - 30);
}

function getPointLabelY(point: ChartPoint, index: number) {
  const shift = index % 2 === 0 ? -24 : 30;

  return clamp(
    point.y + shift,
    chartBox.top + 16,
    chartBox.height - chartBox.bottom - 14,
  );
}

function getLatestEntry(entries: Entry[]) {
  return [...entries]
    .filter((entry) => getEntryDate(entry))
    .sort((a, b) => {
      const aTime = getEntryDate(a)?.getTime() || 0;
      const bTime = getEntryDate(b)?.getTime() || 0;

      return bTime - aTime;
    })[0];
}

function TodayTrendChart({ entries }: { entries: Entry[] }) {
  const sortedEntries = useMemo(
    () =>
      [...entries]
        .filter((entry) => getEntryDate(entry))
        .sort((a, b) => {
          const aTime = getEntryDate(a)?.getTime() || 0;
          const bTime = getEntryDate(b)?.getTime() || 0;

          return aTime - bTime;
        }),
    [entries],
  );

  const [chartStartDate, setChartStartDate] = useState('');
  const [chartEndDate, setChartEndDate] = useState('');
  const [showScale, setShowScale] = useState(true);
  const [visibleSeries, setVisibleSeries] = useState<Record<SeriesKey, boolean>>({
    burnout: true,
    stress: true,
    workload: true,
    energy: false,
    sleep: false,
  });

  useEffect(() => {
    if (sortedEntries.length === 0) return;

    const firstDate = getEntryDate(sortedEntries[0]);
    const lastDate = getEntryDate(sortedEntries[sortedEntries.length - 1]);

    setChartStartDate((current) =>
      current || toDateInputValue(firstDate || new Date()),
    );

    setChartEndDate((current) =>
      current || toDateInputValue(lastDate || new Date()),
    );
  }, [sortedEntries]);

  const filteredEntries = useMemo(
    () => getEntriesInRange(sortedEntries, chartStartDate, chartEndDate),
    [sortedEntries, chartStartDate, chartEndDate],
  );

  const chartRows = useMemo(
    () => groupEntriesByDay(filteredEntries),
    [filteredEntries],
  );

  const chartLabels = useMemo(
    () => chartRows.map((row) => row.label),
    [chartRows],
  );

  const activeSeries = useMemo(
    () =>
      (Object.keys(visibleSeries) as SeriesKey[]).filter(
        (key) => visibleSeries[key],
      ),
    [visibleSeries],
  );

  const showPointLabels = activeSeries.length <= 2;

  const chartPoints = useMemo(
    () =>
      activeSeries.reduce<Record<SeriesKey, ChartPoint[]>>(
        (acc, key) => ({
          ...acc,
          [key]: buildChartPoints(chartRows, chartLabels, key),
        }),
        {} as Record<SeriesKey, ChartPoint[]>,
      ),
    [activeSeries, chartRows, chartLabels],
  );

  function toggleSeries(key: SeriesKey) {
    setVisibleSeries((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <section className="today-trend-card" aria-label="Wellness trend chart">
      <div className="today-trend-header">
        <div className="today-trend-title">
          <Activity size={22} />
          <div>
            <p>Advanced trends</p>
            <h2>Wellness Trend</h2>
          </div>
        </div>

        <div className="today-date-controls">
          <label>
            <span>Start date</span>
            <input
              type="date"
              value={chartStartDate}
              onChange={(event) => setChartStartDate(event.target.value)}
            />
          </label>

          <label>
            <span>End date</span>
            <input
              type="date"
              value={chartEndDate}
              onChange={(event) => setChartEndDate(event.target.value)}
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (sortedEntries.length === 0) return;

              const firstDate = getEntryDate(sortedEntries[0]);
              const lastDate = getEntryDate(sortedEntries[sortedEntries.length - 1]);

              setChartStartDate(toDateInputValue(firstDate || new Date()));
              setChartEndDate(toDateInputValue(lastDate || new Date()));
            }}
          >
            All time
          </button>
        </div>
      </div>

      <div className="today-trend-controls" aria-label="Chart series controls">
        {(Object.keys(seriesConfig) as SeriesKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={visibleSeries[key] ? `active ${seriesConfig[key].className}` : ''}
            onClick={() => toggleSeries(key)}
          >
            {seriesConfig[key].label}
          </button>
        ))}

        <button
          type="button"
          className={showScale ? 'active scale' : ''}
          onClick={() => setShowScale((current) => !current)}
        >
          Scale
        </button>
      </div>

      <div className="today-large-chart">
        {chartRows.length === 0 ? (
          <div className="today-chart-empty">
            No entries found for this date range.
          </div>
        ) : activeSeries.length === 0 ? (
          <div className="today-chart-empty">
            Choose at least one metric to display.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${chartBox.width} ${chartBox.height}`}
            role="img"
            aria-label="Configurable wellness trend chart"
            preserveAspectRatio="none"
          >
            {showScale &&
              [0, 1, 2, 3, 4, 5].map((value) => {
                const y = yToSvg(value);

                return (
                  <g key={value}>
                    <line
                      x1={chartBox.left}
                      y1={y}
                      x2={chartBox.width - chartBox.right}
                      y2={y}
                      className="today-chart-grid-line"
                    />

                    <text
                      x={chartBox.left - 16}
                      y={y + 4}
                      className="today-chart-axis-label today-chart-y-label"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

            {showScale && (
              <>
                <line
                  x1={chartBox.left}
                  y1={chartBox.top}
                  x2={chartBox.left}
                  y2={chartBox.height - chartBox.bottom}
                  className="today-chart-axis-line"
                />

                <line
                  x1={chartBox.left}
                  y1={chartBox.height - chartBox.bottom}
                  x2={chartBox.width - chartBox.right}
                  y2={chartBox.height - chartBox.bottom}
                  className="today-chart-axis-line"
                />
              </>
            )}

            {chartLabels.map((label, index) => {
              const firstSeries = activeSeries[0];
              const x = firstSeries ? chartPoints[firstSeries]?.[index]?.x : chartBox.left;

              return (
                <text
                  key={`${label}-${index}`}
                  x={x || chartBox.left}
                  y={chartBox.height - 18}
                  className="today-chart-axis-label today-chart-x-label"
                >
                  {label}
                </text>
              );
            })}

            {activeSeries.map((key) => {
              const points = chartPoints[key] || [];
              const config = seriesConfig[key];

              return (
                <g key={key}>
                  {points.length > 1 && (
                    <polyline
                      points={buildPolyline(points)}
                      fill="none"
                      stroke={config.color}
                      strokeWidth={5}
                      strokeDasharray={config.dashArray}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`today-chart-line ${config.className}`}
                      style={{ fill: 'none' }}
                    />
                  )}

                  {points.map((point, index) => (
                    <g key={`${key}-${point.label}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={activeSeries.length > 3 ? 4 : 6}
                        fill={config.color}
                        stroke="#ffffff"
                        strokeWidth={3}
                        className={`today-chart-point ${config.className}`}
                      />

                      {showPointLabels && (
                        <>
                          <rect
                            x={getPointLabelX(point) - 24}
                            y={getPointLabelY(point, index) - 13}
                            width="48"
                            height="22"
                            rx="10"
                            className="today-chart-label-bg"
                          />

                          <text
                            x={getPointLabelX(point)}
                            y={getPointLabelY(point, index)}
                            fill={config.color}
                            className={`today-chart-point-label ${config.className}-label`}
                          >
                            {point.rawLabel}
                          </text>
                        </>
                      )}
                    </g>
                  ))}
                </g>
              );
            })}

            {showScale && (
              <text
                x={chartBox.left}
                y={chartBox.top - 24}
                className="today-chart-axis-title"
              >
                Score
              </text>
            )}
          </svg>
        )}

        <p className="today-chart-note">
          Sleep is normalized to the same 0–5 scale using 8 hours as the target.
        </p>
      </div>
    </section>
  );
}

function TodayRecommendedActions({
  insights,
  todayCounts,
  onNavigate,
}: {
  insights: InsightsResponse | null;
  todayCounts: TodayCounts;
  onNavigate?: (target: TodayNavigateTarget) => void;
}) {
  const trendInsights = insights?.insights.trend || [];
  const weeklyInsights = insights?.insights.weekly || [];
  const advancedInsights = insights?.insights.advanced || [];

  const actions: ActionItem[] = [
    {
      title: 'Trend',
      text: trendInsights[0] || weeklyInsights[0] || 'No strong trend detected yet.',
      className: 'recovery',
      icon: Sparkles,
    },
    {
      title: 'Weekly Pattern',
      text:
        advancedInsights[0] ||
        'Keep tracking your stress, sleep, workload, and energy.',
      className: 'sleep',
      icon: Moon,
    },
    {
      title: 'Continue dialogue',
      text:
        todayCounts.dialogueCount > 0
          ? `${todayCounts.dialogueCount} dialogue branch${todayCounts.dialogueCount === 1 ? '' : 'es'} available today.`
          : 'No dialogue branches available yet.',
      className: 'dialogue',
      icon: MessageCircle,
      route: 'dialogues',
    },
    {
      title: 'Use reflection tools',
      text:
        todayCounts.toolCount > 0
          ? `${todayCounts.toolCount} tool${todayCounts.toolCount === 1 ? '' : 's'} ready to use today.`
          : 'No tools unlocked yet.',
      className: 'tools',
      icon: Wrench,
      route: 'tools',
    },
  ];

  return (
    <section className="today-actions-section">
      <h2>Recommended Actions</h2>

      <div className="today-actions-list">
        {actions.map((action) => {
          const Icon = action.icon;
          const clickable = Boolean(action.route && onNavigate);

          return (
            <article
              className={`today-action-card ${action.className} ${clickable ? 'clickable' : ''}`}
              key={action.title}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={() => {
                if (action.route && onNavigate) {
                  onNavigate(action.route);
                }
              }}
              onKeyDown={(event) => {
                if (!action.route || !onNavigate) return;

                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onNavigate(action.route);
                }
              }}
            >
              <div className="today-action-icon">
                <Icon size={22} />
              </div>

              <div>
                <h3>{action.title}</h3>
                <p>{action.text}</p>
              </div>

              <ChevronRight size={22} />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ExpressiveInsights({ insights }: { insights: InsightsResponse }) {
  const trendInsights = insights.insights.trend || [];
  const weeklyInsights = insights.insights.weekly || [];
  const advancedInsights = insights.insights.advanced || [];

  const trendText = trendInsights[0] || 'No strong trend detected yet.';
  const weeklyText = weeklyInsights[0] || 'No weekly pattern available yet.';

  return (
    <section className="today-insights-panel">
      <div className="today-insights-header">
        <div>
          <h2>What the system noticed</h2>
        </div>

        <CircleGauge size={28} />
      </div>

      <div className="today-insight-grid">
        <article>
          <div>
            <Activity size={20} />
            <span>Trend</span>
          </div>
          <p>{trendText}</p>
        </article>

        <article>
          <div>
            <Moon size={20} />
            <span>Weekly</span>
          </div>
          <p>{weeklyText}</p>
        </article>
      </div>

      {advancedInsights.length > 0 && (
        <article className="today-insight-supporting">
          <div>
            <Sparkles size={20} />
            <span>Additional Signals</span>
          </div>

          <ul>
            {advancedInsights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}

function TodayPage({
  entries,
  insights,
  loading,
  error,
  todayCounts = {
    dialogueCount: 0,
    toolCount: 0,
  },
  onNavigate,
}: TodayPageProps) {
  if (loading) {
    return (
      <main className="dashboard dashboard-blended" aria-label="Today dashboard">
        <section className="dashboard-status">
          <h1>Loading your dashboard...</h1>
          <p>Getting your latest wellness entries and insights.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard dashboard-blended" aria-label="Today dashboard">
        <section className="dashboard-status dashboard-error">
          <h1>Unable to load dashboard</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  const currentEntry = getLatestEntry(entries);

  if (!currentEntry) {
    return (
      <main className="dashboard dashboard-blended" aria-label="Today dashboard">
        <section className="dashboard-status">
          <h1>No daily logs yet</h1>
          <p>Use the plus button to add your first check-in and generate insights.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard dashboard-blended" aria-label="Today dashboard">
      <RiskSummaryCard entry={currentEntry} />
      {insights && <ExpressiveInsights insights={insights} />}
      {insights && <AveragesSummary averages={insights.averages} />}
      <TodayTrendChart entries={entries} />
      <TodayRecommendedActions
        insights={insights}
        todayCounts={todayCounts}
        onNavigate={onNavigate}
      />
    </main>
  );
}

export default TodayPage;
