exports.calculateBurnout = ({
  stress,
  workload,
  sleepHours,
  energy,
}) => {
  // sleep score logic
  let sleepScore = 1;

  if (sleepHours >= 8) sleepScore = 5;
  else if (sleepHours >= 7) sleepScore = 4;
  else if (sleepHours >= 6) sleepScore = 3;
  else if (sleepHours >= 5) sleepScore = 2;

  // burnout formula
  const burnoutScore =
    0.4 * stress +
    0.3 * workload +
    0.2 * (5 - sleepScore) +
    0.1 * (5 - energy);

  const burnoutScoreRounded = Number(burnoutScore.toFixed(2));

  // burnout level
  let burnoutLevel = "Low";
  if (burnoutScoreRounded >= 3.5) burnoutLevel = "High";
  else if (burnoutScoreRounded >= 2) burnoutLevel = "Medium";

  return {
    burnoutScore: burnoutScoreRounded,
    burnoutLevel,
  };
};