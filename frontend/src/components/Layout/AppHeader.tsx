import { useState } from "react";
import { Activity, Plus } from "lucide-react";
import DailyLogForm from "../Forms/DailyLogForm";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

interface DailyLogData {
  stress: number;
  sleepHours: number;
  energy: number;
  workload: number;
}

interface AppHeaderProps {
  onEntryCreated: () => void;
}

function AppHeader({ onEntryCreated }: AppHeaderProps) {
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);

  const handleSave = async (data: DailyLogData): Promise<void> => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No auth token found. Please log in again.');
    }

    const payload = {
      stress: data.stress,
      sleepHours: data.sleepHours,
      energy: data.energy,
      workload: data.workload,
    };

    const response = await fetch(`${API}/api/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message || result?.error || 'Failed to save daily log');
    }

    onEntryCreated();
  };


  return (
    <>
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">
            <Activity aria-hidden="true" />
          </span>

          <span>PulseMind</span>
        </div>

        <button
          className="add-entry"
          type="button"
          onClick={() => setIsDailyLogOpen(true)}
          aria-label="Add new entry"
        >
          <Plus aria-hidden="true" />
        </button>
      </header>

      {isDailyLogOpen && (
        <DailyLogForm
          onSave={handleSave}
          onClose={() => setIsDailyLogOpen(false)}
        />
      )}
    </>
  );
}

export default AppHeader;
