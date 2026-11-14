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
  function getView() {
    if (!game) return {phase:'not_started', storage:{available:storageAvailable,error:storageError}};
    const next = engine.nextMission(game).next;
    let ending = null;
    if (game.phase === 'completed') {
      try { ending = engine.report(game); } catch { ending = null; }
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
      weather:game.weather?clone(game.weather):null,
      science:clone(game.science),
      messages:clone(game.messages), events:clone(game.events),
      performance:clone(game.performance),
      lastResult:lastResult?clone(lastResult):null,
      lastLuni:lastLuni?clone(lastLuni):null,
      ending,
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
  function clearProgress() {
    game=null;pendingChoice=null;lastLuni=null;lastResult=null;
    try {store?.removeItem(storageKey);if(storageKey==='moon-survival-partida-v03')store?.removeItem('moon-survival-v03-offline');storageAvailable=!!store;storageError=null;}
    catch {storageAvailable=false;storageError='STORAGE_DELETE_FAILED';}
    notify('CLEAR_PROGRESS');
    return getView();
  }
  const restored=restore();
  if (!restored && autoStart) newGame();
  return {newGame,getState,getView,subscribe,save,chooseCard,prepareMinigame,finishMinigame,skipCard,buy,
    respondWeather,sendMessage,repeatDay,askLuni,refreshNASA,clearProgress};
}
