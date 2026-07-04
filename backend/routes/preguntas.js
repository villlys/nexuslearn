 
// preguntas.js

// routes/preguntas.js - Endpoints de preguntas

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, verificarProfesor } = require('../middleware/auth');

// POST /api/preguntas - Agregar una pregunta a una actividad
router.post('/', verificarToken, verificarProfesor, async (req, res) => {
  const { id_actividad, tipo, enunciado, opciones, respuesta_correcta, retroalimentacion, generada_por_ia } = req.body;

  try {
    if (!id_actividad || !tipo || !enunciado || !opciones || !respuesta_correcta || !retroalimentacion) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios excepto generada_por_ia' });
    }

    const resultado = await pool.query(
      `INSERT INTO PREGUNTAS (id_actividad, tipo, enunciado, opciones, respuesta_correcta, retroalimentacion, generada_por_ia)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [id_actividad, tipo, enunciado, JSON.stringify(opciones), respuesta_correcta, retroalimentacion, generada_por_ia || false]
    );

    res.status(201).json({
      mensaje: 'Pregunta agregada correctamente',
      id: resultado.rows[0].id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/preguntas/:id/responder - El alumno responde una pregunta
router.post('/:id/responder', verificarToken, async (req, res) => {
  const { id } = req.params; // id de la pregunta
  const { id_alumno, respuesta_dada, tiempo_empleado } = req.body;

  try {
    if (!id_alumno || !respuesta_dada || tiempo_empleado === undefined) {
      return res.status(400).json({ error: 'id_alumno, respuesta_dada y tiempo_empleado son obligatorios' });
    }

    // Buscar la pregunta para comparar la respuesta correcta
    const preguntaResult = await pool.query(
      'SELECT respuesta_correcta, retroalimentacion FROM PREGUNTAS WHERE id = $1',
      [id]
    );

    if (preguntaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    const { respuesta_correcta, retroalimentacion } = preguntaResult.rows[0];
    const es_correcta = respuesta_dada.trim() === respuesta_correcta.trim();

    // Cálculo de puntos: máximo 150, reduce con el tiempo (penaliza después de 5 segundos)
    let puntos_ganados = 0;
    if (es_correcta) {
      const tiempoMaximo = 20; // segundos límite del quiz
      const penalizacion = Math.max(0, tiempo_empleado - 5) * 5;
      puntos_ganados = Math.max(50, 150 - penalizacion);
    }

    // Guardar el intento en el historial
    await pool.query(
      `INSERT INTO HISTORIAL_RESPUESTAS (id_alumno, id_pregunta, respuesta_dada, es_correcta, tiempo_empleado, puntos_ganados)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id_alumno, id, respuesta_dada, es_correcta, tiempo_empleado, puntos_ganados]
    );

    // Actualizar el XP total del alumno
    if (puntos_ganados > 0) {
      await pool.query(
        'UPDATE USUARIOS SET xp_total = xp_total + $1 WHERE id = $2',
        [puntos_ganados, id_alumno]
      );
    }

    // Obtener el XP actualizado para recalcular el nivel (cada 500 XP = 1 nivel)
    const usuarioResult = await pool.query(
      'SELECT xp_total FROM USUARIOS WHERE id = $1',
      [id_alumno]
    );
    const xp_total_actualizado = usuarioResult.rows[0].xp_total;
    const nivel_actual = Math.floor(xp_total_actualizado / 500) + 1;

    await pool.query(
      'UPDATE USUARIOS SET nivel_actual = $1 WHERE id = $2',
      [nivel_actual, id_alumno]
    );

    res.status(200).json({
      es_correcta,
      puntos_ganados,
      retroalimentacion,
      xp_total_actualizado,
      nivel_actual,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


/////////////////////////////////////////
// GET /api/preguntas/actividad/:id_actividad - Listar preguntas de una actividad
router.get('/actividad/:id_actividad', verificarToken, verificarProfesor, async (req, res) => {
  const { id_actividad } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT id, enunciado, tipo, opciones, respuesta_correcta, retroalimentacion, generada_por_ia
       FROM PREGUNTAS WHERE id_actividad = $1 ORDER BY id`,
      [id_actividad]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/preguntas/historial/:id_actividad - Resultados de alumnos por actividad
router.get('/historial/:id_actividad', verificarToken, verificarProfesor, async (req, res) => {
  const { id_actividad } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT 
         u.nombre AS alumno,
         p.enunciado,
         hr.respuesta_dada,
         hr.es_correcta,
         hr.puntos_ganados,
         hr.tiempo_empleado,
         hr.fecha_registro
       FROM HISTORIAL_RESPUESTAS hr
       JOIN USUARIOS u ON hr.id_alumno = u.id
       JOIN PREGUNTAS p ON hr.id_pregunta = p.id
       WHERE p.id_actividad = $1
       ORDER BY hr.fecha_registro DESC`,
      [id_actividad]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});
//////////////////////////////////////////////////////
// DELETE /api/preguntas/:id - Eliminar una pregunta
router.delete('/:id', verificarToken, verificarProfesor, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM PREGUNTAS WHERE id = $1', [id]);
    res.status(200).json({ mensaje: 'Pregunta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});
module.exports = router;