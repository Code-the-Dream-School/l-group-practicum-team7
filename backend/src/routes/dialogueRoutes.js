const express = require("express");

const {
  getAllDialogues,
  getAvailableDialogues,
  getUnlockedTools,
  unlockTool,
  resetUnlockedTools,
} = require("../controllers/dialogueController");

const router = express.Router();

router.get("/", getAllDialogues);
router.get("/available", getAvailableDialogues);
router.get("/tools", getUnlockedTools);
router.post("/tools/unlock", unlockTool);
router.delete("/tools", resetUnlockedTools);

module.exports = router;
