// ═════════════════════════════════════════════════════════════════════════════
// Conexión con el motor del backend (backend/ v0.4.1).
//
// Es lo mismo que window.MoonSurvivalFrontend() de backend/public/offline-engine.js,
// pero importado desde la fuente: si el backend cambia retos, datos o reglas,
// el frontend los toma solo al volver a compilar (npm run build).
// No se modifica nada dentro de backend/.
// ═════════════════════════════════════════════════════════════════════════════
import { createEngine } from '../../backend/src/core/engine.js';
import { createFrontendBridge } from '../../backend/src/core/frontend-bridge.js';
import challenges from '../../backend/data/challenges.json';
import items from '../../backend/data/shop.json';
import endings from '../../backend/data/endings.json';
import facts from '../../backend/data/science-facts.json';
import events from '../../backend/data/nasa-events.json';
import statusNames from '../../backend/data/status-names.json';
const i18nFiles = import.meta.glob('../../backend/data/i18n/*.json', { eager: true, import: 'default' });
const i18n = Object.fromEntries(Object.entries(i18nFiles).map(([f, d]) => [f.match(/(\w+)\.json$/)[1], d]));

// Mismo catálogo que arma backend/scripts/build-offline.js
export const catalog = { challenges, items, endings, facts, events, statusNames, i18n };
export const engine = { ...createEngine(catalog), catalog };
export { statusNames };

export const STORAGE_KEY = 'moon-survival-partida-v03'; // la clave que usa el backend

// Crea el puente del backend. autoStart:false → el menú decide si continuar o empezar.
export function createBridge(options = {}) {
  return createFrontendBridge(engine, { autoStart: false, storageKey: STORAGE_KEY, ...options });
}
