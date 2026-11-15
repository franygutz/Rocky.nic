// Borde del exterior: la base está en el fondo de una HONDONADA.
// Alrededor, paredes de roca suben hasta una meseta más alta con rocas sueltas, y al frente
// la meseta vuelve a caer en otro barranco. Por eso el astronauta no puede salir del mapa:
// lo rodean paredes que no se pueden escalar.
// Todo es pixel art generado en código (sin archivos): 1 píxel de arte = 1 unidad del mapa = 3 px.
// cliffCells() es pura (se prueba en node); cliffCanvas() la dibuja en un canvas que va ENCIMA del mapa
// (transparente en el fondo de la hondonada, que es el mapa mismo).

export const CLIFF_PX = 3;
// Tamaño del cuadro alrededor del mapa (píxeles de arte) y alto de las paredes.
export const CLIFF = { mx: 120, mt: 110, mb: 130, wall: 44, side: 26, outer: 52, outerWall: 44 };

// Colores del suelo del mapa y de las rocas de la referencia (meseta rosada, paredes malva).
export const CLIFF_COLORS = {
  ground: '#c6a29f', groundLo: '#b394a6', groundWarm: '#c0a08f', groundHi: '#d4b4ac', pebble: '#9a7a93',
  rim: '#dcc0b9', rimDark: '#8a6a86', shadow: '#a98a9c',
  capTop: '#c9aab8', capEdge: '#a8879f',
  faceHi: '#a6869f', face: '#8f6f8d', faceLo: '#775b7b', faceDeep: '#62496a', crevice: '#46334f',
  ledge: '#b696a6',
  rockTop: '#c8a8b6', rockHi: '#b090a8', rock: '#977792', rockLo: '#7a5e7d', rockLine: '#5a4466',
  abyss: '#2a1f3b', abyssDeep: '#1e1629'
};
const K = CLIFF_COLORS;

// Ruido y azar con semilla: el mismo dibujo en cada partida.
const hash = (x, y, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function smooth(x, y, cell, s) {
  const gx = Math.floor(x / cell), gy = Math.floor(y / cell), fx = x / cell - gx, fy = y / cell - gy;
  const e = (t) => t * t * (3 - 2 * t), a = hash(gx, gy, s), b = hash(gx + 1, gy, s), c = hash(gx, gy + 1, s), d = hash(gx + 1, gy + 1, s);
  return a + (b - a) * e(fx) + (c - a) * e(fy) + (a - b - c + d) * e(fx) * e(fy);
}
const mix = (h1, h2, t) => {
  const p = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return '#' + [0, 1, 2].map((i) => Math.round(p(h1, i) + (p(h2, i) - p(h1, i)) * t).toString(16).padStart(2, '0')).join('');
};
// Borde festoneado (como en la referencia): ondas suaves de 10 a 18 px.
const scallop = (t, seed, amp) => Math.round(amp * Math.abs(Math.sin(t / (11 + (seed % 5)) + seed)) + smooth(t, 0, 7, seed) * 2);

// Columnas de una pared: ancho variable y un escalón a una altura propia.
function columnPlan(len, seed) {
  const r = rng(seed), cols = [];
  for (let x = 0; x < len;) { const w = 8 + Math.floor(r() * 12); cols.push({ x, w, step: 12 + Math.floor(r() * 22), tone: r() }); x += w; }
  const at = new Int32Array(len);
  cols.forEach((c, i) => { for (let x = c.x; x < c.x + c.w && x < len; x++) at[x] = i; });
  return { cols, at };
}

// Píxel de una pared vista de frente. k = profundidad desde el borde de arriba (0 = canto), F = alto.
function facePixel(x, k, F, col) {
  const u = (x - col.x) / col.w;
  if (u < 0.1 || (hash(x, Math.floor(k / 5), 3) > 0.94 && u > 0.25 && u < 0.8)) return K.crevice;
  if (k <= 1) return k === 0 ? K.capTop : K.capEdge;
  if (k === col.step) return K.crevice;
  if (k === col.step + 1) return K.ledge;
  const c = u < 0.36 ? K.faceHi : u < 0.72 ? K.face : col.tone > 0.5 ? K.faceLo : K.faceDeep;
  const low = Math.max(0, (k - F * 0.7) / (F * 0.3)); // al pie de la pared hay menos luz
  return low > 0 ? mix(c, K.faceDeep, low * 0.6) : c;
}

// ¿Este color del mapa es cielo? (violeta muy oscuro; las estrellas cuentan como cielo)
function isSkyColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return (r < 70 && g < 45 && b < 100 && b > r) || (r > 170 && g > 170 && b > 190);
}

/**
 * Píxeles del borde para un mapa de W × H (en píxeles de arte = unidades).
 * Devuelve { w, h, ox, oy, px, floorTop } donde px[i] es '#rrggbb' o null (ahí se ve el mapa)
 * y ox, oy es dónde queda la esquina (0, 0) del mapa dentro del cuadro.
 * ground(x, y): opcional, color del mapa; se usa para tapar la franja de cielo que trae el dibujo arriba.
 */
export function cliffCells(W, H, { seed = 5, ground = null } = {}) {
  const { mx, mt, mb, wall: F, side: S, outer, outerWall: OF } = CLIFF;
  const w = W + mx * 2, h = H + mt + mb, ox = mx, oy = mt;
  const px = new Array(w * h).fill(null);
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < w && y < h) px[y * w + x] = c; };

  // 1) Fondo de la hondonada (lo que se ve del mapa). Arriba tapa la franja de cielo del dibujo.
  const sky = new Int32Array(W);
  if (ground) for (let x = 0; x < W; x++) {
    let y = 0;
    while (y < 40 && (isSkyColor(ground(x, y)) || (y + 1 < 40 && isSkyColor(ground(x, y + 1)) && y > 0))) y++;
    sky[x] = y;
  }
  const floorTop = new Int32Array(W); // primera fila del fondo, por columna (coordenadas del mapa)
  for (let x = 0; x < W; x++) {
    let m = 0;
    for (let d = -5; d <= 5; d++) { const xx = x + d; if (xx >= 0 && xx < W) m = Math.max(m, sky[xx]); }
    floorTop[x] = (m > 0 ? m + 2 : 0) + scallop(x, seed + 1, 3);
  }
  const R = 22; // esquinas redondeadas
  const inBasin = (mxx, my) => {
    if (mxx < 0 || mxx >= W || my < 0 || my >= H) return false;
    const left = scallop(my, seed + 2, 3), right = W - scallop(my, seed + 3, 3), bottom = H - scallop(mxx, seed + 4, 5);
    if (mxx < left || mxx >= right || my < floorTop[mxx] || my >= bottom) return false;
    const cx = mxx < left + R ? left + R : mxx >= right - R ? right - R : null;
    if (cx === null) return true;
    const top = floorTop[mxx];
    if (my > bottom - R) return Math.hypot(mxx - cx, my - (bottom - R)) <= R;
    if (my < top + R) return Math.hypot(mxx - cx, my - (top + R)) <= R + 2;
    return true;
  };
  const basin = new Uint8Array(w * h);
  for (let y = oy; y < oy + H; y++) for (let x = ox; x < ox + W; x++) if (inBasin(x - ox, y - oy)) basin[y * w + x] = 1;
  const B = (x, y) => x >= 0 && y >= 0 && x < w && y < h && basin[y * w + x] === 1;

  // 2) Clasificar cada píxel fuera del fondo: pared del fondo (de frente), paredes de los costados o meseta.
  const wallH = new Int32Array(w);
  for (let x = 0; x < w; x++) wallH[x] = F + scallop(x, seed + 9, 7);
  const kind = new Uint8Array(w * h); // 0 meseta, 1 fondo, 2 pared de frente, 3 pared izquierda, 4 pared derecha
  const depth = new Int16Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (basin[i]) { kind[i] = 1; continue; }
    const Fx = wallH[x]; // alto de la pared en esta columna (el canto de arriba hace lóbulos)
    let k = 0; // ¿hay fondo justo debajo, a menos de Fx? → es la pared que sube desde el fondo
    for (let d = 1; d <= Fx; d++) if (B(x, y + d)) { k = d; break; }
    if (k) { kind[i] = 2; depth[i] = Fx - k; continue; }
    let dl = 0, dr = 0;
    for (let d = 1; d <= S; d++) { if (!dl && B(x + d, y)) dl = d; if (!dr && B(x - d, y)) dr = d; }
    if (dl) { kind[i] = 3; depth[i] = dl; } else if (dr) { kind[i] = 4; depth[i] = dr; }
  }
  const KD = (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? kind[y * w + x] : 0);

  // Borde de afuera: la meseta cae de nuevo al frente (abajo del todo).
  const outerY = (x) => oy + H + outer + scallop(x, seed + 6, 5);

  // 3) Pintar.
  const top = columnPlan(w, seed + 7), front = columnPlan(w, seed + 8), sideCols = columnPlan(h + S, seed + 10);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, kd = kind[i];
    if (kd === 1) continue; // el mapa
    const oyEdge = outerY(x);
    if (y >= oyEdge) { // barranco del frente y abismo
      const k = y - oyEdge;
      if (k <= OF) {
        const c = facePixel(x, k, OF, front.cols[front.at[x]]);
        const fade = Math.max(0, (k - OF * 0.45) / (OF * 0.55));
        set(x, y, fade > 0 ? mix(c, K.abyss, Math.min(0.92, fade)) : c);
      } else set(x, y, hash(x >> 1, y >> 1, 7) > 0.93 ? K.abyss : K.abyssDeep);
      continue;
    }
    if (kd === 2) { set(x, y, facePixel(x, depth[i], wallH[x], top.cols[top.at[x]])); continue; }
    if (kd === 3 || kd === 4) {
      // costados: la pared se ve de lado, con columnas que bajan en diagonal desde el canto hasta el pie;
      // la luz viene de la izquierda (la pared derecha se ve más clara)
      const d = depth[i], lit = kd === 4, v = y + Math.round(d * 0.6);
      const col = sideCols.cols[sideCols.at[((v % sideCols.at.length) + sideCols.at.length) % sideCols.at.length]];
      const p = (v - col.x) / col.w;
      let c;
      if (d >= S - 1) c = d === S ? K.capTop : K.capEdge; // canto de arriba
      else if (p < 0.14) c = K.crevice;
      else if (d === col.step % (S - 4) + 3) c = K.crevice; // quiebre entre bloques
      else if (d === col.step % (S - 4) + 4) c = K.ledge;
      else c = p < 0.45 ? (lit ? K.faceHi : K.face) : p < 0.8 ? (lit ? K.face : K.faceLo) : K.faceDeep;
      if (d <= 3) c = mix(c, K.faceDeep, 0.55 - d * 0.1); // al pie, sombra
      set(x, y, c);
      continue;
    }
    // meseta: suelo con manchas, con labio claro donde empieza una pared y sombra al borde del fondo
    let c;
    const n = smooth(x, y, 15, 21) * 0.75 + smooth(x, y, 5, 23) * 0.25, m = smooth(x, y, 7, 22);
    c = n > 0.64 ? K.groundLo : n < 0.3 ? K.groundWarm : K.ground;
    if (m > 0.86 && n <= 0.64) c = K.groundHi;
    if (hash(x, y, 31) > 0.997) c = K.pebble;
    const below = KD(x, y + 1), below2 = KD(x, y + 2);
    if (below === 2 || below2 === 2 || KD(x - 1, y) === 4 || KD(x + 1, y) === 3 || KD(x - 2, y) === 4 || KD(x + 2, y) === 3) c = K.rim;
    else if (KD(x, y - 1) === 1) c = K.rimDark; // borde de abajo del fondo: línea de sombra
    else if (KD(x, y - 2) === 1 || KD(x, y - 3) === 1 || KD(x, y - 4) === 1) c = K.rim; // y el labio de la meseta de enfrente
    else if (KD(x, y - 5) === 1) c = mix(K.rim, c, 0.5);
    if (y >= oyEdge - 2) c = K.rim; // labio del barranco del frente
    set(x, y, c);
  }

  // 4) Rocas redondeadas sobre la meseta, en grupos (una grande con piedras alrededor) y sueltas.
  const r = rng(seed + 11), rocks = [];
  const free = (cx, cy, rad) => {
    for (let yy = cy - rad - 3; yy <= cy + 4; yy += 2) for (let xx = cx - rad - 3; xx <= cx + rad + 3; xx += 2) {
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) return false;
      if (KD(xx, yy) !== 0 || yy >= outerY(xx) - 4) return false;
    }
    return !rocks.some((o) => Math.abs(o.y - cy) < (o.rad + rad) * 0.7 && Math.abs(o.x - cx) < o.rad + rad + 1);
  };
  let groups = 0;
  for (let tries = 0; tries < 900 && groups < 26; tries++) {
    const cx = Math.floor(r() * w), cy = Math.floor(r() * h), rad = 8 + Math.floor(r() * 9);
    if (!free(cx, cy, rad)) continue;
    rocks.push({ x: cx, y: cy, rad }); groups++;
    const n = 1 + Math.floor(r() * 4);
    for (let j = 0; j < n; j++) {
      const a = r() * Math.PI * 2, dist = rad + 3 + r() * 8, sr = 2 + Math.floor(r() * 4);
      const sx = Math.round(cx + Math.cos(a) * dist), sy = Math.round(cy + Math.sin(a) * dist * 0.6);
      if (free(sx, sy, sr)) rocks.push({ x: sx, y: sy, rad: sr });
    }
  }
  for (let tries = 0; tries < 400; tries++) {
    const cx = Math.floor(r() * w), cy = Math.floor(r() * h), rad = 2 + Math.floor(r() * 3);
    if (free(cx, cy, rad)) rocks.push({ x: cx, y: cy, rad });
    if (rocks.length > 150) break;
  }
  rocks.sort((a, b) => a.y - b.y);
  for (const k of rocks) {
    const rw = k.rad, rh = Math.max(3, Math.round(k.rad * (k.rad >= 7 ? 1.25 : 1))), top0 = k.y - rh, big = rw >= 7;
    // sombra hacia abajo a la derecha
    const sh = Math.max(1, Math.round(rw * 0.32));
    for (let yy = -1; yy <= sh; yy++) for (let xx = -rw + 1; xx <= rw + 4; xx++) {
      if (((xx - 3) / (rw + 1)) ** 2 + (yy / (sh + 0.5)) ** 2 <= 1) set(k.x + xx, k.y + yy, K.shadow);
    }
    const capH = Math.max(1, Math.round(rh * 0.3));
    for (let yy = top0; yy <= k.y; yy++) {
      const t = (yy - top0) / rh; // 0 arriba, 1 abajo
      // silueta de domo: angosta arriba, se ensancha rápido y baja casi recta
      const half = Math.max(1, Math.round(rw * Math.sqrt(Math.max(0, 1 - (1 - Math.min(1, t * 1.15)) ** 2))));
      for (let xx = -half; xx <= half; xx++) {
        const u = (xx + half) / (half * 2); // 0 izquierda, 1 derecha
        let c;
        // luz desde arriba a la izquierda sobre una superficie redonda
        const nx = xx / (rw + 0.5), ny = 1 - t, light = -nx * 0.7 + ny * 0.9 + (hash(k.x + xx, yy, 13) - 0.5) * 0.35;
        if (Math.abs(xx) === half || yy === k.y || yy === top0) c = K.rockLine;
        else if (light > 0.75) c = K.rockTop;
        else if (light > 0.35) c = K.rockHi;
        else if (light > -0.05) c = K.rock;
        else c = K.rockLo;
        if (big && t > 0.45 && hash(k.x * 7 + xx, yy, 14) > 0.93) c = K.rockLine; // poros y grietas
        set(k.x + xx, yy, c);
      }
    }
  }
  return { w, h, ox, oy, px, floorTop };
}

// Dibuja el borde en un canvas (cada píxel de arte = CLIFF_PX × CLIFF_PX). Donde se ve el mapa queda transparente.
export function cliffCanvas(doc, W, H, opts) {
  const c = cliffCells(W, H, opts), k = CLIFF_PX;
  const cv = doc.createElement('canvas');
  cv.width = c.w * k; cv.height = c.h * k;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(cv.width, cv.height), cache = new Map();
  const rgb = (hex) => { let v = cache.get(hex); if (!v) { v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); cache.set(hex, v); } return v; };
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
    const hex = c.px[y * c.w + x];
    if (!hex) continue;
    const [r, g, b] = rgb(hex);
    for (let j = 0; j < k; j++) {
      let o = ((y * k + j) * cv.width + x * k) * 4;
      for (let i = 0; i < k; i++, o += 4) { img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255; }
    }
  }
  ctx.putImageData(img, 0, 0);
  return { canvas: cv, ox: c.ox * k, oy: c.oy * k };
}

// Lee la imagen del mapa (reducida a 1 px por unidad) y devuelve ground(x, y) para cliffCells.
export function mapSampler(doc, image, W, H) {
  const cv = doc.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data;
  const hex = (v) => v.toString(16).padStart(2, '0');
  return (x, y) => { const o = (y * W + x) * 4; return '#' + hex(d[o]) + hex(d[o + 1]) + hex(d[o + 2]); };
}
