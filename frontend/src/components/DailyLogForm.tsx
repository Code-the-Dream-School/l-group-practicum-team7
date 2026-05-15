import { useState } from "react";
import { AlertTriangle, Moon, Zap, Smile, Briefcase, X } from "lucide-react";

import "./DailyLog.css";

interface DailyLogData {
  stress: number;

  sleepHours: number;
  energy: number;
  workload: number;
}

interface DailyLogFormProps {
  onSave: (data: DailyLogData) => Promise<void>;
  onClose: () => void;
}

function DailyLogForm({ onSave, onClose }: DailyLogFormProps) {
  const [stress, setStress] = useState(3);

  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [work, setWork] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await onSave({
        stress,
        sleepHours: sleep,
        energy,
        workload: work,
      });

      onClose();
    } catch (error) {
      console.error("Failed to save daily log:", error);
      setErrorMessage("Failed to save daily log. Please try again.");
    }
  };

  return (
    <div className="daily-log-wrapper">
      <div className="daily-log-overlay">
        <div className="daily-log-card">
          <button
            type="button"
            onClick={onClose}
            className="daily-log-close-btn"
          >
            <X size={18} />
          </button>

          <h1 className="daily-log-title">Daily Log</h1>

          <p className="daily-log-subtitle">How are you feeling today?</p>

          {errorMessage && (
            <div className="daily-log-error">{errorMessage}</div>
          )}

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

            <button type="submit" className="daily-log-save-button">
              SAVE DAILY LOG
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DailyLogForm;
