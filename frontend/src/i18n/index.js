// Internacionalización del juego: un archivo por idioma (es.js, en.js) con las mismas claves.
// El idioma activo lo guarda el backend (bridge.setLanguage); aquí solo se lee.
//   t('clave', { n: 3 })  → texto del idioma activo; {n} se rellena con las variables.
//   tr('Texto en español') → para textos que llegan como dato: busca su clave y devuelve el idioma activo.
// Lo que falte en un idioma cae al español, y si tampoco existe se muestra la clave (se nota en las pruebas).
import { session } from '../bus.js';
import es from './es.js';
import en from './en.js';

export const LOCALES = { es, en };
const ES_TO_KEY = new Map(Object.entries(es).map(([k, v]) => [v, k]));

export const lang = () => session.view?.lang || session.bridge?.getView?.().lang || 'es';

export function t(key, vars = {}) {
  const dict = LOCALES[lang()] || es;
  const s = dict[key] ?? es[key];
  if (s === undefined) return key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

export function tr(text) {
  const key = ES_TO_KEY.get(text);
  return key === undefined ? text : t(key);
}

// Textos de los registros DONKI (en español en los datos): en inglés se traducen por patrón.
const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function trEvent(x) {
  if (lang() !== 'en' || typeof x !== 'string') return x;
  let m = /^Registro (\w+) de DONKI\.(?: Índices Kp observados: (.*))?$/.exec(x);
  if (m) return `DONKI ${m[1]} record.${m[2] ? ` Observed Kp values: ${m[2]}` : ''}`;
  m = /^DONKI registró Kp ([\d.]+) en la magnetosfera terrestre durante el intervalo (.+?) UTC del (\d+) de (\w+) de (\d+)\.$/.exec(x);
  if (m) return `DONKI recorded Kp ${m[1]} in Earth's magnetosphere between ${m[2]} UTC on ${MEN[MES.indexOf(m[4])] || m[4]} ${m[3]}, ${m[5]}.`;
  return tr(x);
}
