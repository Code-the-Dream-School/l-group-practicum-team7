import React, { useEffect, useState } from "react";
import dialogueEngine from "../../assets/novel/text/dialogueEngine";
import mascotImage from "../../assets/novel/graphics/miyuri_d_pryamo.png";
import "./NovelTextViewer.css";

export default function NovelTextViewer({
  flowId,
  insightLines = [],
  onBack,
  onDialogueFinished,
}) {
  const [node, setNode] = useState(null);
  const [introInsight, setIntroInsight] = useState(null);
  const [showingInsight, setShowingInsight] = useState(false);

  // engine subscription
  useEffect(() => {
    dialogueEngine.setOnUpdate(() => {
      setNode(dialogueEngine.getCurrentNode());
    });

    return () => {
      dialogueEngine.setOnUpdate(null);
    };
  }, []);

  useEffect(() => {
    if (!flowId) return;

    setNode(null);
    setIntroInsight(null);
    setShowingInsight(false);

    if (insightLines.length > 0) {
      setIntroInsight({
        id: "insight_intro",
        speaker: "Mascot",
        text: `Before we choose a tool, I noticed this:\n\n${insightLines[0]}`,
      });

      setShowingInsight(true);
      return;
    }

    const nextNode = dialogueEngine.startDialogue(flowId);
    setNode(nextNode || dialogueEngine.getCurrentNode());
  }, [flowId, insightLines]);

  const startDialogueAfterInsight = () => {
    console.log("FLOW ID:", flowId);

    const nextNode = dialogueEngine.startDialogue(flowId);

    console.log("START RESULT:", nextNode);
    console.log("CURRENT NODE:", dialogueEngine.getCurrentNode());

    setNode(nextNode || dialogueEngine.getCurrentNode());
    setShowingInsight(false);
    setIntroInsight(null);
  };

  const handleNext = () => {
    const nextNode = dialogueEngine.goNext();
    setNode(nextNode || dialogueEngine.getCurrentNode());
  };

  const handleChoice = (choiceId) => {
    const nextNode = dialogueEngine.chooseOption(choiceId);
    setNode(nextNode || dialogueEngine.getCurrentNode());
  };

  
  if (showingInsight && introInsight) {
    return (
      <div className="novel-root">
        <div className="novel-scene">
          <img className="novel-character" src={mascotImage} alt="Mascot" />

          <div className="speech-bubble">
            <div className="speaker">{introInsight.speaker}</div>
            <div className="content">{introInsight.text}</div>
          </div>

          <div className="novel-actions">
            <button className="btn-primary" onClick={startDialogueAfterInsight}>
              Continue
            </button>

            <button className="btn-secondary" onClick={onBack}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  if (!node) {
    return null;
  }

  const hasChoices = Array.isArray(node.choices) && node.choices.length > 0;
  const hasNext = Boolean(node.next);

  return (
    <div className="novel-root">
      <div className="novel-scene">
        <img className="novel-character" src={mascotImage} alt="Mascot" />

        <div className="speech-bubble">
          <div className="speaker">{node.speaker || "Mascot"}</div>
          <div className="content">{node.text}</div>
        </div>

        <div className="novel-actions">
          {hasChoices &&
            node.choices.map((choice) => (
              <button
                key={choice.id}
                className="btn-primary"
                onClick={() => handleChoice(choice.id)}
              >
                {choice.text}
              </button>
            ))}

          {!hasChoices && hasNext && (
            <button className="btn-primary" onClick={handleNext}>
              Next
            </button>
          )}

          {!hasChoices && !hasNext && (
            <div className="novel-finish-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  try {
                    window.dispatchEvent(new CustomEvent("openTools"));
                  } catch (e) {}
                }}
              >
                Open Tools
              </button>

              <button
                className="btn-secondary"
                onClick={onDialogueFinished}
              >
                Next dialogue
              </button>

              <button className="btn-secondary" onClick={onBack}>
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}