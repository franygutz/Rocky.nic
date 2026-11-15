// Kita, la mascota alienígena. Reacciona a la partida con las animaciones del kit de diseño
// (sprite sheets de 6 cuadros, 344 × 280 px cada uno). No acompaña al jugador: vive en una esquina del HUD.
//
// Estados y prioridades (el mayor gana; un aviso crítico desplaza a una reacción secundaria):
//   100 crítico   (loop)  recurso por debajo del umbral → "error"
//    60 reacción  (una vez) éxito, fallo, trofeo, novedad, entrega, guardado
//    40 sin señal (loop)  la Tierra no responde → "sin_conexion"
//    30 pausa     (loop)  "dormido"
//    10 trabajando(loop)  mientras hay un puzzle → "programa_tableta"
//     0 reposo    (loop)  "pensando"
export const CLIPS = {
  idle: { file: 'pensando', p: 0 },
  working: { file: 'programa_tableta', p: 10 },
  sleep: { file: 'dormido', p: 30 },
  offline: { file: 'sin_conexion', p: 40 },
  alert: { file: 'error', p: 100 },
  success: { file: 'yupi', p: 60, ms: 2400 },
  trophy: { file: 'gana_trofeo', p: 60, ms: 3200 },
  fail: { file: 'ups', p: 60, ms: 2400 },
  news: { file: 'novedades', p: 60, ms: 2400 },
  delivery: { file: 'choca_cinco', p: 60, ms: 2400 },
  saved: { file: 'guardado', p: 55, ms: 1700 },
  hello: { file: 'guino', p: 55, ms: 2000 }
};
export const CRITICAL_BELOW = 20;
const CRITICAL_KEYS = ['oxygen', 'water', 'energy', 'food', 'health'];
const OFFLINE_STATUSES = ['sin_respuesta', 'aislamiento', 'rescate_retrasado'];

// Función pura: qué estado base corresponde a la partida (se prueba sin DOM).
export function baseClip({ view, paused = false, working = false } = {}) {
  if (view?.metrics && CRITICAL_KEYS.some((k) => view.metrics[k] < CRITICAL_BELOW)) return 'alert';
  if (view?.statuses?.some((s) => OFFLINE_STATUSES.includes(s))) return 'offline';
  if (paused) return 'sleep';
  if (working) return 'working';
  return 'idle';
}

export function createKita(root, { reducedMotion = () => false } = {}) {
  root.innerHTML = '<div class="spr" role="img" aria-label="Kita, la mascota"></div><span class="kita-tip" aria-live="polite"></span>';
  const spr = root.querySelector('.spr'), tip = root.querySelector('.kita-tip');
  let base = 'idle', temp = null, timer = null, current = null, disposed = false;
  const log = []; // para pruebas y depuración

  function show(name) {
    if (current === name || disposed) return;
    current = name;
    log.push(name);
    const c = CLIPS[name];
    spr.style.backgroundImage = `url(${import.meta.env.BASE_URL}assets/kita/${c.file}_spritesheet.png)`;
    spr.style.animation = 'none';
    void spr.offsetWidth; // reinicia la animación solo cuando cambia el clip
    spr.classList.toggle('still', reducedMotion());
    spr.style.animation = '';
    root.dataset.clip = name;
  }
  function resolve() {
    const b = CLIPS[base];
    const t = temp && CLIPS[temp];
    show(t && t.p >= b.p ? temp : base);
  }
  function setBase(state) {
    const next = baseClip(state);
    if (next === base) return;
    base = next;
    resolve();
  }
  // Reacción puntual: dura `ms`, no se apila y no desplaza a un aviso crítico.
  function react(name, text = '') {
    const c = CLIPS[name];
    if (!c || disposed) return;
    if (temp === name && timer) return; // evita repetir el mismo evento sin parar
    if (c.p < CLIPS[base].p) return; // un crítico manda
    if (temp && CLIPS[temp].p > c.p) return;
    clearTimeout(timer);
    temp = name;
    tip.textContent = text;
    root.classList.toggle('talk', !!text);
    resolve();
    timer = setTimeout(() => { temp = null; timer = null; tip.textContent = ''; root.classList.remove('talk'); resolve(); }, c.ms);
  }
  function dispose() { disposed = true; clearTimeout(timer); }
  resolve();
  return { setBase, react, dispose, get clip() { return current; }, log };
}
