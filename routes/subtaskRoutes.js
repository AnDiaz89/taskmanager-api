const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createSubtask,
  toggleSubtask,
  deleteSubtask,
  generateSubtasks,
} = require('../controllers/subtaskController');

router.use(authMiddleware);

router.post('/tasks/:taskId/subtasks', createSubtask);
router.post('/tasks/:taskId/subtasks/generate', generateSubtasks);
router.put('/subtasks/:id', toggleSubtask);
router.delete('/subtasks/:id', deleteSubtask);

module.exports = router;