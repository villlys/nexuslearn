// middleware/auth.js
// Middleware para proteger rutas verificando el JWT

const jwt = require('jsonwebtoken');

// Verifica que venga un token válido en el header Authorization: Bearer <token>
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado, falta el token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, rol, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Se usa DESPUÉS de verificarToken. Exige que el usuario tenga rol de profesor
function verificarProfesor(req, res, next) {
  if (req.usuario.rol !== 'profesor') {
    return res.status(403).json({ error: 'Acceso solo para profesores' });
  }
  next();
}

module.exports = { verificarToken, verificarProfesor };