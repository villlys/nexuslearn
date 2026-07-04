// routes/usuarios.js - Endpoints de usuarios (registro y login)

const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verificarToken } = require('../middleware/auth'); // ← NUEVO



// POST /api/usuarios/registro
router.post('/registro', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    // Validar que vengan todos los datos
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Encriptar la contraseña antes de guardarla
    const password_hash = await bcrypt.hash(password, 10);

    // Guardar el usuario en la base de datos
    const resultado = await pool.query(
      `INSERT INTO USUARIOS (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [nombre, email, password_hash, rol]
    );

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      id: resultado.rows[0].id
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// POST /api/usuarios/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const resultado = await pool.query(
      'SELECT * FROM USUARIOS WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = resultado.rows[0];

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        xp_total: usuario.xp_total,
        nivel_actual: usuario.nivel_actual,
        avatar: usuario.avatar   // ✅ fix: avatar ahora se incluye al login
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// PUT /api/usuarios/:id/avatar - Actualizar el avatar del usuario
router.put('/:id/avatar', verificarToken, async (req, res) => { // ← CAMBIO
  const { id } = req.params;
  const { avatar } = req.body;

  // Evita que un usuario modifique el avatar de otro
  if (parseInt(id) !== req.usuario.id) { // ← NUEVO
    return res.status(403).json({ error: 'No puedes modificar el avatar de otro usuario' });
  }

  const avataresValidos = ['gato', 'perro', 'hamster', 'unicornio', 'caballo', 'conejo', 'panda', 'zorro', 'leon', 'tigre', 'lobo', 'delfin', 'tortuga', 'pez', 'pajaro', 'serpiente', 'iguana', 'rana', 'canguro', 'koala'];
  if (!avataresValidos.includes(avatar)) {
    return res.status(400).json({ error: 'Avatar no válido' });
  }

  try {
    await pool.query(
      'UPDATE USUARIOS SET avatar = $1 WHERE id = $2',
      [avatar, id]
    );
    res.status(200).json({ mensaje: 'Avatar actualizado correctamente', avatar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/usuarios/:id/historial - Historial de respuestas del propio alumno
router.get('/:id/historial', verificarToken, async (req, res) => {
  const { id } = req.params;

  // Evita que un alumno vea el historial de otro
  if (parseInt(id) !== req.usuario.id) {
    return res.status(403).json({ error: 'No puedes consultar el historial de otro usuario' });
  }

  try {
    const resultado = await pool.query(
      `SELECT 
         hr.id,
         hr.respuesta_dada,
         hr.es_correcta,
         hr.puntos_ganados,
         hr.tiempo_empleado,
         hr.fecha_registro,
         p.enunciado,
         a.titulo AS actividad_titulo
       FROM HISTORIAL_RESPUESTAS hr
       JOIN PREGUNTAS p ON hr.id_pregunta = p.id
       JOIN ACTIVIDADES_GAMIFICADAS a ON p.id_actividad = a.id
       WHERE hr.id_alumno = $1
       ORDER BY hr.fecha_registro DESC
       LIMIT 10`,
      [id]
    );

    res.status(200).json(resultado.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;