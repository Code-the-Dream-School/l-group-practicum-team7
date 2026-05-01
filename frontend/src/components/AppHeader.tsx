import { Activity, Plus } from 'lucide-react';

function AppHeader() {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">
          <Activity aria-hidden="true" />
        </span>
        <span>PulseMind</span>
      </div>
      <button className="add-entry" type="button" aria-label="Add new entry">
        <Plus aria-hidden="true" />
      </button>
    </header>
  );
}

export default AppHeader;
