const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendReminder(req, res) {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: { user: true },
    });

    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const dueDateText = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
      : 'sin fecha límite';

    await transporter.sendMail({
      from: `"Task Manager" <${process.env.GMAIL_USER}>`,
      to: task.user.email,
      subject: `Recordatorio: ${task.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #3d6b52;">Recordatorio de tarea</h2>
          <p><strong>${task.title}</strong></p>
          ${task.description ? `<p>${task.description}</p>` : ''}
          <p>Fecha límite: ${dueDateText}</p>
          <p>Prioridad: ${task.priority}</p>
        </div>
      `,
    });

    res.json({ message: 'Recordatorio enviado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al enviar el recordatorio' });
  }
}

module.exports = { sendReminder };