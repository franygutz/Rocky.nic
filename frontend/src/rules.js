// Reglas de PRESENTACIÓN del frontend (no cambian las reglas del motor).
// Puras y probadas en tests/rules.test.js.
import { statusNames } from './engine.js';

// Cada categoría de reto vive en una sala de Luna-7.
export const ROOM_OF = { life: 'lifeSupport', radiation: 'shelter', energy: 'solar', food: 'greenhouse', comms: 'habitat' };
export const CATEGORY_OF_ROOM = Object.fromEntries(Object.entries(ROOM_OF).map(([c, r]) => [r, c]));

export const CATEGORY = {
  life: { label: 'Soporte vital', icon: '🫁', color: 'var(--tech)' },
  radiation: { label: 'Radiación', icon: '☢️', color: 'var(--cool)' },
  energy: { label: 'Energía', icon: '⚡', color: 'var(--brand)' },
  food: { label: 'Alimentos', icon: '🌱', color: 'var(--life)' },
  comms: { label: 'Comunicaciones', icon: '📡', color: 'var(--mid)' }
};

// Los 9 indicadores del motor (0–100).
export const METRICS = [
  { key: 'oxygen', file: '01_oxigeno', label: 'Oxígeno', icon: '🫁', color: 'var(--tech)' },
  { key: 'water', file: '02_agua', label: 'Agua', icon: '💧', color: 'var(--sky)' },
  { key: 'energy', file: '03_energia', label: 'Energía', icon: '⚡', color: 'var(--brand)' },
  { key: 'food', file: '04_cultivos', label: 'Comida', icon: '🌱', color: 'var(--life)' },
  { key: 'shield', file: '07_proteccion', label: 'Protección', icon: '🛡️', color: 'var(--cool)' },
  { key: 'comms', file: '06_radio', label: 'Comunicación', icon: '📡', color: 'var(--mid)' },
  { key: 'health', file: '05_salud', label: 'Salud', icon: '❤️', color: 'var(--alert)' },
  { key: 'morale', file: '11_estrella', label: 'Moral', icon: '🤝', color: 'var(--warm)' },
  { key: 'research', file: '10_muestra', label: 'Investigación', icon: '🔬', color: 'var(--moon)' }
];
export const ICON = { coin: '08_moneda', key: '09_llave', sample: '10_muestra', star: '11_estrella', trophy: '12_trofeo' };
export const iconUrl = (file) => `${import.meta.env.BASE_URL}assets/iconos/${file}.svg`;
export const METRIC = Object.fromEntries(METRICS.map((m) => [m.key, m]));

// Minijuego por categoría (escenas de Phaser).
export const MINIGAME_OF = { life: 'Leak', energy: 'Dust', food: 'Water', radiation: 'Dose', comms: 'Antenna' };

// Decisión de diseño: la opción cuidadosa (riesgo 0) hay que EJECUTARLA con un minijuego;
// los atajos (riesgo 1 o 2) se resuelven como decisión.
export const hasMinigame = (option) => option && option.risk === 0;

// Segundos base de cada minijuego; el motor los acorta con modifiers.timeMultiplier.
export const BASE_SECONDS = 25;
// Los retos de afuera (paneles y cráter) dependen del aire del traje: un tanque mal llenado acorta el tiempo.
export const OUTDOOR_CATEGORIES = ['energy', 'radiation'];
export const suitFactor = (suit, category) => (OUTDOOR_CATEGORIES.includes(category) && suit?.evaMax ? Math.max(0.55, Math.min(1, suit.evaMax / 180)) : 1);
export const minigameSeconds = (modifiers, factor = 1) => Math.max(10, Math.round(BASE_SECONDS * (modifiers?.timeMultiplier ?? 1) * factor));

// Cómo se convierte lo que pasó en el minijuego al objeto que pide el motor:
// { completed, accuracy (0–100), mistakes, hintsUsed }.
// accuracy mide avance y rapidez; los errores se cuentan aparte (el motor ya los descuenta).
export function makePerformance({ done, progress = 0, timeLeftFrac = 0, mistakes = 0, hintsUsed = 0 }) {
  const p = Math.max(0, Math.min(1, progress));
  const left = Math.max(0, Math.min(1, timeLeftFrac));
  const accuracy = done ? Math.round(70 + 30 * left) : Math.round(70 * p);
  return {
    completed: !!done,
    accuracy: Math.max(0, Math.min(100, accuracy)),
    mistakes: Math.max(0, Math.min(100, Math.round(mistakes))),
    hintsUsed: Math.max(0, Math.min(20, Math.round(hintsUsed)))
  };
}

// Si la tripulación está cansada o mareada, los minijuegos piden un poco más.
export const isTired = (statuses = []) => statuses.includes('fatiga') || statuses.includes('mareos');

export function statusName(key) {
  if (statusNames[key]) return statusNames[key];
  const m = /^reparacion_pendiente_(\w+)$/.exec(key);
  if (m) return `Reparación pendiente: ${CATEGORY[m[1]]?.label?.toLowerCase() || m[1]}`;
  const map = { plan_rescate: 'Plan de rescate confirmado' };
  if (map[key]) return map[key];
  const s = key.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Estados que son buenas noticias (para pintarlos en verde).
export const GOOD_STATUSES = ['plan_rescate'];

export const RESULT_LABEL = {
  completed: { text: '¡Reto superado!', icon: '✅', cls: 'up' },
  partial: { text: 'Reto a medias', icon: '🟡', cls: 'warn' },
  failed: { text: 'No salió esta vez', icon: '❌', cls: 'down' },
  missed: { text: 'Reto omitido', icon: '⏭️', cls: 'down' }
};

export const MESSAGE_TYPES = [
  { id: 'status_report', label: 'Reporte de estado', icon: '📋', hint: 'Avisa cómo está la base. Quita "Reporte pendiente".' },
  { id: 'science_report', label: 'Reporte científico', icon: '🔬', hint: 'Comparte lo que investigaron.' },
  { id: 'rescue_request', label: 'Pedir ayuda', icon: '🆘', hint: 'Si la Tierra confirma, queda un plan de rescate.' }
];

export function deltaList(delta = {}) {
  return Object.entries(delta).filter(([, v]) => v).map(([k, v]) => ({ key: k, value: v, ...(METRIC[k] || { label: k, icon: '•' }) }));
}

// Código de misión: la semilla del motor. Al azar: 6 letras fáciles de dictar.
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export function randomCode(rnd = Math.random) {
  let s = '';
  for (let i = 0; i < 6; i++) s += LETTERS[Math.floor(rnd() * LETTERS.length)];
  return s;
}
export function cleanCode(text) {
  const s = String(text || '').trim().toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
  return s.length >= 3 && s.length <= 20 ? s : null;
}
