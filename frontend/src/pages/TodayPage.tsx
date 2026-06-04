import AveragesSummary from '../components/AveragesSummary';
import InsightHighlights from '../components/InsightHighlights';
import MetricCards from '../components/MetricCards';
import RecommendedActions from '../components/RecommendedActions';
import RiskSummaryCard from '../components/RiskSummaryCard';
import WeeklyTrendsChart from '../components/WeeklyTrendsChart';
import type { Entry, InsightsResponse } from '../types/wellness';
import { getRecommendations } from '../utils/wellness';

type TodayPageProps = {
  entries: Entry[];
  insights: InsightsResponse | null;
  loading: boolean;
  error: string | null;
};

function TodayPage({ entries, insights, loading, error }: TodayPageProps) {
  if (loading) {
    return (
      <main className="dashboard" aria-label="Today dashboard">
        <section className="dashboard-status">
          <h1>Loading your dashboard...</h1>
          <p>Getting your latest wellness entries and insights.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard" aria-label="Today dashboard">
        <section className="dashboard-status dashboard-error">
          <h1>Unable to load dashboard</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  const currentEntry = entries[0];

  if (!currentEntry) {
    return (
      <main className="dashboard" aria-label="Today dashboard">
        <section className="dashboard-status">
          <h1>No daily logs yet</h1>
          <p>Use the plus button to add your first check-in and generate insights.</p>
        </section>
      </main>
    );
  }

  const trendData = [...entries.slice(0, 7)].reverse().map((entry) => ({
    day: entry.date.toLocaleDateString('en-US', { weekday: 'short' }),
    stress: entry.stress,
    workload: entry.workload,
  }));
  const recommendations = getRecommendations(currentEntry);

  return (
    <main className="dashboard" aria-label="Today dashboard">
      <RiskSummaryCard entry={currentEntry} />
      <MetricCards entry={currentEntry} />
      {insights && <AveragesSummary averages={insights.averages} />}
      <WeeklyTrendsChart trendData={trendData} />
      <RecommendedActions recommendations={recommendations} />
      {insights && <InsightHighlights insights={insights.insights} />}
    </main>
  );
}

export default TodayPage;
