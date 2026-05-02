const express = require("express");
const router = express.Router();
const Entry = require("../models/Entry");

router.post("/", async (req, res) => {
  try {
    const { stress, workload, sleepHours, energy } = req.body;

    // sleep
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

    // enriched entry
    const entry = await Entry.create({
      stress,
      workload,
      sleepHours,
      energy,
      burnoutScore: burnoutScoreRounded,
      burnoutLevel,
    });

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET last 7 entries
router.get("/", async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: -1 }).limit(7);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;