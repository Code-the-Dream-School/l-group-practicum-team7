const Entry = require("../models/Entry");

const getEmptyInsightsResponse = () => ({
  message: "Not enough data yet",
  today: {
    stress: null,
    sleep: null,
    energy: null,
    burnoutScore: null,
    burnoutLevel: null,
  },
  averages: {
    last2DaysStress: 0,
    last7DaysStress: 0,
    last7DaysEnergy: 0,
    last7DaysBurnout: 0,
  },
  insights: {
    today: [],
    trend: [],
    weekly: [],
    advanced: [],
  },
});

async function getLastEntries(userId, days = 7) {
  return Entry.find({ userId }).sort({ date: -1 }).limit(days);
}

function avg(arr, key) {
  if (!arr.length) return 0;

  return arr.reduce((sum, entry) => sum + (entry[key] || 0), 0) / arr.length;
}

function clean(arr) {
  const seen = new Set();

  return arr.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

function oneDayInsight(entry) {
  if (entry.stress >= 4 && entry.energy <= 2) {
    return "High stress and low energy today — risk of early burnout.";
  }

  if (entry.sleepHours < 6) {
    return "Low sleep detected — recovery needed.";
  }

  return "Your daily balance looks stable.";
}

function trendInsight(entries) {
  if (entries.length < 2) return "Not enough data for trend analysis.";

  const data = [...entries].reverse();

  const previous = data[data.length - 2];
  const current = data[data.length - 1];

  if (current.stress > previous.stress && current.energy < previous.energy) {
    return "Stress is increasing while energy is dropping — warning trend.";
  }

  if (current.stress < previous.stress) {
    return "Stress levels are improving — good progress.";
  }

  return "No strong trend detected yet.";
}

function weeklyInsight(entries) {
  if (!entries.length) return "Not enough data for weekly analysis.";

  const avgStress = entries.reduce((sum, entry) => sum + entry.stress, 0) / entries.length;
  const avgSleep = entries.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.length;

  if (avgStress >= 4 && avgSleep < 6) {
    return "Sustained high stress + low sleep → high burnout risk.";
  }

  if (avgStress <= 2) {
    return "Low stress week — good recovery pattern.";
  }

  return "Moderate weekly balance.";
}

async function generateInsights(userId) {
  const entries = await getLastEntries(userId, 7);

  if (!entries.length) {
    return getEmptyInsightsResponse();
  }

  const data = [...entries].reverse();

  const today = data[data.length - 1];
  const last2 = data.slice(-2);
  const last7 = data;

  const avg2Stress = avg(last2, "stress");
  const avg7Stress = avg(last7, "stress");
  const avg7Energy = avg(last7, "energy");
  const avg7Burnout = avg(last7, "burnoutScore");

  const insights = {
    today: [],
    trend: [],
    weekly: [],
    advanced: [],
  };

  if (today.stress >= 4) {
    insights.today.push("High stress detected today.");
  }

  if (today.sleepHours <= 5) {
    insights.today.push("Low sleep may affect recovery today.");
  }

  if (today.energy <= 2) {
    insights.today.push("Low energy today — possible fatigue.");
  }

  if (today.burnoutScore >= 3.5) {
    insights.today.push("High burnout risk today.");
  } else if (today.burnoutScore >= 2) {
    insights.today.push("Moderate burnout risk today.");
  }

  if (!insights.today.length) {
    insights.today.push(oneDayInsight(today));
  }

  if (last2.length === 2) {
    if (last2[1].stress > last2[0].stress) {
      insights.trend.push("Stress is increasing over the last 2 days.");
    }

    if (last2[1].burnoutScore > last2[0].burnoutScore) {
      insights.trend.push("Burnout risk is increasing.");
    }

    if (last2[1].stress > last2[0].stress && last2[1].energy < last2[0].energy) {
      insights.trend.push(
        "Recent increase in stress alongside falling energy suggests rapid fatigue buildup."
      );
    }
  }

  if (!insights.trend.length) {
    insights.trend.push(trendInsight(last2));
  }

  if (avg7Stress >= 4) {
    insights.weekly.push("Sustained high stress over the past week.");
  }

  if (avg7Burnout >= 3.5) {
    insights.weekly.push("Consistently high burnout risk this week.");
  }

  if (avg7Stress >= 4 && avg7Energy <= 2.5) {
    insights.weekly.push("Burnout risk detected from long-term pattern.");
  }

  if (!insights.weekly.length) {
    insights.weekly.push(weeklyInsight(last7));
  }

  const highStressLowSleepDays = last7.filter(
    (entry) => entry.stress >= 4 && entry.sleepHours <= 5
  ).length;

  if (highStressLowSleepDays >= 3) {
    insights.advanced.push(
      "High stress combined with low sleep over multiple days indicates early signs of burnout."
    );
  }

  if (last7.length >= 3) {
    const workloadTrend = last7[last7.length - 1].workload > last7[last7.length - 3].workload;
    const energyDrop = last7[last7.length - 1].energy < last7[last7.length - 3].energy;

    if (workloadTrend && energyDrop) {
      insights.advanced.push(
        "Your energy has dropped following several high workload days."
      );
    }
  }

  if (avg7Burnout >= 3 && avg7Energy <= 3) {
    insights.advanced.push(
      "Sustained workload and reduced energy suggest accumulating burnout risk."
    );
  }

  const lowRecoveryDays = last7.filter(
    (entry) => entry.sleepHours <= 5 && entry.energy <= 2
  ).length;

  if (lowRecoveryDays >= 2) {
    insights.advanced.push(
      "Insufficient recovery over recent days may impact overall resilience."
    );
  }

  return {
    today: {
      stress: today.stress,
      sleep: today.sleepHours,
      energy: today.energy,
      burnoutScore: today.burnoutScore,
      burnoutLevel: today.burnoutLevel,
    },
    averages: {
      last2DaysStress: avg2Stress,
      last7DaysStress: avg7Stress,
      last7DaysEnergy: avg7Energy,
      last7DaysBurnout: avg7Burnout,
    },
    insights: {
      today: clean(insights.today),
      trend: clean(insights.trend),
      weekly: clean(insights.weekly),
      advanced: clean(insights.advanced),
    },
  };
}

module.exports = {
  getLastEntries,
  oneDayInsight,
  trendInsight,
  weeklyInsight,
  generateInsights,
};