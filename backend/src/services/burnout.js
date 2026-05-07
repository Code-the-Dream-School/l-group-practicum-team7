const getSleepScore = (hours) => {
  if (hours >= 8) return 5;
  if (hours >= 7) return 4;
  if (hours >= 6) return 3;
  if (hours >= 5) return 2;
  return 1;
};

const calculateBurnout = ({ stress, workload, sleepScore, energy }) => {
  const rawScore =
    0.4 * stress +
    0.3 * workload +
    0.2 * (5 - sleepScore) +
    0.1 * (5 - energy);

  const score = Number(rawScore.toFixed(2));

  let level = "Low";

  if (score >= 3.5) {
    level = "High";
  } else if (score >= 2) {
    level = "Medium";
  }

  return { score, level };
};

module.exports = {
  getSleepScore,
  calculateBurnout,
};