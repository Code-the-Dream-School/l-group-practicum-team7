const express = require("express");
const router = express.Router();
const Entry = require("../models/Entry");
const burnoutService = require("../services/burnout.service");


const authApi = require("../middleware/authApi");
router.use(authApi);

router.post("/", async (req, res) => {
  try {
    const { stress, workload, sleepHours, energy } = req.body;

    // validation

    if (
      typeof stress !== "number" ||
      stress < 1 ||
      stress > 5
    ) {
      return res.status(400).json({
        error: "Stress must be a number between 1 and 5",
      });
    }

    if (
      typeof workload !== "number" ||
      workload < 1 ||
      workload > 5
    ) {
      return res.status(400).json({
        error: "Workload must be a number between 1 and 5",
      });
    }

    if (
      typeof energy !== "number" ||
      energy < 1 ||
      energy > 5
    ) {
      return res.status(400).json({
        error: "Energy must be a number between 1 and 5",
      });
    }

    if (
      typeof sleepHours !== "number" ||
      sleepHours < 0 ||
      sleepHours > 24
    ) {
      return res.status(400).json({
        error: "Sleep hours must be between 0 and 24",
      });
    }


     const result = burnoutService.calculateBurnout({
      stress,
      workload,
      sleepHours,
      energy,
    });

    // create entry
    const entry = await Entry.create({
      userId: req.user._id,
      stress,
      workload,
      sleepHours,
      energy,
      ...result, 
    });

    res.json(entry);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

    

// GET last 7 entries
router.get("/", async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(7);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;