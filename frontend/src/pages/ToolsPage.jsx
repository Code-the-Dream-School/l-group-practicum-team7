import React, { useEffect, useState } from 'react';
import {
  Wind,
  Brain,
  Moon,
  Briefcase,
  HeartHandshake,
  ListChecks,
  PenLine,
  Sparkles,
} from 'lucide-react';

import toolDefinitions from '../assets/tools/toolDefinitions';
import './ToolsPage.css';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const STORAGE_PREFIX = 'pulsemind';

const toolIcons = {
  breathing: Wind,
  grounding: Brain,
  thought_dump: PenLine,
  over_responsibility: Briefcase,
  strategic_refusal: HeartHandshake,
  prioritization: ListChecks,
  asking_for_support: HeartHandshake,
  future_me_letter: PenLine,
  five_minute_pause: Sparkles,
  five_minute_task: ListChecks,
  evening_release: Moon,
  letter_to_tomorrow_me: PenLine,
  tomorrow_list: ListChecks,
  light_mode: Sparkles,
  body_reset: HeartHandshake,
  future_sentence: PenLine,
  three_good_things: Sparkles,
};

function getToolType(definition) {
  if (!definition) return 'textarea';
  if (definition.type) return definition.type;
  if (definition.fields) return 'fields';
  if (definition.options) return 'priority';
  if (definition.durationSeconds) return 'timer';

  return 'textarea';
}

function getToolPreview(definition) {
  const text =
    definition?.instruction ||
    definition?.description ||
    definition?.sample ||
    '';

  return text.slice(0, 180);
}

function extractUnlockedToolIds(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  return Array.from(
    new Set(
      raw
        .map((item) => {
          if (typeof item === 'string') return item;
          return item?.key || item?.id || null;
        })
        .filter((id) => id && toolDefinitions[id])
    )
  );
}

function createPriorityRows(definition) {
  const rowsCount = definition?.rows || 3;
  const urgency = definition?.options?.urgency?.[1]?.value || 'not urgent';
  const importance = definition?.options?.importance?.[0]?.value || 'important';

  return Array.from({ length: rowsCount }, () => ({
    task: '',
    urgency,
    importance,
  }));
}

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      '='
    );

    return JSON.parse(window.atob(padded));
  } catch (e) {
    return null;
  }
}

function sanitizeStoragePart(value) {
  return String(value || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_');
}

function getCurrentUserScope() {
  const token = localStorage.getItem('token');

  if (!token) {
    return 'anonymous';
  }

  const payload = decodeJwtPayload(token);
  const userKey =
    payload?.userId ||
    payload?.id ||
    payload?._id ||
    payload?.sub ||
    payload?.email ||
    payload?.username;

  if (userKey) {
    return sanitizeStoragePart(userKey);
  }

  return sanitizeStoragePart(token.slice(-24));
}

function getScopedStorageKey(name) {
  return `${STORAGE_PREFIX}:${getCurrentUserScope()}:${name}`;
}

function getUnlockedKey() {
  return getScopedStorageKey('unlockedTools');
}

function getDialogueStateKey() {
  return getScopedStorageKey('dialogueState_v1');
}

function getSeenNodesKey() {
  return getScopedStorageKey('seenNodes');
}

function getHistoryKey(toolId) {
  return getScopedStorageKey(`tool:${toolId}:entries`);
}

function clearLegacyToolStorage() {
  localStorage.removeItem('unlockedTools');
  localStorage.removeItem('dialogueState_v1');
  localStorage.removeItem('seenNodes');

  Object.keys(localStorage)
    .filter((key) => key.startsWith('tool:') && key.endsWith(':entries'))
    .forEach((key) => localStorage.removeItem(key));
}

function clearCurrentUserToolStorage() {
  localStorage.removeItem(getUnlockedKey());
  localStorage.removeItem(getDialogueStateKey());
  localStorage.removeItem(getSeenNodesKey());

  const scopePrefix = `${STORAGE_PREFIX}:${getCurrentUserScope()}:`;

  Object.keys(localStorage)
    .filter(
      (key) =>
        key.startsWith(scopePrefix) &&
        key.includes(':tool:') &&
        key.endsWith(':entries')
    )
    .forEach((key) => localStorage.removeItem(key));
}

export default function ToolsPage() {
  const [unlocked, setUnlocked] = useState([]);
  const [activeToolId, setActiveToolId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [fieldValues, setFieldValues] = useState({});
  const [priorityRows, setPriorityRows] = useState([]);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [savedMessage, setSavedMessage] = useState('');

  const activeDefinition = activeToolId ? toolDefinitions[activeToolId] : null;
  const activeType = getToolType(activeDefinition);
  const activeInstruction = activeDefinition?.instruction || '';
  const activeSample =
    activeDefinition?.sample || 'Write your reflection here...';

  useEffect(() => {
    let mounted = true;

    async function loadUnlocked() {
      const token = localStorage.getItem('token');

      if (!token) {
        if (mounted) {
          setUnlocked([]);
        }

        return;
      }

      let localKeys = [];

      try {
        const raw = JSON.parse(localStorage.getItem(getUnlockedKey()) || '[]');
        localKeys = extractUnlockedToolIds(raw);

        if (mounted) {
          setUnlocked(localKeys);
        }
      } catch (e) {
        localKeys = [];
      }

      try {
        const resp = await fetch(`${API}/api/dialogues/tools`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resp.ok) {
          return;
        }

        const data = await resp.json();
        const backendRaw = Array.isArray(data?.tools)
          ? data.tools
          : Array.isArray(data?.unlockedTools)
            ? data.unlockedTools
            : [];

        const backendKeys = extractUnlockedToolIds(backendRaw);
        const mergedKeys = Array.from(new Set([...localKeys, ...backendKeys]));

        localStorage.setItem(getUnlockedKey(), JSON.stringify(mergedKeys));

        if (mounted) {
          setUnlocked(mergedKeys);
        }
      } catch (e) {}
    }

    loadUnlocked();

    const handler = (e) => {
      const token = localStorage.getItem('token');

      if (!token) {
        setUnlocked([]);
        return;
      }

      try {
        if (Array.isArray(e?.detail?.unlockedTools)) {
          const ids = extractUnlockedToolIds(e.detail.unlockedTools);

          localStorage.setItem(getUnlockedKey(), JSON.stringify(ids));
          setUnlocked(ids);
          return;
        }

        const raw = JSON.parse(localStorage.getItem(getUnlockedKey()) || '[]');
        setUnlocked(extractUnlockedToolIds(raw));
      } catch (err) {
        setUnlocked([]);
      }
    };

    window.addEventListener('dialogueStateUpdate', handler);
    window.addEventListener('authChanged', loadUnlocked);

    return () => {
      mounted = false;
      window.removeEventListener('dialogueStateUpdate', handler);
      window.removeEventListener('authChanged', loadUnlocked);
    };
  }, []);

  useEffect(() => {
    let timerId = null;

    if (timerRunning && timerSec > 0) {
      timerId = window.setInterval(() => {
        setTimerSec((current) => current - 1);
      }, 1000);
    }

    if (timerRunning && timerSec <= 0) {
      setTimerRunning(false);
    }

    return () => {
      if (timerId) {
        window.clearInterval(timerId);
      }
    };
  }, [timerRunning, timerSec]);

  function loadHistory(toolId) {
    try {
      return JSON.parse(localStorage.getItem(getHistoryKey(toolId)) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveEntry(toolId, payload) {
    const key = getHistoryKey(toolId);
    const currentEntries = loadHistory(toolId);
    const nextEntries = [
      ...currentEntries,
      { ...payload, savedAt: new Date().toISOString() },
    ];

    localStorage.setItem(key, JSON.stringify(nextEntries));
    setHistoryEntries(nextEntries);
  }

  function openToolModal(toolId) {
    const definition = toolDefinitions[toolId];

    if (!definition) {
      return;
    }

    const type = getToolType(definition);
    const initialFieldValues = {};

    if (Array.isArray(definition.fields)) {
      definition.fields.forEach((field) => {
        initialFieldValues[field.key] = '';
      });
    }

    setActiveToolId(toolId);
    setModalOpen(true);
    setTimerRunning(false);
    setTimerSec(type === 'timer' ? definition.durationSeconds || 60 : 0);
    setTextValue('');
    setFieldValues(initialFieldValues);
    setPriorityRows(type === 'priority' ? createPriorityRows(definition) : []);
    setHistoryEntries(loadHistory(toolId));
    setSavedMessage('');
  }

  function closeToolModal() {
    setModalOpen(false);
    setTimerRunning(false);
  }

  function resetUnlockedTools() {
    clearCurrentUserToolStorage();
    clearLegacyToolStorage();

    setUnlocked([]);
    setActiveToolId(null);
    setModalOpen(false);
    setTimerRunning(false);
    setTimerSec(0);
    setTextValue('');
    setFieldValues({});
    setPriorityRows([]);
    setHistoryEntries([]);
    setSavedMessage('');

    window.dispatchEvent(
      new CustomEvent('dialogueStateUpdate', {
        detail: {
          unlockedTools: [],
          dialogueState: null,
          seenNodes: {},
        },
      })
    );
  }

  function unlockAllTools() {
    const allTools = Object.values(toolDefinitions).map((tool) => ({
      key: tool.id,
      title: tool.name,
      unlockedAt: new Date().toISOString(),
    }));

    localStorage.setItem(getUnlockedKey(), JSON.stringify(allTools));
    setUnlocked(allTools.map((tool) => tool.key));

    window.dispatchEvent(
      new CustomEvent('dialogueStateUpdate', {
        detail: {
          unlockedTools: allTools,
        },
      })
    );
  }

  function updateFieldValue(key, value) {
    setFieldValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updatePriorityRow(index, key, value) {
    setPriorityRows((currentRows) =>
      currentRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row
      )
    );
  }

  function buildFieldsText() {
    return (activeDefinition?.fields || [])
      .map((field) => {
        const value = fieldValues[field.key]?.trim();

        if (!value) {
          return '';
        }

        const prefix = field.prefix || field.label || field.key;

        return `${prefix} ${value}`.trim();
      })
      .filter(Boolean)
      .join('\n');
  }

  function buildPriorityText() {
    return priorityRows
      .map((row, index) => {
        if (!row.task.trim()) {
          return '';
        }

        return `Task ${index + 1}: ${row.task.trim()} — ${row.urgency}, ${row.importance}.`;
      })
      .filter(Boolean)
      .join('\n');
  }

  function buildEntryText() {
    if (activeType === 'fields') {
      return buildFieldsText();
    }

    if (activeType === 'priority') {
      return buildPriorityText();
    }

    return textValue.trim();
  }

  function saveCurrentToolEntry() {
    if (!activeToolId || !activeDefinition) {
      return;
    }

    if (activeType === 'timer') {
      saveEntry(activeToolId, {
        note: `Completed timer: ${activeInstruction}`,
      });
    } else {
      saveEntry(activeToolId, {
        text: buildEntryText() || activeSample,
      });
    }

    setSavedMessage('Saved');

    window.setTimeout(() => {
      setSavedMessage('');
    }, 1600);
  }

  function startTimer() {
    const duration = activeDefinition?.durationSeconds || 60;

    if (timerSec <= 0) {
      setTimerSec(duration);
    }

    setTimerRunning(true);
  }

  function renderHistory() {
    return (
      <div className="tool-history-section">
        <h3>History</h3>

        <div className="tool-history-list">
          {historyEntries.length === 0 ? (
            <div className="tool-history-empty">No entries yet.</div>
          ) : (
            historyEntries.map((entry, index) => (
              <div
                key={`${entry.savedAt || 'entry'}-${index}`}
                className="tool-history-item"
              >
                <div>{entry.savedAt}</div>
                <p>{entry.text || entry.note}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  function renderFieldsInput() {
    return (
      <div className="tool-structured-fields">
        {(activeDefinition?.fields || []).map((field) => (
          <label className="tool-structured-field" key={field.key}>
            <span>{field.label}</span>

            <input
              value={fieldValues[field.key] || ''}
              placeholder={field.placeholder}
              onChange={(e) => updateFieldValue(field.key, e.target.value)}
            />
          </label>
        ))}
      </div>
    );
  }

  function renderPriorityInput() {
    const urgencyOptions = activeDefinition?.options?.urgency || [
      { value: 'urgent', label: 'Urgent' },
      { value: 'not urgent', label: 'Not urgent' },
    ];

    const importanceOptions = activeDefinition?.options?.importance || [
      { value: 'important', label: 'Important' },
      { value: 'not important', label: 'Not important' },
    ];

    return (
      <div className="tool-priority-fields">
        {priorityRows.map((row, index) => (
          <div className="tool-priority-row" key={index}>
            <input
              value={row.task}
              placeholder={`Task ${index + 1}`}
              onChange={(e) =>
                updatePriorityRow(index, 'task', e.target.value)
              }
            />

            <select
              value={row.urgency}
              onChange={(e) =>
                updatePriorityRow(index, 'urgency', e.target.value)
              }
            >
              {urgencyOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={row.importance}
              onChange={(e) =>
                updatePriorityRow(index, 'importance', e.target.value)
              }
            >
              {importanceOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  function renderWritingInput() {
    if (activeType === 'fields') {
      return renderFieldsInput();
    }

    if (activeType === 'priority') {
      return renderPriorityInput();
    }

    return (
      <textarea
        className="tool-textarea"
        placeholder={activeSample}
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
      />
    );
  }

  function renderTimerView() {
    return (
      <div className="tool-breathing-view">
        <div className="tool-experience-heading">
          <h2>Guided {activeDefinition?.name || activeToolId}</h2>
          <p>Use this short reset to slow down and regain focus.</p>
        </div>

        <div className={`breathing-orb ${timerRunning ? 'is-running' : ''}`}>
          <div className="breathing-orb-inner">
            <strong>{timerRunning ? 'Breathe' : 'Zen'}</strong>
            <span />
          </div>
        </div>

        <p className="tool-experience-instruction">{activeInstruction}</p>

        <div className="tool-experience-timer">{formatTimer(timerSec)}</div>

        <div className="tool-experience-actions">
          {timerRunning ? (
            <button
              type="button"
              className="tool-main-action"
              onClick={() => setTimerRunning(false)}
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              className="tool-main-action"
              onClick={startTimer}
            >
              {timerSec > 0 ? 'Start Now' : 'Restart'}
            </button>
          )}

          <button
            type="button"
            className="tool-secondary-action"
            onClick={() =>
              setTimerSec(activeDefinition?.durationSeconds || 60)
            }
          >
            Reset
          </button>

          <button
            type="button"
            className="tool-secondary-action"
            onClick={saveCurrentToolEntry}
          >
            Save result
          </button>
        </div>

        {savedMessage && <p className="tool-saved-message">{savedMessage}</p>}

        {renderHistory()}
      </div>
    );
  }

  function renderWritingView() {
    return (
      <div className="tool-writing-view">
        <div className="tool-experience-heading">
          <h2>{activeDefinition?.name || activeToolId}</h2>
          <p>{activeInstruction}</p>
        </div>

        <div className="tool-writing-card">
          {renderWritingInput()}

          <button
            type="button"
            className="tool-main-action full"
            onClick={saveCurrentToolEntry}
          >
            Save Reflection
          </button>

          {savedMessage && <p className="tool-saved-message">{savedMessage}</p>}
        </div>

        {renderHistory()}
      </div>
    );
  }

  function renderToolRow(toolId) {
    const definition = toolDefinitions[toolId];

    if (!definition) {
      return null;
    }

    const Icon = toolIcons[toolId] || PenLine;
    const previewText = getToolPreview(definition);

    return (
      <div className="tool-row-capsule" key={toolId}>
        <div className="tool-row-left">
          <div className="tool-icon-circle theme-blue">
            <Icon size={26} strokeWidth={2.5} />
          </div>

          <div className="tool-row-details">
            <h2 className="tool-row-title">{definition.name}</h2>

            {previewText && (
              <p className="tool-row-desc">
                {previewText}
                {previewText.length >= 180 ? '…' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="tool-row-actions">
          <button
            type="button"
            className="btn-use-capsule"
            onClick={() => openToolModal(toolId)}
          >
            Use Tool
          </button>

          <button
            type="button"
            className="btn-ghost-capsule"
            onClick={() => openToolModal(toolId)}
          >
            History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tools-page">
      <div className="tools-header-row">
        <div>
          <h1>PulseMind Tools</h1>
          <p>Tools recommended based on your emotional state.</p>
        </div>

        <div className="tools-admin-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={resetUnlockedTools}
          >
            Reset my tools
          </button>
        </div>
      </div>

      {unlocked.length === 0 && (
        <div className="tools-empty-state">
          <p>No tools unlocked yet. You can unlock tools via the Novel choices.</p>
          <p>To seed a tool for testing, run in console:</p>
          <pre>
            window.dispatchEvent(new CustomEvent('dialogueStateUpdate', &#123; detail: &#123; unlockedTools: ['thought_dump'] &#125; &#125;))
          </pre>
        </div>
      )}

      <div className="tools-grid-rows">
        {unlocked.map((toolId) => renderToolRow(toolId))}
      </div>

      {modalOpen && activeDefinition && (
        <div className="tool-modal-backdrop" onClick={closeToolModal}>
          <div
            className="tool-modal-card tool-experience-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="tool-modal-close"
              onClick={closeToolModal}
              aria-label="Close tool"
            >
              X
            </button>

            {activeType === 'timer' ? renderTimerView() : renderWritingView()}
          </div>
        </div>
      )}
    </div>
  );
}