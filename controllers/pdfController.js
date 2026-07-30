const { PDFParse } = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTasksFromPDF(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    const parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    const text = result.text;
    await parser.destroy();

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'No se pudo extraer texto del PDF' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const instruction = `Eres un asistente que identifica tareas accionables dentro de un texto.

Analiza el siguiente texto (extraído de un PDF) y genera una lista de tareas concretas que se puedan extraer de él. Ignora información que no sea una tarea (como fechas de encabezado, nombres, etc.), a menos que formen parte de una tarea real.

Responde ÚNICAMENTE con un array JSON de objetos con este formato, sin texto adicional ni marcado de código:
[{"title": "...", "description": "..."}]

Si no encuentras ninguna tarea clara, responde con un array vacío: []

Texto extraído del PDF:
"""
${text.slice(0, 8000)}
"""`;

    const aiResult = await model.generateContent(instruction);
    const responseText = aiResult.response.text();
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    const tasks = JSON.parse(cleanText);

    res.json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el PDF' });
  }
}

module.exports = { extractTasksFromPDF };