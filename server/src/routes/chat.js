const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/:roadmapId', chatController.getMessages);
router.post('/:roadmapId', chatController.sendMessage);
router.delete('/:roadmapId', chatController.clearChat);

module.exports = router;
