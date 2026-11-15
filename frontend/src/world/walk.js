// Caminata de FRENTE y de ESPALDAS (al subir y bajar), con los pasos visibles.
// Parte del sprite frontal del kit (32 × 46 px) y lo anima con el ritmo lunar: apoyo, impulso, vuelo con los dos pies en el aire
// (g = 1,62 m/s²: el vuelo dura más y el cuerpo sube más que en la Tierra), apoyo del otro pie, y los brazos al contrario de las piernas.
export const WALK_FRAMES = 8;
export const STAND_FRAME = 8;       // noveno cuadro: de pie, sin rebote
export const WALK_FPS = 4;          // ciclo de 2 s a ritmo 1×; se acelera con la velocidad igual que el perfil
export const WALK_W = 36, WALK_H = 54;   // margen de 2 px a los lados y 8 arriba para el vuelo
export const WALK_OX = 18, WALK_OY = 54; // ancla: centro del cuerpo, suela en la última fila
export const WALK_V = 1.05;              // m/s del trote de referencia (el mismo del perfil)

// dy positivo = hacia arriba. b = cuerpo, L/R = pierna izquierda/derecha levantada, aL/aR = brazos, sx = balanceo lateral
const POSES = [
  { b: -1, L: 0, R: 3, aL: 2, aR: -2, sx: -1 },  // apoyo pie izquierdo
  { b: 2, L: 0, R: 2, aL: 1, aR: -1, sx: -1 },   // impulso
  { b: 5, L: 2, R: 3, aL: 0, aR: 0, sx: 0 },     // vuelo (los dos pies en el aire)
  { b: 2, L: 1, R: 0, aL: -1, aR: 1, sx: 1 },    // se prepara el apoyo derecho
  { b: -1, L: 3, R: 0, aL: -2, aR: 2, sx: 1 },   // apoyo pie derecho
  { b: 2, L: 2, R: 0, aL: -1, aR: 1, sx: 1 },
  { b: 5, L: 3, R: 2, aL: 0, aR: 0, sx: 0 },
  { b: 2, L: 0, R: 1, aL: 1, aR: -1, sx: -1 }
];

function copy(dst, src, sx, sy, sw, sh, dx, dy) {
  for (let j = 0; j < sh; j++) for (let i = 0; i < sw; i++) {
    const X = sx + i, Y = sy + j, tx = dx + i, ty = dy + j;
    if (X < 0 || X >= 32 || Y < 0 || Y >= 46 || tx < 0 || tx >= WALK_W || ty < 0 || ty >= WALK_H) continue;
    const s = (Y * 32 + X) * 4;
    if (src.data[s + 3] < 128) continue;
    const d = (ty * WALK_W + tx) * 4;
    dst.data[d] = src.data[s]; dst.data[d + 1] = src.data[s + 1]; dst.data[d + 2] = src.data[s + 2]; dst.data[d + 3] = 255;
  }
}

// img: imagen 32 × 46 del avatar (de frente o de espaldas). Devuelve el canvas con las 8 poses en fila.
export function buildWalkSheet(img) {
  const base = document.createElement('canvas'); base.width = 32; base.height = 46;
  const bx = base.getContext('2d'); bx.drawImage(img, 0, 0, 32, 46);
  const src = bx.getImageData(0, 0, 32, 46);
  const sheet = document.createElement('canvas'); sheet.width = WALK_W * (WALK_FRAMES + 1); sheet.height = WALK_H;
  const sx = sheet.getContext('2d');
  const GROUND = 8 + 46; // fila de la suela
  [...POSES, { b: 0, L: 0, R: 0, aL: 0, aR: 0, sx: 0 }].forEach((p, k) => {
    const f = sx.createImageData(WALK_W, WALK_H);
    const ox = 2 + p.sx, top = 8;
    // piernas (filas 38–45): la que se levanta sube; la otra queda en el suelo
    copy(f, src, 0, 38, 16, 8, ox, GROUND - 8 - p.L);
    copy(f, src, 16, 38, 16, 8, ox + 16, GROUND - 8 - p.R);
    // torso y cabeza (sin brazos), con el rebote del paso
    copy(f, src, 10, 0, 12, 38, ox + 10, top - p.b + 0);
    copy(f, src, 0, 0, 10, 26, ox, top - p.b);
    copy(f, src, 22, 0, 10, 26, ox + 22, top - p.b);
    // brazos al revés de las piernas
    copy(f, src, 0, 26, 10, 12, ox, top + 26 - p.b - p.aL);
    copy(f, src, 22, 26, 10, 12, ox + 22, top + 26 - p.b - p.aR);
    sx.putImageData(f, k * WALK_W, 0);
  });
  return sheet;
}
