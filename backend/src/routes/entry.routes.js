const express = require("express");
<<<<<<< HEAD
const router = express.Router();

const authApi = require("../middleware/authApi");

const {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
} = require("../controllers/entryController");

router.use(authApi);

router.route("/").get(getEntries).post(createEntry);

router
  .route("/:id")
  .get(getEntryById)
  .put(updateEntry)
  .delete(deleteEntry);

module.exports = router;
=======
const { createEntry } = require("../controllers/entry.controller.js");

const router = express.Router();

// POST /api/entry
router.post("/entries", createEntry);

module.exports = router;
>>>>>>> 0e47246aae5b353fd2f29d3a8992ba95aed76c9d
