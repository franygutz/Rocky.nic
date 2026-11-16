// Montañas alrededor del exterior: rocas en pixel art con los mismos colores que las rocas del mapa
// (cara superior clara, laterales violetas y verdosos, contorno oscuro). Se dibujan en código:
// un patrón que se repite sin costuras para todo lo que queda fuera del mapa y rocas sueltas para el borde.
// Funciones puras sobre un búfer de píxeles; el dibujo final en canvas lo hace drawToCanvas().

export const ROCK = {
  outline: '#2c2140', crevice: '#3a2c4d', creviceHi: '#4a3a5f',
  top: '#b9abb3', topHi: '#d2afbf', topLo: '#aa95b3',
  side: '#73618b', sideMid: '#5a4b74', sideDark: '#5d405a', sideDeep: '#423852',
  moss: '#676d77', mossDark: '#505e64'
};
export const ROCK_PX = 3; // un píxel de arte = 3 px del mapa (como el resto del exterior)

// Generador con semilla (mismo resultado en cada partida).
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

// Una roca con forma de bloque o pilar: cara superior elíptica y cuerpo que se ensancha un poco hacia abajo.
// Devuelve las celdas { x, y, c } relativas a (0, 0) = centro de la base.
export function rockCells(w, h, seed = 1) {
  const r = rng(seed), cells = new Map(), set = (x, y, c) => cells.set(x + ',' + y, { x, y, c });
  const capH = Math.max(4, Math.round(h * (0.26 + r() * 0.08)));
  const lean = (r() - 0.5) * 0.25, taper = 0.12 + r() * 0.12;
  const inside = (x, y) => {
    // y: 0 = base, -h = cima
    const t = -y / h; // 0 abajo, 1 arriba
    const half = (w / 2) * (1 - taper * t) ;
    const cx = lean * (h * t);
    if (y > 0 || y < -h) return null;
    const capCy = -h + capH / 2;
    const dx = (x + 0.5 - cx) / half;
    if (y < capCy) { const dy = (y + 0.5 - capCy) / (capH / 2); return dx * dx + dy * dy <= 1 ? 'cap' : null; }
    const bottomRound = y > -2 ? 1 - (y + 2) * 0.08 : 1; // esquinas de abajo un poco redondeadas
    if (Math.abs(dx) > bottomRound) return null;
    const dyc = (y + 0.5 - capCy) / (capH / 2);
    if (dyc < 1 && dx * dx + dyc * dyc <= 1) return 'cap';
    return 'body';
  };
  const W2 = Math.ceil(w / 2) + 3;
  for (let y = -h - 1; y <= 1; y++) {
    for (let x = -W2; x <= W2; x++) {
      const part = inside(x, y);
      if (!part) continue;
      const t = -y / h, half = (w / 2) * (1 - taper * t), cx = lean * h * t, u = (x + 0.5 - cx) / half; // u: -1 izquierda … 1 derecha
      let c;
      if (part === 'cap') {
        const capCy = -h + capH / 2, v = (y + 0.5 - capCy) / (capH / 2);
        c = v < -0.45 && u < 0.4 ? ROCK.topHi : v > 0.35 ? ROCK.topLo : ROCK.top;
      } else {
        const n = hash(x + seed * 7, Math.floor(y / 2));
        if (u < -0.35) c = ROCK.side;
        else if (u < 0.35) c = ROCK.sideMid;
        else c = n < 0.5 ? ROCK.sideDark : ROCK.sideDeep;
        // vetas verdosas en la parte baja (como en las rocas del mapa)
        if (t < 0.45 && n > 0.62) c = u < 0.2 ? ROCK.moss : ROCK.mossDark;
        // grietas verticales
        if (hash(Math.round(x * 0.7) + seed, 3) > 0.86 && t < 0.8 && Math.abs(u) < 0.8) c = ROCK.sideDeep;
      }
      set(x, y, c);
    }
  }
  // contorno de 1 píxel
  const out = [];
  for (const { x, y } of cells.values()) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = x + dx + ',' + (y + dy);
      if (!cells.has(k)) out.push({ x: x + dx, y: y + dy, c: ROCK.outline });
    }
  }
  return [...out, ...cells.values()];
}

// Patrón de montañas que se repite sin costuras (size × size píxeles de arte).
export function fieldCells(size = 96, seed = 7) {
  const r = rng(seed), px = new Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) px[y * size + x] = hash(x, y) > 0.82 ? ROCK.creviceHi : ROCK.crevice;
  const rocks = [];
  // tamaños variados (bloques grandes, medianos y piedras chicas) para que el patrón no se vea como una grilla
  for (let i = 0; i < 58; i++) {
    const big = r() < 0.35, w = big ? 22 + Math.floor(r() * 12) : 9 + Math.floor(r() * 12);
    rocks.push({ x: Math.floor(r() * size), y: Math.floor(r() * size), w, h: Math.max(7, Math.round(w * (0.6 + r() * 0.5))), s: i + seed });
  }
  rocks.sort((a, b) => a.y - b.y); // las de abajo tapan a las de arriba
  for (const k of rocks) {
    const cells = rockCells(k.w, k.h, k.s);
    for (const oy of [-size, 0, size]) for (const ox of [-size, 0, size]) {
      for (const c of cells) {
        const X = k.x + c.x + ox, Y = k.y + c.y + oy;
        if (X >= 0 && Y >= 0 && X < size && Y < size) px[Y * size + X] = c.c;
      }
    }
  }
  return { size, px };
}

const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// Dibuja celdas de arte en un canvas, cada píxel de arte como un bloque de k × k.
export function drawToCanvas(doc, width, height, paint, k = ROCK_PX) {
  const cv = doc.createElement('canvas');
  cv.width = width * k; cv.height = height * k;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(cv.width, cv.height);
  const put = (x, y, hex) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const [r, g, b] = rgb(hex);
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) {
      const o = ((y * k + j) * cv.width + (x * k + i)) * 4;
      img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255;
    }
  };
  paint(put);
  ctx.putImageData(img, 0, 0);
  return cv;
}

export function fieldCanvas(doc, size = 96, seed = 7) {
  const f = fieldCells(size, seed);
  return drawToCanvas(doc, size, size, (put) => { for (let i = 0; i < f.px.length; i++) put(i % size, Math.floor(i / size), f.px[i]); });
}

// Roca suelta para el borde: canvas + ancla (centro de la base).
export function rockCanvas(doc, w, h, seed) {
  const cells = rockCells(w, h, seed);
  const W = Math.ceil(w / 2) + 5, top = h + 3;
  const cv = drawToCanvas(doc, W * 2, top + 3, (put) => { for (const c of cells) put(c.x + W, c.y + top, c.c); });
  return { canvas: cv, ox: W * ROCK_PX, oy: top * ROCK_PX };
}

// Cielo con estrellas para lo que queda por encima del horizonte.
export function skyCanvas(doc, size = 64, seed = 3) {
  const r = rng(seed);
  return drawToCanvas(doc, size, size, (put) => {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) put(x, y, '#261038');
    for (let i = 0; i < 18; i++) put(Math.floor(r() * size), Math.floor(r() * size), r() > 0.7 ? '#FFFFFF' : '#C5D2FF');
  });
}

// Dónde va cada roca del borde (en px del mapa), con semilla: izquierda, derecha y abajo.
export function ridgePlan(W, H, seed = 11) {
  const r = rng(seed), out = [];
  const size = () => ({ w: 26 + Math.floor(r() * 18), h: 22 + Math.floor(r() * 16) });
  for (let y = 70; y < H + 60; y += 46 + Math.floor(r() * 26)) out.push({ edge: 'left', x: -36 + r() * 30, y: y + r() * 10, ...size(), seed: out.length + 1 });
  for (let y = 70; y < H + 60; y += 46 + Math.floor(r() * 26)) out.push({ edge: 'right', x: W + 36 - r() * 30, y: y + r() * 10, ...size(), seed: out.length + 1 });
  for (let x = -40; x < W + 60; x += 54 + Math.floor(r() * 30)) out.push({ edge: 'bottom', x: x + r() * 20, y: H + 48 + r() * 22, ...size(), seed: out.length + 1 });
  return out;
}
