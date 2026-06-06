import React, { useEffect, useMemo, useState } from "react";
import dialogueEngine from "../../assets/novel/text/dialogueEngine";
import dialogueFlows from "../../assets/novel/text/dialogueFlows";
import mascotImage from "../../assets/novel/graphics/miyuri_d_pryamo.png";
import loggia from "../../assets/novel/graphics/loggia day.png";
import "./NovelTextViewer.css";

const DEFAULT_FLOW_IDS = [
  "overwhelmedByMultitasking",
  "highWorkload",
  "sleepDeprivation",
  "lowEnergy",
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function hasEntryToday(entries = []) {
  const todayKey = getTodayKey();

  return entries.some((entry) => {
    const rawDate = entry?.date || entry?.createdAt;
    if (!rawDate) return false;

    return new Date(rawDate).toISOString().slice(0, 10) === todayKey;
  });
}

function splitTextPages(text, maxLength = 185) {
  if (!text) return [""];

  const paragraphs = String(text)
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  const pages = [];

  paragraphs.forEach((paragraph) => {
    if (paragraph.length <= maxLength) {
      pages.push(paragraph);
      return;
    }

    const sentences = paragraph.match(/[^.!?]+[.!?]*/g) || [paragraph];
    let current = "";

    sentences.forEach((sentence) => {
      const next = `${current} ${sentence}`.trim();

      if (next.length > maxLength && current) {
        pages.push(current);
        current = sentence.trim();
      } else {
        current = next;
      }
    });

    if (current) pages.push(current);
  });

  return pages.length ? pages : [String(text)];
}

function buildIntroNodes({ entries, availableDialogues, insightLines }) {
  const nodes = [
    {
      id: "__intro_greeting__",
      speaker: "Mascot",
      text: "Hi. Let's check what would help you most right now.",
      choices: [],
      next: "__intro_next__",
    },
  ];

  if (!hasEntryToday(entries)) {
    nodes.push({
      id: "__intro_entry_reminder__",
      speaker: "Mascot",
      text: "I do not see today's entry yet. If you have a minute, adding it first will make my suggestions more accurate.",
      choices: [
        {
          id: "add-entry",
          text: "Add today's entry",
          action: "openDashboard",
        },
        {
          id: "continue-without-entry",
          text: "Continue anyway",
          action: "continueIntro",
        },
      ],
    });
  }

  const unlockedToolsCount = dialogueEngine.getUnlockedToolsCount();

  if (unlockedToolsCount > 0) {
    nodes.push({
      id: "__intro_tools_summary__",
      speaker: "Mascot",
      text: `You also have ${unlockedToolsCount} reflection tool${unlockedToolsCount === 1 ? "" : "s"} ready. We can use them after choosing a topic.`,
      choices: [],
      next: "__intro_next__",
    });
  }

  nodes.push(buildBranchSelectNode(availableDialogues, insightLines, entries));

  return nodes;
}

function getAvailableUnlockFlowIdsFromDialogues(availableDialogues) {
  const backendIds = Array.isArray(availableDialogues)
    ? availableDialogues
        .filter((flow) => flow?.id && dialogueFlows[flow.id])
        .map((flow) => flow.id)
    : [];

  const sourceIds = backendIds.length > 0 ? backendIds : DEFAULT_FLOW_IDS;
  return dialogueEngine.getAvailableUnlockFlowIds(sourceIds);
}

function buildBranchSelectNode(availableDialogues, insightLines) {
  const unlockFlowIds = getAvailableUnlockFlowIdsFromDialogues(availableDialogues);

  const choices = unlockFlowIds.map((flowId) => ({
    id: flowId,
    text: dialogueFlows[flowId].title,
    action: "startFlow",
    flowId,
  }));

  choices.push({
    id: "stateTalk",
    text: "I want to talk about my state",
    action: "stateTalk",
  });

  return {
    id: "__branch_select__",
    speaker: "Mascot",
    text:
      unlockFlowIds.length > 0
        ? "What feels closest to what is bothering you right now?"
        : "You have already opened the main dialogue tools. We can talk about your current state now.",
    choices,
  };
}

export default function NovelTextViewer({
  flowId,
  entries = [],
  insights = null,
  insightLines = [],
  dashboardContext = {},
  availableDialogues = [],
  autoStart = true,
  onBack,
  onNavigate,
  onDialogueFinished,
}) {
  const [node, setNode] = useState(null);
  const [textPage, setTextPage] = useState(0);
  const [introQueue, setIntroQueue] = useState([]);

  const dialogueContext = useMemo(
    () => ({
      entries,
      insights,
      insightLines,
      dashboardContext: {
        ...dashboardContext,
        availableUnlockDialogueCount:
          getAvailableUnlockFlowIdsFromDialogues(availableDialogues).length,
      },
    }),
    [entries, insights, insightLines, dashboardContext, availableDialogues]
  );

  const setVisibleNode = (nextNode) => {
    setTextPage(0);
    setNode(nextNode);
  };

  const showNextIntroNode = (queueOverride) => {
    const queue = queueOverride || introQueue;
    const [nextIntroNode, ...rest] = queue;

    setIntroQueue(rest);

    if (nextIntroNode) {
      setVisibleNode(nextIntroNode);
    }
  };

  useEffect(() => {
    dialogueEngine.setOnUpdate(() => {
      const current = dialogueEngine.getCurrentNode();

      if (current?.id !== "empty") {
        setVisibleNode(current);
      }
    });

    return () => {
      dialogueEngine.setOnUpdate(null);
    };
  }, []);

  useEffect(() => {
    if (!autoStart && !flowId) return;

    if (flowId) {
      const nextNode = dialogueEngine.startDialogue(flowId, {
        context: dialogueContext,
      });

      setVisibleNode(nextNode || dialogueEngine.getCurrentNode());
      return;
    }

    const nextIntroQueue = buildIntroNodes({
      entries,
      availableDialogues,
      insightLines,
    });

    setIntroQueue(nextIntroQueue.slice(1));
    setVisibleNode(nextIntroQueue[0]);
  }, [autoStart, flowId, dialogueContext, availableDialogues, insightLines]);

  const startFlow = (selectedFlowId) => {
    const nextNode = dialogueEngine.startDialogue(selectedFlowId, {
      context: dialogueContext,
    });

    setVisibleNode(nextNode || dialogueEngine.getCurrentNode());
  };

  const startStateTalk = () => {
    const nextNode = dialogueEngine.startStateTalk({
      ...dialogueContext,
      forceFresh: true,
    });

    setVisibleNode(nextNode || dialogueEngine.getCurrentNode());
  };

  const openTool = (toolKey = node?.toolKey) => {
    window.dispatchEvent(
      new CustomEvent("openTools", {
        detail: { toolKey },
      })
    );

    if (typeof onNavigate === "function") {
      onNavigate("tools");
    }
  };

  const openDashboard = () => {
    if (typeof onNavigate === "function") {
      onNavigate("dashboard");
      return;
    }

    window.dispatchEvent(new CustomEvent("openDashboard"));
  };

  const chooseAnotherTopic = () => {
    setVisibleNode(buildBranchSelectNode(availableDialogues, insightLines, entries));

    if (typeof onDialogueFinished === "function") {
      onDialogueFinished();
    }
  };

  const handleNext = () => {
    if (node?.id?.startsWith("__intro_")) {
      showNextIntroNode();
      return;
    }

    const nextNode = dialogueEngine.goNext();

    if (nextNode) {
      setVisibleNode(nextNode);
      return;
    }

    const current = dialogueEngine.getCurrentNode();
    setVisibleNode(current?.id === "empty" ? node : current);
  };

  const handleChoice = (choice) => {
    if (choice.action === "continueIntro") {
      showNextIntroNode();
      return;
    }

    if (choice.action === "openDashboard") {
      openDashboard();
      return;
    }

    if (choice.action === "startFlow") {
      startFlow(choice.flowId);
      return;
    }

    if (choice.action === "stateTalk") {
      startStateTalk();
      return;
    }

    if (choice.action === "openTool") {
      openTool(choice.toolKey);
      return;
    }

    const nextNode = dialogueEngine.chooseOption(choice.id);

    if (nextNode?.selectedAction?.action === "openTool") {
      openTool(nextNode.selectedAction.toolKey);
      return;
    }

    if (nextNode?.selectedAction?.action === "stateTalk") {
      startStateTalk();
      return;
    }

    const current = nextNode || dialogueEngine.getCurrentNode();
    setVisibleNode(current?.id === "empty" ? node : current);
  };

  if (!node) {
    return null;
  }

  const textPages = splitTextPages(node.text);
  const visibleText = textPages[textPage] || node.text;
  const hasMoreText = textPage < textPages.length - 1;
  const choices = Array.isArray(node.choices) ? node.choices : [];
  const hasChoices = choices.length > 0;
  const hasNext = Boolean(node.next);
  const canShowChoices = !hasMoreText && hasChoices;
  const canShowNodeNext = !hasMoreText && !hasChoices && hasNext;
  const canShowFinish = !hasMoreText && !hasChoices && !hasNext;

  return (
    <div className="novel-root">
      <div className="novel-scene">
        <img className="novel-bg" src={loggia} alt="Background" />
        <img className="novel-character" src={mascotImage} alt="Mascot" />

        <div className="speech-bubble">
          <div className="speaker">{node.speaker || "Mascot"}</div>
          <div className="content">{visibleText}</div>
        </div>

        <div className="novel-actions">
          {hasMoreText && (
            <button
              className="btn-primary"
              onClick={() => setTextPage((page) => page + 1)}
            >
              Next
            </button>
          )}

          {canShowChoices &&
            choices.map((choice) => (
              <button
                key={choice.id}
                className={[
                  choice.action === "openTool" || choice.action === "startFlow"
                    ? "btn-primary"
                    : "btn-secondary",
                  choice.seen ? "choice-seen" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleChoice(choice)}
              >
                {choice.text || choice.label}
              </button>
            ))}

          {canShowNodeNext && (
            <button className="btn-primary" onClick={handleNext}>
              Next
            </button>
          )}

          {canShowFinish && (
            <div className="novel-finish-actions">
              <button className="btn-primary" onClick={() => openTool()}>
                Open Tools
              </button>

              <button className="btn-secondary" onClick={chooseAnotherTopic}>
                Choose another topic
              </button>

              <button
                className="btn-secondary"
                onClick={() => {
                  if (onBack) onBack();
                }}
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
