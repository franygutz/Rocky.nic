// Ruta por la cuadrícula del escenario (A*): sirve para tocar un destino y para que la guía te lleve.
import { SCENES, walkable, safeSpot } from './scenes.js';

const CELL = 4;
export function findPath(sceneId, from, to) {
  const s = SCENES[sceneId];
  const gx = (x) => Math.round(x / CELL), gy = (y) => Math.round(y / CELL);
  const cols = Math.ceil(s.w / CELL) + 1, rows = Math.ceil(s.h / CELL) + 1;
  const ok = (cx, cy) => cx >= 0 && cy >= 0 && cx < cols && cy < rows && walkable(sceneId, cx * CELL, cy * CELL);
  const goalPt = safeSpot(sceneId, to.x, to.y);
  // La cuadrícula es de 4 unidades: si la celda más cercana cae sobre un borde, se busca otra vecina libre.
  const snap = (x, y) => {
    const cx = gx(x), cy = gy(y);
    for (let r = 0; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && ok(cx + dx, cy + dy)) return [cx + dx, cy + dy];
    return null;
  };
  const start = snap(from.x, from.y), goal = snap(goalPt.x, goalPt.y);
  if (!start || !goal) return [];
  const key = (x, y) => y * cols + x;
  const g = new Map([[key(...start), 0]]), prev = new Map(), open = [[0, ...start]];
  const h = (x, y) => Math.hypot(x - goal[0], y - goal[1]);
  let guard = 0;
  while (open.length && guard++ < 20000) {
    open.sort((a, b) => a[0] - b[0]);
    const [, cx, cy] = open.shift();
    if (cx === goal[0] && cy === goal[1]) {
      const out = [];
      let k = key(cx, cy);
      while (k !== undefined && k !== key(...start)) { out.push({ x: (k % cols) * CELL, y: Math.floor(k / cols) * CELL }); k = prev.get(k); }
      out.reverse();
      if (out.length) out[out.length - 1] = goalPt;
      return out;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (!ok(nx, ny)) continue;
      if (dx && dy && (!ok(cx + dx, cy) || !ok(cx, cy + dy))) continue; // no cortar esquinas
      const ng = g.get(key(cx, cy)) + Math.hypot(dx, dy);
      if (ng < (g.get(key(nx, ny)) ?? Infinity)) { g.set(key(nx, ny), ng); prev.set(key(nx, ny), key(cx, cy)); open.push([ng + h(nx, ny), nx, ny]); }
    }
  }
  return [];
}
