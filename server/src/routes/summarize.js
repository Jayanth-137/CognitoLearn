const express = require("express");
const router = express.Router();
const summarizerController = require("../controllers/summarizerController");

// POST /api/summarize — Generate summary from content
router.post("/", summarizerController.generateSummary);

module.exports = router;
