const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getTasks, createTask, updateTask, deleteTask, getTaskStats } = require('../controllers/taskController');
// Todas las rutas de este archivo requieren estar logueado
router.use(authMiddleware);

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;