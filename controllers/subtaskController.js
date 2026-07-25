const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Verifica que la tarea exista y le pertenezca al usuario logueado
async function verifyTaskOwnership(taskId, userId) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== userId) {
    return null;
  }
  return task;
}

// Crear una subtarea manualmente
async function createSubtask(req, res) {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    const task = await verifyTaskOwnership(parseInt(taskId), req.userId);
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const subtask = await prisma.subtask.create({
      data: { title, taskId: parseInt(taskId) },
    });

    res.status(201).json(subtask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la subtarea' });
  }
}

// Marcar como completada / pendiente
async function toggleSubtask(req, res) {
  try {
    const { id } = req.params;

    const subtask = await prisma.subtask.findUnique({
      where: { id: parseInt(id) },
      include: { task: true },
    });

    if (!subtask || subtask.task.userId !== req.userId) {
      return res.status(404).json({ error: 'Subtarea no encontrada' });
    }

    const updated = await prisma.subtask.update({
      where: { id: parseInt(id) },
      data: { completed: !subtask.completed },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la subtarea' });
  }
}

// Eliminar una subtarea
async function deleteSubtask(req, res) {
  try {
    const { id } = req.params;

    const subtask = await prisma.subtask.findUnique({
      where: { id: parseInt(id) },
      include: { task: true },
    });

    if (!subtask || subtask.task.userId !== req.userId) {
      return res.status(404).json({ error: 'Subtarea no encontrada' });
    }

    await prisma.subtask.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Subtarea eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la subtarea' });
  }
}

// Generar subtareas automáticamente con IA
async function generateSubtasks(req, res) {
  try {
    const { taskId } = req.params;

    const task = await verifyTaskOwnership(parseInt(taskId), req.userId);
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const instruction = `Eres un asistente que divide tareas grandes en pasos accionables más pequeños.

Tarea: "${task.title}"
Descripción: "${task.description || 'Sin descripción'}"

Genera entre 3 y 6 subtareas concretas y accionables para completar esta tarea.

Responde ÚNICAMENTE con un array JSON de strings, sin texto adicional ni marcado de código:
["subtarea 1", "subtarea 2", "subtarea 3"]`;

    const result = await model.generateContent(instruction);
    const text = result.response.text();
    const cleanText = text.replace(/```json|```/g, '').trim();
    const titles = JSON.parse(cleanText);

    const createdSubtasks = await prisma.subtask.createMany({
      data: titles.map((title) => ({ title, taskId: parseInt(taskId) })),
    });

    const allSubtasks = await prisma.subtask.findMany({
      where: { taskId: parseInt(taskId) },
      orderBy: { createdAt: 'asc' },
    });

    res.status(201).json(allSubtasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar subtareas con IA' });
  }
}

module.exports = { createSubtask, toggleSubtask, deleteSubtask, generateSubtasks };