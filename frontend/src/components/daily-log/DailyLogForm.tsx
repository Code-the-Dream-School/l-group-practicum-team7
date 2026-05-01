import { useState } from "react";

function DailyLogForm({ onSave, onClose }: any) {
  const [stress, setStress] = useState(3);
  const [mood, setMood] = useState(3);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [work, setWork] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({ stress, mood, sleepHours: sleep, energy, workload: work });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Daily Log</h1>
      <h2>How are you feeling today?</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>Stress Level: {stress}</label>
        <br />
        <input
          type="range"
          min="1"
          max="5"
          value={stress}
          onChange={(e) => setStress(Number(e.target.value))}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Mood: {mood}</label>
        <br />
        <input
          type="range"
          min="1"
          max="5"
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Sleep: {sleep}</label>
        <br />
        <input
          type="range"
          min="1"
          max="8"
          value={sleep}
          onChange={(e) => setSleep(Number(e.target.value))}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Energy: {energy}</label>
        <br />
        <input
          type="range"
          min="1"
          max="5"
          value={energy}
          onChange={(e) => setEnergy(Number(e.target.value))}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Workload: {work}</label>
        <br />
        <input
          type="range"
          min="1"
          max="5"
          value={work}
          onChange={(e) => setWork(Number(e.target.value))}
        />
      </div>

      <button type="submit">Save</button>
    </form>
  );
}

export default DailyLogForm;
