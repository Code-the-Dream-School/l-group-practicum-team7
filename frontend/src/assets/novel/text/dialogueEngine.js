import dialogueFlows from "./dialogueFlows";

const STORAGE_PREFIX = "dialogueState_v2";
const LEGACY_STORAGE_KEY = "dialogueState_v1";
const LEGACY_UNLOCKED_TOOLS_KEY = "unlockedTools";
const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const EMPTY_NODE = {
  id: "empty",
  speaker: "Mascot",
  text: "No dialogue selected yet.",
  choices: [],
};

const MISSING_NODE = {
  id: "missing",
  speaker: "Mascot",
  text: "Dialogue node was not found.",
  choices: [],
};

const GLUE_LINES = [
  {
    when: (entry) => Number(entry?.sleepHours) >= 7,
    text: "Sleeping enough is not a small thing. It gives your brain room to recover.",
  },
  {
    when: (entry) => Number(entry?.sleepHours) > 0 && Number(entry?.sleepHours) < 6,
    text: "Low sleep can make normal problems feel louder than they are.",
  },
  {
    when: (entry) => Number(entry?.stress) >= 4,
    text: "Stress is high today, so we should lower pressure before demanding more from you.",
  },
  {
    when: (entry) => Number(entry?.stress) > 0 && Number(entry?.stress) <= 2,
    text: "Your stress looks lower today. That is a good moment to protect what is working.",
  },
  {
    when: (entry) => Number(entry?.energy) > 0 && Number(entry?.energy) <= 2,
    text: "Low energy is information, not a personal failure.",
  },
  {
    when: (entry) => Number(entry?.energy) >= 4,
    text: "Your energy looks better today. Use it carefully, not all at once.",
  },
  {
    when: (entry) => Number(entry?.workload) >= 4,
    text: "High workload needs sorting, not just more effort.",
  },
  {
    when: (entry) => Number(entry?.workload) > 0 && Number(entry?.workload) <= 2,
    text: "A lighter workload is a chance to recover, not a reason to fill every gap.",
  },
  {
    when: (entry) => Number(entry?.stress) >= 4 && Number(entry?.sleepHours) > 0 && Number(entry?.sleepHours) < 6,
    text: "High stress plus low sleep is a warning sign. Recovery should be part of the plan.",
  },
  {
    when: (entry) => Number(entry?.stress) >= 4 && Number(entry?.energy) > 0 && Number(entry?.energy) <= 2,
    text: "Pushing through high stress with low energy can drain you fast.",
  },
  {
    when: (entry) => Number(entry?.workload) >= 4 && Number(entry?.energy) > 0 && Number(entry?.energy) <= 2,
    text: "Your workload is high while energy is low. The next step should be smaller.",
  },
  {
    when: (entry) => Number(entry?.sleepHours) >= 7 && Number(entry?.energy) > 0 && Number(entry?.energy) <= 2,
    text: "Even with sleep, energy can stay low. That means we should look at load and mood too.",
  },
  {
    when: (entry) => Number(entry?.stress) > 0 && Number(entry?.stress) <= 2 && Number(entry?.energy) >= 4,
    text: "This looks like a steadier day. Let's notice what helped create it.",
  },
  {
    when: (entry) => Number(entry?.workload) >= 4,
    text: "You do not have to carry every task at the same size.",
  },
  {
    when: (entry) => Number(entry?.sleepHours) > 0 && Number(entry?.sleepHours) < 6,
    text: "Tonight, finishing everything may be less useful than making tomorrow possible.",
  },
  {
    when: (entry) => Number(entry?.energy) > 0 && Number(entry?.energy) <= 2,
    text: "A reset can be productive when the system is running empty.",
  },
  {
    when: (entry) => Number(entry?.stress) >= 4,
    text: "Before solving the problem, let's help your body feel safer.",
  },
  {
    when: (entry) => Number(entry?.workload) > 0 && Number(entry?.workload) <= 2 && Number(entry?.stress) >= 4,
    text: "If workload is not the main issue, the stress may be coming from thoughts, uncertainty, or pressure.",
  },
  {
    when: (entry) => Number(entry?.sleepHours) >= 7 && Number(entry?.stress) >= 4,
    text: "You slept, but stress is still high. That means the pressure deserves attention.",
  },
  {
    when: () => true,
    text: "Small honest entries are enough. We can work with patterns, not perfection.",
  },
];

let state = createEmptyState();
let onUpdate = null;

function createEmptyState() {
  return {
    flowId: null,
    nodeId: null,
    seenKeys: {},
    completedFlows: {},
    completedNodes: {},
    selectedChoices: {},
  };
}

function safeJsonParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getCurrentUserKey() {
  const token = localStorage.getItem("token");
  const payload = token ? decodeJwtPayload(token) : null;

  const tokenUserId =
    payload?.id ||
    payload?._id ||
    payload?.userId ||
    payload?.user?.id ||
    payload?.user?._id ||
    payload?.user?.userId ||
    payload?.user?.email ||
    payload?.sub ||
    payload?.email;

  if (tokenUserId) {
    return String(tokenUserId);
  }

  const storedUser = safeJsonParse(
    localStorage.getItem("user") ||
      localStorage.getItem("currentUser") ||
      localStorage.getItem("authUser") ||
      localStorage.getItem("sessionUser") ||
      localStorage.getItem("profile") ||
      localStorage.getItem("pulsemindUser"),
    null
  );

  const storedUserId =
    storedUser?.id ||
    storedUser?._id ||
    storedUser?.userId ||
    storedUser?.email;

  if (storedUserId) {
    return String(storedUserId);
  }

  if (token) {
    return String(token.slice(-24));
  }

  return "guest";
}

function getDialogueStorageKey() {
  return `${STORAGE_PREFIX}:${getCurrentUserKey()}`;
}

function getUnlockedToolsKey() {
  return `${LEGACY_UNLOCKED_TOOLS_KEY}:${getCurrentUserKey()}`;
}

function getToolHistoryKey() {
  return `toolHistory:${getCurrentUserKey()}`;
}

function getToolReactionKey() {
  return `lastToolReactionAt:${getCurrentUserKey()}`;
}

function getInsightReactionKey() {
  return `lastInsightReactionAt:${getCurrentUserKey()}`;
}

function normalizeState(nextState) {
  return {
    ...createEmptyState(),
    ...(nextState || {}),
    seenKeys: nextState?.seenKeys || {},
    completedFlows: nextState?.completedFlows || {},
    completedNodes: nextState?.completedNodes || {},
    selectedChoices: nextState?.selectedChoices || {},
  };
}

function loadLegacyStateIfNeeded() {
  const userScopedKey = getDialogueStorageKey();
  const scopedState = localStorage.getItem(userScopedKey);

  if (scopedState) return scopedState;

  const legacyState = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyState || getCurrentUserKey() !== "guest") return null;

  return legacyState;
}

function load() {
  const raw = loadLegacyStateIfNeeded();
  state = normalizeState(safeJsonParse(raw, createEmptyState()));
}

function getUnlockedTools() {
  const userScoped = safeJsonParse(localStorage.getItem(getUnlockedToolsKey()), null);

  if (Array.isArray(userScoped)) {
    return userScoped;
  }

  if (getCurrentUserKey() === "guest") {
    return safeJsonParse(localStorage.getItem(LEGACY_UNLOCKED_TOOLS_KEY), []);
  }

  return [];
}

function saveUnlockedTools(tools) {
  localStorage.setItem(getUnlockedToolsKey(), JSON.stringify(tools));
}

function getToolHistory() {
  return safeJsonParse(localStorage.getItem(getToolHistoryKey()), {});
}

function getToolKey(tool) {
  if (!tool) return null;
  return typeof tool === "string" ? tool : tool.key;
}

function hasUnlockedTool(toolKey) {
  if (!toolKey) return false;

  return getUnlockedTools().some((tool) => {
    if (typeof tool === "string") return tool === toolKey;
    return tool.key === toolKey;
  });
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
  const alreadyUnlocked = tools.some((item) => getToolKey(item) === tool.key);

  if (alreadyUnlocked) {
    return;
  }

  const nextTool = {
    key: tool.key,
    title: tool.title || tool.key,
    sourceDialogue: state.flowId,
    unlockedAt: new Date().toISOString(),
  };

  saveUnlockedTools([...tools, nextTool]);
  syncUnlockedToolToBackend(nextTool);
}

function save() {
  localStorage.setItem(getDialogueStorageKey(), JSON.stringify(state));

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

function markNodeCompleted(nodeId) {
  if (!state.flowId || !nodeId) return;

  state.completedNodes[`${state.flowId}:${nodeId}`] = true;
}

function markFlowCompleted(flowId = state.flowId) {
  if (!flowId || flowId.startsWith("__")) return;

  state.completedFlows[flowId] = {
    completedAt: new Date().toISOString(),
  };
}

function isTerminalNode(node) {
  return Boolean(node?.end || (!node?.next && !node?.choices?.length));
}

function getCurrentFlow() {
  if (!state.flowId) return null;
  return dialogueFlows[state.flowId] || null;
}

function getLatestEntry(entries = []) {
  return [...entries]
    .filter(Boolean)
    .sort((a, b) => {
      const left = new Date(a.date || a.createdAt || 0).getTime();
      const right = new Date(b.date || b.createdAt || 0).getTime();
      return right - left;
    })[0];
}

function getUnlockedToolByKey(toolKey) {
  return getUnlockedTools().find((tool) => getToolKey(tool) === toolKey);
}

function pickRandom(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function pickGlueLine(entry) {
  const matches = GLUE_LINES.filter((line) => line.when(entry));
  return pickRandom(matches)?.text || GLUE_LINES.at(-1).text;
}

function getFlowUnlockToolKey(flow) {
  return (
    flow?.unlocksToolKey ||
    flow?.unlockToolKey ||
    flow?.toolKey ||
    flow?.unlockTool?.key ||
    null
  );
}

function isFlowRepeatable(flow) {
  return flow?.repeatable === true;
}

function wasFlowCompleted(flowId) {
  return Boolean(state.completedFlows?.[flowId]);
}

function collectFlowToolKeys(flow) {
  if (!flow?.nodes) return [];

  return Object.values(flow.nodes)
    .map((node) => node?.unlockTool?.key)
    .filter(Boolean);
}

function shouldSkipFlow(flowId, flow) {
  if (!flow) return true;

  if (!isFlowRepeatable(flow) && wasFlowCompleted(flowId)) {
    return true;
  }

  const unlockToolKey = getFlowUnlockToolKey(flow);

  if (!isFlowRepeatable(flow) && unlockToolKey && hasUnlockedTool(unlockToolKey)) {
    return true;
  }

  return false;
}

function getNodeChoiceSeenKey(flowId, nodeId, choiceId) {
  return `${flowId}:${nodeId}:${choiceId}`;
}

function withSeenChoices(node) {
  if (!node || !Array.isArray(node.choices)) {
    return node;
  }

  return {
    ...node,
    choices: node.choices.map((choice) => ({
      ...choice,
      seen: Boolean(
        state.selectedChoices?.[
          getNodeChoiceSeenKey(state.flowId, state.nodeId, choice.id)
        ]
      ),
    })),
  };
}

function getNextNodeIdAfterSkippedTool(node) {
  if (node?.next) return node.next;

  if (Array.isArray(node?.choices) && node.choices.length === 1) {
    return node.choices[0].next || null;
  }

  return null;
}

function shouldSkipNode(node) {
  if (!node || node.repeatable !== false || !node.unlockTool?.key) {
    return false;
  }

  return hasUnlockedTool(node.unlockTool.key);
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
    return EMPTY_NODE;
  }

  let node = flow.nodes[state.nodeId];

  if (!node) {
    return MISSING_NODE;
  }

  if (node.type === "condition") {
    return resolveConditionNode(node);
  }

  if (shouldSkipNode(node)) {
    const nextNodeId = getNextNodeIdAfterSkippedTool(node);

    if (nextNodeId) {
      state.nodeId = nextNodeId;
      save();
      return processCurrentNode();
    }
  }

  if (node.unlockTool) {
    unlockTool(node.unlockTool);
  }

  if (node.markSeen) {
    markSeen(node.markSeen);
  }

  markNodeCompleted(node.id || state.nodeId);

  if (isTerminalNode(node)) {
    markFlowCompleted();
  }

  save();

  return withSeenChoices(node);
}

function buildToolReminderNode(context = {}) {
  const latestEntry = getLatestEntry(context.entries || []);
  const unlockedTools = getUnlockedTools();
  const toolHistory = context.toolHistory || getToolHistory();

  if (!latestEntry || !unlockedTools.length) {
    return null;
  }

  const stress = Number(latestEntry.stress);
  const workload = Number(latestEntry.workload);
  const energy = Number(latestEntry.energy);
  const sleepHours = Number(latestEntry.sleepHours);

  const breathingTool =
    getUnlockedToolByKey("breathing") ||
    getUnlockedToolByKey("breathing-tool") ||
    getUnlockedToolByKey("breathingTool");

  if (stress >= 4 && breathingTool) {
    const history = toolHistory[getToolKey(breathingTool)] || [];
    const lastNote = Array.isArray(history) ? history.at(-1)?.note : null;

    return {
      id: "tool-reminder-breathing",
      speaker: "Mascot",
      type: "reminder",
      toolKey: getToolKey(breathingTool),
      text: lastNote
        ? `Last time you wrote: "${lastNote}". Your stress still looks high, so this may be a good moment to use ${breathingTool.title || "your breathing tool"} again.`
        : `Your stress looks high again. You already have ${breathingTool.title || "a breathing tool"} unlocked, and it may help right now.`,
      choices: [
        {
          id: "open-tool",
          text: "Open tool",
          action: "openTool",
          toolKey: getToolKey(breathingTool),
        },
        {
          id: "not-now",
          text: "Not now",
          next: null,
        },
      ],
      end: true,
    };
  }

  const recoveryTool =
    getUnlockedToolByKey("recovery") ||
    getUnlockedToolByKey("sleep-recovery") ||
    getUnlockedToolByKey("energy-recovery");

  if (((sleepHours > 0 && sleepHours < 6) || energy <= 2) && recoveryTool) {
    return {
      id: "tool-reminder-recovery",
      speaker: "Mascot",
      type: "reminder",
      toolKey: getToolKey(recoveryTool),
      text: `Your recovery signals look low today. You already unlocked ${recoveryTool.title || "a recovery tool"}, so it may be worth using before pushing further.`,
      choices: [
        {
          id: "open-tool",
          text: "Open tool",
          action: "openTool",
          toolKey: getToolKey(recoveryTool),
        },
        {
          id: "not-now",
          text: "Not now",
          next: null,
        },
      ],
      end: true,
    };
  }

  const workloadTool =
    getUnlockedToolByKey("workload") ||
    getUnlockedToolByKey("workload-planner") ||
    getUnlockedToolByKey("planning");

  if (workload >= 4 && workloadTool) {
    return {
      id: "tool-reminder-workload",
      speaker: "Mascot",
      type: "reminder",
      toolKey: getToolKey(workloadTool),
      text: `Your workload is running high. ${workloadTool.title || "Your planning tool"} is already unlocked and can help you sort the next steps.`,
      choices: [
        {
          id: "open-tool",
          text: "Open tool",
          action: "openTool",
          toolKey: getToolKey(workloadTool),
        },
        {
          id: "not-now",
          text: "Not now",
          next: null,
        },
      ],
      end: true,
    };
  }

  return null;
}

function evaluateFlowConditions(flow, context = {}) {
  if (!flow?.conditions) {
    return true;
  }

  if (typeof flow.conditions === "function") {
    return Boolean(flow.conditions(context));
  }

  const latestEntry = getLatestEntry(context.entries || []);

  if (!latestEntry) {
    return Boolean(flow.conditions.allowWithoutEntries);
  }

  const stress = Number(latestEntry.stress);
  const workload = Number(latestEntry.workload);
  const energy = Number(latestEntry.energy);
  const sleepHours = Number(latestEntry.sleepHours);

  if (flow.conditions.minStress && stress < flow.conditions.minStress) return false;
  if (flow.conditions.maxStress && stress > flow.conditions.maxStress) return false;
  if (flow.conditions.minWorkload && workload < flow.conditions.minWorkload) return false;
  if (flow.conditions.maxWorkload && workload > flow.conditions.maxWorkload) return false;
  if (flow.conditions.minEnergy && energy < flow.conditions.minEnergy) return false;
  if (flow.conditions.maxEnergy && energy > flow.conditions.maxEnergy) return false;
  if (flow.conditions.minSleepHours && sleepHours < flow.conditions.minSleepHours) return false;
  if (flow.conditions.maxSleepHours && sleepHours > flow.conditions.maxSleepHours) return false;

  return true;
}

function getDefaultFlowId() {
  if (dialogueFlows.default) return "default";
  if (dialogueFlows.intro) return "intro";

  return Object.keys(dialogueFlows)[0] || null;
}

function getFlatToolEntries(toolHistory = {}) {
  return Object.entries(toolHistory).flatMap(([toolKey, entries]) => {
    if (!Array.isArray(entries)) return [];

    return entries.map((entry) => ({
      toolKey,
      ...entry,
    }));
  });
}

function getAllLocalToolEntries() {
  const results = [];
  const userKey = getCurrentUserKey();
  const normalizedUserKey = String(userKey).toLowerCase();

  const belongsToCurrentUser = (key) => {
    const normalizedKey = String(key || "").toLowerCase();

    if (!normalizedKey.includes("tool")) return false;

    if (normalizedKey === getToolHistoryKey().toLowerCase()) return true;
    if (normalizedKey.includes(`:${normalizedUserKey}`)) return true;
    if (normalizedKey.includes(`_${normalizedUserKey}`)) return true;
    if (normalizedKey.includes(`-${normalizedUserKey}`)) return true;

    return userKey === "guest" && !normalizedKey.includes(":");
  };

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!belongsToCurrentUser(key)) continue;

    const value = safeJsonParse(localStorage.getItem(key), null);

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item && typeof item === "object") {
          results.push({ storageKey: key, ...item });
        }
      });
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value).forEach(([toolKey, entries]) => {
        if (Array.isArray(entries)) {
          entries.forEach((entry) => {
            if (entry && typeof entry === "object") {
              results.push({ storageKey: key, toolKey, ...entry });
            }
          });
        }
      });
    }
  }

  return results;
}

function hasRecentToolReaction() {
  const lastReactionAt = Number(localStorage.getItem(getToolReactionKey()) || 0);
  return Date.now() - lastReactionAt < 1000 * 60 * 60 * 18;
}

function markToolReactionShown() {
  localStorage.setItem(getToolReactionKey(), String(Date.now()));
}

function hasRecentInsightReaction() {
  const lastReactionAt = Number(localStorage.getItem(getInsightReactionKey()) || 0);
  return Date.now() - lastReactionAt < 1000 * 60 * 60 * 12;
}

function markInsightReactionShown() {
  localStorage.setItem(getInsightReactionKey(), String(Date.now()));
}

function getToolEntryText(entry) {
  const raw =
    entry?.note ||
    entry?.text ||
    entry?.content ||
    entry?.answer ||
    entry?.value ||
    entry?.comment ||
    entry?.reflection;

  if (!raw) return "";
  return String(raw).replace(/\s+/g, " ").trim().slice(0, 140);
}

function buildStateTalkNode(context = {}) {
  const latestEntry = getLatestEntry(context.entries || []);
  const insights = context.insightLines || [];
  const unlockedTools = getUnlockedTools();
  const toolHistory = context.toolHistory || getToolHistory();
  const toolEntries = getFlatToolEntries(toolHistory);
  const allToolEntries = getAllLocalToolEntries();
  const randomToolEntry = pickRandom(allToolEntries);

  const stress = Number(latestEntry?.stress || 0);
  const workload = Number(latestEntry?.workload || 0);
  const energy = Number(latestEntry?.energy || 0);
  const sleepHours = Number(latestEntry?.sleepHours || 0);

  const usedCount = Math.max(toolEntries.length, allToolEntries.length);
  const unlockedCount = unlockedTools.length;
  const lines = [];
  const toolEntryText = getToolEntryText(randomToolEntry);

  if (toolEntryText && !hasRecentToolReaction()) {
    lines.push(
      `I noticed you used a tool and wrote: "${toolEntryText}". I am glad you left that note. It gives us something concrete to return to.`
    );
    markToolReactionShown();
  }

  if (insights[0] && !hasRecentInsightReaction()) {
    lines.push(`I noticed this pattern: ${insights[0]}`);
    markInsightReactionShown();
  } else if (latestEntry) {
    lines.push(
      `Today I see stress ${stress || "unknown"}, workload ${workload || "unknown"}, energy ${energy || "unknown"}, and sleep ${sleepHours || "unknown"}.`
    );
  } else {
    lines.push("I do not have enough entries yet, but we can still check in.");
  }

  if (latestEntry) {
    lines.push(pickGlueLine(latestEntry));
  }

  if (stress >= 4 && energy > 0 && energy <= 2) {
    lines.push("High stress together with low energy can mean your system is pushing while already depleted.");
  } else if (sleepHours > 0 && sleepHours < 6) {
    lines.push("Low sleep may be making everything feel heavier than it actually is.");
  } else if (workload >= 4) {
    lines.push("Your workload looks like the main pressure point right now.");
  } else if (latestEntry) {
    lines.push("I do not see a sharp danger signal, so this may be a good time to maintain your progress.");
  }

  if (unlockedCount > 0 && usedCount === 0) {
    lines.push(
      `You already have ${unlockedCount} tool${unlockedCount === 1 ? "" : "s"} unlocked, but I do not see tool notes yet. Try one small tool entry today, even a messy one. It gives us something real to work with.`
    );
  }

  if (usedCount > 0) {
    lines.push(
      `You have used your tools ${usedCount} time${usedCount === 1 ? "" : "s"}. That matters. You are leaving traces we can return to instead of starting from zero every time.`
    );
  }

  const dashboardContext = context.dashboardContext || {};

  if (dashboardContext.hasHighBurnout) {
    lines.push("Your dashboard is showing burnout pressure, so today should include recovery, not only performance.");
  }

  if (Number(dashboardContext.availableUnlockDialogueCount) > 0) {
    lines.push(`There are ${dashboardContext.availableUnlockDialogueCount} dialogue branch${dashboardContext.availableUnlockDialogueCount === 1 ? "" : "es"} available from your recent patterns.`);
  }

  const selectedLines = lines.filter(Boolean).sort(() => Math.random() - 0.5).slice(0, 2);

  return {
    id: `__state_talk_${Date.now()}__`,
    speaker: "Mascot",
    type: "stateTalk",
    text: selectedLines.join("\n\n"),
    choices: [
      {
        id: "talk-more",
        text: "Talk more about my state",
        action: "stateTalk",
      },
      {
        id: "open-tools",
        text: "Open my tools",
        action: "openTool",
      },
    ],
    end: false,
  };
}

export function setOnUpdate(callback) {
  onUpdate = callback;
}

export function startDialogue(flowId, options = {}) {
  load();

  const flow = dialogueFlows[flowId];

  if (!flow) {
    console.error(`Dialogue flow not found: ${flowId}`);
    return null;
  }

  if (!options.force && shouldSkipFlow(flowId, flow)) {
    const reminderNode = buildToolReminderNode(options.context);

    if (reminderNode) {
      state = {
        ...normalizeState(state),
        flowId: "__tool_reminder__",
        nodeId: reminderNode.id,
      };

      save();
      return reminderNode;
    }

    const fallbackFlowId = getDefaultFlowId();

    if (fallbackFlowId && fallbackFlowId !== flowId) {
      return startDialogue(fallbackFlowId, { ...options, force: true });
    }

    return {
      id: "already-completed",
      speaker: "Mascot",
      text: "We have already unlocked what you needed from this conversation. Let's use the tools you have now.",
      choices: [],
      end: true,
    };
  }

  state = {
    ...normalizeState(state),
    flowId,
    nodeId: flow.startNodeId || "start",
  };

  save();
  return processCurrentNode();
}

export function startBestDialogue(context = {}) {
  load();

  const reminderNode = buildToolReminderNode(context);
  const candidates = Object.entries(dialogueFlows)
    .filter(([flowId, flow]) => flowId !== "default" && !shouldSkipFlow(flowId, flow))
    .filter(([, flow]) => evaluateFlowConditions(flow, context))
    .sort(([, left], [, right]) => {
      const leftPriority = Number(left.priority || 0);
      const rightPriority = Number(right.priority || 0);
      return rightPriority - leftPriority;
    });

  if (candidates.length > 0) {
    const [flowId] = candidates[0];
    return startDialogue(flowId, { context });
  }

  if (reminderNode) {
    state = {
      ...normalizeState(state),
      flowId: "__tool_reminder__",
      nodeId: reminderNode.id,
    };

    save();
    return reminderNode;
  }

  return startStateTalk(context);
}

export function startStateTalk(context = {}) {
  load();

  const node = buildStateTalkNode(context);

  state = {
    ...normalizeState(state),
    flowId: "__state_talk__",
    nodeId: node.id,
  };

  save();
  return node;
}

export function getCurrentNode() {
  load();

  const flow = getCurrentFlow();

  if (!flow) {
    return EMPTY_NODE;
  }

  const node = flow.nodes[state.nodeId] || MISSING_NODE;
  return withSeenChoices(node);
}

export function chooseOption(choiceId) {
  const flow = getCurrentFlow();
  if (!flow) return null;

  const node = flow.nodes[state.nodeId];
  if (!node?.choices) return null;

  const choice = node.choices.find((item) => item.id === choiceId);
  if (!choice) return null;

  state.selectedChoices[
    getNodeChoiceSeenKey(state.flowId, state.nodeId, choiceId)
  ] = true;

  if (choice.action === "openTool" || choice.action === "stateTalk") {
    save();
    return {
      ...withSeenChoices(node),
      selectedAction: choice,
    };
  }

  if (!choice.next) {
    markFlowCompleted();
    save();

    return {
      ...withSeenChoices(node),
      choices: [],
      end: true,
    };
  }

  state.nodeId = choice.next;
  save();

  return processCurrentNode();
}

export function goNext() {
  const flow = getCurrentFlow();
  if (!flow) return null;

  const node = flow.nodes[state.nodeId];
  if (!node?.next) {
    markFlowCompleted();
    save();
    return null;
  }

  state.nodeId = node.next;
  save();

  return processCurrentNode();
}

export function resetDialogueProgress() {
  state = createEmptyState();
  save();
}

export function getDialogueState() {
  load();
  return normalizeState(state);
}

export function getDialogueStorageInfo() {
  return {
    userKey: getCurrentUserKey(),
    dialogueStorageKey: getDialogueStorageKey(),
    unlockedToolsKey: getUnlockedToolsKey(),
    toolHistoryKey: getToolHistoryKey(),
  };
}

export function getUnlockedToolsCount() {
  load();
  return getUnlockedTools().length;
}

export function isFlowExhausted(flowId) {
  load();

  const flow = dialogueFlows[flowId];

  if (!flow) return true;

  const toolKeys = collectFlowToolKeys(flow);

  if (toolKeys.length === 0) {
    return Boolean(state.completedFlows?.[flowId]);
  }

  return toolKeys.every((toolKey) => hasUnlockedTool(toolKey));
}

export function getAvailableUnlockFlowIds(flowIds = []) {
  load();

  return flowIds.filter((flowId) => {
    if (!dialogueFlows[flowId]) return false;
    if (flowId === "stateTalk" || flowId === "default") return false;

    return !isFlowExhausted(flowId);
  });
}

load();

export default {
  startDialogue,
  startBestDialogue,
  startStateTalk,
  getCurrentNode,
  chooseOption,
  goNext,
  resetDialogueProgress,
  setOnUpdate,
  getDialogueState,
  getDialogueStorageInfo,
  getUnlockedToolsCount,
  isFlowExhausted,
  getAvailableUnlockFlowIds,
};
