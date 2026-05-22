import React, { useEffect, useState } from 'react';
import NovelTextViewer from '../components/novel/NovelTextViewer';
import dialogueFlows from '../assets/novel/text/dialogueFlows';
import dialogueEngine from '../assets/novel/text/dialogueEngine';
import '../components/novel/NovelTextViewer.css';

// const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const API = import.meta.env.VITE_API_BASE;

function uniqueById(items) {
  const map = new Map();

  items.forEach((item) => {
    if (item && item.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
}

export default function NovelPage() {
  const [flowId, setFlowId] = useState(null);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [insightLines, setInsightLines] = useState([]);

  async function loadAvailableDialogues() {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    if (!token) {
      setAvailable([]);
      setError('Please log in to get recommended dialogues.');
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch(`${API}/api/dialogues/available`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.status === 401) {
        setAvailable([]);
        setError('Authentication failed. Please log in again.');
        setLoading(false);
        return;
      }

      if (!resp.ok) {
        throw new Error(`Failed to load dialogues: ${resp.status}`);
      }

      const data = await resp.json();

      const backendDialogues = Array.isArray(data.dialogues)
        ? data.dialogues
        : [];

      const validDialogues = backendDialogues.filter((dialogue) => {
        return dialogue.id && dialogueFlows[dialogue.id];
      });

      setAvailable(uniqueById(validDialogues));
    } catch (e) {
      setAvailable([]);
      setError('Could not load recommended dialogues from backend.');
    } finally {
      setLoading(false);
    }
  }

  async function loadInsightsForMascot() {
    const token = localStorage.getItem('token');

    if (!token) {
      setInsightLines([]);
      return;
    }

    try {
      const resp = await fetch(`${API}/api/insights`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resp.ok) {
        setInsightLines([]);
        return;
      }

      const data = await resp.json();

      const advanced = data.insights?.advanced || [];
      const trend = data.insights?.trend || [];
      const today = data.insights?.today || [];
      const weekly = data.insights?.weekly || [];

      const lines = [
        ...advanced,
        ...trend,
        ...today,
        ...weekly,
      ];

      setInsightLines(lines.filter(Boolean));
    } catch (e) {
      setInsightLines([]);
    }
  }

  useEffect(() => {
    loadAvailableDialogues();
    loadInsightsForMascot();
  }, []);

  if (flowId) {
    return (
      <div className="novel-page">
        <NovelTextViewer
          flowId={flowId}
          insightLines={insightLines}
          currentNode={dialogueEngine.getCurrentNode()}
          onNext={() => {
            const node = dialogueEngine.goNext();
            return node;
          }}
          onChoose={(choiceId) => {
            const node = dialogueEngine.chooseOption(choiceId);
            return node;
          }}
          onBack={() => setFlowId(null)}
          onDialogueFinished={() => {
            setFlowId(null);
            loadAvailableDialogues();
            loadInsightsForMascot();
          }}
        />
      </div>
    );
  }

  return (
    <div className="novel-page">
      <div className="dialogue-select-card">
        <p className="dialogue-kicker">Today's focus</p>

        <h2>What should we work on?</h2>

        <p className="dialogue-muted">
          Based on your recent entries, PulseMind suggests the most relevant
          conversation paths.
        </p>

        {insightLines.length > 0 && (
          <div className="mascot-insight-card">
            <strong>Mascot insight</strong>
            <span>{insightLines[0]}</span>
          </div>
        )}

        {loading && <div className="dialogue-status">Loading...</div>}

        {!loading && error && (
          <div className="dialogue-error">
            <p>{error}</p>

            <button className="btn-primary" onClick={loadAvailableDialogues}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && available.length === 0 && (
          <div className="dialogue-status">
            No recommended dialogues yet. Add a daily log first.
          </div>
        )}

        {!loading && !error && available.length > 0 && (
          <div className="dialogue-options">
            {available.map((flow) => (
              <button
                type="button"
                key={flow.id}
                className="dialogue-option-card"
                onClick={() => {
                dialogueEngine.startDialogue(flow.id);
                setFlowId(flow.id);
              }}
              >
                <span className="dialogue-option-title">{flow.title}</span>

                {flow.reason && (
                  <span className="dialogue-option-reason">{flow.reason}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}