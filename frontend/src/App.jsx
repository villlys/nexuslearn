import { useState, useEffect } from 'react';

import DashboardAlumno from './components/DashboardAlumno';
import PanelProfesor from './components/PanelProfesor';
import { tokenExpirado, limpiarSesion } from './utils/auth';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [sesionExpirada, setSesionExpirada] = useState(false);

  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    const token = localStorage.getItem('token');
    const guardado = localStorage.getItem('usuario');

    // Si no hay token o ya expiró, no restauramos la sesión
    if (!token || tokenExpirado(token)) {
      limpiarSesion();
      return null;
    }

    return guardado ? JSON.parse(guardado) : null;
  });

  // Revisa periódicamente si el token expiró mientras la app está abierta
  useEffect(() => {
    if (!usuarioLogueado) return;

    const intervalo = setInterval(() => {
      const token = localStorage.getItem('token');
      if (tokenExpirado(token)) {
        limpiarSesion();
        setUsuarioLogueado(null);
        setSesionExpirada(true);
      }
    }, 60 * 1000); // revisa cada minuto

    return () => clearInterval(intervalo);
  }, [usuarioLogueado]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSesionExpirada(false);
    setCargando(true);

    try {
      const respuesta = await fetch('http://localhost:3000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || 'Error al iniciar sesión');
        setCargando(false);
        return;
      }

      localStorage.setItem('token', datos.token);
      localStorage.setItem('usuario', JSON.stringify(datos.usuario));
      setUsuarioLogueado(datos.usuario);

    } catch (err) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    limpiarSesion();
    setUsuarioLogueado(null);
  };

  // Si ya hay un usuario logueado, mostramos su panel según el rol
  if (usuarioLogueado) {
    if (usuarioLogueado.rol === 'alumno') {
      return (
        <DashboardAlumno
          usuario={usuarioLogueado}
          onLogout={handleLogout}
          onActualizarUsuario={(cambios) => setUsuarioLogueado({ ...usuarioLogueado, ...cambios })}
        />
      );
    }

    return (
      <PanelProfesor
        usuario={usuarioLogueado}
        onLogout={handleLogout}
        onActualizarUsuario={(cambios) => setUsuarioLogueado({ ...usuarioLogueado, ...cambios })}
      />
    );
  }

  // Si no hay usuario logueado, mostramos el formulario de login
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-[#0a0e27]" style={{ fontFamily: 'Outfit, sans-serif' }}>

      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-purple-600 opacity-30 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[28rem] h-[28rem] rounded-full bg-blue-500 opacity-30 blur-3xl"></div>
      <div className="absolute top-[30%] right-[10%] w-72 h-72 rounded-full bg-pink-500 opacity-20 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-black/30 border border-white/20 rounded-3xl p-8 shadow-2xl">

          <div className="text-center mb-8">
            <h1
              className="text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Nexus<span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">Learn</span>
            </h1>
            <p className="text-white/80 text-sm mt-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">Aprende a tu propio ritmo</p>
          </div>

          {sesionExpirada && (
            <div className="bg-amber-500/20 border border-amber-400/40 text-amber-200 text-sm px-4 py-2.5 rounded-xl mb-5 flex items-center gap-2">
              <i className="ti ti-clock-exclamation"></i>
              Tu sesión expiró, inicia sesión de nuevo
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="text-white/90 text-xs font-semibold mb-1.5 block uppercase tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-white/90 text-xs font-semibold mb-1.5 block uppercase tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50"
            >
              {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>

          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            ¿No tienes cuenta? <span className="text-purple-300 font-medium cursor-pointer hover:underline">Regístrate</span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default App;