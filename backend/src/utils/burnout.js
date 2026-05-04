const getSleepScore = (hours) => {
  if (hours >= 8) return 100;
  if (hours >= 6) return 75;
  if (hours >= 4) return 50;
  return 25;
};

const calculateBurnout = ({ stress, workload, sleepScore, energy }) => {
  const score =
    stress * 0.3 +
    workload * 0.3 +
    (100 - sleepScore) * 0.2 +
    (5 - energy) * 10 * 0.2;

  let level = "Low";
  if (score > 60) level = "High";
  else if (score > 30) level = "Medium";

  return {
    score: Math.round(score),
    level,
  };
};

module.exports = {
  getSleepScore,
  calculateBurnout,
};
