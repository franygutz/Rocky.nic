// Puertas animadas, como en los Zelda: la puerta se abre, el personaje la cruza caminando y la puerta se cierra detrás.
// Cada puerta con `fx` en scenes.js ({ box, dir, kind }) se dibuja encima del arte original mientras dura la animación.
//   box  = [x0, y0, x1, y1] del hueco de la puerta, en unidades del mapa
//   dir  = hacia dónde se camina para cruzarla ('up' | 'down' | 'left' | 'right')
//   kind = 'double' (dos hojas que se separan) | 'single' (una hoja que sube)
import { U, dist } from '../world/scenes.js';

const VEC = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const LEAF = 0x9aa3c9, LEAF_HI = 0xc9d0ee, LEAF_LO = 0x6c7399, EDGE = 0x27234c, HOLE = 0x14122a;

export const doorCenter = (fx) => ({ x: (fx.box[0] + fx.box[2]) / 2, y: (fx.box[1] + fx.box[3]) / 2 });

// La puerta (con animación) más cercana a un punto de la escena.
export function doorNear(cfg, x, y, maxD = 40) {
  let best = null, bd = maxD;
  for (const d of cfg.doors || []) {
    if (!d.fx) continue;
    const dd = dist({ x, y }, { x: d.anchor[0], y: d.anchor[1] });
    if (dd < bd) { best = d; bd = dd; }
  }
  return best;
}

function paint(scene, fx, o) {
  const g = scene.doorGfx;
  g.clear();
  if (o <= 0.001) return;
  const [x0, y0, x1, y1] = fx.box.map((n) => n * U), w = x1 - x0, h = y1 - y0;
  g.setDepth(y1 + 1);
  g.fillStyle(HOLE, 1).fillRect(x0, y0, w, h); // el hueco oscuro
  g.fillStyle(0x3a3470, 0.8).fillRect(x0, y0, w, Math.max(2, h * 0.08)); // sombra del dintel
  const leaf = (lx, ly, lw, lh) => {
    if (lw < 1 || lh < 1) return;
    g.fillStyle(LEAF, 1).fillRect(lx, ly, lw, lh);
    g.fillStyle(LEAF_HI, 1).fillRect(lx, ly, lw, Math.max(2, lh * 0.07));
    g.fillStyle(LEAF_LO, 1).fillRect(lx, ly + lh - Math.max(2, lh * 0.07), lw, Math.max(2, lh * 0.07));
    g.lineStyle(2, EDGE, 1).strokeRect(lx, ly, lw, lh);
  };
  const shut = 1 - o;
  if (fx.kind === 'single') leaf(x0, y0, w, h * shut); // la hoja sube
  else { const lw = (w / 2) * shut; leaf(x0, y0, lw, h); leaf(x1 - lw, y0, lw, h); } // las hojas se separan
}

const tween = (scene, from, to, ms, onUpdate, ease = 'Sine.easeInOut') => new Promise((res) => {
  scene.tweens.addCounter({ from, to, duration: ms, ease, onUpdate: (t) => onUpdate(t.getValue()), onComplete: res });
});

function face(scene, dir) {
  if (dir === 'up') scene.pose = 'back';
  else if (dir === 'down') scene.pose = 'front';
  else { scene.pose = scene.helmet ? 'side' : (dir === 'left' ? 'front' : 'front'); scene.facing = dir === 'left' ? -1 : 1; }
}

// Salir: se abre la puerta, el personaje camina hacia adentro y desaparece, la puerta se cierra.
export async function exitThrough(scene, door, sfx) {
  const fx = door.fx, v = VEC[fx.dir], c = doorCenter(fx);
  scene.cut = true; scene.route = []; scene.cutMoving = false;
  const from = { x: scene.pos.x, y: scene.pos.y };
  fx.o = 0;
  sfx?.door();
  await tween(scene, 0, 1, 230, (o) => paint(scene, fx, o), 'Sine.easeOut');
  // camina hasta el hueco y un paso más adentro
  const target = { x: c.x + v[0] * 3, y: c.y + v[1] * 3 };
  const d = Math.hypot(target.x - from.x, target.y - from.y);
  face(scene, fx.dir);
  scene.cutMoving = true;
  scene.tweens.add({ targets: [scene.hero, scene.shadow], alpha: 0, duration: 200, delay: Math.max(120, d * 6 + 160), ease: 'Sine.easeIn' });
  await tween(scene, 0, 1, Math.max(300, d * 9 + 260), (p) => { scene.pos = { x: from.x + (target.x - from.x) * p, y: from.y + (target.y - from.y) * p }; }, 'Sine.easeInOut');
  scene.cutMoving = false;
  await tween(scene, 1, 0, 210, (o) => paint(scene, fx, o), 'Sine.easeIn');
  fx.o = 0;
}

// Entrar: la puerta ya está abierta, el personaje sale caminando y la puerta se cierra detrás.
export async function enterFrom(scene, door, x, y) {
  const fx = door.fx, v = VEC[fx.dir], c = doorCenter(fx);
  scene.cut = true; scene.cutMoving = false;
  const start = { x: c.x, y: c.y };
  scene.pos = { ...start };
  scene.hero.setAlpha(0); scene.shadow.setAlpha(0);
  face(scene, { up: 'down', down: 'up', left: 'right', right: 'left' }[fx.dir]); // sale en sentido contrario al de la entrada
  fx.o = 1; paint(scene, fx, 1);
  await new Promise((r) => scene.time.delayedCall(240, r));
  scene.cutMoving = true;
  scene.tweens.add({ targets: scene.hero, alpha: 1, duration: 160 });
  scene.tweens.add({ targets: scene.shadow, alpha: 0.35, duration: 160 });
  const out = { x, y };
  const d = Math.hypot(out.x - start.x, out.y - start.y);
  await tween(scene, 0, 1, Math.max(320, d * 9 + 220), (p) => { scene.pos = { x: start.x + (out.x - start.x) * p, y: start.y + (out.y - start.y) * p }; }, 'Sine.easeOut');
  scene.cutMoving = false;
  scene.cut = false;
  await tween(scene, 1, 0, 230, (o) => paint(scene, fx, o), 'Sine.easeIn');
  fx.o = 0;
}
