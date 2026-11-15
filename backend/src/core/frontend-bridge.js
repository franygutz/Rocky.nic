/**
 * Contrato sencillo para frontend HTML/CSS/JavaScript o Phaser.
 * No introduce reglas nuevas: delega las decisiones al motor lunar existente.
 * Independiente de Node, SQLite, HTML y Phaser.
 */
export function createFrontendBridge(engine, {
  storage = undefined,
  storageKey = 'moon-survival-partida-v03',
  now = () => Date.now(),
  autoStart = true,
  seed = undefined,
} = {}) {
  if (!engine || typeof engine.createGame !== 'function' || typeof engine.resolveMission !== 'function') {
    throw new Error('INVALID_ENGINE');
  }
  const clone = object => structuredClone(object);
  const listeners = new Set();
  let game = null;
  let pendingChoice = null;
  let lastResult = null;
  let lastLuni = null;
  let storageAvailable = false;
  let storageError = null;
  const getStorage = () => {
    if (storage !== undefined) return storage;
    try { return typeof localStorage === 'undefined' ? null : localStorage; }
    catch { return null; }
  };
  const store = getStorage();
  // Idioma: preferencia aparte de la partida (se puede cambiar desde el menú, antes de empezar).
  const langKey = storageKey + '-lang';
  const readLang = () => { try { return store?.getItem(langKey) || null; } catch { return null; } };
  const browserLang = () => { try { return String(navigator.language || '').slice(0, 2).toLowerCase(); } catch { return ''; } };
  if (typeof engine.setLanguage === 'function') {
    const wanted = readLang() || browserLang();
    try { engine.setLanguage(engine.languages().some(l => l.code === wanted && l.ready) ? wanted : 'es'); } catch { /* queda en español */ }
  }
  const langInfo = () => typeof engine.setLanguage === 'function'
    ? {lang:engine.getLanguage(), languages:engine.languages(), statusNames:engine.statusNames()}
    : {lang:'es', languages:[{code:'es',name:'Español',native:'Español',ready:true}], statusNames:{}};
  function setLanguage(code) {
    if (typeof engine.setLanguage !== 'function') throw new Error('INVALID_LANGUAGE');
    const info = engine.languages().find(l => l.code === code);
    if (!info || !info.ready) throw new Error('INVALID_LANGUAGE');
    engine.setLanguage(code);
    try { store?.setItem(langKey, code); } catch { /* sin almacenamiento: dura la sesión */ }
    notify('LANGUAGE', {result:{lang:code}});
    return getView();
  }
  function notify(action, extra = {}) {
    const view = getView();
    for (const fn of listeners) fn(view, {action, ...extra});
  }
  function save() {
    if (!store) {storageAvailable = false; storageError = 'STORAGE_UNAVAILABLE'; return false;}
    try {
      store.setItem(storageKey, JSON.stringify({format:'moon-frontend-bridge-1', game, pendingChoice, updatedAt:now()}));
      storageAvailable = true; storageError = null;
      return true;
    } catch {
      storageAvailable = false; storageError = 'STORAGE_WRITE_FAILED';
      return false;
    }
  }
  function restore() {
    if (!store) return false;
    try {
      // Compatibilidad con la primera demo offline, que utilizaba otra clave.
      const raw = store.getItem(storageKey) ?? (storageKey === 'moon-survival-partida-v03' ? store.getItem('moon-survival-v03-offline') : null);
      if (!raw) { storageAvailable = true; return false; }
      const parsed = JSON.parse(raw);
      // Admite también el guardado anterior de v0.3, que contenía directamente game.
      const saved = parsed && parsed.format === 'moon-frontend-bridge-1' ? parsed.game : parsed;
      if (!saved || saved.schemaVersion !== 3 || !Array.isArray(saved.statuses) || !saved.metrics || !Number.isInteger(saved.turn)) {
        storageAvailable = true; return false;
      }
      game = clone(saved);
      pendingChoice = parsed?.format === 'moon-frontend-bridge-1' && ['A','B'].includes(parsed.pendingChoice) ? parsed.pendingChoice : null;
      storageAvailable = true;
      return true;
    } catch {
      storageAvailable = false; storageError = 'STORAGE_READ_FAILED'; return false;
    }
  }
  function requireGame() { if (!game) throw new Error('NO_GAME'); return game; }
  function commit(output, action) {
    game = output.state;
    pendingChoice = null;
    lastResult = output.result ?? null;
    save(); notify(action, {result:lastResult});
    return {view:getView(), result:lastResult, state:getState()};
  }
  function newGame({seed:chosenSeed, scienceEvents} = {}) {
    const actualSeed = chosenSeed ?? seed ?? `luna-${now()}-${Math.random().toString(36).slice(2)}`;
    const events = scienceEvents ?? engine.catalog?.events ?? [];
    game = engine.createGame({seed:actualSeed, scienceEvents:events});
    pendingChoice = null; lastResult = null; lastLuni = null;
    save(); notify('NEW_GAME');
    return getView();
  }
  function getState() { return game ? clone(game) : null; }
  const localWeather = w => { const c = clone(w); if (typeof engine.evLocal === 'function') { if (c.event) c.event = engine.evLocal(c.event); if (c.note) c.note = engine.evText(c.note); } return c; };
  const localScience = sc => { const c = clone(sc); if (typeof engine.evLocal === 'function') { if (c.registeredEvent) c.registeredEvent = engine.evLocal(c.registeredEvent); } return c; };
  const localEvents = list => { const c = clone(list); if (typeof engine.evText === 'function') for (const e of c) { if (e.explanation) e.explanation = engine.evText(e.explanation); if (e.note) e.note = engine.evText(e.note); } return c; };
  const localResult = r => deepEv(clone(r));
  // Traduce los textos de los registros DONKI en cualquier parte de un objeto (solo cambia de idioma si está en inglés).
  const EV_KEYS = new Set(['note', 'location', 'summary', 'explanation', 'disclaimer']);
  const deepEv = o => { if (typeof engine.evText !== 'function' || !o || typeof o !== 'object') return o;
    for (const [k, v] of Object.entries(o)) { if (typeof v === 'string' && EV_KEYS.has(k)) o[k] = engine.evText(v); else if (v && typeof v === 'object') deepEv(v); } return o; };
  function getView() {
    if (!game) return {phase:'not_started', ...langInfo(), storage:{available:storageAvailable,error:storageError}};
    const next = engine.nextMission(game).next;
    let ending = null;
    if (game.phase === 'completed') {
      try { ending = engine.report(game); ending = deepEv(ending); } catch { ending = null; }
    }
    return {
      gameId:game.id, phase:game.phase, scene:game.phase==='completed'?'ending':game.weather?.pending?'weather':'mission',
      day:game.day, turn:game.turn, maxDays:game.maxDays, maxTurns:game.maxTurns,
      daysCompleted:Math.floor(game.turn/2), seed:game.seed, skill:game.skill,
      metrics:clone(game.metrics), statuses:[...game.statuses],
      coins:game.coins, inventory:clone(game.inventory), shop:engine.shop(game),
      mission:next?{id:next.id, name:next.name, intro:next.intro, cause:next.cause, science:next.science,
        category:next.category, difficulty:next.difficulty, options:next.choices.map((choice,index)=>({
          id:index===0?'A':'B', label:choice.label, consequence:choice.consequence,
          delta:clone(choice.delta), risk:choice.risk
        })), modifiers:clone(next.modifiers)}:null,
      pendingChoice,
      weather:game.weather?localWeather(game.weather):null,
      science:localScience(game.science),
      messages:clone(game.messages), events:localEvents(game.events),
      performance:clone(game.performance),
      lastResult:lastResult?localResult(lastResult):null,
      lastLuni:lastLuni?clone(lastLuni):null,
      orders:clone(game.orders||[]), bag:clone(game.bag||{}), world:clone(game.world||{avatar:null,scene:'exterior',pos:null,clock:0}),
      ending, ...langInfo(),
      storage:{available:storageAvailable,error:storageError}
    };
  }
  function subscribe(fn, {immediate=true} = {}) {
    if (typeof fn !== 'function') throw new TypeError('Listener must be a function');
    listeners.add(fn);
    if (immediate) fn(getView(), {action:'SUBSCRIBED'});
    return () => listeners.delete(fn);
  }
  function validateChoice(id) {
    if (!['A','B'].includes(id)) throw new Error('INVALID_CHOICE');
    const current = engine.nextMission(requireGame()).next;
    if (!current) throw new Error('NO_CURRENT_MISSION');
    if (game.weather?.pending) throw new Error('WEATHER_RESPONSE_REQUIRED');
    return current.id;
  }
  // Para una carta SIN minijuego: resuelve en un solo paso.
  function chooseCard(choiceId, {performance, hintUsed=false} = {}) {
    const id = validateChoice(choiceId);
    return commit(engine.resolveMission(game,id,choiceId,{performance,hintUsed}), 'CHOOSE_CARD');
  }
  // Para carta CON minijuego: separar selección y resultado visual sin avanzar turnos al elegir.
  function prepareMinigame(choiceId) {
    validateChoice(choiceId);
    pendingChoice = choiceId;
    save(); notify('PREPARE_MINIGAME');
    return getView();
  }
  function finishMinigame(performance, {hintUsed=false} = {}) {
    if (!pendingChoice) throw new Error('NO_PENDING_MINIGAME');
    const id = validateChoice(pendingChoice);
    return commit(engine.resolveMission(game,id,pendingChoice,{performance,hintUsed}), 'FINISH_MINIGAME');
  }
  function skipCard() { return commit(engine.skipMission(requireGame()), 'SKIP_CARD'); }
  function buy(itemId) { return commit(engine.purchase(requireGame(),itemId), 'BUY'); }
  function respondWeather(choice) { return commit(engine.respondWeather(requireGame(),choice), 'WEATHER'); }
  function sendMessage(type) { return commit(engine.sendMessage(requireGame(),type), 'MESSAGE'); }
  function repeatDay(day=undefined) {
    return commit(engine.repeatDay(requireGame(),day ?? game.day), 'REPEAT_DAY');
  }
  function askLuni(question,{hint=false}={}) {
    const output=engine.npcAsk(requireGame(),question,{hint});
    game=output.state;lastLuni=output.response;
    save();notify('LUNI_ANSWER', {response:clone(output.response)});
    return clone(output.response);
  }
  function refreshNASA(events) {
    if (!Array.isArray(events)) throw new Error('INVALID_SCIENCE_EVENTS');
    const g=clone(requireGame());
    const existing=new Map((g.scienceEventPool||[]).map(e=>[e.id,e]));
    for(const e of events) {
      if (!e || typeof e.id !== 'string' || !['SEP','CME','GST'].includes(e.type) || !e.observedAt || typeof e.sourceUrl !== 'string' || !/^https:\/\/([a-z0-9.-]+\.)?nasa\.gov(\/|$)/i.test(e.sourceUrl)) continue;
      existing.set(e.id,clone(e));
    }
    g.scienceEventPool=[...existing.values()];
    game=g;save();notify('NASA_REFRESH');
    return {count:g.scienceEventPool.length,view:getView()};
  }
  // ── Mundo jugable (v0.5) ──
  function worldOp(action, fn, name) {
    const out = fn(engine.ensureWorld(requireGame()));
    return commit(out, name || action);
  }
  const order = (itemId, {requestId} = {}) => worldOp('ORDER', g => engine.orderItem(g, itemId, {requestId}), 'ORDER');
  const collect = ({requestId} = {}) => worldOp('COLLECT', g => engine.collectOrders(g, {requestId}), 'COLLECT');
  const useItem = (itemId, {requestId} = {}) => worldOp('USE_ITEM', g => engine.useItem(g, itemId, {requestId}), 'USE_ITEM');
  const fillTank = (percent, {requestId} = {}) => worldOp('TANK_FILL', g => engine.tankFill(g, percent, {requestId}), 'TANK_FILL');
  const leaveBase = ({requestId} = {}) => worldOp('LEAVE_BASE', g => engine.leaveBase(g, {requestId}), 'LEAVE_BASE');
  const enterBase = () => worldOp('ENTER_BASE', g => engine.enterBase(g), 'ENTER_BASE');
  const setAvatar = avatar => worldOp('AVATAR', g => engine.setAvatar(g, avatar), 'AVATAR');
  // Reloj del mundo: no guarda ni avisa en cada segundo, solo cuando cambia algo (pedido listo, oxígeno agotado).
  function tick(seconds, {outside = false} = {}) {
    const out = engine.tickWorld(engine.ensureWorld(requireGame()), {seconds, outside});
    game = out.state;
    if (out.result.ready.length || out.result.exhausted) { save(); notify('WORLD_TICK', {result: out.result}); }
    return out.result;
  }
  // Punto de guardado del mundo (cambio de zona, tarea, compra, recogida, pausa, cierre).
  function checkpoint(scene, pos) {
    const out = engine.setWorldState(engine.ensureWorld(requireGame()), {scene, pos});
    game = out.state; save();
    return out.result;
  }
  function clearProgress() {
    game=null;pendingChoice=null;lastLuni=null;lastResult=null;
    try {store?.removeItem(storageKey);if(storageKey==='moon-survival-partida-v03')store?.removeItem('moon-survival-v03-offline');storageAvailable=!!store;storageError=null;}
    catch {storageAvailable=false;storageError='STORAGE_DELETE_FAILED';}
    notify('CLEAR_PROGRESS');
    return getView();
  }
  const restored=restore();
  if (!restored && autoStart) newGame();
  return {setLanguage,getLanguages:()=>langInfo().languages,newGame,getState,getView,subscribe,save,chooseCard,prepareMinigame,finishMinigame,skipCard,buy,
    respondWeather,sendMessage,repeatDay,askLuni,refreshNASA,clearProgress,order,collect,useItem,fillTank,leaveBase,enterBase,setAvatar,tick,checkpoint};
}
