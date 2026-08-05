const express = require('express');
const router = express.Router();
const { register, login, updateGithubUsername } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.put('/github-username', authMiddleware, updateGithubUsername);

module.exports = router;