// routes/actividades.js - Endpoints de actividades gamificadas

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verificarToken, verificarProfesor } = require('../middleware/auth');

// POST /api/actividades - El profesor crea una nueva actividad
router.post('/', verificarToken, verificarProfesor, async (req, res) => {
  const { titulo, descripcion, id_profesor, codigo_acceso } = req.body;

  try {
    if (!titulo || !id_profesor || !codigo_acceso) {
      return res.status(400).json({ error: 'Título, id_profesor y codigo_acceso son obligatorios' });
    }

    const resultado = await pool.query(
      `INSERT INTO ACTIVIDADES_GAMIFICADAS (titulo, descripcion, id_profesor, codigo_acceso)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [titulo, descripcion, id_profesor, codigo_acceso]
    );

    res.status(201).json({
      mensaje: 'Actividad creada correctamente',
      id: resultado.rows[0].id,
      codigo_acceso
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El código de acceso ya está en uso' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/actividades/:codigo_acceso - El alumno consulta una actividad con sus preguntas
router.get('/:codigo_acceso', async (req, res) => {
  const { codigo_acceso } = req.params;

  try {
    const actividad = await pool.query(
      'SELECT * FROM ACTIVIDADES_GAMIFICADAS WHERE codigo_acceso = $1',
      [codigo_acceso]
    );

    if (actividad.rows.length === 0) {
      return res.status(404).json({ error: 'No existe ninguna actividad con ese código' });
    }

    const preguntas = await pool.query(
      `SELECT id, tipo, enunciado, opciones, retroalimentacion
       FROM PREGUNTAS WHERE id_actividad = $1`,
      [actividad.rows[0].id]
    );

    res.status(200).json({
      id: actividad.rows[0].id,
      titulo: actividad.rows[0].titulo,
      descripcion: actividad.rows[0].descripcion,
      preguntas: preguntas.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/actividades/profesor/:id_profesor - Lista las actividades de un profesor
router.get('/profesor/:id_profesor', verificarToken, verificarProfesor, async (req, res) => {
  const { id_profesor } = req.params;

  // Evita que un profesor consulte actividades de otro profesor
  if (parseInt(id_profesor) !== req.usuario.id) {
    return res.status(403).json({ error: 'No puedes consultar actividades de otro profesor' });
  }

  try {
    const resultado = await pool.query(
      `SELECT a.id, a.titulo, a.codigo_acceso, a.fecha_creacion,
              COUNT(p.id) AS total_preguntas
       FROM ACTIVIDADES_GAMIFICADAS a
       LEFT JOIN PREGUNTAS p ON p.id_actividad = a.id
       WHERE a.id_profesor = $1
       GROUP BY a.id`,
      [id_profesor]
    );

    res.status(200).json(resultado.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;