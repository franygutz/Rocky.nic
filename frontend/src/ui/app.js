// Controlador de la interfaz: arma el recorrido de la partida con el puente del backend.
// menú → informe → mapa → reto → (minijuego) → resultado → [fin del día] → … → final
import { bus, session } from '../bus.js';
import { createBridge } from '../engine.js';
import { hasMinigame, minigameSeconds, suitFactor, isTired, randomCode, cleanCode, CATEGORY } from '../rules.js';
import { renderHud, renderDock, resetHud, setSuit } from './hud.js';
import { SCENES, OUTSIDE, placeOf, POINTS, nextHop } from '../world/scenes.js';
import { defaultAvatar, normalizeAvatar, PRESETS, CATEGORIES } from '../world/avatar.js';
import { createKita } from '../game/kita.js';
import { catalog } from '../engine.js';
import { setupTouch } from './touch.js';
import * as S from './screens.js';
import { openLuni, closeLuni, luniOpen, ask, clearLuni } from './luni.js';
import { TERM, esc } from './text.js';
import { sfx } from '../game/sfx.js';

const $ = (s) => document.querySelector(s);
const SETTINGS_KEY = 'vita-lunae-ajustes';
const ALBUM_KEY = 'vita-lunae-album';

let stack = []; // pantallas abiertas; la última es la visible
let codeError = '';
let confirmErase = false;
let lastRes = null; // último resultado del motor (para la pantalla de resultado)
let before = null; // vista antes de resolver
let hintText = '';
let hintsThisMission = 0;
let album = { endings: [], missions: 0 };
let returnFocus = null;
let draft = null; // astronauta en edición
let draftCat = 'skin';
let editing = false;
let kita = null;
let lastFill = null;
let fichaFact = null, fichaPoint = null;
// Qué dato de la NASA explica cada equipo (ids de backend/data/science-facts.json).
const FACT_OF = { comms: 'comms', radiation: 'radiation', life: 'oxygen', food: 'plant', energy: 'power' };
const rid = () => (crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-${Math.random().toString(36).slice(2)}`);

// ── Guardado propio del frontend (ajustes y álbum). La partida la guarda el backend. ──
const read = (k, def) => { try { return { ...def, ...JSON.parse(localStorage.getItem(k) || 'null') }; } catch { return def; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

const view = () => session.bridge.getView();

// ── Pantallas ──
function render() {
  const top = stack[stack.length - 1];
  const el = $('#screen');
  session.overlay = stack.length > 0;
  if (!top) { el.innerHTML = ''; el.className = ''; refresh(); try { returnFocus?.focus?.({ preventScroll: true }); } catch { /* nada */ } returnFocus = null; return; }
  if (!el.innerHTML && document.activeElement && document.activeElement !== document.body) returnFocus = document.activeElement; // para devolver el foco al cerrar
  el.className = top.cls || '';
  el.innerHTML = top.html();
  el.scrollTop = 0;
  const sheet = el.querySelector('.sheet');
  if (sheet) { sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); const h = sheet.querySelector('h1, h2'); if (h) { h.id = h.id || 'dlg-title'; sheet.setAttribute('aria-labelledby', h.id); } }
  refresh();
  (el.querySelector('[autofocus]') || el.querySelector('.btn.go, .opt, .btn'))?.focus({ preventScroll: true });
}
const open = (s) => { stack.push(s); render(); };
const replace = (s) => { stack = [s]; render(); };
const back = () => { stack.pop(); render(); };
const closeAll = () => { stack = []; render(); };
const topIs = (id) => stack[stack.length - 1]?.id === id;

const scr = {
  menu: () => ({ id: 'menu', cls: 'start', html: () => { const v = view(); return S.menuHTML({ canContinue: v.phase !== 'not_started', finished: v.phase === 'completed', day: v.day }); } }),
  code: () => ({ id: 'code', html: () => S.codeHTML(codeError) }),
  briefing: () => ({ id: 'briefing', html: () => S.briefingHTML(view()) }),
  mission: () => ({ id: 'mission', html: () => S.missionHTML(view(), { hint: hintText, factor: suitFactor(view().world?.suit, view().mission?.category) }) }),
  skip: () => ({ id: 'skip', html: () => S.skipConfirmHTML(view()) }),
  result: () => ({ id: 'result', html: () => S.resultHTML(lastRes, before, view()) }),
  day: () => ({ id: 'day', html: () => S.dayHTML(view(), daySummary()) }),
  weather: () => ({ id: 'weather', html: () => S.weatherHTML(view()) }),
  weatherResult: () => ({ id: 'weatherResult', html: () => S.weatherResultHTML(lastRes) }),
  ending: () => ({ id: 'ending', html: () => S.endingHTML(view()) }),
  repeat: () => ({ id: 'repeat', html: () => S.repeatHTML(view()) }),
  shop: () => ({ id: 'shop', html: () => S.shopHTML(view()) }),
  comms: () => ({ id: 'comms', html: () => S.commsHTML(view()) }),
  statuses: () => ({ id: 'statuses', html: () => S.statusesHTML(view()) }),
  album: () => ({ id: 'album', html: () => S.albumHTML(album) }),
  sources: () => ({ id: 'sources', html: () => S.sourcesHTML() }),
  glossary: () => ({ id: 'glossary', html: () => S.glossaryHTML() }),
  teachers: () => ({ id: 'teachers', html: () => S.teachersHTML(view()) }),
  settings: () => ({ id: 'settings', html: () => S.settingsHTML(session.settings, view().storage?.available !== false, confirmErase) }),
  pause: () => ({ id: 'pause', html: () => S.pauseHTML(view()) }),
  create: () => ({ id: 'create', cls: 'start', html: () => S.createHTML({ draft, cat: draftCat, editing }) }),
  bag: () => ({ id: 'bag', html: () => S.bagHTML(view()) }),
  diary: () => ({ id: 'diary', html: () => S.diaryHTML(view(), session.bridge.getState()) }),
  eva: () => ({ id: 'eva', html: () => S.evaHTML() }),
  tank: () => ({ id: 'tank', html: () => S.tankHTML(lastFill?.fill ?? 0, lastFill?.evaMax ?? 0) }),
  tankMenu: () => ({ id: 'tankMenu', html: () => tankMenuHTML() }),
  ficha: () => ({ id: 'ficha', html: () => S.fichaHTML(fichaFact, fichaPoint, view()) }),
  tankGate: () => ({ id: 'tankGate', html: () => tankMenuHTML(true) })
};

function tankMenuHTML(gate = false) {
  const v = view(), su = v.world?.suit || {};
  const loaded = !!su.loaded;
  return `<div class="sheet enter tank-card"><button class="btn small close" data-action="back" aria-label="Cerrar">✕</button>
    <h2>${gate ? 'La esclusa no abre' : 'Depósitos de soporte vital'}</h2>
    <p>${gate ? 'Para salir de Zora el traje necesita un <b>tanque lleno</b>. Cada salida usa uno: al volver, el tanque queda vacío.' : 'Aquí se llenan los tanques del traje. Cada llenado gasta <b>3 de oxígeno de la base</b>.'}</p>
    <div class="facts-grid">
      <div class="stat"><span>Tanque</span><b>${loaded ? `Lleno (${su.fill}%)` : 'Vacío'}</b></div>
      <div class="stat"><span>Aire para afuera</span><b>${loaded ? su.evaMax + ' s' : '—'}</b></div>
      <div class="stat"><span>Oxígeno de la base</span><b>${Math.round(v.metrics.oxygen)}</b></div>
    </div>
    <div class="list"><button class="btn go" data-action="fillTank" autofocus>${loaded ? 'Volver a llenar el tanque' : 'Llenar el tanque'}</button><button class="btn" data-action="back">Ahora no</button></div></div>`;
}

function refresh() {
  const v = session.view;
  renderHud(v);
  renderDock(v);
  measure();
  renderPrompt(lastPrompt);
  const touch = $('#touch');
  if (touch) touch.hidden = !(session.mode === 'map' && !session.overlay);
  const root = $('#kita');
  if (root) {
    const show = !!v && v.phase !== 'not_started' && !['menu', 'create', 'briefing', 'ending'].includes(session.mode);
    root.hidden = !show;
    kita?.setBase({ view: v, paused: topIs('pause'), working: session.mode === 'minigame' });
  }
}

// Mensajes de la Tierra que llegaron en el último día (para el resumen).
function daySummary() {
  const st = session.bridge.getState();
  const acks = (st?.events || []).filter((e) => e.type === 'COMMS_ACK' && e.turn > (before?.turn ?? 0) - 2)
    .map((e) => st.messages.find((m) => m.id === e.messageId)).filter(Boolean);
  return { acks };
}

// ── A dónde ir según el estado del motor ──
function route() {
  const v = view();
  hintText = '';
  if (v.phase === 'not_started') { toMenu(); return; }
  if (!normalizeAvatar(v.world?.avatar) && v.phase !== 'completed') { openCreator(false); return; }
  if (v.phase === 'completed') { recordEnding(v); session.mode = 'ending'; replace(scr.ending()); return; }
  if (v.scene === 'weather') { session.mode = 'weather'; sfx.alert(); replace(scr.weather()); return; }
  if (v.pendingChoice) { startMinigame(v.pendingChoice); return; } // se cerró a mitad de un minijuego
  session.mode = 'map';
  closeAll();
  placeWorld();
}

function toMenu() {
  session.mode = 'menu';
  closeLuni();
  replace(scr.menu());
}

function newGame(code) {
  clearLuni();
  session.bridge.newGame({ seed: code || randomCode() });
  resetHud();
  bus.emit('newGame');
  session.world = { scene: 'exterior', ...SCENES.exterior.spawn };
  openCreator(false);
}

// ── Creador de astronauta ──
function openCreator(isEditing) {
  editing = isEditing;
  draft = normalizeAvatar(view().world?.avatar) || defaultAvatar();
  draftCat = 'skin';
  session.mode = isEditing ? session.mode : 'create';
  isEditing ? open(scr.create()) : replace(scr.create());
}

// Lleva el mundo a donde quedó la partida guardada (escenario y posición seguros).
function placeWorld() {
  const w = view().world;
  const cur = session.world;
  let sc = w?.scene && SCENES[w.scene] ? w.scene : 'exterior';
  let pos = w?.pos || SCENES[sc].spawn;
  // Un guardado afuera sin tanque en uso no puede ser: se vuelve a la esclusa de Zora.
  if (OUTSIDE.has(sc) && !w?.suit?.outside && !view().world?.suit?.outside) { sc = 'zora'; pos = SCENES.zora.spawn; }
  if (!cur || cur.scene !== sc || Math.hypot((cur.x ?? 0) - pos.x, (cur.y ?? 0) - pos.y) > 40) bus.emit('teleport', { scene: sc, x: pos.x, y: pos.y });
  bus.emit('poseChanged');
}

// Guardado del mundo: solo en puntos relevantes, nunca por fotograma.
function saveWorld() {
  const v = session.view, w = session.world;
  if (!v || v.phase !== 'active' || !w || !session.bridge) return;
  try { session.bridge.checkpoint(w.scene, { x: w.x, y: w.y }); } catch { /* sin almacenamiento */ }
}

function recordEnding(v) {
  const id = v.ending?.endingId;
  if (!id || album.lastGame === v.gameId) return;
  album.lastGame = v.gameId;
  if (!album.endings.includes(id)) album.endings.push(id);
  album.missions = (album.missions || 0) + 1;
  write(ALBUM_KEY, album);
  id <= 7 ? sfx.win() : sfx.bad();
}

// ── Reto ──
function openMission() {
  const v = view();
  if (v.phase !== 'active' || !v.mission || v.scene !== 'mission') return;
  if (session.mission !== v.mission.id) { session.mission = v.mission.id; hintText = ''; hintsThisMission = 0; }
  session.mode = 'mission';
  sfx.alert();
  replace(scr.mission());
}

function choose(id) {
  const v = view();
  const opt = v.mission.options.find((o) => o.id === id);
  before = v;
  if (hasMinigame(opt)) {
    try { session.bridge.prepareMinigame(id); } catch (e) { return fail(e); }
    startMinigame(id);
  } else {
    let res;
    try { res = session.bridge.chooseCard(id); } catch (e) { return fail(e); }
    showResult(res);
  }
}

function startMinigame(id) {
  const v = view();
  before = before || v;
  const opt = v.mission.options.find((o) => o.id === id);
  session.mode = 'minigame';
  closeAll();
  bus.emit('playMinigame', {
    category: v.mission.category,
    seconds: minigameSeconds(v.mission.modifiers, suitFactor(v.world?.suit, v.mission.category)),
    tired: isTired(v.statuses),
    title: `${CATEGORY[v.mission.category]?.icon || ''} ${opt?.label || v.mission.name}`,
    hintsUsed: hintsThisMission,
    onDone: (perf) => {
      let res;
      try { res = session.bridge.finishMinigame(perf); } catch (e) { fail(e); route(); return; }
      showResult(res);
    }
  });
}

function showResult(res) {
  lastRes = res;
  session.mode = 'result';
  const st = res.result?.status;
  if (st === 'completed') { sfx.good(); kita?.react('success', '¡Reto superado!'); }
  else if (st === 'partial') kita?.react('hello', 'Salió a medias…');
  else if (st === 'failed' || st === 'missed') { sfx.bad(); kita?.react('fail', 'Ups… sigamos'); }
  saveWorld();
  replace(scr.result());
}

function afterResult() {
  const v = view();
  const dayChanged = before && v.daysCompleted > before.daysCompleted && v.phase === 'active';
  before = null;
  if (lastRes?.result?.status === 'completed') setTimeout(() => bus.emit('playAnim', { name: 'salto', rate: 1.15 }), 250);
  if (dayChanged) { session.mode = 'day'; kita?.react('trophy', '¡Día completo!'); replace(scr.day()); return; }
  route();
}

// ── Errores del motor, en palabras para el niño ──
const ERR = {
  INSUFFICIENT_COINS: 'No te alcanzan las monedas.',
  OUT_OF_STOCK: 'Ya no quedan de ese artículo.',
  INSUFFICIENT_ENERGY: 'No hay energía suficiente para mandar el mensaje.',
  WEATHER_RESPONSE_REQUIRED: 'Primero hay que responder la alerta de clima espacial.',
  GAME_FINISHED: 'La misión ya terminó.',
  INVALID_REPLAY_DAY: 'No se puede repetir ese día.',
  NO_ORDER_READY: 'Todavía no hay un pedido listo.',
  BAG_FULL: 'Tu bolsa está llena. Usa algo antes de recoger.',
  ITEM_NOT_IN_BAG: 'Ese objeto no está en tu bolsa.',
  INVALID_AVATAR: 'Ese astronauta no es válido. Revisa las opciones.',
  TANK_NOT_LOADED: 'Llena el tanque del traje antes de salir.',
  TANK_FILL_OUTSIDE: 'El tanque se llena adentro de Zora.',
  INSUFFICIENT_STATION_OXYGEN: 'La base casi no tiene oxígeno para llenar un tanque.'
};
function fail(e) {
  const code = String(e?.message || '').split(':')[0];
  toast(ERR[code] || 'Algo no salió. Probá otra vez.');
  sfx.bad();
}

// ── Acciones de botones ──
function onAction(a, el) {
  sfx.unlock();
  if (a !== 'choose') sfx.tap();
  const b = session.bridge;
  switch (a) {
    case 'new': newGame(); break;
    case 'continue': route(); break;
    case 'code': codeError = ''; open(scr.code()); break;
    case 'album': open(scr.album()); break;
    case 'sources': open(scr.sources()); break;
    case 'glossary': open(scr.glossary()); break;
    case 'teachers': open(scr.teachers()); break;
    case 'settings': confirmErase = false; open(scr.settings()); break;
    case 'back':
      back();
      if (!stack.length && session.mode === 'mission') session.mode = 'map';
      if (!stack.length && session.mode === 'menu') replace(scr.menu());
      if (!stack.length) refresh();
      break;
    case 'toMap': route(); break;
    case 'guide': session.settings.guide = true; bus.emit('walkToTarget'); toast('Te llevo hasta el equipo del reto.'); break;
    case 'act': bus.emit('act'); break;
    case 'guideClose': back(); bus.emit('walkToTarget'); break;
    case 'openMission': openMission(); break;
    case 'choose': sfx.tap(); choose(el.dataset.id); break;
    case 'hint': {
      const r = ask('¿Qué hago en este reto?', { hint: true });
      hintsThisMission++;
      hintText = r?.hint || r?.answer || '';
      render();
      break;
    }
    case 'skip': open(scr.skip()); break;
    case 'skipYes': {
      before = view();
      let res;
      try { res = b.skipCard(); } catch (e) { fail(e); break; }
      showResult(res);
      break;
    }
    case 'afterResult': afterResult(); break;
    case 'weather': {
      before = view();
      try { lastRes = b.respondWeather(el.dataset.choice); } catch (e) { fail(e); break; }
      session.mode = 'result';
      replace(scr.weatherResult());
      break;
    }
    case 'order':
      try { const r = b.order(el.dataset.id, { requestId: rid() }); sfx.coin(); toast(`Pedido confirmado: ${r.result.order.name.replace(/^\S+\s/, '')}. Llega en la nave de carga.`); kita?.react('saved', 'Pedido en camino'); saveWorld(); } catch (e) { fail(e); }
      render();
      break;
    case 'use':
      try { const r = b.useItem(el.dataset.id, { requestId: rid() }); sfx.good(); toast(`Usaste ${r.result.name.replace(/^\S+\s/, '')}.`); } catch (e) { fail(e); }
      render();
      break;
    case 'bag': open(scr.bag()); break;
    case 'diary': open(scr.diary()); break;
    case 'fillTank': back(); startTank(); break;
    case 'afterEva': route(); break;
    case 'editAvatar': openCreator(true); break;
    case 'tab': draftCat = el.dataset.k; render(); break;
    case 'pick': {
      const k = el.dataset.k, val = el.dataset.v;
      draft = { ...draft, [k]: k === 'accessory' || k === 'expression' ? val : Number(val) };
      render();
      break;
    }
    case 'randomAvatar': {
      const rnd = (n) => Math.floor(Math.random() * n);
      const name = draft.name;
      draft = { ...draft, ...Object.fromEntries(CATEGORIES.map((c) => [c.key, c.key === 'accessory' ? ['none', 'freckles', 'glasses', 'beard'][rnd(4)] : c.key === 'expression' ? ['neutral', 'happy', 'determined'][rnd(3)] : rnd(c.list.length)])), name };
      render();
      break;
    }
    case 'saveAvatar': {
      const a = normalizeAvatar(draft);
      if (!a) { toast('Ese astronauta no es válido.'); break; }
      try { b.setAvatar(a); } catch (e) { fail(e); break; }
      bus.emit('poseChanged');
      sfx.good();
      if (editing) { editing = false; back(); toast('Astronauta guardado.'); render(); }
      else { session.mode = 'briefing'; replace(scr.briefing()); }
      break;
    }
    case 'comms': open(scr.comms()); break;
    case 'send':
      try { b.sendMessage(el.dataset.type); sfx.message(); toast('Mensaje enviado a la Tierra.'); } catch (e) { fail(e); }
      render();
      break;
    case 'statuses': open(scr.statuses()); break;
    case 'luni': openLuni(); break;
    case 'closeLuni': closeLuni(); break;
    case 'luniAsk': ask(el.dataset.q); break;
    case 'setLang':
      try { b.setLanguage(el.dataset.lang); } catch (e) { fail(e); break; }
      if (!document.getElementById('drawer').hidden) clearLuni();
      render(); refresh();
      break;
    case 'pause': if (!topIs('pause')) { saveWorld(); open(scr.pause()); kita?.react('saved', t('rSaved')); } break;
    case 'repeatMenu': open(scr.repeat()); break;
    case 'repeat':
      try { b.repeatDay(Number(el.dataset.day)); toast(`Volviste al inicio del día ${el.dataset.day}.`); } catch (e) { fail(e); break; }
      before = null;
      route();
      break;
    case 'menu': saveWorld(); toMenu(); break;
    case 'set':
      session.settings[el.dataset.k] = el.dataset.v === 'true';
      write(SETTINGS_KEY, session.settings);
      applySettings();
      render();
      break;
    case 'erase': confirmErase = true; render(); break;
    case 'eraseNo': confirmErase = false; render(); break;
    case 'eraseYes':
      confirmErase = false;
      b.clearProgress();
      album = { endings: [], missions: 0 };
      try { localStorage.removeItem(ALBUM_KEY); } catch { /* nada */ }
      clearLuni();
      toast('Se borró tu progreso.');
      toMenu();
      break;
  }
}

function applySettings() {
  document.body.classList.toggle('reduced', !!session.settings.reducedMotion);
}

// ── Aviso breve ──
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ── Glosario al tocar ──
function showTerm(btn) {
  const g = TERM[btn.dataset.term];
  if (!g) return;
  const pop = $('#pop');
  pop.innerHTML = `<b>${esc(g.term)}</b>${esc(g.def)}`;
  pop.hidden = false;
  const r = btn.getBoundingClientRect();
  const w = pop.offsetWidth, h = pop.offsetHeight;
  const x = Math.min(window.innerWidth - w - 12, Math.max(12, r.left + r.width / 2 - w / 2));
  let y = r.bottom + 8;
  if (y + h > window.innerHeight - 12) y = r.top - h - 8;
  pop.style.left = x + 'px';
  pop.style.top = y + 'px';
}

// ── Márgenes del mapa ──
function measure() {
  const hud = $('#hud'), dock = $('#dock');
  const narrow = window.innerWidth < 900;
  const topEl = hud.querySelector('.vl-top'), rail = hud.querySelector('.vl-rail');
  const shown = !hud.hidden && topEl;
  // El mapa se encuadra en el espacio libre: debajo de la placa superior (y del riel en pantallas angostas), a la derecha del riel y arriba de la barra inferior.
  const top = shown ? Math.round((narrow && rail ? rail : topEl).getBoundingClientRect().bottom) + 6 : 0;
  const left = shown && !narrow && rail ? Math.round(rail.getBoundingClientRect().right) + 8 : 0;
  const dockH = dock.hidden ? 0 : Math.round(window.innerHeight - dock.getBoundingClientRect().top);
  const bottom = dock.hidden ? (shown ? 12 : 0) : Math.min(260, dockH + 8);
  document.documentElement.style.setProperty('--dock-h', (dock.hidden ? 16 : Math.max(60, dockH)) + 'px');
  $('#toast').style.bottom = (dock.hidden ? 40 : bottom + 12) + 'px';
  const ins = session.insets;
  if (top !== ins.top || bottom !== ins.bottom || left !== (ins.left || 0)) {
    session.insets = { top, bottom, left };
    bus.emit('insets', session.insets);
  }
}

// ── Esclusa: sin tanque lleno no se sale ──
function onExitRequest(door) {
  if (session.mode !== 'map' || session.overlay) return;
  try {
    session.bridge.leaveBase({ requestId: rid() });
  } catch (e) {
    const code = String(e?.message || '').split(':')[0];
    if (code === 'TANK_NOT_LOADED') { sfx.bad(); kita?.react('fail', 'Falta el tanque'); open(scr.tankGate()); return; }
    fail(e); return;
  }
  bus.emit('teleport', { scene: door.to.scene, x: door.to.x, y: door.to.y });
}

// ── Interacciones del mundo ──
function onInteract(d) {
  if (session.mode !== 'map' || session.overlay) return;
  const v = view();
  if (v.phase !== 'active') return;
  if (d.kind === 'pickup') { collectOrders(); return; }
  const pt = d.point;
  const mine = v.mission && v.scene === 'mission' && placeOf(v.mission)?.id === pt.id;
  if (mine) { openMission(); return; }
  switch (pt.kind) {
    case 'tank': open(scr.tankMenu()); break;
    case 'comms': open(scr.comms()); break;
    case 'storage': open(scr.bag()); break;
    case 'luni': openLuni(); break;
    case 'statuses': open(scr.statuses()); break;
    case 'info': toast(pt.info || pt.label); break;
    case 'task': {
      const fact = catalog.facts.find((f) => f.id === FACT_OF[pt.cat]);
      if (!fact) { toast(`${pt.label}: aquí no hay trabajo pendiente.`); break; }
      const show = () => { fichaFact = fact; fichaPoint = pt; open(scr.ficha()); };
      // En el cráter, mirar una muestra primero: el astronauta se arrodilla y la recoge (animación de Artemis).
      if (pt.cat === 'radiation' && d.scene === 'crater' && session.worldScene) bus.emit('playAnim', { name: 'muestra', rate: 1.9, onDone: show });
      else show();
      break;
    }
  }
}

function collectOrders() {
  try {
    const r = session.bridge.collect({ requestId: rid() });
    sfx.good();
    toast(`Recogiste ${r.result.collected.length} pedido${r.result.collected.length > 1 ? 's' : ''}. Ya están en tu bolsa.`);
    kita?.react('delivery', '¡Entrega recibida!');
    saveWorld();
  } catch (e) { fail(e); }
}

// Llenar el tanque: es un minijuego del dosímetro; el resultado decide cuánto aire queda para salir.
function startTank() {
  session.mode = 'minigame';
  closeAll();
  bus.emit('playMinigame', {
    category: 'radiation', seconds: 20, tired: false, hintsUsed: 0, title: '🫁 Llenar el tanque del traje',
    onDone: (perf) => {
      const pct = Math.max(0, Math.min(100, Math.round(perf.accuracy - perf.mistakes * 4)));
      try { const r = session.bridge.fillTank(pct, { requestId: rid() }); lastFill = r.result; } catch (e) { fail(e); route(); return; }
      session.mode = 'map';
      open(scr.tank());
      lastFill.insufficient ? kita?.react('fail', 'Ups, quedó incompleto') : kita?.react('success', '¡Tanque listo!');
      saveWorld();
    }
  });
}

// ── Aviso contextual ("E · Entrar a Zora"): también es botón para ratón y pantalla táctil ──
let lastPrompt = null;
function renderPrompt(p) {
  lastPrompt = p;
  const el = $('#prompt');
  if (!p || session.mode !== 'map' || session.overlay) { el.hidden = true; return; }
  el.innerHTML = `<button class="btn go prompt-btn" data-action="act"><kbd>E</kbd> ${esc(p.label)}</button>`;
  el.hidden = false;
}

// ── Reloj del mundo: 1 vez por segundo y solo mientras se explora (no en pausa, menús ni minijuegos) ──
let clockTimer = null, ticks = 0;
function startClock() {
  clearInterval(clockTimer);
  clockTimer = setInterval(() => {
    if (document.hidden || session.mode !== 'map' || session.overlay || !session.bridge) return;
    const v = session.view;
    if (!v || v.phase !== 'active') return;
    const outside = OUTSIDE.has(session.world?.scene) && !!v.world?.suit?.outside;
    let r;
    try { r = session.bridge.tick(1, { outside }); } catch { return; }
    setSuit(r);
    if (r.exhausted) { onExhausted(); return; }
    if (++ticks % 30 === 0) saveWorld();
  }, 1000);
  const flush = () => saveWorld();
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
}

function onExhausted() {
  sfx.alert();
  kita?.react('fail', 'Se acabó el aire');
  const v = view();
  if (v.phase === 'completed') { route(); return; }
  session.nextAnim = 'caida'; // al llegar a Zora se cae y se levanta
  bus.emit('teleport', { scene: 'zora', x: SCENES.zora.spawn.x, y: SCENES.zora.spawn.y });
  session.world = { scene: 'zora', ...SCENES.zora.spawn };
  saveWorld();
  session.mode = 'eva';
  replace(scr.eva());
}

export function boot() {
  session.settings = read(SETTINGS_KEY, { sound: true, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, guide: true });
  album = read(ALBUM_KEY, { endings: [], missions: 0 });
  applySettings();
  if (matchMedia('(pointer: coarse)').matches || /[?&]touch\b/.test(location.search)) document.body.classList.add('touchy');

  session.bridge = createBridge();
  let prevReady = 0;
  session.bridge.subscribe((v) => {
    session.view = v;
    refresh();
    bus.emit('view', v);
    const ready = (v.orders || []).filter((o) => o.status === 'ready').length;
    if (ready > prevReady) { toast('📦 Tu pedido está listo: recógelo en la nave de carga de la plataforma.'); kita?.react('news', '¡Llegó tu pedido!'); }
    prevReady = ready;
  });
  if (session.bridge.getView().storage?.available === false) setTimeout(() => toast('Este navegador no deja guardar. Igual podés jugar.'), 800);

  const delegate = (root) => root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (b && !b.disabled) onAction(b.dataset.action, b);
  });
  ['#screen', '#hud', '#dock', '#drawer'].forEach((s) => delegate($(s)));
  document.addEventListener('input', (e) => {
    const f = e.target;
    if (f?.dataset?.field === 'name' && draft) draft = { ...draft, name: f.value.slice(0, 16) };
  });
  document.addEventListener('submit', (e) => {
    const f = e.target;
    e.preventDefault();
    if (f.dataset.form === 'code') {
      const code = cleanCode(new FormData(f).get('code'));
      if (!code) { codeError = 'Usá de 3 a 20 letras o números, por ejemplo AULA-1.'; render(); return; }
      newGame(code);
    } else if (f.dataset.form === 'luni') {
      const q = new FormData(f).get('q');
      ask(q);
    }
  });
  document.addEventListener('click', (e) => {
    const term = e.target.closest('.term');
    if (term) { e.stopPropagation(); e.preventDefault(); showTerm(term); return; }
    if (!e.target.closest('#pop')) $('#pop').hidden = true;
  }, true);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && stack.length) {
      const f = [...$('#screen').querySelectorAll('button, a[href], input, summary, [tabindex]:not([tabindex="-1"])')].filter((n) => !n.disabled && n.offsetParent !== null);
      if (f.length) {
        const first = f[0], lastEl = f[f.length - 1];
        if (!$('#screen').contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    }
    if (e.key !== 'Escape') return;
    if (!$('#pop').hidden) { $('#pop').hidden = true; return; }
    if (luniOpen()) { closeLuni(); return; }
    if (session.mode === 'minigame') return;
    if (stack.length && !['menu', 'create', 'briefing', 'result', 'day', 'weather', 'weatherResult', 'ending', 'eva'].includes(stack[stack.length - 1].id)) onAction('back');
    else if (topIs('create') && editing) onAction('back');
    else if (session.mode === 'map') onAction('pause');
  });

  bus.on('interact', onInteract);
  bus.on('zone', (z) => { if (z.id === 'plataforma' && session.mode === 'map' && !session.overlay && view().phase === 'active') { session.mode = 'map'; open(scr.shop()); } });
  bus.on('prompt', renderPrompt);
  bus.on('exitRequest', onExitRequest);
  bus.on('sceneChange', (d) => {
    // Entrar a Zora vacía el tanque: para la próxima salida hay que llenar otro.
    if (d.to === 'zora' && d.from !== 'zora') { try { session.bridge.enterBase(); } catch { /* sin partida */ } }
    saveWorld();
    if (OUTSIDE.has(d.to) && !OUTSIDE.has(d.from)) { const s = view().world?.suit; toast(`Afuera: te quedan ${Math.ceil(s?.eva ?? 0)} s de aire en el traje.`); }
  });
  bus.on('openLuni', () => openLuni());
  kita = createKita($('#kita'), { reducedMotion: () => !!session.settings.reducedMotion });
  setupTouch($('#touch'));
  startClock();

  new ResizeObserver(measure).observe($('#hud'));
  new ResizeObserver(measure).observe($('#dock'));
  window.addEventListener('resize', measure);
  toMenu();

  if (/[?&]debug\b/.test(location.search)) window.__moon = { session, bus, route, view, onAction, onInteract, saveWorld, POINTS, placeOf, nextHop, SCENES, kitaLog: () => kita?.log };
}
