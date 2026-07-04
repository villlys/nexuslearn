// src/utils/auth.js
// Utilidades para validar la sesión del usuario a partir del JWT

// Decodifica el payload de un JWT (sin verificar firma, solo para leer datos como "exp")
export function decodificarToken(token) {
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payloadJson);
  } catch (err) {
    return null;
  }
}

// Revisa si el token ya expiró comparando "exp" (segundos) contra la hora actual
export function tokenExpirado(token) {
  if (!token) return true;

  const payload = decodificarToken(token);
  if (!payload || !payload.exp) return true;

  const ahoraEnSegundos = Date.now() / 1000;
  return payload.exp < ahoraEnSegundos;
}

// Limpia todo rastro de sesión guardado en localStorage
export function limpiarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}