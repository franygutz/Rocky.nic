// Pantalla completa en celular: oculta la barra de la URL y las del sistema.
// Android y computadoras usan la Fullscreen API. El iPhone no la permite en páginas web:
// ahí la salida es agregar el juego a la pantalla de inicio (manifest + metas de Apple), que lo abre sin barras.
export const fsSupported = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
export const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
export const isStandalone = () => {
  try { return matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true; } catch { return false; }
};

// Devuelve 'on', 'off' o 'unsupported' (en ese caso hay que explicar cómo agregarlo a la pantalla de inicio).
export async function toggleFull() {
  if (!fsSupported()) return 'unsupported';
  const el = document.documentElement;
  try {
    if (isFull()) {
      await (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen());
      return 'off';
    }
    await (el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen());
    return 'on';
  } catch {
    return 'unsupported';
  }
}

export function onFullChange(fn) {
  document.addEventListener('fullscreenchange', fn);
  document.addEventListener('webkitfullscreenchange', fn);
}
