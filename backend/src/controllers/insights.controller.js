const Entry = require("../models/Entry");
const insightsService = require("../services/insights.service");

exports.getInsights = async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(7);

    const result = insightsService.generateInsights(entries);

    return res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Error generating insights",
      error: err.message,
    });
  }
};