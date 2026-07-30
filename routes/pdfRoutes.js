const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { extractTasksFromPDF } = require('../controllers/pdfController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(authMiddleware);

router.post('/extract-tasks', upload.single('pdf'), extractTasksFromPDF);

module.exports = router;