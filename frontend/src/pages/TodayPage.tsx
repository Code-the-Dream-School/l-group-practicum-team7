import MetricCards from '../components/MetricCards';
import RecommendedActions from '../components/RecommendedActions';
import RiskSummaryCard from '../components/RiskSummaryCard';
import WeeklyTrendsChart from '../components/WeeklyTrendsChart';
import { mockEntryInputs } from '../services/mockEntries';
import { buildEntry, getRecommendations } from '../utils/wellness';

function TodayPage() {
  const entries = mockEntryInputs.map(buildEntry);
  const currentEntry = entries[entries.length - 1]; // Get the last entry (most recent)
  const trendData = entries.map((entry) => ({
    day: entry.date.toLocaleDateString('en-US', { weekday: 'short' }),
    stress: entry.stress,
    workload: entry.workload,
  }));
  const recommendations = getRecommendations(currentEntry);

  return (
    <main className="dashboard" aria-label="Today dashboard">
      <RiskSummaryCard entry={currentEntry} />
      <MetricCards entry={currentEntry} />
      <WeeklyTrendsChart trendData={trendData} />
      <RecommendedActions recommendations={recommendations} />
    </main>
  );
}

export default TodayPage;
