import { useState } from 'react'; // React hook para manejar el estado del componente
// registro.jsx: Componente de registro de usuario
function Registro({ onRegistroExitoso, onVolverALogin }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);



    /////////////////////////////////////////////////////////////////////////////////
    // Llamada a la API para registrar al usuario con la url de VITE_API_URL
    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email,
          password,
          rol: 'alumno', // ← fijo, el usuario no puede elegir su rol
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || 'No se pudo completar el registro');
        setCargando(false);
        return;
      }

      setExito(true);
      setTimeout(() => {
        onRegistroExitoso();
      }, 1800);

    } catch (err) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-[#0a0e27]" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-purple-600 opacity-30 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[28rem] h-[28rem] rounded-full bg-blue-500 opacity-30 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 text-center backdrop-blur-xl bg-black/30 border border-white/20 rounded-3xl p-10 max-w-md mx-4">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            ¡Cuenta creada!
          </h1>
          <p className="text-white/60">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-[#0a0e27]" style={{ fontFamily: 'Outfit, sans-serif' }}>

      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-purple-600 opacity-30 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[28rem] h-[28rem] rounded-full bg-blue-500 opacity-30 blur-3xl pointer-events-none"></div>
      <div className="absolute top-[30%] right-[10%] w-72 h-72 rounded-full bg-pink-500 opacity-20 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-black/30 border border-white/20 rounded-3xl p-8 shadow-2xl">

          <div className="text-center mb-8">
            <h1
              className="text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Nexus<span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">Learn</span>
            </h1>
            <p className="text-white/80 text-sm mt-2">Crea tu cuenta de alumno</p>
          </div>

          <form onSubmit={handleRegistro} className="space-y-5">

            <div>
              <label className="text-white/90 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                Nombre completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-white/90 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-white/90 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-white/90 text-xs font-semibold mb-1.5 block uppercase tracking-wide">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                autoComplete="new-password"
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
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <span
              onClick={onVolverALogin}
              className="text-purple-300 font-medium cursor-pointer hover:underline"
            >
              Inicia sesión
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Registro;