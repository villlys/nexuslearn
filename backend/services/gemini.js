// services/gemini.js
// Lógica para generar preguntas de quiz usando la API de Gemini

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generarPreguntas(tema, cantidad = 5) {
////////////////////////////////////////////////////////////////////////////////////////////
    // generar preguntas de opción múltiple sobre un tema usando Gemini
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Genera ${cantidad} preguntas de opción múltiple sobre el tema: "${tema}".
Cada pregunta debe tener exactamente 4 opciones, solo una correcta.
Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin backticks de markdown, con este formato exacto:

[
  {
    "enunciado": "texto de la pregunta",
    "opciones": ["opción A", "opción B", "opción C", "opción D"],
    "respuesta_correcta": "la opción correcta (debe coincidir exactamente con una de las opciones)",
    "retroalimentacion": "explicación breve de por qué es la respuesta correcta"
  }
]`;

  const resultado = await model.generateContent(prompt);
  const texto = resultado.response.text();

  // Gemini a veces envuelve el JSON en ```json ... ``` aunque se lo pidamos, lo limpiamos por seguridad
  const textoLimpio = texto.replace(/```json|```/g, '').trim();

  const preguntas = JSON.parse(textoLimpio);
  return preguntas;
}


module.exports = { generarPreguntas };