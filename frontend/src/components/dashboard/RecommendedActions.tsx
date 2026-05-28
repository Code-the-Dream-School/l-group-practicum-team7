import { ChevronRight, CircleCheck } from 'lucide-react';
import type { Recommendation } from '../../types/wellness';

type RecommendedActionsProps = {
  recommendations: Recommendation[];
};

function RecommendedActions({ recommendations }: RecommendedActionsProps) {
  return (
    <section className="actions-section" aria-labelledby="actions-heading">
      <h2 id="actions-heading">Recommended Actions</h2>

      <div className="action-list">
        {recommendations.length > 0 ? (
          recommendations.map(({ title, description, variant, Icon }) => (
            <article className={`action-card ${variant}-action`} key={title}>
              <span className="action-icon">
                <Icon aria-hidden="true" />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <ChevronRight className="action-arrow" aria-hidden="true" />
            </article>
          ))
        ) : (
          <article className="action-card empty-action">
            <span className="action-icon">
              <CircleCheck aria-hidden="true" />
            </span>
            <div>
              <h3>No urgent actions</h3>
              <p>Your latest entry looks stable. Add another check-in to refresh suggestions.</p>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

export default RecommendedActions;
