const Entry = require("../models/Entry");

// GET /api/insights
exports.getInsights = async (req, res) => {
  try {
    // Get last 7 entries
    const entries = await Entry.find()
      .sort({ date: -1 })
      .limit(7);

    if (!entries.length) {
      return res.json({
        message: "Not enough data yet",
        insights: {
          today: [],
          trend: [],
          weekly: [],
          advanced: [],
        },
      });
    }

    // chronological order (old → new)
    const data = entries.reverse();

    // helper function
    const avg = (arr, key) =>
      arr.reduce((sum, e) => sum + (e[key] || 0), 0) / arr.length;

    // time windows
    const today = data[data.length - 1];
    const last2 = data.slice(-2);
    const last7 = data;

    // averages
    const avg2Stress = avg(last2, "stress");
    const avg7Stress = avg(last7, "stress");
    const avg7Energy = avg(last7, "energy");
    const avg7Burnout = avg(last7, "burnoutScore");

    // insights structure 
    const insights = {
      today: [],
      trend: [],
      weekly: [],
      advanced: [],
    };

    // today

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

//   2 days (trend)

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

    // weekly

    if (avg7Stress >= 4) {
      insights.weekly.push("Sustained high stress over the past week.");
    }

    if (avg7Burnout >= 3.5) {
      insights.weekly.push("Consistently high burnout risk this week.");
    }

    if (avg7Stress >= 4 && avg7Energy <= 2.5) {
      insights.weekly.push(
        "Burnout risk detected from long-term pattern."
      );
    }

    // advanced

    const highStressLowSleepDays = last7.filter(
      (e) => e.stress >= 4 && e.sleepHours <= 5
    ).length;

    if (highStressLowSleepDays >= 3) {
      insights.advanced.push(
        "High stress combined with low sleep over multiple days indicates early signs of burnout."
      );
    }

    if (last7.length >= 3) {
      const workloadTrend =
        last7[last7.length - 1].workload >
        last7[last7.length - 3].workload;

      const energyDrop =
        last7[last7.length - 1].energy <
        last7[last7.length - 3].energy;

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
      (e) => e.sleepHours <= 5 && e.energy <= 2
    ).length;

    if (lowRecoveryDays >= 2) {
      insights.advanced.push(
        "Insufficient recovery over recent days may impact overall resilience."
      );
    }

    if (today.stress < 3 && avg7Stress >= 4) {
        insights.advanced.push(
            "Stress is improving today compared to your weekly pattern — good recovery sign."
        );
    }

    if (today.sleepHours >= 8 && today.stress >= 4) {
        insights.advanced.push(
            "Despite good sleep, stress remains high — consider workload or external factors."
        );
    }

    // response

    const seen = new Set();

        const clean = (arr) =>
        arr.filter((item) => {
            if (seen.has(item)) return false;
            seen.add(item);
            return true;
        });

    res.json({
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
    });

  } catch (err) {
    res.status(500).json({
      message: "Error generating insights",
      error: err.message,
    });
  }
};