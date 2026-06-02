const express = require('express');
const router = express.Router();
const { getHello } = require('../controllers/helloController');

// GET /api/hello
router.get('/', getHello);

module.exports = router;
