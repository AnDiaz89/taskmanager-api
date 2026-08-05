const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getGithubActivity } = require('../controllers/githubController');

router.use(authMiddleware);

router.get('/github/activity', getGithubActivity);

module.exports = router;