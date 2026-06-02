import { useEffect, useState } from "react";
import "./insights.css";

type InsightsProps = {
  initialEntry?: string;
};

export default function Insights({ initialEntry = "" }: InsightsProps) {
  const [entry, setEntry] = useState(initialEntry);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ text?: string }>;
      setEntry(customEvent.detail?.text || "");
    };

    window.addEventListener("insights.entry", handler);

    return () => {
      window.removeEventListener("insights.entry", handler);
    };
  }, []);

  return (
    <section className="insights-panel">
      <h2>Insights</h2>

      {entry ? (
        <p>{entry}</p>
      ) : (
        <p>No entry selected yet.</p>
      )}
    </section>
  );
}