import { useState } from "react";
import {
  Wind,
  Brain,
  Moon,
  Briefcase,
  HeartHandshake,
  ListChecks,
  PenLine,
  Sparkles,
} from "lucide-react";

import { allTools } from "../utils/toolsData";
import "./ToolsPage.css";

export default function ToolsPage({ unlockedTools = [], onClose }) {
  const [selectedTool, setSelectedTool] = useState(null);

  const visibleTools = allTools.filter((tool) =>
    unlockedTools.includes(tool.id),
  );

  const toolIcons = {
    breathing: Wind,
    grounding: Brain,
    "thought-dump": PenLine,
    "over-responsibility": Briefcase,
    "strategic-refusal": HeartHandshake,
    prioritization: ListChecks,
    "asking-support": HeartHandshake,
    "future-letter": PenLine,
    "five-minute-pause": Sparkles,
    "five-minute-task": ListChecks,
    "evening-release": Moon,
    "tomorrow-letter": PenLine,
    "tomorrow-list": ListChecks,
    "light-mode": Sparkles,
    "body-reset": HeartHandshake,
    "future-sentence": PenLine,
    "three-good-things": Sparkles,
  };

  return (
    <div className="tools-overlay">
      <main className="tools-modal">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <div className="tools-header-row">
          <div>
            <h1>PulseMind Tools</h1>
            <p>Tools recommended based on your emotional state.</p>
          </div>
        </div>

        <div className="tools-grid-rows">
          {visibleTools.map((tool) => {
            const Icon = toolIcons[tool.id] || Sparkles;

            return (
              <div className="tool-row-capsule" key={tool.id}>
                <div className="tool-row-left">
                  <div className="tool-icon-circle theme-blue">
                    <Icon size={26} strokeWidth={2.5} />
                  </div>

                  <div className="tool-row-details">
                    <h2 className="tool-row-title">{tool.title}</h2>

                    <p className="tool-row-desc">{tool.description}</p>
                  </div>
                </div>

                <div className="tool-row-actions">
                  <button
                    className="btn-use-capsule"
                    onClick={() => setSelectedTool(tool)}
                  >
                    Use Tool
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {selectedTool && (
          <div className="tool-panel">
            <button
              className="close-button"
              onClick={() => setSelectedTool(null)}
            >
              X
            </button>

            <h2>{selectedTool.title}</h2>

            <p>{selectedTool.description}</p>
          </div>
        )}
      </main>
    </div>
  );
}
