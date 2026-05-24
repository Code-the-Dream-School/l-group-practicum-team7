import dialogueFlows from "./dialogueFlows";

const STORAGE_KEY = "dialogueState_v1";
const UNLOCKED_TOOLS_KEY = "unlockedTools";
const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

let state = {
  flowId: null,
  nodeId: null,
  seenKeys: {},
};

let onUpdate = null;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw);
    }
  } catch {
    state = {
      flowId: null,
      nodeId: null,
      seenKeys: {},
    };
  }
}

function getUnlockedTools() {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKED_TOOLS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUnlockedTools(tools) {
  localStorage.setItem(UNLOCKED_TOOLS_KEY, JSON.stringify(tools));
}

async function syncUnlockedToolToBackend(tool) {
  const token = localStorage.getItem("token");

  if (!token || !tool?.key) {
    return;
  }

  try {
    await fetch(`${API}/api/dialogues/tools/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        key: tool.key,
        title: tool.title || tool.key,
        sourceDialogue: state.flowId,
      }),
    });
  } catch (e) {
    console.warn("Could not sync unlocked tool to backend", e);
  }
}

function unlockTool(tool) {
  if (!tool?.key) return;

  const tools = getUnlockedTools();

  const alreadyUnlocked = tools.some((item) => {
    if (typeof item === "string") return item === tool.key;
    return item.key === tool.key;
  });

  if (!alreadyUnlocked) {
    const nextTool = {
      key: tool.key,
      title: tool.title || tool.key,
      sourceDialogue: state.flowId,
      unlockedAt: new Date().toISOString(),
    };

    tools.push(nextTool);
    saveUnlockedTools(tools);
    syncUnlockedToolToBackend(nextTool);

  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  window.dispatchEvent(
    new CustomEvent("dialogueStateUpdate", {
      detail: {
        dialogueState: state,
        unlockedTools: getUnlockedTools(),
      },
    })
  );

  if (typeof onUpdate === "function") {
    onUpdate(state);
  }
}

function markSeen(keys = []) {
  keys.forEach((key) => {
    state.seenKeys[key] = true;
  });
}

function getCurrentFlow() {
  if (!state.flowId) return null;
  return dialogueFlows[state.flowId] || null;
}

function resolveConditionNode(node) {
  const hasSeen = Boolean(state.seenKeys[node.seenKey]);
  state.nodeId = hasSeen ? node.ifSeen : node.ifNew;
  save();
  return processCurrentNode();
}

function processCurrentNode() {
  const flow = getCurrentFlow();

  if (!flow) {
    return {
      id: "empty",
      speaker: "Mascot",
      text: "No dialogue selected yet.",
      choices: [],
    };
  }

  const node = flow.nodes[state.nodeId];

  if (!node) {
    return {
      id: "missing",
      speaker: "Mascot",
      text: "Dialogue node was not found.",
      choices: [],
    };
  }

  if (node.type === "condition") {
    return resolveConditionNode(node);
  }

  if (node.unlockTool) {
    unlockTool(node.unlockTool);
  }

  if (node.markSeen) {
    markSeen(node.markSeen);
  }

  save();

  return node;
}

export function setOnUpdate(callback) {
  onUpdate = callback;
}

export function startDialogue(flowId) {
  const flow = dialogueFlows[flowId];

  if (!flow) {
    console.error(`Dialogue flow not found: ${flowId}`);
    return null;
  }

  state = {
    flowId,
    nodeId: flow.startNodeId || "start",
    seenKeys: state.seenKeys || {},
  };

  save();
  return processCurrentNode();
}

export function getCurrentNode() {
  return processCurrentNode();
}

export function chooseOption(choiceId) {
  const flow = getCurrentFlow();
  if (!flow) return null;

  const node = flow.nodes[state.nodeId];
  if (!node?.choices) return null;

  const choice = node.choices.find((item) => item.id === choiceId);
  if (!choice) return null;

  state.nodeId = choice.next;
  save();

  return processCurrentNode();
}

export function goNext() {
  const flow = getCurrentFlow();
  if (!flow) return null;

  const node = flow.nodes[state.nodeId];
  if (!node?.next) return null;

  state.nodeId = node.next;
  save();

  return processCurrentNode();
}

export function resetDialogueProgress() {
  state = {
    flowId: null,
    nodeId: null,
    seenKeys: {},
  };

  save();
}

load();

export default {
  startDialogue,
  getCurrentNode,
  chooseOption,
  goNext,
  resetDialogueProgress,
  setOnUpdate,
};

