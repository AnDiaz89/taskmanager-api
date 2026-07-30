const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getTasks(req, res) {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { subtasks: { orderBy: { createdAt: 'asc' } } },
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
}

async function createTask(req, res) {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'media',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.userId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, completed, priority, dueDate } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTask || existingTask.userId !== req.userId) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title: title !== undefined ? title : existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        completed: completed !== undefined ? completed : existingTask.completed,
        priority: priority !== undefined ? priority : existingTask.priority,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTask.dueDate,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTask || existingTask.userId !== req.userId) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    await prisma.task.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
}

async function getTaskStats(req, res) {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
    });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;

    const byPriority = {
      alta: tasks.filter((t) => t.priority === 'alta').length,
      media: tasks.filter((t) => t.priority === 'media').length,
      baja: tasks.filter((t) => t.priority === 'baja').length,
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sevenDaysAgo);
      day.setDate(day.getDate() + i);
      const dayStr = day.toISOString().slice(0, 10);

      const count = tasks.filter((t) => t.createdAt.toISOString().slice(0, 10) === dayStr).length;

      last7Days.push({
        date: day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        tareas: count,
      });
    }

    res.json({ total, completed, pending, byPriority, last7Days });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask, getTaskStats };