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

module.exports = { getTasks, createTask, updateTask, deleteTask };