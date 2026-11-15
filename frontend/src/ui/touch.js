// Controles táctiles: cruceta y botón de acción. Solo aparecen en pantallas táctiles (o con ?touch).
import { session } from '../bus.js';
import { bus } from '../bus.js';
import { t, lang } from '../i18n/index.js';

export function setupTouch(root) {
  const coarse = matchMedia('(pointer: coarse)').matches || /[?&]touch\b/.test(location.search);
  if (!coarse || !root) return;
  const dirs = { up: [0, -1, '▲'], down: [0, 1, '▼'], left: [-1, 0, '◀'], right: [1, 0, '▶'] };
  const build = () => {
    const names = { up: t('padUp'), down: t('padDown'), left: t('padLeft'), right: t('padRight') };
    root.innerHTML = `<div class="pad" role="group" aria-label="${t('padMove')}">${Object.entries(dirs).map(([k, d]) => `<button class="pad-${k}" data-dir="${k}" aria-label="${names[k]}">${d[2]}</button>`).join('')}</div>`;
  };
  let builtLang = lang();
  build();
  const held = new Set();
  const update = () => {
    let x = 0, y = 0;
    for (const k of held) { x += dirs[k][0]; y += dirs[k][1]; }
    session.joy = x || y ? { x, y } : null;
  };
  root.addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-dir]'); if (!b) return; e.preventDefault(); held.add(b.dataset.dir); update(); b.setPointerCapture?.(e.pointerId); });
  const up = (e) => { const b = e.target.closest('[data-dir]'); if (b) held.delete(b.dataset.dir); else held.clear(); update(); };
  root.addEventListener('pointerup', up);
  root.addEventListener('pointercancel', () => { held.clear(); update(); });
  bus.on('view', () => { if (builtLang !== lang()) { builtLang = lang(); build(); } });
  bus.on('modeChange', (m) => { root.hidden = m !== 'map'; if (m !== 'map') { held.clear(); update(); } });
  root.hidden = false;
}
