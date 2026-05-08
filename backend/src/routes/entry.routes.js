const express = require("express");
const router = express.Router();

const {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
} = require("../controllers/entryController");

router.route("/").get(getEntries).post(createEntry);
router.route("/:id").get(getEntryById).put(updateEntry).delete(deleteEntry);
const { createEntry } = require("../controllers/entry.controller.js");

const router = express.Router();

// POST /api/entry
router.post("/entries", createEntry);

module.exports = router;
