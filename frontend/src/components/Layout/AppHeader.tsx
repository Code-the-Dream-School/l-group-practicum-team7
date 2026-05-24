import { useState } from 'react';
import { Activity, Plus } from 'lucide-react';
import DailyLogForm from '../Forms/DailyLogForm';

const API = import.meta.env.VITE_API_BASE;

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
    try {
      console.log("Send to backend:", data);
      const response = await fetch("http://localhost:8080/api/entries", {        
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save daily log");
      }
      console.log("Response from backend:", result);
      return result;
    } catch (error) {
      console.error("Error sending data to backend:", error);
      throw error;
    }
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
