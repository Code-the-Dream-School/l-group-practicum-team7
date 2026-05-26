import { Activity, CalendarDays, Sparkles, TrendingUp } from 'lucide-react';
import type { InsightGroups } from '../types/wellness';

type InsightHighlightsProps = {
  insights: InsightGroups;
};

function InsightHighlights({ insights }: InsightHighlightsProps) {
  const groups = [
    { title: 'Today', messages: insights.today, Icon: Activity },
    { title: 'Trend', messages: insights.trend, Icon: TrendingUp },
    { title: 'Weekly', messages: insights.weekly, Icon: CalendarDays },
    { title: 'Additional Signals', messages: insights.advanced, Icon: Sparkles },
  ].filter((group) => group.messages.length > 0);

  if (!groups.length) {
    return null;
  }

  return (
    <section className="insights-section" aria-labelledby="insights-heading">
      <h2 id="insights-heading">Insights</h2>

      <div className="insight-grid">
        {groups.map(({ title, messages, Icon }) => (
          <article className="insight-card" key={title}>
            <h3>
              <Icon aria-hidden="true" />
              {title}
            </h3>
            <ul>
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default InsightHighlights;
