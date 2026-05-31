const Entry = require("../models/Entry");
const UserTool = require("../models/UserTool");

const DIALOGUES = [
  {
    id: "overwhelmedByMultitasking",
    title: "Overwhelmed by Multi-tasking",
    problemKey: "multitasking",
    description: "For moments when many things happen at once and the user feels mentally overloaded.",
  },
  {
    id: "highWorkload",
    title: "High Workload",
    problemKey: "high_workload",
    description: "For sustained workload, pressure, responsibility, and high burnout risk.",
  },
  {
    id: "sleepDeprivation",
    title: "Sleep Deprivation",
    problemKey: "sleep_deprivation",
    description: "For low sleep, poor recovery, and fatigue related to sleep loss.",
  },
  {
    id: "lowEnergy",
    title: "Low Energy",
    problemKey: "low_energy",
    description: "For low energy, low motivation, tiredness, and difficulty starting tasks.",
  },
];

async function getLastEntries(userId, limit = 7) {
  return Entry.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(limit);
}

function avg(entries, field) {
  if (!entries.length) return 0;

  const valid = entries.filter((entry) => typeof entry[field] === "number");
  if (!valid.length) return 0;

  return valid.reduce((sum, entry) => sum + entry[field], 0) / valid.length;
}

function detectProblems(entries) {
  if (!entries.length) {
    return [
      {
        problemKey: "low_energy",
        reason: "No recent entries found. Start with a gentle low-energy check-in.",
        score: 1,
      },
    ];
  }

  const today = entries[0];
  const lastTwo = entries.slice(0, 2);
  const lastSeven = entries.slice(0, 7);

  const avgStress7 = avg(lastSeven, "stress");
  const avgEnergy7 = avg(lastSeven, "energy");
  const avgSleep7 = avg(lastSeven, "sleepHours");

  const problems = [];

  if (today.sleepHours < 6 || avgSleep7 < 6) {
    problems.push({
      problemKey: "sleep_deprivation",
      reason: "Low sleep detected in recent entries.",
      score: today.sleepHours < 6 ? 3 : 2,
    });
  }

  if (today.energy <= 2 || avgEnergy7 <= 2.5) {
    problems.push({
      problemKey: "low_energy",
      reason: "Low energy detected from today or recent average.",
      score: today.energy <= 2 ? 3 : 2,
    });
  }

  if (today.stress >= 4 || avgStress7 >= 4) {
    problems.push({
      problemKey: "high_workload",
      reason: "High stress or sustained workload pattern detected.",
      score: today.stress >= 4 ? 3 : 2,
    });
  }

  if (lastTwo.length >= 2) {
    const current = lastTwo[0];
    const previous = lastTwo[1];

    if (current.stress > previous.stress && current.energy < previous.energy) {
      problems.push({
        problemKey: "multitasking",
        reason: "Stress is rising while energy is falling, suggesting overload.",
        score: 3,
      });
    }
  }

  if (!problems.length) {
    problems.push({
      problemKey: "high_workload",
      reason: "No severe pattern detected. General workload reflection is available.",
      score: 1,
    });
  }

  const unique = new Map();

  problems.forEach((problem) => {
    const existing = unique.get(problem.problemKey);

    if (!existing || problem.score > existing.score) {
      unique.set(problem.problemKey, problem);
    }
  });

  return Array.from(unique.values()).sort((a, b) => b.score - a.score);
}

async function getAvailableDialoguesForUser(userId) {
  const entries = await getLastEntries(userId, 7);
  const problems = detectProblems(entries);

  const problemKeys = new Set(problems.map((problem) => problem.problemKey));

  const availableDialogues = DIALOGUES.filter((dialogue) =>
    problemKeys.has(dialogue.problemKey)
  ).map((dialogue) => {
    const problem = problems.find((item) => item.problemKey === dialogue.problemKey);

    return {
      ...dialogue,
      reason: problem?.reason || "",
      score: problem?.score || 1,
    };
  });

  return {
    entriesAnalyzed: entries.length,
    problems,
    dialogues: availableDialogues,
  };
}

async function getUnlockedToolsForUser(userId) {
  return UserTool.find({ userId }).sort({ unlockedAt: -1 });
}

async function unlockToolForUser(userId, payload) {
  const { key, title, sourceDialogue } = payload;

  if (!key || !title) {
    const error = new Error("Tool key and title are required.");
    error.statusCode = 400;
    throw error;
  }

  const tool = await UserTool.findOneAndUpdate(
    { userId, key },
    {
      $setOnInsert: {
        userId,
        key,
        title,
        sourceDialogue: sourceDialogue || null,
        unlockedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return tool;
}

module.exports = {
  DIALOGUES,
  getAvailableDialoguesForUser,
  getUnlockedToolsForUser,
  unlockToolForUser,
};