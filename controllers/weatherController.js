const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getWeatherForTask(req, res) {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({ where: { id: parseInt(taskId) } });

    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    if (!task.city) {
      return res.status(400).json({ error: 'Esta tarea no tiene una ciudad asignada' });
    }

    if (!task.dueDate) {
      return res.status(400).json({ error: 'Esta tarea no tiene fecha límite' });
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: task.city,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric',
        lang: 'es',
      },
    });

    const targetDate = task.dueDate.toISOString().slice(0, 10);

    const forecastsForDay = response.data.list.filter((item) => item.dt_txt.startsWith(targetDate));

    if (forecastsForDay.length === 0) {
      return res.status(404).json({
        error: 'No hay pronóstico disponible para esa fecha (el pronóstico solo cubre los próximos 5 días)',
      });
    }

    const midday = forecastsForDay.find((f) => f.dt_txt.includes('12:00:00')) || forecastsForDay[0];

    res.json({
      city: task.city,
      date: targetDate,
      temp: Math.round(midday.main.temp),
      description: midday.weather[0].description,
      icon: midday.weather[0].icon,
    });
  } catch (error) {
    console.error(error);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }
    res.status(500).json({ error: 'Error al consultar el clima' });
  }
}

module.exports = { getWeatherForTask };