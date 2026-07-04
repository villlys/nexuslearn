import { useState } from 'react';

// Mapeo de cada avatar a su emoji y color de fondo
const avataresDisponibles = [
  { id: 'gato', emoji: '🐱', color: 'from-orange-400 to-pink-400' },
  { id: 'perro', emoji: '🐶', color: 'from-amber-400 to-orange-500' },
  { id: 'hamster', emoji: '🐹', color: 'from-pink-300 to-rose-400' },
  { id: 'unicornio', emoji: '🦄', color: 'from-purple-400 to-pink-400' },
  { id: 'caballo', emoji: '🐴', color: 'from-amber-600 to-yellow-600' },
  { id: 'conejo', emoji: '🐰', color: 'from-gray-300 to-gray-400' },
  { id: 'panda', emoji: '🐼', color: 'from-gray-700 to-gray-900' },
  { id: 'zorro', emoji: '🦊', color: 'from-orange-500 to-red-500' },
  { id: 'leon', emoji: '🦁', color: 'from-yellow-500 to-amber-600' },
  { id: 'tigre', emoji: '🐯', color: 'from-orange-400 to-amber-600' },
  { id: 'lobo', emoji: '🐺', color: 'from-slate-400 to-slate-600' },
  { id: 'delfin', emoji: '🐬', color: 'from-blue-400 to-cyan-400' },
  { id: 'tortuga', emoji: '🐢', color: 'from-green-500 to-emerald-600' },
  { id: 'pez', emoji: '🐠', color: 'from-cyan-400 to-blue-400' },
  { id: 'pajaro', emoji: '🐦', color: 'from-sky-400 to-blue-400' },
  { id: 'serpiente', emoji: '🐍', color: 'from-green-600 to-lime-600' },
  { id: 'iguana', emoji: '🦎', color: 'from-lime-500 to-green-500' },
  { id: 'rana', emoji: '🐸', color: 'from-green-400 to-emerald-500' },
  { id: 'canguro', emoji: '🦘', color: 'from-orange-300 to-amber-500' },
  { id: 'koala', emoji: '🐨', color: 'from-gray-400 to-zinc-500' },
];

function SelectorAvatar({ usuario, onAvatarActualizado }) {
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(usuario.avatar || 'gato');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleSeleccionar = async (avatarId) => {
    setAvatarSeleccionado(avatarId);
    setGuardando(true);
    setMensaje('');

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`http://localhost:3000/api/usuarios/${usuario.id}/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: avatarId }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.error || 'No se pudo actualizar el avatar');
        setGuardando(false);
        return;
      }

      // Actualizamos también en localStorage para que persista
      const usuarioActualizado = { ...usuario, avatar: avatarId };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

      if (onAvatarActualizado) {
        onAvatarActualizado(avatarId);
      }

      setMensaje('¡Avatar actualizado!');

    } catch (err) {
      setMensaje('No se pudo conectar con el servidor');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-3xl p-6">
      <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-1">
        <i className="ti ti-mood-smile text-pink-300"></i>
        Elige tu avatar
      </h2>
      <p className="text-white/50 text-xs mb-5">Escoge el animalito que te represente</p>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {avataresDisponibles.map((avatar) => {
          const seleccionado = avatarSeleccionado === avatar.id;
          return (
            <button
              key={avatar.id}
              onClick={() => handleSeleccionar(avatar.id)}
              disabled={guardando}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                seleccionado
                  ? 'border-purple-400 bg-purple-500/15 scale-105'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20'
              }`}
            >
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center relative`}>
                <span className="text-xl">{avatar.emoji}</span>
                {seleccionado && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 border-2 border-[#0a0e27] flex items-center justify-center">
                    <i className="ti ti-check text-white text-[10px]"></i>
                  </div>
                )}
              </div>
              <span className={`text-[10px] capitalize font-medium ${seleccionado ? 'text-purple-200' : 'text-white/50'}`}>
                {avatar.id}
              </span>
            </button>
          );
        })}
      </div>

      {mensaje && (
        <p className={`text-xs mt-4 text-center ${mensaje.includes('actualizado') ? 'text-green-300' : 'text-red-300'}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
}

export default SelectorAvatar;