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

module.exports = router;
