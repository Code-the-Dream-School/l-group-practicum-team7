import { useState } from "react";
import { AlertTriangle, Moon, Zap, Briefcase, X } from "lucide-react";

import "./DailyLog.css";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

interface DailyLogData {
  stress: number;
  sleepHours: number;
  energy: number;
  workload: number;
}

interface DailyLogFormProps {
  onSave?: (data: DailyLogData) => Promise<void>;
  onClose?: () => void;
  onEntryCreated?: (entry?: unknown) => void;
  closeOnSave?: boolean;
}

function DailyLogForm({
  onSave,
  onClose,
  onEntryCreated,
  closeOnSave,
}: DailyLogFormProps) {
  const [stress, setStress] = useState(3);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [work, setWork] = useState(3);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const shouldCloseAfterSave = closeOnSave ?? Boolean(onClose);

  async function saveToBackend(data: DailyLogData) {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("You need to log in first.");
    }

    const response = await fetch(`${API}/api/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.error || result.msg || result.message || "Failed to create entry",
      );
    }

    return result;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: DailyLogData = {
      stress,
      sleepHours: sleep,
      energy,
      workload: work,
    };

    setPending(true);
    setMessage("");
    setErrorMessage("");

    try {
      const result = onSave ? await onSave(payload) : await saveToBackend(payload);

      setMessage("Daily log saved.");

      if (onEntryCreated) {
        onEntryCreated(result);
      }

      window.dispatchEvent(
        new CustomEvent("insights.entry", {
          detail: { entry: result, text: "Daily log saved." },
        }),
      );

      if (shouldCloseAfterSave && onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to save daily log:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save daily log. Please try again.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="daily-log-wrapper">
      <div className={onClose ? "daily-log-overlay" : "daily-log-inline"}>
        <div className="daily-log-card">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="daily-log-close-btn"
              aria-label="Close daily log"
            >
              <X size={18} />
            </button>
          )}

          <h1 className="daily-log-title">Daily Log</h1>

          <p className="daily-log-subtitle">How are you feeling today?</p>

          {errorMessage && (
            <div className="daily-log-error">{errorMessage}</div>
          )}

          {message && <div className="daily-log-success">{message}</div>}

          <form onSubmit={handleSubmit} className="daily-log-scroll-area">
            <div className="daily-log-field">
              <div className="daily-log-field-header">
                <div className="daily-log-label-container">
                  <AlertTriangle size={18} />
                  <span>Stress Level</span>
                </div>

                <span className="daily-log-value-badge">{stress}</span>
              </div>

              <input
                className="daily-log-slider-input"
                type="range"
                min="1"
                max="5"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
              />

              <div className="daily-log-legend">
                <span>Calm</span>
                <span>Critical</span>
              </div>
            </div>

            <div className="daily-log-field">
              <div className="daily-log-field-header">
                <div className="daily-log-label-container">
                  <Moon size={18} />
                  <span>Sleep Hours</span>
                </div>

                <span className="daily-log-value-badge">{sleep}</span>
              </div>

              <input
                className="daily-log-slider-input"
                type="range"
                min="1"
                max="24"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(Number(e.target.value))}
              />

              <div className="daily-log-legend">
                <span>Less Sleep</span>
                <span>More Sleep</span>
              </div>
            </div>

            <div className="daily-log-field">
              <div className="daily-log-field-header">
                <div className="daily-log-label-container">
                  <Zap size={18} />
                  <span>Energy</span>
                </div>

                <span className="daily-log-value-badge">{energy}</span>
              </div>

              <input
                className="daily-log-slider-input"
                type="range"
                min="1"
                max="5"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
              />

              <div className="daily-log-legend">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div className="daily-log-field">
              <div className="daily-log-field-header">
                <div className="daily-log-label-container">
                  <Briefcase size={18} />
                  <span>Workload</span>
                </div>

                <span className="daily-log-value-badge">{work}</span>
              </div>

              <input
                className="daily-log-slider-input"
                type="range"
                min="1"
                max="5"
                value={work}
                onChange={(e) => setWork(Number(e.target.value))}
              />

              <div className="daily-log-legend">
                <span>Light</span>
                <span>Heavy</span>
              </div>
            </div>

            <button
              type="submit"
              className="daily-log-save-button"
              disabled={pending}
            >
              {pending ? "SAVING..." : "SAVE DAILY LOG"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DailyLogForm;