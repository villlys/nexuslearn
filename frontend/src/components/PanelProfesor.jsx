import { useState, useEffect } from 'react';
import DetalleActividad from './DetalleActividad';
import SelectorAvatar from './SelectorAvatar';

const emojiPorAvatar = {
  gato: '🐱', perro: '🐶', hamster: '🐹', unicornio: '🦄', caballo: '🐴',
  conejo: '🐰', panda: '🐼', zorro: '🦊', leon: '🦁', tigre: '🐯',
  lobo: '🐺', delfin: '🐬', tortuga: '🐢', pez: '🐠', pajaro: '🐦',
  serpiente: '🐍', iguana: '🦎', rana: '🐸', canguro: '🦘', koala: '🐨',
};

function PanelProfesor({ usuario, onLogout, onActualizarUsuario }) {
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState('actividades');

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigoAcceso, setCodigoAcceso] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const cargarActividades = async () => {
    setCargando(true);
    setError('');
    try {
      const token = localStorage.getItem('token'); 
      ////////////////////////////////////////////////////////////////////////////////////7
      // Llamada a la API para obtener las actividades del profesor con la url de VITE_API_URL
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/actividades/profesor/${usuario.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }, 
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.error || 'No se pudieron cargar las actividades');
        setCargando(false);
        return;
      }
      setActividades(datos);
    } catch (err) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarActividades();
  }, []);

  const handleCrearActividad = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    setMensajeExito('');

    try {
      const token = localStorage.getItem('token'); // ← NUEVO
      /////////////////////////////////////////////////////////////////////////////////////////////
      // Llamada a la API para crear una nueva actividad con la url de VITE_API_URL
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/actividades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ← NUEVO
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          id_profesor: usuario.id,
          codigo_acceso: codigoAcceso.toUpperCase(),
        }),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.error || 'No se pudo crear la actividad');
        setGuardando(false);
        return;
      }

      setMensajeExito(`¡Actividad "${titulo}" creada con código ${datos.codigo_acceso}!`);
      setTitulo('');
      setDescripcion('');
      setCodigoAcceso('');
      setMostrarFormulario(false);
      cargarActividades();

    } catch (err) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setGuardando(false);
    }
  };

  if (actividadSeleccionada) {
    return (
      <DetalleActividad
        actividad={actividadSeleccionada}
        onVolver={() => setActividadSeleccionada(null)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0e27] flex" style={{ fontFamily: 'Outfit, sans-serif' }}>

      <aside className="w-20 lg:w-56 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col items-center lg:items-stretch py-6 px-3 gap-2">
        <div className="flex items-center gap-2 px-2 mb-8 justify-center lg:justify-start">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <i className="ti ti-bolt text-white text-lg"></i>
          </div>
          <span className="hidden lg:inline text-white font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>NexusLearn</span>
        </div>

        {[
          { id: 'actividades', icon: 'ti-layout-grid', label: 'Mis actividades' },
          { id: 'ajustes', icon: 'ti-settings', label: 'Ajustes' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => { setSeccionActiva(item.id); setMostrarFormulario(false); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all justify-center lg:justify-start ${
              seccionActiva === item.id
                ? 'bg-white/15 text-white'
                : 'text-white/50 hover:bg-white/5 hover:text-white/80'
            }`}
          >
            <i className={`ti ${item.icon} text-xl flex-shrink-0`}></i>
            <span className="hidden lg:inline text-sm font-medium">{item.label}</span>
          </button>
        ))}

        <div className="flex-1"></div>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-red-500/10 hover:text-red-300 transition-all justify-center lg:justify-start"
        >
          <i className="ti ti-logout text-xl flex-shrink-0"></i>
          <span className="hidden lg:inline text-sm font-medium">Salir</span>
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">

        <div className="absolute top-[-5%] right-[10%] w-72 h-72 rounded-full bg-purple-600 opacity-[0.15] blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[10%] left-[20%] w-72 h-72 rounded-full bg-blue-500 opacity-[0.12] blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto">

          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <p className="text-white/60 text-sm">Panel del profesor</p>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                {usuario.nombre}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {seccionActiva === 'actividades' && (
                <button
                  onClick={() => { setMostrarFormulario(!mostrarFormulario); setMensajeExito(''); setError(''); }}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 active:scale-[0.98] transition-all text-sm flex items-center gap-2"
                >
                  <i className={`ti ${mostrarFormulario ? 'ti-x' : 'ti-plus'}`}></i>
                  {mostrarFormulario ? 'Cancelar' : 'Nueva actividad'}
                </button>
              )}

              <div
                onClick={() => setSeccionActiva('ajustes')}
                className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl pl-3 pr-2 py-1.5 cursor-pointer hover:bg-white/10 transition-all"
              >
                <span className="text-white text-sm font-medium hidden sm:inline">
                  {usuario.nombre.split(' ')[0]}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-base">
                  {emojiPorAvatar[usuario.avatar] || '👤'}
                </div>
              </div>
            </div>
          </div>

          {seccionActiva === 'ajustes' && (
            <SelectorAvatar
              usuario={usuario}
              onAvatarActualizado={(nuevoAvatar) => {
                if (onActualizarUsuario) onActualizarUsuario({ avatar: nuevoAvatar });
              }}
            />
          )}

          {seccionActiva === 'actividades' && (
            <>
              {mensajeExito && (
                <div className="bg-green-500/15 border border-green-400/30 text-green-200 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
                  <i className="ti ti-circle-check"></i>
                  {mensajeExito}
                </div>
              )}

              {mostrarFormulario && (
                <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6 mb-6">
                  <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <i className="ti ti-target-arrow text-purple-300"></i>
                    Crear nueva actividad
                  </h2>

                  <form onSubmit={handleCrearActividad} className="space-y-4">
                    <div>
                      <label className="text-white/80 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Título</label>
                      <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ej. Fundamentos de Bases de Datos"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-white/80 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Descripción</label>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Breve descripción del tema a evaluar"
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-white/80 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Código de acceso</label>
                      <input
                        type="text"
                        value={codigoAcceso}
                        onChange={(e) => setCodigoAcceso(e.target.value.toUpperCase())}
                        placeholder="Ej. SQL303"
                        maxLength={10}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase"
                      />
                      <p className="text-white/40 text-xs mt-1">Este código lo usarán tus alumnos para unirse a la actividad</p>
                    </div>

                    {error && (
                      <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm px-4 py-2.5 rounded-xl">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={guardando}
                      className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 active:scale-[0.98] transition-all text-sm disabled:opacity-50"
                    >
                      {guardando ? 'Creando...' : 'Crear actividad'}
                    </button>
                  </form>
                </div>
              )}

              <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6">
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <i className="ti ti-list-check text-blue-300"></i>
                  Mis actividades
                </h2>

                {cargando ? (
                  <p className="text-white/50 text-sm">Cargando actividades...</p>
                ) : error && actividades.length === 0 ? (
                  <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm px-4 py-2.5 rounded-xl">{error}</div>
                ) : actividades.length === 0 ? (
                  <p className="text-white/50 text-sm">Aún no has creado ninguna actividad. ¡Crea la primera!</p>
                ) : (
                  <div className="space-y-3">
                    {actividades.map((actividad) => (
                      <div
                        key={actividad.id}
                        className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.08] transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">{actividad.titulo}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-purple-300 text-xs font-medium flex items-center gap-1 bg-purple-500/15 px-2 py-0.5 rounded-md">
                              <i className="ti ti-key text-xs"></i> {actividad.codigo_acceso}
                            </span>
                            <span className="text-white/40 text-xs flex items-center gap-1">
                              <i className="ti ti-help-circle text-xs"></i> {actividad.total_preguntas} preguntas
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActividadSeleccionada(actividad)}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all flex-shrink-0 ml-3"
                        >
                          Ver detalle
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default PanelProfesor;