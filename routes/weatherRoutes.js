const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getWeatherForTask } = require('../controllers/weatherController');

router.use(authMiddleware);

router.get('/tasks/:taskId/weather', getWeatherForTask);

module.exports = router;