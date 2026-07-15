// routes/ia.js - Endpoint para generar quizzes con IA (Gemini)

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken } = require('../middleware/auth');
const { generarPreguntas } = require('../services/gemini');

// POST /api/ia/generar-quiz - El alumno pide un quiz generado por IA sobre un tema
router.post('/generar-quiz', verificarToken, async (req, res) => {
  const { tema } = req.body;
  const id_alumno = req.usuario.id;

  if (!tema || !tema.trim()) {
    return res.status(400).json({ error: 'El tema es obligatorio' });
  }

  try {
    // 1. Generar las preguntas PRIMERO con Gemini
    //    (si esto falla, no queda ninguna actividad huérfana en la base de datos)
    const preguntasGeneradas = await generarPreguntas(tema.trim(), 5);

    // 2. Ya con las preguntas listas, generar un código de acceso único
    const codigoAcceso = 'IA-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 3. Crear la actividad en la base de datos
    const actividadResultado = await pool.query(
      `INSERT INTO ACTIVIDADES_GAMIFICADAS (titulo, descripcion, id_profesor, codigo_acceso)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        `Desafío IA: ${tema.trim()}`,
        `Quiz generado automáticamente sobre "${tema.trim()}"`,
        id_alumno,
        codigoAcceso,
      ]
    );
    const idActividad = actividadResultado.rows[0].id;

    // 4. Insertar cada pregunta generada
    for (const p of preguntasGeneradas) {
      await pool.query(
        `INSERT INTO PREGUNTAS (id_actividad, tipo, enunciado, opciones, respuesta_correcta, retroalimentacion, generada_por_ia)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          idActividad,
          'quiz',
          p.enunciado,
          JSON.stringify(p.opciones),
          p.respuesta_correcta,
          p.retroalimentacion,
          true,
        ]
      );
    }

    res.status(201).json({
      mensaje: 'Quiz generado correctamente',
      codigo_acceso: codigoAcceso,
      total_preguntas: preguntasGeneradas.length,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo generar el quiz. Intenta con otro tema.' });
  }
});

module.exports = router;