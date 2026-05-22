import React, { useEffect, useState } from 'react';
import toolDefinitions from '../assets/tools/toolDefinitions';
import TOOLS_TEXT from '../assets/tools/tools.txt?raw';

const API = import.meta.env.VITE_API_BASE;

function parseToolsTxt(raw) {
  const text = String(raw || '').replace(/\r\n/g, '\n').trim();

  const re =
    /^([^\n]+)\n\nInstruction:\n([\s\S]*?)\n\nSample entry:\n([\s\S]*?)(?=\n\n[^\n]+\n\nInstruction:|\n?$)/gm;

  const map = {};
  let m;

  while ((m = re.exec(text)) !== null) {
    const title = (m[1] || '').trim();
    const instruction = (m[2] || '').trim();
    const sample = (m[3] || '').trim();

    const key = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    map[key] = { title, instruction, sample };
  }

  return map;
}

function resetUnlockedTools() {
  localStorage.removeItem('unlockedTools');

  Object.keys(localStorage)
    .filter((key) => key.startsWith('tool:') && key.endsWith(':entries'))
    .forEach((key) => localStorage.removeItem(key));

  setUnlocked([]);
  setActiveTool(null);
  setModalOpen(false);
  setTimerRunning(false);
  setTimerSec(0);
  setTextValue('');
  setHistoryEntries([]);

  window.dispatchEvent(
    new CustomEvent('dialogueStateUpdate', {
      detail: {
        unlockedTools: [],
      },
    })
  );
}

function unlockAllTools() {
  const allTools = Object.keys(toolDefinitions).map((key) => ({
    key,
    title: toolDefinitions[key]?.name || key,
    unlockedAt: new Date().toISOString(),
  }));

  localStorage.setItem('unlockedTools', JSON.stringify(allTools));
  setUnlocked(allTools.map((tool) => tool.key));

  window.dispatchEvent(
    new CustomEvent('dialogueStateUpdate', {
      detail: {
        unlockedTools: allTools,
      },
    })
  );
}

function getLocalUnlockedKeys() {
  try {
    const raw = JSON.parse(localStorage.getItem('unlockedTools') || '[]');

    return raw
      .map((item) => {
        if (typeof item === 'string') return item;
        return item && item.key ? item.key : null;
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

export default function ToolsPage() {
  const [unlocked, setUnlocked] = useState([]);
  const [toolMap] = useState(() => parseToolsTxt(TOOLS_TEXT));
  const [activeTool, setActiveTool] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [historyEntries, setHistoryEntries] = useState([]);

  const activeDefinition = activeTool ? toolDefinitions[activeTool] : null;
  const activeInfo = activeTool ? toolMap[activeTool] || {} : {};
  const activeInstruction =
    activeInfo.instruction || activeDefinition?.instruction || activeDefinition?.description || '';
  const activeSample = activeInfo.sample || 'Sample text';

  useEffect(() => {
    let mounted = true;

async function loadUnlocked() {
    let localKeys = [];

    try {
      const raw = JSON.parse(localStorage.getItem('unlockedTools') || '[]');

      localKeys = raw
        .map((item) => {
          if (typeof item === 'string') return item;
          return item && item.key ? item.key : null;
        })
        .filter(Boolean);

      if (mounted) {
        setUnlocked(localKeys);
      }
    } catch (e) {
      localKeys = [];
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    try {
      const resp = await fetch(`${API}/api/dialogues/tools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        return;
      }

      const data = await resp.json();

      const backendKeys = Array.isArray(data.tools)
        ? data.tools.map((tool) => (tool && tool.key ? tool.key : null)).filter(Boolean)
        : [];

      const mergedKeys = Array.from(new Set([...localKeys, ...backendKeys]));

      if (mounted) {
        setUnlocked(mergedKeys);
      }
    } catch (e) {}
  }

    loadUnlocked();

    const handler = (e) => {
      try {
        const raw =
          e?.detail?.unlockedTools || JSON.parse(localStorage.getItem('unlockedTools') || '[]');

        const keys = raw
          .map((item) => {
            if (typeof item === 'string') return item;
            return item && item.key ? item.key : null;
          })
          .filter(Boolean);

        setUnlocked(keys);
      } catch (_) {
        setUnlocked([]);
      }
    };

    window.addEventListener('dialogueStateUpdate', handler);

    return () => {
      mounted = false;
      window.removeEventListener('dialogueStateUpdate', handler);
    };
  }, []);

  function resetUnlockedTools() {
    localStorage.removeItem('unlockedTools');
    localStorage.removeItem('dialogueState_v1');
    localStorage.removeItem('seenNodes');

    Object.keys(localStorage)
      .filter((key) => key.startsWith('tool:') && key.endsWith(':entries'))
      .forEach((key) => localStorage.removeItem(key));

    setUnlocked([]);
    setActiveTool(null);
    setModalOpen(false);
    setTimerRunning(false);
    setTimerSec(0);
    setTextValue('');
    setHistoryEntries([]);

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
    const allTools = Object.keys(toolDefinitions).map((key) => ({
      key,
      title: toolDefinitions[key]?.name || key,
      unlockedAt: new Date().toISOString(),
    }));

    localStorage.setItem('unlockedTools', JSON.stringify(allTools));
    setUnlocked(allTools.map((tool) => tool.key));

    window.dispatchEvent(
      new CustomEvent('dialogueStateUpdate', {
        detail: {
          unlockedTools: allTools,
        },
      })
    );
  }

  function loadHistory(toolId) {
    const key = `tool:${toolId}:entries`;

    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveEntry(toolId, payload) {
    const key = `tool:${toolId}:entries`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');

    arr.push({ ...payload, savedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(arr));
    setHistoryEntries(arr);
  }

  function openToolModal(toolKey) {
    setActiveTool(toolKey);
    setModalOpen(true);
    setTextValue('');
    setTimerRunning(false);
    setTimerSec(0);
    setHistoryEntries(loadHistory(toolKey));
  }

  useEffect(() => {
    let t = null;

    if (timerRunning && timerSec > 0) {
      t = setInterval(() => setTimerSec((s) => s - 1), 1000);
    } else if (timerRunning && timerSec === 0) {
      setTimerRunning(false);
    }

    return () => clearInterval(t);
  }, [timerRunning, timerSec]);

  const startTimerForInstruction = (instruction) => {
    const m = instruction.match(/(\d+)\s*minute/i);
    const mins = m ? parseInt(m[1], 10) : 5;

    setTimerSec(mins * 60);
    setTimerRunning(true);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Tools</h2>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className="btn-secondary" onClick={resetUnlockedTools}>
          Reset unlocked tools
        </button>

        <button className="btn-secondary" onClick={unlockAllTools}>
          Unlock all tools
        </button>
      </div>

      {unlocked.length === 0 && (
        <div>
          <p>No tools unlocked yet. You can unlock tools via the Novel choices.</p>
          <p>To seed a tool for testing, run in console:</p>
          <pre>localStorage.setItem("unlockedTools", JSON.stringify(["thought_dump"]))</pre>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {unlocked.map((id) => {
          const def = toolDefinitions[id];
          const title = def ? def.name : id;
          const desc = def ? def.description : '';
          const info = toolMap[id] || {};

          const instructionShort = info.instruction
            ? info.instruction.split('\n')[0].slice(0, 140)
            : desc;

          const sampleText = info.sample || '';
          const hasInstruction = Boolean(info.instruction);
          const showDesc = !hasInstruction && desc;

          return (
            <div key={id} style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, background: '#fff' }}>
              <h3 style={{ marginTop: 0 }}>{title}</h3>

              <div style={{ color: '#444', marginBottom: 8 }}>
                {instructionShort}
                {instructionShort.length >= 140 ? '…' : ''}
              </div>

              {showDesc ? <p style={{ color: '#666', marginTop: 4 }}>{desc}</p> : null}

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn-primary" onClick={() => openToolModal(id)}>
                  Use tool
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setHistoryEntries(loadHistory(id));
                    setActiveTool(id);
                    setModalOpen(true);
                  }}
                >
                  History
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    saveEntry(id, { text: sampleText || '' });
                    alert('Saved sample entry');
                  }}
                >
                  Quick Use
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && activeTool && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{ width: 720, maxWidth: '95%', background: '#fff', padding: 20, borderRadius: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{activeDefinition?.name || activeTool}</h3>

            <div style={{ marginBottom: 12 }}>
              <strong>Instruction</strong>
              <p>{activeInstruction}</p>
            </div>

            {/\d+\s*minute/i.test(activeInstruction) ? (
              <div>
                <div style={{ fontSize: 24, marginBottom: 8 }}>
                  {String(Math.floor(timerSec / 60)).padStart(2, '0')}:
                  {String(timerSec % 60).padStart(2, '0')}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {!timerRunning ? (
                    <button className="btn-primary" onClick={() => startTimerForInstruction(activeInstruction)}>
                      Start
                    </button>
                  ) : (
                    <button className="btn-secondary" onClick={() => setTimerRunning(false)}>
                      Stop
                    </button>
                  )}

                  <button
                    className="btn-secondary"
                    onClick={() => {
                      saveEntry(activeTool, { note: `Completed timer ${activeInstruction}` });
                      alert('Saved timer entry');
                    }}
                  >
                    Save result
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <textarea
                    placeholder={activeSample}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    style={{ width: '100%', minHeight: 120, padding: 8 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      saveEntry(activeTool, { text: textValue || activeInfo.sample || '' });
                      alert('Saved');
                    }}
                  >
                    Use tool
                  </button>

                  <button className="btn-secondary" onClick={() => setHistoryEntries(loadHistory(activeTool))}>
                    History
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <h4>History</h4>

              <div style={{ maxHeight: 180, overflow: 'auto' }}>
                {historyEntries.length === 0 ? (
                  <div>No entries yet.</div>
                ) : (
                  historyEntries.map((it, idx) => (
                    <div key={`${it.savedAt || 'x'}-${idx}`} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                      <div style={{ fontSize: 12, color: '#666' }}>{it.savedAt}</div>
                      <div>{it.text || it.note}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}