// Mundo de Vita Lunae: escenarios, colisiones, puertas y puntos de interacción.
// Todo está en "unidades de mapa" (la cuadrícula del SVG original). Cada PNG se dibuja a 3 px por unidad.
// Las áreas transitables, los obstáculos y las zonas de uso viven aquí, separados de la imagen.

export const U = 3; // px de textura por unidad de mapa

// Los mapas en pantalla se midieron sobre vistas de 760 px de ancho. kPx convierte esos px a unidades.
const px = (k, list) => list.map((r) => r.map((n) => +(n / k).toFixed(1)));
const ZK = 760 / 480; // Zora
const GK = 500 / 320; // invernadero
const CK = 500 / 256; // cráter

export const SCENES = {
  exterior: {
    name: 'Exterior de la estación',
    map: 'mapa-exterior',
    w: 568, h: 336, avatarScale: 0.5, view: 200, music: 'sky',
    surround: true, // la base está en una hondonada rodeada de paredes de roca (src/world/cliff.js)
    // zona general (todo el terreno) menos obstáculos; deja libre la franja de montañas del borde.
    // Arriba, el límite sigue la línea del cielo medida en el PNG (+20 unidades): el astronauta no queda parado sobre el cielo.
    walk: [[14, 29, 142, 322], [142, 22, 189, 322], [189, 25, 236, 322], [236, 32, 284, 322], [284, 41, 331, 322], [331, 37, 378, 322], [378, 30, 473, 322], [473, 28, 520, 322], [520, 44, 554, 322]],
    block: [
      [46, 2, 133, 72], [0, 0, 48, 26], [8, 52, 52, 86], // antena y rocas
      [196, 106, 374, 195], // Zora
      [14, 136, 94, 184], // invernadero
      [410, 6, 556, 66], // paneles solares
      [436, 262, 568, 334], // cráter (se entra por el borde)
      [0, 284, 60, 334], [60, 300, 172, 334], [520, 312, 566, 334], // rocas
      [66, 286, 84, 292], // tubería de la plataforma
      [286, 255, 298, 262], // piedras
    ],
    spawn: { x: 288, y: 210 },
    zones: {
      plataforma: { rect: [76, 247, 158, 292], outer: [60, 235, 172, 306], label: 'Plataforma de entregas' },
    },
    doors: [
      { id: 'zora', rect: [268, 196, 308, 208], label: 'Entrar a la nave Zora', to: { scene: 'zora', x: 46, y: 186 }, anchor: [288, 200] },
      { id: 'invernadero', rect: [94, 148, 108, 174], label: 'Entrar al invernadero', to: { scene: 'invernadero', x: 160, y: 190 }, anchor: [98, 161] },
      { id: 'paneles', rect: [462, 66, 510, 80], label: 'Ir a los paneles solares', to: { scene: 'paneles', x: 14, y: 190 }, anchor: [486, 72] },
      { id: 'crater', rect: [446, 242, 520, 258], label: 'Bajar al cráter', to: { scene: 'crater', x: 148, y: 62 }, anchor: [482, 250] },
    ],
    points: [
      { id: 'ext-antena', x: 96, y: 78, r: 26, kind: 'task', cat: 'comms', label: 'Antena de comunicaciones' },
      { id: 'ext-plataforma', x: 117, y: 270, r: 6, kind: 'info', label: 'Plataforma', hidden: true },
    ],
    ship: { x: 117, y: 272, scale: 1.25 }, // la nave de carga aparece aquí solo con un pedido listo
  },

  zora: {
    name: 'Nave Zora',
    map: 'mapa-zora',
    w: 480, h: 320, avatarScale: 0.5, view: 170, music: 'inside',
    // Habitaciones (medidas en la vista de 760 px) + pasillos medidos sobre el PNG (1440 × 960 px, 3 px por unidad)
    // siguiendo el borde exacto de las baldosas: así el astronauta no puede pisar el vacío entre pasillos.
    walk: [
      ...px(ZK, [
        [22, 44, 212, 126], // energía
        [253, 62, 415, 128], // comunicaciones
        [498, 72, 735, 138], // cabina
        [22, 252, 130, 318], // esclusa
        [165, 262, 318, 336], // taller
        [346, 286, 486, 360], // atención médica
        [535, 286, 732, 374], // soporte vital
        [155, 418, 332, 486], // dormitorios
        [460, 420, 695, 486], // almacén
      ]),
      // Pasillos y puertas medidos sobre el PNG (1440 × 960 px, 3 px por unidad) desde el borde del vacío:
      // a los costados quedan 15 px para el pie (la pared + medio pie), arriba 18 px (el cuerpo no flota sobre el vacío)
      // y abajo 12 px. Así el astronauta camina solo sobre las baldosas.
      ...px(3, [
        [176, 230, 204, 310], // puerta de energía
        [592, 238, 637, 310], // puerta de comunicaciones
        [110, 305, 873, 357], // pasillo superior
        [104, 350, 150, 432], [116, 428, 144, 482], // bajada a la esclusa
        [425, 350, 474, 470], [438, 466, 455, 502], // bajada al taller
        [821, 350, 873, 440], // cruce del pasillo superior con el derecho
        [821, 380, 1311, 432], // pasillo derecho
        [752, 431, 840, 490], // codo hacia la atención médica
        [764, 485, 792, 546], // puerta de la atención médica
        [1175, 256, 1224, 438], // puerta de la cabina
        [1187, 432, 1236, 485], [1199, 480, 1227, 546], // bajada y puerta de soporte vital
        [443, 630, 471, 800], // salida inferior del taller y puerta de los dormitorios
        [431, 698, 990, 732], // pasillo inferior
        [985, 722, 1029, 735], // extremo del pasillo inferior
        [1001, 722, 1029, 800], // puerta del almacén
      ]),
    ],
    block: px(ZK, [
      [30, 52, 62, 80], // consola de energía
      [172, 262, 232, 284], [262, 262, 320, 284], // equipos del taller
      [346, 286, 372, 312], [356, 312, 372, 362], // camas médicas
      [540, 290, 622, 346], [684, 290, 732, 340], // tanques
      [158, 420, 220, 450], [258, 420, 330, 450], // literas (queda libre el paso central)
      [462, 424, 516, 462], [562, 424, 622, 462], // estantes (paso libre desde el pasillo)
    ]),
    spawn: { x: 46, y: 186 },
    bed: { x: +(240 / ZK).toFixed(1), y: +(468 / ZK).toFixed(1) }, // pasillo entre las literas: aquí despierta la tripulación cada día nuevo
    doors: [
      { id: 'salida', rect: px(ZK, [[28, 262, 124, 318]])[0], label: 'Salir al exterior', to: { scene: 'exterior', x: 288, y: 211 }, anchor: [46, 186], mode: 'point', needsTank: true },
    ],
    points: px(ZK, [
      [128, 78, 0], [60, 92, 0], [312, 98, 0], [392, 102, 0], [590, 106, 0], [528, 102, 0],
      [205, 296, 0], [290, 296, 0], [412, 306, 0], [640, 318, 0], [706, 322, 0], [95, 296, 0], [240, 455, 0], [575, 458, 0],
    ]).map((p, i) => ({ x: p[0], y: p[1], i })).map(({ x, y, i }) => ({
      ...[
        { id: 'zora-energia-bat', r: 24, kind: 'task', cat: 'energy', label: 'Baterías de energía' },
        { id: 'zora-energia-consola', r: 20, kind: 'task', cat: 'energy', label: 'Consola de energía' },
        { id: 'zora-com-antena', r: 22, kind: 'task', cat: 'comms', label: 'Consola de la antena' },
        { id: 'zora-com-radio', r: 20, kind: 'comms', cat: 'comms', label: 'Radio con la Tierra' },
        { id: 'zora-luni', r: 22, kind: 'luni', label: 'Kita, la mascota de la base' },
        { id: 'zora-panel', r: 18, kind: 'statuses', label: 'Panel de alertas' },
        { id: 'zora-taller-1', r: 20, kind: 'task', cat: 'life', label: 'Estación de trabajo' },
        { id: 'zora-taller-2', r: 20, kind: 'task', cat: 'life', label: 'Monitor de aire' },
        { id: 'zora-medica', r: 22, kind: 'task', cat: 'life', label: 'Atención médica' },
        { id: 'zora-tanques', r: 26, kind: 'tank', cat: 'life', label: 'Depósitos de soporte vital' },
        { id: 'zora-agua', r: 20, kind: 'task', cat: 'life', label: 'Reciclador de agua' },
        { id: 'zora-traje', r: 20, kind: 'task', cat: 'radiation', label: 'Soporte del traje' },
        { id: 'zora-dormitorio', r: 26, kind: 'info', label: 'Dormitorios', info: 'La tripulación descansa aquí. Dormir no cambia el reloj de la misión: el tiempo avanza con tus retos.' },
        { id: 'zora-almacen', r: 30, kind: 'storage', label: 'Almacén de la nave' },
      ][i], x, y,
    })),
  },

  invernadero: {
    name: 'Invernadero',
    map: 'mapa-invernadero',
    w: 320, h: 240, avatarScale: 0.5, view: 170, music: 'inside',
    walk: [[24, 54, 296, 200], [138, 196, 182, 224]],
    block: px(GK, [
      [145, 90, 235, 150], [265, 90, 355, 150], [145, 170, 235, 225], [265, 170, 355, 225], // bandejas
      [50, 90, 120, 165], [375, 80, 455, 185], // aislamiento y riego
      [75, 245, 195, 300], [330, 240, 420, 305], // mesa y almacén
      [25, 275, 62, 322], [438, 275, 472, 322], // macetas
    ]),
    spawn: { x: 160, y: 190 },
    doors: [
      { id: 'salida', rect: [138, 200, 182, 222], label: 'Salir al exterior', to: { scene: 'exterior', x: 100, y: 164 }, anchor: [160, 204] },
    ],
    points: [
      { id: 'inv-bandeja-1', x: 120, y: 78, r: 30, kind: 'task', cat: 'food', label: 'Bandeja de cultivo 1', tray: 0 },
      { id: 'inv-bandeja-2', x: 198, y: 78, r: 30, kind: 'task', cat: 'food', label: 'Bandeja de cultivo 2', tray: 1 },
      { id: 'inv-bandeja-3', x: 120, y: 126, r: 30, kind: 'task', cat: 'food', label: 'Bandeja de cultivo 3', tray: 2 },
      { id: 'inv-bandeja-4', x: 198, y: 126, r: 30, kind: 'task', cat: 'food', label: 'Bandeja de cultivo 4', tray: 3 },
      { id: 'inv-aislamiento', x: 55, y: 82, r: 30, kind: 'task', cat: 'food', label: 'Unidad de aislamiento' },
      { id: 'inv-riego', x: 262, y: 80, r: 34, kind: 'task', cat: 'food', label: 'Depósito y riego' },
      { id: 'inv-mesa', x: 88, y: 170, r: 30, kind: 'task', cat: 'food', label: 'Mesa de trabajo' },
      { id: 'inv-almacen', x: 240, y: 172, r: 28, kind: 'storage', label: 'Almacén del invernadero' },
    ],
    trays: [[93, 58, 150, 96], [170, 58, 227, 96], [93, 109, 150, 144], [170, 109, 227, 144]],
  },

  paneles: {
    name: 'Paneles solares',
    map: 'mapa-paneles', front: { tex: 'mapa-paneles-frente', y: 208 },
    w: 384, h: 288, avatarScale: 2, view: 384, music: 'sky',
    // el avatar queda parcialmente oculto por los paneles delanteros (y >= 208) pero nunca desaparece
    walk: [[4, 132, 272, 226]],
    block: [[272, 90, 384, 230], [246, 120, 274, 160]],
    spawn: { x: 14, y: 190 },
    doors: [
      { id: 'salida', rect: [0, 132, 10, 226], label: 'Volver al exterior', to: { scene: 'exterior', x: 486, y: 84 }, anchor: [6, 190] },
    ],
    points: [
      { id: 'pan-a', x: 56, y: 128, r: 28, kind: 'task', cat: 'energy', label: 'Panel solar A' },
      { id: 'pan-b', x: 198, y: 128, r: 28, kind: 'task', cat: 'energy', label: 'Panel solar B' },
      { id: 'pan-alm', x: 262, y: 176, r: 30, kind: 'task', cat: 'energy', label: 'Almacenamiento de energía' },
    ],
    panels: [[0, 0, 125, 40], [130, 0, 255, 40]],
  },

  crater: {
    name: 'Cráter de exploración',
    map: 'mapa-crater',
    w: 256, h: 192, avatarScale: 1, view: 256, music: 'sky',
    walk: [[140, 44, 158, 62]],
    ellipse: { cx: 128, cy: 115, rx: 72, ry: 60 },
    block: px(CK, [[210, 190, 330, 240], [140, 530, 175, 560], [105, 625, 150, 660], [170, 625, 215, 660], [270, 575, 380, 660], [30, 400, 90, 440], [360, 400, 420, 450]]).map((r) => r),
    spawn: { x: 148, y: 64 },
    doors: [
      { id: 'salida', rect: [140, 44, 158, 58], label: 'Subir por la escalera', to: { scene: 'exterior', x: 482, y: 240 }, anchor: [149, 52] },
    ],
    points: [
      { id: 'cra-baliza', x: 79, y: 85, r: 26, kind: 'task', cat: 'radiation', label: 'Baliza de medición' },
      { id: 'cra-roca', x: 136, y: 110, r: 30, kind: 'task', cat: 'radiation', label: 'Roca de muestra' },
      { id: 'cra-analisis', x: 168, y: 128, r: 26, kind: 'task', cat: 'radiation', label: 'Equipo de análisis' },
      { id: 'cra-cofre', x: 62, y: 132, r: 24, kind: 'task', cat: 'radiation', label: 'Contenedor de muestras' },
      { id: 'cra-pico', x: 100, y: 138, r: 22, kind: 'task', cat: 'radiation', label: 'Herramienta de excavación' },
    ],
  },
};

export const SCENE_IDS = Object.keys(SCENES);
export const OUTSIDE = new Set(['exterior', 'paneles', 'crater']); // aquí se gasta el aire del traje

// ── Geometría (pura, sin Phaser) ──────────────────────────────────────────────
const inRect = (r, x, y) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];
export function walkable(sceneId, x, y) {
  const s = SCENES[sceneId];
  if (!s) return false;
  if (x < 0 || y < 0 || x > s.w || y > s.h) return false;
  let ok = s.walk.some((r) => inRect(r, x, y));
  if (!ok && s.ellipse) { const e = s.ellipse; ok = ((x - e.cx) / e.rx) ** 2 + ((y - e.cy) / e.ry) ** 2 <= 1; }
  if (!ok) return false;
  return !s.block.some((r) => inRect(r, x, y));
}

// Mueve con deslizamiento por ejes: si el diagonal choca, prueba cada eje por separado.
export function step(sceneId, x, y, dx, dy) {
  if (walkable(sceneId, x + dx, y + dy)) return { x: x + dx, y: y + dy };
  if (dx && walkable(sceneId, x + dx, y)) return { x: x + dx, y };
  if (dy && walkable(sceneId, x, y + dy)) return { x, y: y + dy };
  return { x, y };
}

// Punto seguro cercano: sirve para reaparecer sin quedar dentro de una pared.
export function safeSpot(sceneId, x, y) {
  if (walkable(sceneId, x, y)) return { x, y };
  for (let r = 2; r <= 120; r += 2) {
    for (let a = 0; a < 360; a += 20) {
      const px_ = x + Math.cos((a * Math.PI) / 180) * r, py_ = y + Math.sin((a * Math.PI) / 180) * r;
      if (walkable(sceneId, px_, py_)) return { x: px_, y: py_ };
    }
  }
  return { ...SCENES[sceneId].spawn };
}

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const doorAt = (sceneId, x, y, pad = 0) =>
  (SCENES[sceneId].doors || []).find((d) => inRect([d.rect[0] - pad, d.rect[1] - pad, d.rect[2] + pad, d.rect[3] + pad], x, y)) || null;

// Zona rectangular con histéresis: se entra por `rect` y no se vuelve a armar hasta salir de `outer`.
export function zoneState(zone, x, y, wasInside) {
  if (wasInside) return inRect(zone.outer, x, y);
  return inRect(zone.rect, x, y);
}

// ── Qué punto del mundo atiende cada reto ─────────────────────────────────────
// Reglas: cada reto vive en un escenario y en un equipo concreto. La mayoría se reparte por categoría;
// unos pocos tienen un lugar propio por su contenido (traje, tanque, antena, etc.).
const SLOTS = {
  life: ['zora-tanques', 'zora-medica', 'zora-taller-1', 'zora-taller-2', 'zora-agua'],
  comms: ['zora-com-antena', 'zora-com-antena', 'zora-com-radio'],
  energy: ['pan-a', 'zora-energia-bat', 'pan-b', 'zora-energia-consola', 'pan-alm'],
  food: ['inv-bandeja-1', 'inv-bandeja-2', 'inv-riego', 'inv-bandeja-3', 'inv-bandeja-4', 'inv-aislamiento', 'inv-mesa'],
  radiation: ['cra-baliza', 'cra-roca', 'cra-analisis', 'cra-cofre', 'cra-pico'],
};
const FIXED = {
  1: 'zora-taller-2', 11: 'zora-medica', 26: 'zora-medica', 46: 'zora-medica', 21: 'zora-agua', 41: 'zora-agua', 36: 'zora-tanques', 16: 'zora-tanques',
  12: 'zora-traje', 47: 'zora-traje', 17: 'cra-analisis', 37: 'cra-baliza', 42: 'cra-baliza',
  3: 'pan-a', 18: 'pan-b', 13: 'zora-energia-bat', 23: 'zora-energia-consola', 33: 'zora-energia-consola', 28: 'pan-alm', 38: 'pan-alm',
  19: 'inv-aislamiento', 29: 'inv-aislamiento', 49: 'inv-aislamiento', 24: 'inv-bandeja-3', 34: 'inv-riego', 9: 'inv-bandeja-2', 14: 'inv-riego',
  15: 'zora-com-antena', 25: 'zora-com-antena', 5: 'zora-com-radio', 10: 'zora-com-radio',
};

export const POINTS = Object.fromEntries(SCENE_IDS.flatMap((sid) => (SCENES[sid].points || []).map((p) => [p.id, { ...p, scene: sid }])));

export function placeOf(mission) {
  if (!mission) return null;
  const id = FIXED[mission.id] || SLOTS[mission.category]?.[(mission.id - 1) % SLOTS[mission.category].length];
  return POINTS[id] || null;
}

// Camino entre escenarios: devuelve la puerta que hay que usar ahora para llegar al destino.
export function nextHop(from, to) {
  if (from === to) return null;
  if (from === 'exterior') return SCENES.exterior.doors.find((d) => d.to.scene === to) || null;
  return SCENES[from].doors[0]; // todos los interiores salen al exterior
}

export const doorTarget = (door) => ({ x: door.anchor[0], y: door.anchor[1] });
