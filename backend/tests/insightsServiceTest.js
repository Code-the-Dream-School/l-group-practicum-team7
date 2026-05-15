const { expect } = require("chai");

const {
  oneDayInsight,
  trendInsight,
  weeklyInsight,
} = require("../src/services/insightsService");

describe("insights service", () => {
  it("should detect high stress and low energy today", () => {
    const entry = {
      stress: 5,
      energy: 1,
      sleepHours: 7,
    };

    const result = oneDayInsight(entry);

    expect(result).to.equal("High stress and low energy today — risk of early burnout.");
  });

  it("should detect low sleep", () => {
    const entry = {
      stress: 2,
      energy: 4,
      sleepHours: 4,
    };

    const result = oneDayInsight(entry);

    expect(result).to.equal("Low sleep detected — recovery needed.");
  });

  it("should detect increasing stress and falling energy trend", () => {
    const entries = [
      {
        stress: 5,
        energy: 1,
      },
      {
        stress: 2,
        energy: 4,
      },
    ];

    const result = trendInsight(entries);

    expect(result).to.equal("Stress is increasing while energy is dropping — warning trend.");
  });

  it("should detect weekly high burnout risk from stress and low sleep", () => {
    const entries = [
      { stress: 5, sleepHours: 4 },
      { stress: 4, sleepHours: 5 },
      { stress: 5, sleepHours: 4 },
    ];

    const result = weeklyInsight(entries);

    expect(result).to.equal("Sustained high stress + low sleep → high burnout risk.");
  });
});