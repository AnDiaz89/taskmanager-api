const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { generateTask } = require('../controllers/aiController');

router.use(authMiddleware);

router.post('/generate-task', generateTask);

module.exports = router;