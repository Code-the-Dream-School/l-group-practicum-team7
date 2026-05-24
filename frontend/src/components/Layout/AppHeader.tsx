import { useState } from "react";
import { Activity, Plus } from "lucide-react";
import DailyLogForm from "./DailyLogForm";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

interface DailyLogData {
  stress: number;
  sleepHours: number;
  energy: number;
  workload: number;
}

function AppHeader() {
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);

  const handleSave = async (data: DailyLogData) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No auth token found");
    }

    console.log("Send to backend:", data);

    const response = await fetch(`${API}/api/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message || "Failed to save daily log");
    }

    console.log("Response from backend:", result);

    window.dispatchEvent(
      new CustomEvent("entries.updated", {
        detail: { entry: result },
      }),
    );

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
