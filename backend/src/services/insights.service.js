const Entry = require("../models/Entry");

function generateInsights(entries) {
  if (!entries.length) {
    return {
      message: "Not enough data yet",
      insights: {
        today: [],
        trend: [],
        weekly: [],
        advanced: [],
      },
    };
  }

  const data = [...entries].reverse();

  const avg = (arr, key) =>
    arr.reduce((sum, e) => sum + (e[key] || 0), 0) / arr.length;

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

  // today
  if (today.stress >= 4) insights.today.push("High stress detected today.");
  if (today.sleepHours <= 5) insights.today.push("Low sleep may affect recovery today.");
  if (today.energy <= 2) insights.today.push("Low energy today — possible fatigue.");
  if (today.burnoutScore >= 3.5) insights.today.push("High burnout risk today.");

  // trend
  if (last2.length === 2) {
    if (last2[1].stress > last2[0].stress)
      insights.trend.push("Stress is increasing over last 2 days.");

    if (last2[1].burnoutScore > last2[0].burnoutScore)
      insights.trend.push("Burnout risk is increasing.");

    if (last2[1].stress > last2[0].stress && last2[1].energy < last2[0].energy)
      insights.trend.push("Stress rising with energy drop → fatigue risk.");
  }

  // weekly
  if (avg7Stress >= 4)
    insights.weekly.push("Sustained high stress over the week.");

  if (avg7Burnout >= 3.5)
    insights.weekly.push("High burnout risk this week.");

  if (avg7Stress >= 4 && avg7Energy <= 2.5)
    insights.weekly.push("Burnout pattern detected.");

  // advanced
  const highStressLowSleepDays = last7.filter(
    (e) => e.stress >= 4 && e.sleepHours <= 5
  ).length;

  if (highStressLowSleepDays >= 3)
    insights.advanced.push("High stress + low sleep pattern detected.");

  if (last7.length >= 3) {
    const workloadTrend =
      last7[last7.length - 1].workload >
      last7[last7.length - 3].workload;

    const energyDrop =
      last7[last7.length - 1].energy <
      last7[last7.length - 3].energy;

    if (workloadTrend && energyDrop) {
      insights.advanced.push("Energy dropped after high workload period.");
    }
  }

  if (avg7Burnout >= 3 && avg7Energy <= 3)
    insights.advanced.push("Accumulating burnout risk detected.");

  const lowRecoveryDays = last7.filter(
    (e) => e.sleepHours <= 5 && e.energy <= 2
  ).length;

  if (lowRecoveryDays >= 2)
    insights.advanced.push("Low recovery over multiple days.");

  if (today.stress < 3 && avg7Stress >= 4)
    insights.advanced.push("Stress improving today — good recovery sign.");

  if (today.sleepHours >= 8 && today.stress >= 4)
    insights.advanced.push("High stress despite good sleep.");

  // deduplication
  const seen = new Set();
  const clean = (arr) =>
    arr.filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });

 insights.today = clean(insights.today);
 insights.trend = clean(insights.trend);
 insights.weekly = clean(insights.weekly);
 insights.advanced = clean(insights.advanced);

 return {
  today,
  averages: {
    last2DaysStress: avg2Stress,
    last7Stress: avg7Stress,
    last7Energy: avg7Energy,
    last7Burnout: avg7Burnout,
  },
  insights,
};
}

module.exports = {
  generateInsights,
};