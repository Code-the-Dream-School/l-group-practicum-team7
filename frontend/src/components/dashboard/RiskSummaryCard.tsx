import { Activity, Info } from 'lucide-react';
import type { Entry } from '../../types/wellness';
import { getRiskMessage } from '../../utils/wellness';

type RiskSummaryCardProps = {
  entry: Entry;
};

function RiskSummaryCard({ entry }: RiskSummaryCardProps) {
  return (
    <section className={`risk-card risk-${entry.burnoutLevel.toLowerCase()}`}>
      <div>
        <p className="eyebrow">Burnout Risk</p>
        <h1>{entry.burnoutLevel}</h1>
        <p className="score">Burnout Score: {entry.burnoutScore}/5</p>
      </div>
      <span className="pulse-icon">
        <Activity aria-hidden="true" />
      </span>
      <p className="risk-note">
        <Info aria-hidden="true" />
        {getRiskMessage(entry)}
      </p>
    </section>
  );
}

export default RiskSummaryCard;
