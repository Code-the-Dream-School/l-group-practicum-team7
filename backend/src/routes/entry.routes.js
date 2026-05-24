const express = require("express");
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
