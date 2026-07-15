import { useState, useEffect, useRef } from 'react';

const TIEMPO_LIMITE = 25; // segundos por pregunta

function Quiz({ usuario, codigoActividad, onSalir, onActualizarUsuario }) {
  const [actividad, setActividad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [preguntaActual, setPreguntaActual] = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [respondida, setRespondida] = useState(false);
  const [resultado, setResultado] = useState(null); // { es_correcta, puntos_ganados, retroalimentacion }
  const [enviando, setEnviando] = useState(false);

  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_LIMITE);
  const tiempoInicioRef = useRef(Date.now());
  const intervaloRef = useRef(null);

  // Puntaje acumulado durante esta sesión de juego
  const [puntajeSesion, setPuntajeSesion] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  // Cargar la actividad y sus preguntas
  useEffect(() => {
    const cargarActividad = async () => {
      try {
        ////////////////////////////////////////////////////////////////////
        // Llamada a la API para obtener la actividad con la url de VITE_API_URL
        const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/actividades/${codigoActividad}`);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
          setError(datos.error || 'No se encontró la actividad');
          setCargando(false);
          return;
        }

        setActividad(datos);
      } catch (err) {
        setError('No se pudo conectar con el servidor');
      } finally {
        setCargando(false);
      }
    };

    cargarActividad();
  }, [codigoActividad]);

  // Temporizador: corre mientras la pregunta no esté respondida
  useEffect(() => {
    if (cargando || respondida || juegoTerminado || !actividad) return;

    tiempoInicioRef.current = Date.now();
    setTiempoRestante(TIEMPO_LIMITE);

    intervaloRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(intervaloRef.current);
          handleResponder(null); // se acabó el tiempo, se manda como no respondida
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervaloRef.current);
  }, [preguntaActual, cargando, actividad]);

  const handleResponder = async (opcion) => {
    if (respondida) return;
    clearInterval(intervaloRef.current);

    const tiempoEmpleado = Math.round((Date.now() - tiempoInicioRef.current) / 1000);
    setOpcionSeleccionada(opcion);
    setRespondida(true);
    setEnviando(true);

    const pregunta = actividad.preguntas[preguntaActual];

    try {
      //////////////////////////////////////////////////////////////////////////
      // Llamada a la API para enviar la respuesta del alumno con la url de VITE_API_URL
      const token = localStorage.getItem('token');
const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/preguntas/${pregunta.id}/responder`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    id_alumno: usuario.id,
    respuesta_dada: opcion || '',
    tiempo_empleado: tiempoEmpleado,
  }),
});
      const datos = await respuesta.json();

      if (respuesta.ok) {
        setResultado(datos);
        setPuntajeSesion((prev) => prev + datos.puntos_ganados);

        if (onActualizarUsuario) {
          onActualizarUsuario({
            xp_total: datos.xp_total_actualizado,
            nivel_actual: datos.nivel_actual,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const handleSiguiente = () => {
    if (preguntaActual + 1 >= actividad.preguntas.length) {
      setJuegoTerminado(true);
      return;
    }
    setPreguntaActual((prev) => prev + 1);
    setOpcionSeleccionada(null);
    setRespondida(false);
    setResultado(null);
  };

  if (cargando) {
    return (
      <div className="min-h-screen w-full bg-[#0a0e27] flex items-center justify-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <p className="text-white/60">Cargando actividad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#0a0e27] flex flex-col items-center justify-center gap-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <p className="text-red-300">{error}</p>
        <button onClick={onSalir} className="px-5 py-2 rounded-xl bg-white/10 text-white text-sm">Volver</button>
      </div>
    );
  }

  if (juegoTerminado) {
    return (
      <div className="min-h-screen w-full bg-[#0a0e27] flex items-center justify-center relative overflow-hidden" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-purple-600 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-blue-500 opacity-30 blur-3xl"></div>

        <div className="relative z-10 text-center backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-10 max-w-md mx-4">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            ¡Actividad completada!
          </h1>
          <p className="text-white/60 mb-6">{actividad.titulo}</p>

          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-5 mb-6">
            <p className="text-white/80 text-sm">XP obtenido en esta sesión</p>
            <p className="text-white text-3xl font-bold">+{puntajeSesion} XP</p>
          </div>

          <button
            onClick={onSalir}
            className="w-full py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 transition-all"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const pregunta = actividad.preguntas[preguntaActual];
  const totalPreguntas = actividad.preguntas.length;
  const porcentajeTiempo = (tiempoRestante / TIEMPO_LIMITE) * 100;
  const colorTiempo = tiempoRestante <= 5 ? 'from-red-500 to-orange-500' : 'from-blue-400 via-purple-400 to-pink-400';

  return (
    <div className="min-h-screen w-full bg-[#0a0e27] relative overflow-hidden" style={{ fontFamily: 'Outfit, sans-serif' }}>

      <div className="absolute top-[-5%] right-[10%] w-72 h-72 rounded-full bg-purple-600 opacity-[0.15] blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[10%] w-72 h-72 rounded-full bg-blue-500 opacity-[0.12] blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Encabezado: salir + progreso */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onSalir} className="text-white/50 hover:text-white text-sm flex items-center gap-1.5">
            <i className="ti ti-x text-lg"></i> Salir
          </button>
          <span className="text-white/50 text-sm font-medium">
            Pregunta {preguntaActual + 1} de {totalPreguntas}
          </span>
        </div>

        {/* Barra de progreso de preguntas */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transition-all"
            style={{ width: `${((preguntaActual) / totalPreguntas) * 100}%` }}
          ></div>
        </div>

        {/* Temporizador circular */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                strokeWidth="6" strokeLinecap="round"
                stroke={tiempoRestante <= 5 ? '#f87171' : '#a78bfa'}
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - porcentajeTiempo / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold ${tiempoRestante <= 5 ? 'text-red-400' : 'text-white'}`}>
                {tiempoRestante}
              </span>
            </div>
          </div>
        </div>

        {/* Pregunta */}
        <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6 sm:p-8 mb-5">
          <h2 className="text-white text-lg sm:text-xl font-semibold text-center leading-relaxed" style={{ fontFamily: 'Sora, sans-serif' }}>
            {pregunta.enunciado}
          </h2>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {pregunta.opciones.map((opcion, index) => {
            let estilo = 'bg-white/[0.06] border-white/10 hover:bg-white/[0.12] hover:border-white/20';

            if (respondida) {
              if (opcion === resultado?.retroalimentacion) {
                // no usamos esto, evitamos mostrar la correcta si no se sabe aún
              }
              if (opcionSeleccionada === opcion && resultado) {
                estilo = resultado.es_correcta
                  ? 'bg-green-500/20 border-green-400/50'
                  : 'bg-red-500/20 border-red-400/50';
              } else if (resultado && !resultado.es_correcta && resultado.respuesta_correcta === opcion) {
                estilo = 'bg-green-500/20 border-green-400/50';
              } else {
                estilo = 'bg-white/[0.03] border-white/5 opacity-50';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleResponder(opcion)}
                disabled={respondida}
                className={`text-left px-5 py-4 rounded-2xl border text-white text-sm font-medium transition-all ${estilo} disabled:cursor-not-allowed`}
              >
                {opcion}
              </button>
            );
          })}
        </div>

        {/* Retroalimentación */}
        {respondida && resultado && (
          <div className={`rounded-2xl p-5 mb-5 border ${resultado.es_correcta ? 'bg-green-500/10 border-green-400/30' : 'bg-red-500/10 border-red-400/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <i className={`ti ${resultado.es_correcta ? 'ti-circle-check text-green-400' : 'ti-circle-x text-red-400'} text-xl`}></i>
              <span className={`font-semibold ${resultado.es_correcta ? 'text-green-300' : 'text-red-300'}`}>
                {resultado.es_correcta ? `¡Correcto! +${resultado.puntos_ganados} XP` : 'Incorrecto'}
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{resultado.retroalimentacion}</p>
          </div>
        )}

        {respondida && !enviando && (
          <button
            onClick={handleSiguiente}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {preguntaActual + 1 >= totalPreguntas ? 'Ver resultados' : 'Siguiente pregunta'}
          </button>
        )}

      </div>
    </div>
  );
}

export default Quiz;