const Entry = require("../models/Entry");

// get last N entries
async function getLastEntries(userId, days = 7) {
  return Entry.find({ userId }).sort({ date: -1 }).limit(days);
}

// 1-day insight
function oneDayInsight(entry) {
  if (entry.stress >= 4 && entry.energy <= 2) {
    return "High stress and low energy today — risk of early burnout.";
  }

  if (entry.sleepHours < 6) {
    return "Low sleep detected — recovery needed.";
  }

  return "Your daily balance looks stable.";
}

// trend analysis (2–3 days)
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

// 7-day pattern
function weeklyInsight(entries) {
  if (!entries.length) return "Not enough data for weekly analysis.";

  const avgStress =
    entries.reduce((sum, entry) => sum + entry.stress, 0) / entries.length;

  const avgSleep =
    entries.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.length;

  if (avgStress >= 4 && avgSleep < 6) {
    return "Sustained high stress + low sleep → high burnout risk.";
  }

  if (avgStress <= 2) {
    return "Low stress week — good recovery pattern.";
  }

  return "Moderate weekly balance.";
}

module.exports = {
  getLastEntries,
  oneDayInsight,
  trendInsight,
  weeklyInsight,
};