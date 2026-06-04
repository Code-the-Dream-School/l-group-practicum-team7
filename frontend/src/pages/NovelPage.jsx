import React, { useEffect, useState } from "react";
import NovelTextViewer from "../components/novel/NovelTextViewer";
import dialogueFlows from "../assets/novel/text/dialogueFlows";
import "../components/novel/NovelTextViewer.css";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function uniqueById(items) {
  const map = new Map();

  items.forEach((item) => {
    if (item?.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
}

export default function NovelPage({ onNavigate }) {
  const [available, setAvailable] = useState([]);
  const [insightLines, setInsightLines] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMascotContext() {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setAvailable([]);
      setInsightLines([]);
      setEntries([]);
      setError("Please log in to start a dialogue.");
      setLoading(false);
      return;
    }

    try {
      const [dialoguesResp, insightsResp, entriesResp] = await Promise.all([
        fetch(`${API}/api/dialogues/available`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/insights`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/entries`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (dialoguesResp.status === 401) {
        setAvailable([]);
        setInsightLines([]);
        setEntries([]);
        setError("Authentication failed. Please log in again.");
        return;
      }

      if (!dialoguesResp.ok) {
        throw new Error(`Failed to load dialogues: ${dialoguesResp.status}`);
      }

      const dialoguesData = await dialoguesResp.json();
      const backendDialogues = Array.isArray(dialoguesData.dialogues)
        ? dialoguesData.dialogues
        : [];

      const validDialogues = backendDialogues.filter(
        (dialogue) => dialogue.id && dialogueFlows[dialogue.id]
      );

      setAvailable(uniqueById(validDialogues));

      if (insightsResp.ok) {
        const insightsData = await insightsResp.json();
        const advanced = insightsData.insights?.advanced || [];
        const trend = insightsData.insights?.trend || [];
        const today = insightsData.insights?.today || [];
        const weekly = insightsData.insights?.weekly || [];

        setInsightLines(
          [...advanced, ...trend, ...today, ...weekly].filter(Boolean)
        );
      } else {
        setInsightLines([]);
      }

      if (entriesResp.ok) {
        const entriesData = await entriesResp.json();
        const nextEntries = Array.isArray(entriesData)
          ? entriesData
          : entriesData.entries || [];

        setEntries(Array.isArray(nextEntries) ? nextEntries : []);
      } else {
        setEntries([]);
      }
    } catch (e) {
      setAvailable([]);
      setInsightLines([]);
      setEntries([]);
      setError("Could not load dialogue context.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMascotContext();
  }, []);

  if (loading) {
    return (
      <div className="novel-page">
        <div className="dialogue-status">Loading dialogue...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="novel-page">
        <div className="dialogue-error">
          <p>{error}</p>

          <button className="btn-primary" onClick={loadMascotContext}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="novel-page">
      <NovelTextViewer
        entries={entries}
        insightLines={insightLines}
        dashboardContext={{
          dialogueCount: available.length,
          hasHighBurnout: insightLines.some((line) =>
            String(line).toLowerCase().includes("burnout")
          ),
        }}
        availableDialogues={available}
        autoStart
        onNavigate={onNavigate}
        onBack={loadMascotContext}
        onDialogueFinished={loadMascotContext}
      />
    </div>
  );
}
