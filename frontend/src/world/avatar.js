// Creador de astronautas por capas con los rasgos originales del Kit Visual de Vita Lunae.
// Las formas (piel, cabello, ojos, traje, accesorios) son las del kit; aquí solo se componen.
// Todos los sprites miden 32 × 46 px lógicos y comparten ancla (pies abajo, centro).
import { PALETTE as P } from '../theme.js';

const NS = 'http://www.w3.org/2000/svg';
const R = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const path = (d, c) => `<path d="${d}" fill="${c}"/>`;
const wrap = (w, h, body) => `<svg xmlns="${NS}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`;

export const SKINS = [['Marfil', '#FFE5C5', '#D9A17F'], ['Claro', '#F3C49F', '#C98F72'], ['Durazno', '#E7AB85', '#B77758'], ['Dorado', '#D59B64', '#A86A44'], ['Canela', '#B9774F', '#864E38'], ['Cobrizo', '#9E6245', '#70412F'], ['Marrón', '#794832', '#503024'], ['Ébano', '#513324', '#38251F']];
export const HAIRS = [['Negro', '#26243B', '#51465E'], ['Castaño oscuro', '#50362E', '#835544'], ['Castaño', '#875235', '#BC8253'], ['Rubio', '#E7B653', '#FFF0A5'], ['Pelirrojo', '#B84E37', '#F07A50'], ['Cobrizo', '#D7824B', '#F9B76A'], ['Platinado', '#DFE2ED', '#FFFFFF'], ['Violeta', '#8057C1', '#BA92EE'], ['Rosa', '#D56C9D', '#FCA2BF'], ['Azul', '#365C9D', '#6595E1']];
export const EYES = [['Marrón', '#61412D'], ['Negro', '#27234C'], ['Azul', '#4777BB'], ['Verde', '#438961'], ['Avellana', '#9B713C'], ['Violeta', '#7752AE']];
export const SUITS = [['Dorado', 'brand'], ['Azul', 'sky'], ['Lavanda', 'cool'], ['Coral', 'alert'], ['Verde', 'life'], ['Blanco lunar', 'cream']];
export const ACCESSORIES = [['none', 'Sin detalle'], ['freckles', 'Pecas'], ['glasses', 'Gafas'], ['beard', 'Barba']];
export const EXPRESSIONS = [['neutral', 'Tranquila'], ['happy', 'Feliz'], ['determined', 'Decidida']];
export const EMBLEMS = ['Estrella', 'Planeta', 'Luna', 'Sol', 'Cohete', 'Satélite', 'Cometa', 'Ovni', 'Astronauta', 'Alien', 'Telescopio', 'Cristal', 'Bandera', 'Engranaje', 'Cráter', 'Órbita'];
export const EMBLEM_FILES = ['01_estrella', '02_planeta', '03_luna', '04_sol', '05_cohete', '06_satelite', '07_cometa', '08_ovni', '09_astronauta', '10_alien', '11_telescopio', '12_cristal', '13_bandera', '14_engranaje', '15_crater', '16_orbita'];
export const STYLES = [ ['Bob', 'M9 4H23V6H26V10H27V23H22V25H9V23H5V10H6V6H9Z','M9 6H23V8H25V15H22V11H13V13H8V19H6V10H7V8H9Z','M10 7H21V8H10Z M7 11H8V17H7Z'], ['Largo liso','M9 3H23V5H27V10H28V27H22V25H10V27H4V10H5V5H9Z','M9 5H23V7H25V19H23V12H19V9H12V12H8V22H6V10H7V7H9Z','M10 6H21V7H10Z M6 16H7V24H6Z'], ['Coleta','M10 4H23V6H26V12H28V13H30V23H27V26H23V19H7V9H8V6H10Z','M10 6H23V8H25V15H22V11H14V13H9V16H7V10H8V8H10Z','M11 7H21V8H11Z M27 16H28V22H27Z'], ['Rizos largos','M9 3H22V5H26V7H28V11H29V16H27V19H29V24H26V27H21V25H11V27H6V25H3V20H5V16H3V11H5V6H9Z','M8 6H12V4H20V6H24V8H27V13H24V16H21V12H17V10H13V12H9V17H6V11H8Z','M9 7H12V9H9Z M19 7H22V9H19Z M5 20H7V22H5Z M25 22H27V24H25Z'], ['Moño','M12 1H21V3H24V7H26V11H26V20H6V10H8V6H10V3H12Z','M10 7H22V9H25V15H22V11H14V12H9V16H7V11H10Z','M13 2H20V4H13Z M10 8H19V9H10Z'], ['Trenzas','M9 4H23V6H26V10H27V18H25V22H27V28H23V29H20V25H10V29H6V27H4V22H6V10H7V6H9Z','M9 6H23V8H25V15H22V11H18V9H14V11H10V15H7V10H9Z','M7 20H9V22H7Z M6 24H8V26H6Z M23 20H25V22H23Z M24 24H26V26H24Z'], ['Pixie','M9 5H23V7H26V17H23V20H8V17H6V10H7V7H9Z','M8 8H10V6H24V8H26V12H21V10H17V12H12V15H8Z','M11 7H22V8H11Z M8 10H10V12H8Z'], ['Ondulado','M10 3H21V5H25V7H27V12H28V20H26V25H22V27H8V25H4V19H5V11H7V6H10Z','M10 5H21V7H24V9H26V14H23V12H18V9H14V11H10V14H7V9H10Z','M10 6H14V8H10Z M20 8H24V10H20Z M5 20H7V23H5Z'], ['Corto clásico','M9 5H23V7H26V18H23V21H8V18H6V10H7V7H9Z','M9 7H23V9H25V14H22V11H13V13H9V17H7V11H9Z','M10 8H21V9H10Z'], ['Flequillo','M9 4H23V6H26V10H27V18H24V21H8V18H5V10H7V6H9Z','M8 7H24V9H26V13H22V15H18V12H14V14H10V17H7V10H8Z','M10 8H22V9H10Z M14 10H16V12H14Z'], ['Rapado','M10 6H22V8H25V13H23V14H9V13H7V10H9V8H10Z','M10 7H22V9H24V12H8V10H10Z','M12 8H20V9H12Z'], ['Afro','M10 2H22V4H26V6H29V11H30V17H27V20H24V22H8V20H5V17H2V10H4V6H7V4H10Z','M9 5H23V7H26V10H28V14H24V12H21V14H17V12H13V14H9V12H5V10H7V7H9Z','M10 5H13V7H10Z M18 5H21V7H18Z M5 9H7V11H5Z M24 8H26V10H24Z'], ['Degradado','M9 4H23V6H26V10H27V17H24V20H8V17H5V11H7V6H9Z','M9 5H24V7H26V10H20V11H11V13H7V9H9Z','M11 6H22V7H11Z M6 12H8V15H6Z'], ['Puntiagudo','M7 7H9V3H12V5H15V1H18V4H21V2H24V6H27V10H28V18H24V21H8V18H5V11H7Z','M8 8H11V6H14V8H18V5H21V7H25V10H27V13H22V10H17V12H12V15H8Z','M16 4H18V7H16Z M22 5H24V7H22Z'], ['Rizos cortos','M10 3H22V5H26V7H28V12H27V17H24V21H8V17H5V13H4V9H7V5H10Z','M9 6H12V4H19V6H24V8H26V12H23V14H20V12H16V14H12V12H9V16H6V10H9Z','M10 7H13V9H10Z M18 6H21V8H18Z M23 9H25V11H23Z'], ['Raya lateral','M9 4H23V6H26V10H27V18H23V21H8V18H5V10H7V6H9Z','M9 6H23V8H25V12H22V10H19V9H16V11H13V13H10V16H7V10H9Z','M10 7H17V8H10Z M18 7H23V8H18Z']];

// Categorías del creador, en el orden en que se muestran.
export const CATEGORIES = [
  { key: 'skin', label: 'Piel', list: SKINS },
  { key: 'style', label: 'Peinado', list: STYLES },
  { key: 'hair', label: 'Color de cabello', list: HAIRS },
  { key: 'eyes', label: 'Ojos', list: EYES },
  { key: 'suit', label: 'Traje', list: SUITS },
  { key: 'accessory', label: 'Detalle', list: ACCESSORIES },
  { key: 'expression', label: 'Expresión', list: EXPRESSIONS },
  { key: 'emblem', label: 'Parche', list: EMBLEMS.map((n) => [n]) }
];

export const PRESETS = [['Luna', 'f', 0, 1, 0, 2, 2, 'none'], ['Sol', 'f', 3, 3, 2, 4, 0, 'freckles'], ['Vega', 'f', 5, 0, 3, 1, 3, 'none'], ['Mira', 'f', 1, 4, 1, 0, 1, 'freckles'], ['Astra', 'f', 6, 0, 5, 1, 4, 'none'], ['Nala', 'f', 4, 2, 4, 3, 2, 'glasses'], ['Iris', 'f', 2, 7, 6, 5, 3, 'none'], ['Selene', 'f', 7, 6, 7, 2, 5, 'none'],
  ['Leo', 'm', 1, 2, 8, 4, 0, 'none'], ['Kai', 'm', 3, 0, 9, 1, 1, 'none'], ['Orion', 'm', 5, 0, 10, 0, 2, 'beard'], ['Atlas', 'm', 7, 0, 11, 1, 4, 'none'], ['Teo', 'm', 0, 3, 12, 2, 3, 'freckles'], ['Nico', 'm', 2, 4, 13, 3, 0, 'none'], ['Elio', 'm', 4, 1, 14, 0, 5, 'glasses'], ['Cosmo', 'm', 6, 9, 15, 2, 2, 'none']]
  .map(([name, group, skin, hair, style, eyes, suit, accessory], i) => ({ name, group, skin, hair, style, eyes, suit, accessory, expression: 'neutral', emblem: i % 16 }));

export const defaultAvatar = () => ({ ...PRESETS[0] });

// ¿Es válido? Mismas reglas que el backend (setAvatar). Devuelve el avatar normalizado o null.
export function normalizeAvatar(a) {
  if (!a || typeof a !== 'object') return null;
  const int = (v, n) => Number.isInteger(v) && v >= 0 && v < n;
  if (!int(a.skin, SKINS.length) || !int(a.hair, HAIRS.length) || !int(a.style, STYLES.length) || !int(a.eyes, EYES.length) || !int(a.suit, SUITS.length) || !int(a.emblem ?? 0, EMBLEMS.length)) return null;
  if (!ACCESSORIES.some(([k]) => k === a.accessory) || !EXPRESSIONS.some(([k]) => k === a.expression)) return null;
  const name = String(a.name || '').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 16) || 'Astro';
  return { name, skin: a.skin, hair: a.hair, style: a.style, eyes: a.eyes, suit: a.suit, accessory: a.accessory, expression: a.expression, emblem: a.emblem ?? 0 };
}

const accent = (a) => P[SUITS[a.suit][1] === 'cool' ? 'cool' : SUITS[a.suit][1]];

function head(a) {
  const [, skin, shade] = SKINS[a.skin];
  const [, hair, highlight] = HAIRS[a.hair];
  const [, back, front, shine] = STYLES[a.style];
  let b = path(back, P.outline) + path(back, hair);
  b += path('M11 7H21V9H24V13H26V19H24V23H21V25H11V23H8V19H6V13H8V9H11Z', P.outline);
  b += path('M11 8H21V10H23V14H25V18H23V22H20V24H12V22H9V18H7V14H9V10H11Z', skin);
  b += R(8, 15, 2, 3, shade) + R(22, 15, 2, 3, shade) + R(12, 23, 8, 1, shade) + R(21, 20, 2, 2, shade) + R(15, 19, 2, 1, shade);
  b += path(front, hair) + path(shine, highlight);
  const eye = EYES[a.eyes][1];
  if (a.expression === 'happy') b += path('M10 15H13V16H14V17H13V16H10Z M19 15H22V16H23V17H22V16H19Z', P.outline) + R(14, 20, 4, 2, P.outline) + R(15, 20, 2, 1, P.cream);
  else {
    for (const x of [11, 19]) b += R(x, 15, 3, 3, P.outline) + R(x + 1, 16, 2, 2, eye) + R(x, 15, 1, 1, P.white);
    b += R(14, 21, 4, 1, P.outline);
    if (a.expression === 'determined') b += R(10, 14, 4, 1, P.outline) + R(19, 14, 4, 1, P.outline);
  }
  if (a.accessory === 'freckles') for (const x of [10, 12, 20, 22]) b += R(x, 19, 1, 1, shade);
  if (a.accessory === 'glasses') b += path('M9 14H15V15H18V14H24V19H18V16H15V19H9Z', P.outline) + R(10, 15, 4, 3, skin) + R(19, 15, 4, 3, skin) + R(12, 16, 1, 2, eye) + R(20, 16, 1, 2, eye);
  if (a.accessory === 'beard') b += path('M9 19H11V22H13V23H19V22H21V19H23V23H21V25H11V23H9Z', hair) + R(14, 21, 4, 1, P.outline);
  return b;
}

// Vista de espaldas: cabello por detrás, sin cara, y la mochila con el tanque de aire.
function headBack(a) {
  const [, skin] = SKINS[a.skin], [, hair, highlight] = HAIRS[a.hair], [, back, front, shine] = STYLES[a.style];
  let b = path(back, P.outline) + path(back, hair);
  b += path('M11 7H21V9H24V13H26V19H24V23H21V25H11V23H8V19H6V13H8V9H11Z', P.outline);
  b += path('M11 8H21V10H23V14H25V18H23V22H20V24H12V22H9V18H7V14H9V10H11Z', hair);
  b += R(6, 15, 2, 3, skin) + R(24, 15, 2, 3, skin);   // orejas
  b += path(shine, highlight) + R(12, 11, 8, 1, highlight);
  return b;
}
function bodyBack(a) {
  const ac = accent(a);
  let b = path('M10 24H22V26H25V29H27V36H24V34H23V41H25V45H18V43H14V45H7V41H9V34H8V36H5V29H7V26H10Z', P.outline);
  b += R(10, 26, 12, 13, P.cream) + R(10, 36, 12, 3, P.cool) + R(10, 27, 12, 2, ac) + R(7, 28, 3, 5, ac) + R(22, 28, 3, 5, ac) + R(6, 33, 3, 2, P.cream) + R(23, 33, 3, 2, P.cream)
    + R(10, 39, 5, 3, P.moon) + R(18, 39, 4, 3, P.moon) + R(9, 43, 6, 1, ac) + R(18, 43, 6, 1, ac);
  // mochila de soporte vital con su tanque
  b += R(11, 29, 10, 9, P.outline) + R(12, 30, 8, 7, P.moon) + R(13, 31, 2, 5, P.tech) + R(17, 31, 2, 5, P.life) + R(15, 30, 2, 7, ac);
  return b;
}

function body(a, helmet) {
  const ac = accent(a), skin = SKINS[a.skin][1];
  let b = path('M10 24H22V26H25V29H27V36H24V34H23V41H25V45H18V43H14V45H7V41H9V34H8V36H5V29H7V26H10Z', P.outline);
  b += R(10, 26, 12, 13, P.cream) + R(10, 36, 12, 3, P.cool) + R(10, 27, 12, 2, ac) + R(13, 30, 6, 5, ac) + R(14, 31, 4, 2, P.outline) + R(14, 32, 1, 1, P.life) + R(17, 32, 1, 1, P.alert)
    + R(7, 28, 3, 5, ac) + R(22, 28, 3, 5, ac) + R(6, 33, 3, 2, helmet ? P.cream : skin) + R(23, 33, 3, 2, helmet ? P.cream : skin)
    + R(10, 39, 5, 3, P.moon) + R(18, 39, 4, 3, P.moon) + R(9, 43, 6, 1, ac) + R(18, 43, 6, 1, ac);
  return b;
}

// Vista interior (sin casco) o exterior (con casco y visor): mismo tamaño y misma ancla.
export function avatarSvg(a, helmet = false, view = 'front') {
  if (view === 'back') {
    let b = bodyBack(a);
    if (!helmet) return wrap(32, 46, b + headBack(a));
    const ac = accent(a), hair = HAIRS[a.hair][1];
    b += path('M9 2H23V4H27V8H29V19H27V23H23V26H9V24H5V20H3V8H5V4H9Z', P.outline) + path('M9 4H23V6H25V9H27V19H25V22H22V24H10V22H7V19H5V9H7V6H9Z', ac);
    b += R(10, 7, 12, 3, P.white) + R(9, 11, 14, 8, mixShade(ac)) + R(11, 20, 10, 2, mixShade(ac)) + R(3, 13, 2, 4, P.cool) + R(27, 13, 2, 4, P.cool) + R(14, 9, 4, 2, hair);
    return wrap(32, 46, b);
  }
  let b = body(a, helmet);
  if (!helmet) return wrap(32, 46, b + head(a));
  const ac = accent(a), [, skin, shade] = SKINS[a.skin], hair = HAIRS[a.hair][1];
  b += path('M9 2H23V4H27V8H29V19H27V23H23V26H9V24H5V20H3V8H5V4H9Z', P.outline) + path('M9 4H23V6H25V9H27V19H25V22H22V24H10V22H7V19H5V9H7V6H9Z', ac)
    + path('M9 7H23V9H25V20H22V22H10V20H7V9H9Z', P.outline) + path('M10 8H22V10H24V19H21V21H11V19H8V10H10Z', P.moon);
  b += R(10, 11, 12, 8, skin) + R(11, 10, 10, 2, hair) + R(10, 11, 3, 2, hair) + R(21, 12, 1, 4, shade) + R(11, 19, 10, 1, shade);
  if (a.style === 10) b += R(12, 10, 8, 1, skin);
  else if ([3, 11, 14].includes(a.style)) b += R(10, 10, 2, 2, hair) + R(20, 10, 2, 2, hair);
  else if ([2, 4, 13].includes(a.style)) b += R(14, 9, 4, 2, hair);
  for (const x of [12, 19]) b += R(x, 14, 2, 2, P.outline) + R(x + 1, 15, 1, 1, EYES[a.eyes][1]);
  b += R(15, 17, 3, a.expression === 'happy' ? 2 : 1, P.outline);
  if (a.accessory === 'glasses') b += R(11, 13, 4, 1, P.outline) + R(18, 13, 4, 1, P.outline) + R(15, 14, 3, 1, P.outline);
  if (a.accessory === 'freckles') b += R(11, 17, 1, 1, shade) + R(21, 17, 1, 1, shade);
  if (a.accessory === 'beard') b += R(12, 18, 8, 1, hair);
  b += R(9, 5, 12, 1, P.cream) + R(8, 9, 2, 3, P.white) + R(23, 7, 2, 2, P.warm) + R(8, 22, 16, 2, P.warm) + R(3, 13, 2, 4, P.cool) + R(27, 13, 2, 4, P.cool);
  return wrap(32, 46, b);
}

const mixShade = (c) => c;
export const avatarKey = (a, helmet) => `av:${a.skin}.${a.hair}.${a.style}.${a.eyes}.${a.suit}.${a.accessory}.${a.expression}:${helmet ? 'x' : 'i'}`;
export const avatarUri = (a, helmet = false, view = 'front') => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(avatarSvg(a, helmet, view));
