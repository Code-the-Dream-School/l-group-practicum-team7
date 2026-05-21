import { useState } from 'react';
import { Activity, Plus } from 'lucide-react';
import DailyLogForm from '../Forms/DailyLogForm';

interface DailyLogData {
  stress: number;
  mood: number;
  sleepHours: number;
  energy: number;
  workload: number;
}

function AppHeader() {
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);

 const handleSave = async (data: DailyLogData) => {
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

    console.log('Send to backend:', payload);

    const response = await fetch(`http://localhost:8080/api/entries`, {
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

    console.log('Response from backend:', result);

    return result;
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
        <button className="add-entry" type="button" onClick={() => setIsDailyLogOpen(!isDailyLogOpen)} aria-label="Add new entry">
          <Plus aria-hidden="true" />
        </button>
      </header>
      
      {isDailyLogOpen && (
        <DailyLogForm onSave={handleSave} onClose={() => setIsDailyLogOpen(false)} />
      )}
    </>
  );
}

export default AppHeader;
