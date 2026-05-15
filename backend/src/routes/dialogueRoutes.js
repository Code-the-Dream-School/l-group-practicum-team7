const express = require("express");

const {
  getAllDialogues,
  getAvailableDialogues,
  getUnlockedTools,
  unlockTool,
} = require("../controllers/dialogueController");

const router = express.Router();

router.get("/", getAllDialogues);
router.get("/available", getAvailableDialogues);

router.get("/tools", getUnlockedTools);
router.post("/tools/unlock", unlockTool);

module.exports = router;
