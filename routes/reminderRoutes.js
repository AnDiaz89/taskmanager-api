const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { sendReminder } = require('../controllers/reminderController');

router.use(authMiddleware);

router.post('/tasks/:taskId/reminder', sendReminder);

module.exports = router;