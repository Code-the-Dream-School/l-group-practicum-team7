const { expect } = require("chai");
const { getSleepScore, calculateBurnout } = require("../src/services/burnout");

describe("burnout service", () => {
  it("should return high sleep score for good sleep", () => {
    const result = getSleepScore(8);

    expect(result).to.be.a("number");
    expect(result).to.equal(5);
  });

  it("should return higher burnout when stress and workload are high", () => {
    const result = calculateBurnout({
      stress: 5,
      workload: 5,
      sleepScore: 5,
      energy: 1,
    });

    expect(result.score).to.be.greaterThan(3.5);
    expect(result.level).to.equal("High");
  });

  it("should return low burnout for balanced values", () => {
    const result = calculateBurnout({
      stress: 1,
      workload: 1,
      sleepScore: 1,
      energy: 5,
    });

    expect(result.score).to.be.lessThan(2);
    expect(result.level).to.equal("Low");
  });
});