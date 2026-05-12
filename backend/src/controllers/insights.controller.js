const { generateInsights } = require("../services/insights.service");

exports.getInsights = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const result = await generateInsights(userId);

    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      message: "Error generating insights",
      error: err.message,
    });
  }
};