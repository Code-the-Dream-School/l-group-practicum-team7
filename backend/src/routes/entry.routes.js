const express = require("express");
const { createEntry } = require("../controllers/entry.controller.js");

const router = express.Router();

// POST /api/entry
router.post("/entries", createEntry);

module.exports = router;
