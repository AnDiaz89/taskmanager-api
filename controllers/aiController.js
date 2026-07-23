const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateTask(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Escribe una idea para generar la tarea' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const instruction = `Eres un asistente que ayuda a convertir ideas en tareas claras para un gestor de tareas.
A partir de la siguiente idea del usuario, genera un título corto (máximo 8 palabras) y una descripción útil (máximo 2 frases).

Responde ÚNICAMENTE en este formato JSON, sin texto adicional ni marcado de código:
{"title": "...", "description": "..."}

Idea del usuario: "${prompt}"`;

    const result = await model.generateContent(instruction);
    const text = result.response.text();

    const cleanText = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar la tarea con IA' });
  }
}

module.exports = { generateTask };