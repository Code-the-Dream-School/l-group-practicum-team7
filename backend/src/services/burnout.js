const getSleepScore = (hours) => {
  if (hours === undefined || hours === null) return 3;
  if (hours >= 8) return 5;
  if (hours >= 7) return 4;
  if (hours >= 6) return 3;
  if (hours >= 5) return 2;
  return 1;
};

const calculateBurnout = ({ stress, workload, sleepScore, energy } = {}) => {
  const s = typeof stress === "number" ? stress : 3;
  const w = typeof workload === "number" ? workload : 3;
  const sl = typeof sleepScore === "number" ? sleepScore : 3;
  const e = typeof energy === "number" ? energy : 3;

  const rawScore = 0.4 * s + 0.3 * w + 0.2 * (5 - sl) + 0.1 * (5 - e);

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