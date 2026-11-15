// Mensajes entre el juego (Phaser) y la interfaz (HTML) sin que se conozcan.
const handlers = new Map();

export const bus = {
  on(name, fn) {
    if (!handlers.has(name)) handlers.set(name, new Set());
    handlers.get(name).add(fn);
    return () => handlers.get(name).delete(fn);
  },
  emit(name, data) {
    (handlers.get(name) || []).forEach((fn) => fn(data));
  }
};

// Estado de la sesión del frontend (el estado del juego lo guarda el motor).
export const session = {
  bridge: null, // puente del backend (createFrontendBridge)
  view: null, // última vista del motor
  mode: 'menu', // menu | map | mission | minigame | result | day | weather | ending
  overlay: false, // hay una pantalla encima del mapa
  world: null, // { scene, x, y } del astronauta (la actualiza el mundo)
  joy: null, // dirección de la cruceta táctil
  worldScene: null,
  insets: { top: 0, bottom: 0, left: 0 },
  settings: { sound: true, reducedMotion: false, guide: true }
};

// El astronauta solo camina cuando el mapa está libre.
export const canWalk = () => session.mode === 'map' && !session.overlay;
