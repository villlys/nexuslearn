import { useState, useEffect } from 'react';
import SelectorAvatar from './SelectorAvatar';
import Quiz from './Quiz';

// Gráfica SVG simple de % de aciertos por actividad (para la sección Progreso)
function GraficaProgreso({ datos }) {
  if (!datos || datos.length === 0) return null;
  const altura = 140;
  const anchoBarra = 50;
  const gap = 24;
  const paddingLeft = 32;
  const paddingBottom = 40;
  const anchoTotal = paddingLeft + datos.length * (anchoBarra + gap) + gap;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={anchoTotal} height={altura + paddingBottom + 10} style={{ minWidth: '100%' }}>
        {[0, 25, 50, 75, 100].map((val) => {
          const y = 10 + (altura - (val / 100) * altura);
          return (
            <g key={val}>
              <line x1={paddingLeft} y1={y} x2={anchoTotal} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
              <text x={paddingLeft - 6} y={y + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.35)">{val}</text>
            </g>
          );
        })}
        {datos.map((d, i) => {
          const x = paddingLeft + gap + i * (anchoBarra + gap);
          const alturaBarra = Math.max(4, (d.porcentaje / 100) * altura);
          const y = 10 + altura - alturaBarra;
          const color = d.porcentaje >= 70 ? '#4ade80' : '#fb923c';
          return (
            <g key={i}>
              <rect x={x} y={y} width={anchoBarra} height={alturaBarra} rx={6} fill={color} opacity={0.85} />
              {d.porcentaje > 0 && (
                <text x={x + anchoBarra / 2} y={y - 6} textAnchor="middle" fontSize={11} fill={color} fontWeight="600">{d.porcentaje}%</text>
              )}
              <foreignObject x={x - 10} y={10 + altura + 6} width={anchoBarra + 20} height={34}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: '1.2' }}>
                  {d.titulo.length > 16 ? d.titulo.slice(0, 16) + '…' : d.titulo}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const emojiPorAvatar = {
  gato: '🐱', perro: '🐶', hamster: '🐹', unicornio: '🦄', caballo: '🐴',
  conejo: '🐰', panda: '🐼', zorro: '🦊', leon: '🦁', tigre: '🐯',
  lobo: '🐺', delfin: '🐬', tortuga: '🐢', pez: '🐠', pajaro: '🐦',
  serpiente: '🐍', iguana: '🦎', rana: '🐸', canguro: '🦘', koala: '🐨',
};

function DashboardAlumno({ usuario, onLogout, onActualizarUsuario }) {
  const [codigoActividad, setCodigoActividad] = useState('');
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [jugandoCodigo, setJugandoCodigo] = useState(null);

  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  const [temaIA, setTemaIA] = useState('');
  const [generandoIA, setGenerandoIA] = useState(false);
  const [errorIA, setErrorIA] = useState('');

  const porcentajeXP = Math.round((usuario.xp_total / (usuario.xp_siguiente_nivel || 500)) * 100);

  const calcularInsignias = () => {
    const correctas = historial.filter(h => h.es_correcta).length;
    const totalRespuestas = historial.length;
    const tituloContieneSQL = historial.some(h =>
      h.actividad_titulo?.toLowerCase().includes('sql') ||
      h.actividad_titulo?.toLowerCase().includes('base de datos')
    );
    const respuestaRapida = historial.some(h => h.es_correcta && h.tiempo_empleado <= 5);

    return [
      { nombre: 'Primer Quiz', icono: 'ti-medal', desbloqueada: totalRespuestas >= 1 },
      { nombre: 'Racha x5', icono: 'ti-flame', desbloqueada: correctas >= 5 },
      { nombre: 'Maestro SQL', icono: 'ti-database', desbloqueada: tituloContieneSQL && correctas >= 3 },
      { nombre: 'Velocista', icono: 'ti-bolt', desbloqueada: respuestaRapida },
    ];
  };

  const calcularMisiones = () => {
    const porActividad = historial.reduce((acc, h) => {
      const titulo = h.actividad_titulo || 'Actividad sin nombre';
      if (!acc[titulo]) {
        acc[titulo] = { titulo, correctas: 0, total: 0, xp: 0 };
      }
      acc[titulo].total += 1;
      if (h.es_correcta) acc[titulo].correctas += 1;
      acc[titulo].xp += h.puntos_ganados || 0;
      return acc;
    }, {});

    return Object.values(porActividad);
  };

  const insignias = calcularInsignias();
  const misiones = calcularMisiones();

  // Estadísticas y datos de gráfica para la sección "Progreso"
  const totalRespuestas = historial.length;
  const totalCorrectas = historial.filter((h) => h.es_correcta).length;
  const porcentajeGlobal = totalRespuestas > 0 ? Math.round((totalCorrectas / totalRespuestas) * 100) : 0;
  const totalXP = historial.reduce((sum, h) => sum + (h.puntos_ganados || 0), 0);
  const datosGraficaProgreso = misiones.map((m) => ({
    titulo: m.titulo,
    porcentaje: Math.round((m.correctas / m.total) * 100),
  }));

  const cargarHistorial = async () => {
    setCargandoHistorial(true);

    /////////////////////////////////////////////////////////////////////////////////////////7
    // Llamada a la API para obtener el historial del usuario con la url de VITE_API_URL
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${usuario.id}/historial`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const datos = await respuesta.json();
      if (respuesta.ok) {
        setHistorial(datos);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoHistorial(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [usuario.id]);

  const handleUnirme = () => {
    if (!codigoActividad.trim()) return;
    setJugandoCodigo(codigoActividad.trim());
  };

  const handleSalirDelQuiz = () => {
    setJugandoCodigo(null);
    setCodigoActividad('');
    cargarHistorial();
  };

  const handleGenerarQuizIA = async () => {
    if (!temaIA.trim()) return;
    setGenerandoIA(true);
    setErrorIA('');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Llamada a la API para generar un quiz con IA con la url de VITE_API_URL

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/ia/generar-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tema: temaIA.trim() }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setErrorIA(datos.error || 'No se pudo generar el quiz');
        setGenerandoIA(false);
        return;
      }

      setJugandoCodigo(datos.codigo_acceso);
      setTemaIA('');

    } catch (err) {
      setErrorIA('No se pudo conectar con el servidor');
    } finally {
      setGenerandoIA(false);
    }
  };

  if (jugandoCodigo) {
    return (
      <Quiz
        usuario={usuario}
        codigoActividad={jugandoCodigo}
        onSalir={handleSalirDelQuiz}
        onActualizarUsuario={onActualizarUsuario}
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
          { icon: 'ti-home', label: 'Inicio', id: 'inicio' },
          { icon: 'ti-target-arrow', label: 'Misiones', id: 'misiones' },
          { icon: 'ti-chart-bar', label: 'Progreso', id: 'progreso' },
          { icon: 'ti-award', label: 'Insignias', id: 'insignias' },
          { icon: 'ti-settings', label: 'Ajustes', id: 'ajustes' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSeccionActiva(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all justify-center lg:justify-start ${
              seccionActiva === item.id ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
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

        <div className="relative z-10 max-w-6xl mx-auto">

          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-lg"></i>
              <input
                type="text"
                placeholder="Buscar misiones..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl pl-3 pr-2 py-1.5">
              <span className="text-white text-sm font-medium hidden sm:inline">{usuario.nombre.split(' ')[0]}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-base">
                {emojiPorAvatar[usuario.avatar] || usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            </div>
          </div>

          {seccionActiva === 'ajustes' ? (
            <SelectorAvatar usuario={usuario} onAvatarActualizado={(nuevoAvatar) => onActualizarUsuario({ avatar: nuevoAvatar })} />
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // SECCION DE MISIONES
          ) : seccionActiva === 'misiones' ? (
            <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-1">
                <i className="ti ti-target-arrow text-purple-300"></i>
                Mis misiones
              </h2>
              <p className="text-white/40 text-xs mb-5">Actividades en las que has participado</p>

              {cargandoHistorial ? (
                <p className="text-white/40 text-sm">Cargando misiones...</p>
              ) : misiones.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ti ti-target-arrow text-white/20 text-4xl mb-3 block"></i>
                  <p className="text-white/50 text-sm">Aún no has jugado ninguna actividad.</p>
                  <p className="text-white/30 text-xs mt-1">Únete a una actividad o genera un Desafío IA para empezar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {misiones.map((m) => {
                    const porcentaje = Math.round((m.correctas / m.total) * 100);
                    return (
                      <div key={m.titulo} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold text-sm">{m.titulo}</p>
                          <span className={`text-sm font-bold ${porcentaje >= 70 ? 'text-green-300' : 'text-orange-300'}`}>
                            {porcentaje}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full ${porcentaje >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-orange-400 to-yellow-400'}`}
                            style={{ width: `${porcentaje}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          <span>{m.correctas}/{m.total} correctas</span>
                          <span>{m.xp} XP ganados</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // SECCION DE PROGRESO 
          ) : seccionActiva === 'progreso' ? ( 
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: '% Aciertos global', valor: `${porcentajeGlobal}%`, icono: 'ti-chart-bar', color: 'text-green-300' },
                  { label: 'XP total ganado', valor: totalXP, icono: 'ti-bolt', color: 'text-purple-300' },
                  { label: 'Preguntas respondidas', valor: totalRespuestas, icono: 'ti-help-circle', color: 'text-blue-300' },
                  { label: 'Actividades jugadas', valor: misiones.length, icono: 'ti-target-arrow', color: 'text-pink-300' },
                ].map((stat) => (
                  <div key={stat.label} className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-2xl p-4">
                    <i className={`ti ${stat.icono} ${stat.color} text-xl mb-1 block`}></i>
                    <p className="text-white font-bold text-xl">{cargandoHistorial ? '…' : stat.valor}</p>
                    <p className="text-white/50 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6">
                <h2 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
                  <i className="ti ti-chart-bar text-green-300"></i>
                  Rendimiento por actividad
                </h2>
                <p className="text-white/40 text-xs mb-4">% de aciertos en cada actividad jugada</p>

                {cargandoHistorial ? (
                  <p className="text-white/40 text-sm">Cargando progreso...</p>
                ) : datosGraficaProgreso.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="ti ti-chart-bar text-white/20 text-4xl mb-3 block"></i>
                    <p className="text-white/50 text-sm">Aún no hay datos para mostrar tu progreso.</p>
                  </div>
                ) : (
                  <>
                    <GraficaProgreso datos={datosGraficaProgreso} />
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <span className="flex items-center gap-1.5 text-white/50"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span> ≥ 70% de aciertos</span>
                      <span className="flex items-center gap-1.5 text-white/50"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span> Necesita refuerzo</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>

              <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-white/60 text-sm">Bienvenido de nuevo</p>
                  <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{usuario.nombre}</h1>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                      {usuario.nivel_actual}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Nivel {usuario.nivel_actual}</p>
                      <p className="text-white/50 text-xs">{usuario.xp_total} / {usuario.xp_siguiente_nivel || 500} XP</p>
                    </div>
                  </div>

                  <div className="w-40">
                    <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                        style={{ width: `${porcentajeXP}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-orange-500/15 border border-orange-400/30 rounded-xl px-3 py-2">
                    <i className="ti ti-flame text-orange-400 text-lg"></i>
                    <span className="text-orange-200 font-semibold text-sm">{usuario.racha_dias || 0} días</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                <div className="lg:col-span-2 backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                      <i className="ti ti-target-arrow text-purple-300"></i>
                      Unirme a una actividad
                    </h2>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={codigoActividad}
                      onChange={(e) => setCodigoActividad(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleUnirme()}
                      placeholder="Código de actividad (ej. NET101)"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                      onClick={handleUnirme}
                      className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 active:scale-[0.98] transition-all text-sm whitespace-nowrap"
                    >
                      Unirme
                    </button>
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
                    <i className="ti ti-key text-white/20 text-3xl mb-2 block"></i>
                    <p className="text-white/50 text-sm">Pide el código de acceso a tu profesor para unirte a una actividad</p>
                  </div>
                </div>

                {/* Entrenador IA */}
                <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/30 via-black/30 to-blue-900/30 border border-white/10 rounded-3xl p-6">
                  <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-1">
                    <i className="ti ti-sparkles text-pink-300"></i>
                    Entrenador IA
                  </h2>
                  <p className="text-white/50 text-xs mb-4">Genera un quiz personalizado al instante</p>

                  <input
                    type="text"
                    value={temaIA}
                    onChange={(e) => setTemaIA(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerarQuizIA()}
                    placeholder="Escribe un tema..."
                    disabled={generandoIA}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-50"
                  />

                  {errorIA && (
                    <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-xs px-3 py-2 rounded-xl mb-3">
                      {errorIA}
                    </div>
                  )}

                  <button
                    onClick={handleGenerarQuizIA}
                    disabled={generandoIA || !temaIA.trim()}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className={`ti ${generandoIA ? 'ti-loader-2 animate-spin' : 'ti-sparkles'}`}></i>
                    {generandoIA ? 'Generando...' : 'Generar Desafío IA'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6">
                  <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
                    <i className="ti ti-history text-blue-300"></i>
                    Historial y logros
                  </h2>

                  {cargandoHistorial ? (
                    <p className="text-white/40 text-sm">Cargando historial...</p>
                  ) : historial.length === 0 ? (
                    <div className="text-center py-6">
                      <i className="ti ti-history text-white/20 text-3xl mb-2 block"></i>
                      <p className="text-white/50 text-sm">Aún no has respondido ninguna pregunta.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {historial.map((h) => (
                        <div key={h.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${h.es_correcta ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                              <i className={`ti ${h.es_correcta ? 'ti-check text-green-400' : 'ti-x text-red-400'} text-sm`}></i>
                            </div>
                            <div className="min-w-0">
                              <p className="text-white/80 text-sm truncate">{h.enunciado}</p>
                              <p className="text-white/40 text-xs">{h.actividad_titulo}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold flex-shrink-0 ml-3 ${h.es_correcta ? 'text-green-300' : 'text-white/30'}`}>
                            {h.es_correcta ? `+${h.puntos_ganados} XP` : '0 XP'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6">
                  <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
                    <i className="ti ti-award text-amber-300"></i>
                    Insignias
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {insignias.map((insignia) => (
                      <div
                        key={insignia.nombre}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border ${
                          insignia.desbloqueada
                            ? 'bg-amber-500/10 border-amber-400/30'
                            : 'bg-white/[0.02] border-white/10 opacity-40'
                        }`}
                      >
                        <i className={`ti ${insignia.icono} text-2xl ${insignia.desbloqueada ? 'text-amber-300' : 'text-white/40'}`}></i>
                        <span className={`text-[11px] text-center font-medium ${insignia.desbloqueada ? 'text-amber-100' : 'text-white/40'}`}>
                          {insignia.nombre}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardAlumno;