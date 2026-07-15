import { useState, useEffect } from 'react';

// Gráfica SVG pura — sin recharts, sin bugs
function GraficaBarras({ datos }) {
  if (!datos || datos.length === 0) return null;
  const altura = 160;
  const anchoBarra = 40;
  const gap = 20;
  const paddingLeft = 36;
  const paddingBottom = 32;
  const anchoTotal = paddingLeft + datos.length * (anchoBarra + gap) + gap;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={anchoTotal} height={altura + paddingBottom + 16} style={{ minWidth: '100%' }}>
        {[0, 25, 50, 75, 100].map((val) => {
          const y = 10 + (altura - (val / 100) * altura);
          return (
            <g key={val}>
              <line x1={paddingLeft} y1={y} x2={anchoTotal} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
              <text x={paddingLeft - 5} y={y + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.35)">{val}</text>
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
              <rect x={x} y={y} width={anchoBarra} height={alturaBarra} rx={5} fill={color} opacity={0.85} />
              {d.porcentaje > 0 && (
                <text x={x + anchoBarra / 2} y={y - 5} textAnchor="middle" fontSize={10} fill={color} fontWeight="600">{d.porcentaje}%</text>
              )}
              <text x={x + anchoBarra / 2} y={10 + altura + 18} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.5)">{d.pregunta}</text>
              <text x={x + anchoBarra / 2} y={10 + altura + 30} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.3)">{d.intentos} int.</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DetalleActividad({ actividad, onVolver }) {
  const [pestanaActiva, setPestanaActiva] = useState('preguntas');
  const [preguntas, setPreguntas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enunciado, setEnunciado] = useState('');
  const [opciones, setOpciones] = useState(['', '', '', '']);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState('');
  const [retroalimentacion, setRetroalimentacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorForm, setErrorForm] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    setError('');
    try {
      const token = localStorage.getItem('token'); // 
      const headers = { 'Authorization': `Bearer ${token}` }; // 
////////////////////////////////////////////////////////////////////////////////////////7
// Llamada a la API para obtener preguntas e historial de la actividad con la url de VITE_API_URL
      const [resPreguntas, resHistorial] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/preguntas/actividad/${actividad.id}`, { headers }), // ← headers agregado
        fetch(`${import.meta.env.VITE_API_URL}/api/preguntas/historial/${actividad.id}`, { headers }), // ← headers agregado
      ]);
      const dataPreguntas = await resPreguntas.json();
      const dataHistorial = await resHistorial.json();
      if (resPreguntas.ok) setPreguntas(dataPreguntas);
      if (resHistorial.ok) setHistorial(dataHistorial);
    } catch (err) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [actividad.id]);

  const handleOpcionChange = (index, valor) => {
    const nuevas = [...opciones];
    nuevas[index] = valor;
    setOpciones(nuevas);
    if (respuestaCorrecta === opciones[index]) setRespuestaCorrecta('');
  };

  const handleAgregarPregunta = async (e) => {
    e.preventDefault();
    setErrorForm(''); setMensajeExito('');
    const opcionesLimpias = opciones.map(o => o.trim());
    if (opcionesLimpias.some(o => o === '')) { setErrorForm('Completa las 4 opciones'); return; }
    if (!respuestaCorrecta) { setErrorForm('Selecciona cuál es la respuesta correcta'); return; }
    if (!enunciado.trim() || !retroalimentacion.trim()) { setErrorForm('El enunciado y la retroalimentación son obligatorios'); return; }
    setGuardando(true);
    try {
      const token = localStorage.getItem('token'); // 
      ////////////////////////////////////////////////////////////////////////////777
      // Llamada a la API para agregar una nueva pregunta con la url de VITE_API_URL
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/preguntas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ← NUEVO
        },
        body: JSON.stringify({ id_actividad: actividad.id, tipo: 'quiz', enunciado: enunciado.trim(), opciones: opcionesLimpias, respuesta_correcta: respuestaCorrecta, retroalimentacion: retroalimentacion.trim(), generada_por_ia: false }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) { setErrorForm(datos.error || 'No se pudo guardar'); return; }
      setMensajeExito('¡Pregunta agregada correctamente!');
      setEnunciado(''); setOpciones(['', '', '', '']); setRespuestaCorrecta(''); setRetroalimentacion('');
      setMostrarFormulario(false); cargarDatos();
    } catch { setErrorForm('No se pudo conectar con el servidor'); }
    finally { setGuardando(false); }
  };

  const handleEliminarPregunta = async (preguntaId, enunciadoPregunta) => {
    if (!window.confirm(`¿Eliminar la pregunta "${enunciadoPregunta}"?`)) return;
    try {
      const token = localStorage.getItem('token'); // 
      ///////////////////////////////////////////////////////////////////
      // Llamada a la API para eliminar una pregunta con la url de VITE_API_URL
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/preguntas/${preguntaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }, // ← NUEVO
      });
      if (!respuesta.ok) { const d = await respuesta.json(); setError(d.error || 'No se pudo eliminar'); return; }
      cargarDatos(); setMensajeExito('Pregunta eliminada correctamente');
    } catch { setError('No se pudo conectar con el servidor'); }
  };

  const resumenAlumnos = historial.reduce((acc, fila) => {
    if (!acc[fila.alumno]) acc[fila.alumno] = { correctas: 0, total: 0, xp: 0 };
    acc[fila.alumno].total += 1;
    if (fila.es_correcta) acc[fila.alumno].correctas += 1;
    acc[fila.alumno].xp += fila.puntos_ganados;
    return acc;
  }, {});

  const datosGrafica = preguntas.map((p, index) => {
    const intentos = historial.filter(h => h.enunciado === p.enunciado);
    const correctos = intentos.filter(h => h.es_correcta).length;
    const porcentaje = intentos.length > 0 ? Math.round((correctos / intentos.length) * 100) : 0;
    return { pregunta: `P${index + 1}`, enunciadoCompleto: p.enunciado, porcentaje, intentos: intentos.length };
  });

  const letras = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen w-full bg-[#0a0e27] flex" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <aside className="w-20 lg:w-56 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col items-center lg:items-stretch py-6 px-3 gap-2">
        <div className="flex items-center gap-2 px-2 mb-8 justify-center lg:justify-start">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <i className="ti ti-bolt text-white text-lg"></i>
          </div>
          <span className="hidden lg:inline text-white font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>NexusLearn</span>
        </div>
        <button onClick={onVolver} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-white/5 hover:text-white/80 transition-all justify-center lg:justify-start">
          <i className="ti ti-arrow-left text-xl flex-shrink-0"></i>
          <span className="hidden lg:inline text-sm font-medium">Volver</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/15 text-white justify-center lg:justify-start">
          <i className="ti ti-layout-grid text-xl flex-shrink-0"></i>
          <span className="hidden lg:inline text-sm font-medium">Detalle</span>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
        <div className="absolute top-[-5%] right-[10%] w-72 h-72 rounded-full bg-purple-600 opacity-[0.15] blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[10%] left-[20%] w-72 h-72 rounded-full bg-blue-500 opacity-[0.12] blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="mb-6">
            <p className="text-white/50 text-sm mb-1">Detalle de actividad</p>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{actividad.titulo}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-purple-300 text-xs font-medium flex items-center gap-1 bg-purple-500/15 px-2 py-0.5 rounded-md">
                <i className="ti ti-key text-xs"></i> {actividad.codigo_acceso}
              </span>
              {actividad.descripcion && <span className="text-white/40 text-xs">{actividad.descripcion}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Preguntas', valor: preguntas.length, icono: 'ti-help-circle', color: 'text-blue-300' },
              { label: 'Alumnos', valor: Object.keys(resumenAlumnos).length, icono: 'ti-users', color: 'text-purple-300' },
              { label: 'Intentos totales', valor: historial.length, icono: 'ti-history', color: 'text-pink-300' },
              { label: '% Aciertos global', valor: historial.length > 0 ? Math.round((historial.filter(h => h.es_correcta).length / historial.length) * 100) + '%' : '—', icono: 'ti-chart-bar', color: 'text-green-300' },
            ].map((stat) => (
              <div key={stat.label} className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-2xl p-4">
                <i className={`ti ${stat.icono} ${stat.color} text-xl mb-1 block`}></i>
                <p className="text-white font-bold text-xl">{cargando ? '…' : stat.valor}</p>
                <p className="text-white/50 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-5">
            {[{ id: 'preguntas', label: 'Preguntas', icono: 'ti-help-circle' }, { id: 'alumnos', label: 'Alumnos', icono: 'ti-users' }].map((tab) => (
              <button key={tab.id} onClick={() => setPestanaActiva(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${pestanaActiva === tab.id ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white' : 'bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10'}`}>
                <i className={`ti ${tab.icono}`}></i>{tab.label}
              </button>
            ))}
          </div>

          {cargando ? (
            <p className="text-white/50 text-sm">Cargando...</p>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm px-4 py-3 rounded-xl">{error}</div>
          ) : (
            <>
              {pestanaActiva === 'preguntas' && (
                <div className="space-y-4">

                  {datosGrafica.length > 0 && historial.length > 0 && (
                    <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6">
                      <h2 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
                        <i className="ti ti-chart-bar text-green-300"></i>
                        Rendimiento por pregunta
                      </h2>
                      <p className="text-white/40 text-xs mb-4">% de aciertos de todos los alumnos en cada pregunta</p>
                      <GraficaBarras datos={datosGrafica} />
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <span className="flex items-center gap-1.5 text-white/50"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span> ≥ 70% de aciertos</span>
                        <span className="flex items-center gap-1.5 text-white/50"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span> Necesita refuerzo</span>
                      </div>
                    </div>
                  )}

                  {mensajeExito && (
                    <div className="bg-green-500/15 border border-green-400/30 text-green-200 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                      <i className="ti ti-circle-check"></i> {mensajeExito}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button onClick={() => { setMostrarFormulario(!mostrarFormulario); setErrorForm(''); setMensajeExito(''); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 active:scale-[0.98] transition-all text-sm">
                      <i className={`ti ${mostrarFormulario ? 'ti-x' : 'ti-plus'}`}></i>
                      {mostrarFormulario ? 'Cancelar' : 'Agregar pregunta'}
                    </button>
                  </div>

                  {mostrarFormulario && (
                    <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6">
                      <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
                        <i className="ti ti-pencil-plus text-purple-300"></i>Nueva pregunta
                      </h2>
                      <form onSubmit={handleAgregarPregunta} className="space-y-5">
                        <div>
                          <label className="text-white/80 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Enunciado</label>
                          <textarea value={enunciado} onChange={(e) => setEnunciado(e.target.value)} placeholder="Escribe aquí la pregunta..." rows={2} required
                            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
                        </div>
                        <div>
                          <label className="text-white/80 text-xs font-semibold mb-3 block uppercase tracking-wide">Opciones — selecciona cuál es la correcta</label>
                          <div className="space-y-2">
                            {opciones.map((op, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <button type="button" onClick={() => setRespuestaCorrecta(opciones[i].trim())}
                                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all font-bold text-xs ${respuestaCorrecta === opciones[i].trim() && opciones[i].trim() !== '' ? 'bg-green-500 border-green-400 text-white' : 'border-white/20 text-white/40 hover:border-white/40'}`}>
                                  {letras[i]}
                                </button>
                                <input type="text" value={op} onChange={(e) => handleOpcionChange(i, e.target.value)} placeholder={`Opción ${letras[i]}`}
                                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                              </div>
                            ))}
                          </div>
                          <p className="text-white/40 text-xs mt-2"><i className="ti ti-info-circle mr-1"></i>Toca la letra de la opción correcta para marcarla en verde</p>
                          {respuestaCorrecta && <p className="text-green-300 text-xs mt-1 flex items-center gap-1"><i className="ti ti-circle-check"></i>Correcta: "{respuestaCorrecta}"</p>}
                        </div>
                        <div>
                          <label className="text-white/80 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Retroalimentación</label>
                          <textarea value={retroalimentacion} onChange={(e) => setRetroalimentacion(e.target.value)} placeholder="Explica por qué esa es la respuesta correcta..." rows={2} required
                            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
                        </div>
                        {errorForm && <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm px-4 py-2.5 rounded-xl">{errorForm}</div>}
                        <button type="submit" disabled={guardando}
                          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 active:scale-[0.98] transition-all text-sm disabled:opacity-50">
                          {guardando ? 'Guardando...' : 'Guardar pregunta'}
                        </button>
                      </form>
                    </div>
                  )}

                  {preguntas.length === 0 ? (
                    <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-2xl p-8 text-center">
                      <i className="ti ti-help-circle text-white/20 text-4xl mb-3 block"></i>
                      <p className="text-white/50 text-sm">Esta actividad no tiene preguntas aún.</p>
                    </div>
                  ) : preguntas.map((p, index) => (
                    <div key={p.id} className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-2xl p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
                        <p className="text-white font-semibold text-sm leading-relaxed flex-1">{p.enunciado}</p>
                        <button onClick={() => handleEliminarPregunta(p.id, p.enunciado)}
                          className="text-white/30 hover:text-red-400 transition-all flex-shrink-0" title="Eliminar pregunta">
                          <i className="ti ti-trash text-lg"></i>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3 ml-10">
                        {p.opciones.map((op, i) => (
                          <div key={i} className={`px-3 py-2 rounded-xl text-xs border ${op === p.respuesta_correcta ? 'bg-green-500/15 border-green-400/40 text-green-300 font-semibold' : 'bg-white/[0.03] border-white/10 text-white/50'}`}>
                            {op === p.respuesta_correcta && <i className="ti ti-check mr-1"></i>}
                            <span className="font-bold mr-1">{letras[i]}.</span>{op}
                          </div>
                        ))}
                      </div>
                      <div className="ml-10 bg-blue-500/10 border border-blue-400/20 rounded-xl px-3 py-2">
                        <p className="text-blue-200 text-xs"><span className="font-semibold">Retroalimentación:</span> {p.retroalimentacion}</p>
                      </div>
                      {p.generada_por_ia && <p className="ml-10 mt-2 text-pink-300 text-xs flex items-center gap-1"><i className="ti ti-sparkles"></i> Generada por IA</p>}
                    </div>
                  ))}
                </div>
              )}

              {pestanaActiva === 'alumnos' && (
                <div className="space-y-4">
                  {Object.keys(resumenAlumnos).length === 0 ? (
                    <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-2xl p-8 text-center">
                      <i className="ti ti-users text-white/20 text-4xl mb-3 block"></i>
                      <p className="text-white/50 text-sm">Ningún alumno ha jugado esta actividad aún.</p>
                    </div>
                  ) : Object.entries(resumenAlumnos).map(([nombre, stats]) => (
                    <div key={nombre} className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                            {nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{nombre}</p>
                            <p className="text-white/40 text-xs">{stats.total} intentos · {stats.xp} XP total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${(stats.correctas / stats.total) >= 0.7 ? 'text-green-300' : 'text-orange-300'}`}>
                            {Math.round((stats.correctas / stats.total) * 100)}%
                          </p>
                          <p className="text-white/40 text-xs">{stats.correctas}/{stats.total} correctas</p>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-4">
                        <div className={`h-full rounded-full ${(stats.correctas / stats.total) >= 0.7 ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-orange-400 to-yellow-400'}`}
                          style={{ width: `${Math.round((stats.correctas / stats.total) * 100)}%` }}></div>
                      </div>
                      <div className="space-y-2">
                        {historial.filter(h => h.alumno === nombre).reduce((acc, h) => { if (!acc.find(x => x.enunciado === h.enunciado)) acc.push(h); return acc; }, [])
                          .map((h, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${h.es_correcta ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <i className={`ti ${h.es_correcta ? 'ti-check text-green-400' : 'ti-x text-red-400'} text-xs`}></i>
                              </div>
                              <p className="text-white/70 text-xs flex-1 leading-relaxed">{h.enunciado}</p>
                              <div className="text-right flex-shrink-0">
                                <span className={`text-xs font-semibold ${h.es_correcta ? 'text-green-300' : 'text-white/30'}`}>{h.es_correcta ? `+${h.puntos_ganados} XP` : '0 XP'}</span>
                                <p className="text-white/30 text-xs">{h.tiempo_empleado}s</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default DetalleActividad;