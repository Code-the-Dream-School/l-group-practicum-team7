const Entry = require("../models/Entry");

// get last N entries
async function getLastEntries(days = 7) {
  return await Entry.find()
    .sort({ date: -1 })
    .limit(days);
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

  const stressTrend = entries[0].stress - entries[1].stress;
  const energyTrend = entries[0].energy - entries[1].energy;

  if (stressTrend > 0 && energyTrend < 0) {
    return "Stress is increasing while energy is dropping — warning trend.";
  }

  if (stressTrend < 0) {
    return "Stress levels are improving — good progress.";
  }

  return "No strong trend detected yet.";
}

// 7-day pattern
function weeklyInsight(entries) {
  const avgStress =
    entries.reduce((sum, e) => sum + e.stress, 0) / entries.length;

  const avgSleep =
    entries.reduce((sum, e) => sum + e.sleepHours, 0) / entries.length;

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