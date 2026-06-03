const express = require("express");
const router = express.Router();
const authApi = require("../middleware/authApi");
const { getInsights } = require("../controllers/insightsController");

router.use(authApi);

router.get("/", getInsights);

module.exports = router;