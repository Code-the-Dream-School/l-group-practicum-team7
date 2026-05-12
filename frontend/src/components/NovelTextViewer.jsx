import React, { useEffect, useState } from "react";
import dialogueEngine from "../lib/dialogueEngine";
import "./NovelTextViewer.css";

export default function NovelTextViewer({ flowId }) {
  const [node, setNode] = useState(null);

  useEffect(() => {
    dialogueEngine.setOnUpdate(() => {
      setNode(dialogueEngine.getCurrentNode());
    });
  }, []);

  useEffect(() => {
    if (flowId) {
      const nextNode = dialogueEngine.startDialogue(flowId);
      setNode(nextNode || dialogueEngine.getCurrentNode());
    }
  }, [flowId]);

  const handleNext = () => {
    const nextNode = dialogueEngine.goNext();
    setNode(nextNode || dialogueEngine.getCurrentNode());
  };

  const handleChoice = (choiceId) => {
    const nextNode = dialogueEngine.chooseOption(choiceId);
    setNode(nextNode || dialogueEngine.getCurrentNode());
  };

  if (!node) {
    return null;
  }

  const hasChoices = node.choices && node.choices.length > 0;
  const hasNext = Boolean(node.next);

  return (
    <div className="novel-root">
      <div className="novel-scene">
        <div className="novel-sprite" />
      </div>

      <div className="novel-overlay">
        <div className="novel-text">
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
        </div>
      </div>
    </div>
  );
}