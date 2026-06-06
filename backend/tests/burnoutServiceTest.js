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

  it("should handle missing fields with neutral defaults", () => {
    const result = calculateBurnout({});

    expect(result.score).to.be.a("number");
    expect(result.level).to.be.oneOf(["Low", "Medium", "High"]);
  });

  it("should handle completely undefined input", () => {
    const result = calculateBurnout();

    expect(result.score).to.be.a("number");
    expect(result.level).to.be.oneOf(["Low", "Medium", "High"]);
  });

  it("should return correct boundary sleep scores for 1 and 5 equivalents", () => {
    expect(getSleepScore(0)).to.equal(1);
    expect(getSleepScore(10)).to.equal(5);
  });

  it("should classify medium burnout correctly", () => {
    const result = calculateBurnout({
      stress: 3,
      workload: 3,
      sleepScore: 3,
      energy: 3,
    });

    expect(result.score).to.be.at.least(2);
    expect(result.score).to.be.below(3.5);
    expect(result.level).to.equal("Medium");
  });
});