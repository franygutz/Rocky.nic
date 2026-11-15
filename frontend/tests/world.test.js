import { describe, it, expect } from 'vitest';
import { SCENES, SCENE_IDS, OUTSIDE, POINTS, walkable, step, safeSpot, placeOf, nextHop, zoneState, doorAt } from '../src/world/scenes.js';
import { findPath } from '../src/world/path.js';
import { taskMatrix, taskState } from '../src/world/tasks.js';
import { normalizeAvatar, PRESETS, avatarSvg, avatarKey, CATEGORIES, defaultAvatar } from '../src/world/avatar.js';
import { baseClip, createKita, CLIPS } from '../src/game/kita.js';
import { suitFactor, minigameSeconds, OUTDOOR_CATEGORIES } from '../src/rules.js';
import { catalog, createBridge } from '../src/engine.js';
import * as S from '../src/ui/screens.js';
import { choosePose } from '../src/world/walk.js';
import { cliffCells, CLIFF } from '../src/world/cliff.js';

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; };
const bridge = () => createBridge({ storage: mem(), seed: 'mundo' });

describe('Mundo: escenarios y colisiones', () => {
  it('los 5 escenarios existen y su aparición es transitable', () => {
    expect(SCENE_IDS).toEqual(['exterior', 'zora', 'invernadero', 'paneles', 'crater']);
    for (const id of SCENE_IDS) { const s = SCENES[id]; expect(walkable(id, s.spawn.x, s.spawn.y), id).toBe(true); }
  });
  it('el avatar no atraviesa paredes ni equipos: un paso hacia un obstáculo se detiene o se desliza', () => {
    // contra el edificio de Zora (obstáculo) desde la puerta hacia arriba
    const a = { x: 288, y: 199 };
    let p = a;
    for (let i = 0; i < 80; i++) p = step('exterior', p.x, p.y, 0, -1);
    expect(walkable('exterior', p.x, p.y)).toBe(true);
    expect(p.y).toBeGreaterThan(190);
    // deslizamiento: avanzar en diagonal contra un muro mantiene el eje libre
    const q = step('exterior', 190, 150, 12, 0);
    expect(q.x).toBeLessThan(196);
    const sl = step('exterior', 190, 150, 12, -3); // choca de lado pero sigue por el eje libre
    expect(sl.x).toBeLessThan(196);
    expect(sl.y).toBeLessThan(150);
  });
  it('safeSpot rescata un punto dentro de una pared', () => {
    const p = safeSpot('exterior', 250, 150);
    expect(walkable('exterior', p.x, p.y)).toBe(true);
  });
  it('todos los puntos de interacción se pueden alcanzar caminando desde la aparición', () => {
    for (const id of SCENE_IDS) {
      const s = SCENES[id];
      for (const pt of s.points) {
        const sp = safeSpot(id, pt.x, pt.y);
        const path = findPath(id, s.spawn, sp);
        expect(path.length, `${id}/${pt.id}`).toBeGreaterThan(0);
        expect(Math.hypot(sp.x - pt.x, sp.y - pt.y), `${id}/${pt.id} lejos`).toBeLessThanOrEqual(pt.r + 14);
      }
    }
  });
  it('cada puerta se alcanza, y su destino cae en suelo transitable del otro escenario', () => {
    for (const id of SCENE_IDS) for (const d of SCENES[id].doors) {
      expect(walkable(id, d.anchor[0], d.anchor[1]) || walkable(id, d.anchor[0], d.anchor[1] + 4), `${id}/${d.id} ancla`).toBe(true);
      const to = SCENES[d.to.scene];
      expect(walkable(d.to.scene, d.to.x, d.to.y) || !!safeSpot(d.to.scene, d.to.x, d.to.y), `${id}->${d.to.scene}`).toBe(true);
      const here = Math.hypot(SCENES[id].spawn.x - d.anchor[0], SCENES[id].spawn.y - d.anchor[1]) < 4; // la puerta de Zora está en la aparición
      expect(here || findPath(id, SCENES[id].spawn, { x: d.anchor[0], y: d.anchor[1] }).length > 0, `${id}/${d.id}`).toBe(true);
      expect(to).toBeTruthy();
    }
  });
  it('ida y vuelta: toda entrada tiene salida al mismo sector del exterior', () => {
    for (const d of SCENES.exterior.doors) {
      const back = SCENES[d.to.scene].doors[0].to;
      expect(back.scene).toBe('exterior');
      const exit = SCENES.exterior.doors.find((e) => e.id === d.id);
      // el punto de regreso queda cerca de la puerta por la que se entró
      expect(Math.hypot(back.x - exit.anchor[0], back.y - exit.anchor[1])).toBeLessThan(60);
    }
  });
  it('la plataforma tiene histéresis: cerrar la tienda no la reabre mientras sigues dentro', () => {
    const z = SCENES.exterior.zones.plataforma;
    expect(zoneState(z, 117, 270, false)).toBe(true); // entras
    expect(zoneState(z, 70, 240, true)).toBe(true); // en el borde exterior sigues "dentro": no se rearma
    expect(zoneState(z, 40, 240, true)).toBe(false); // sales de verdad
    expect(zoneState(z, 70, 240, false)).toBe(false); // entre rect y outer no se abre sola
  });
  it('solo se gasta aire del traje afuera', () => {
    expect([...OUTSIDE].sort()).toEqual(['crater', 'exterior', 'paneles']);
  });
  it('en los paneles el avatar queda parcialmente tapado por los paneles delanteros sin desaparecer', () => {
    const s = SCENES.paneles, avatarH = 46 * s.avatarScale;
    const maxY = Math.max(...s.walk.map((r) => r[3]));
    expect(maxY).toBeGreaterThan(s.front.y); // los pies pueden pasar detrás del primer plano
    const hidden = maxY - s.front.y, top = maxY - avatarH;
    expect(hidden).toBeLessThan(avatarH * 0.5); // nunca desaparece por completo
    expect(top).toBeLessThan(s.front.y);
  });
});

describe('Las 50 tareas', () => {
  const rows = taskMatrix(catalog.challenges);
  it('cada una tiene escenario, equipo, puzzle y punto real', () => {
    expect(rows).toHaveLength(50);
    for (const r of rows) {
      expect(r.escenarioId, `#${r.id}`).toBeTruthy();
      expect(POINTS[r.puntoId], `#${r.id}`).toBeTruthy();
      expect(POINTS[r.puntoId].kind === 'task' || ['tank', 'comms'].includes(POINTS[r.puntoId].kind), `#${r.id}`).toBe(true);
      expect(r.puzzle).toBeTruthy();
      expect(r.recompensa).toMatch(/monedas/);
    }
  });
  it('cada categoría usa su escenario esperado', () => {
    for (const r of rows) {
      if (r.categoria === 'food') expect(r.escenarioId).toBe('invernadero');
      if (r.categoria === 'radiation') expect(['crater', 'zora']).toContain(r.escenarioId);
      if (r.categoria === 'comms') expect(r.escenarioId).toBe('zora');
    }
  });
  it('todo equipo con tareas se puede alcanzar desde el exterior pasando por puertas', () => {
    for (const r of rows) {
      let at = 'exterior', hops = 0;
      while (at !== r.escenarioId && hops++ < 3) { const d = nextHop(at, r.escenarioId); at = d.to.scene; }
      expect(at, `#${r.id}`).toBe(r.escenarioId);
    }
  });
  it('el estado de cada tarea sale de la partida: activa, disponible, hecha o por descubrir', () => {
    const b = bridge();
    b.newGame({ seed: 'diario' });
    const st = b.getState();
    expect(taskState(st, st.currentMissionId)).toBe('activa');
    const counts = {};
    for (let i = 1; i <= 50; i++) counts[taskState(st, i)] = (counts[taskState(st, i)] || 0) + 1;
    expect(counts.bloqueada).toBeGreaterThan(30);
    const { result } = b.chooseCard('A', { performance: { completed: true, accuracy: 90, mistakes: 0, hintsUsed: 0 } });
    expect(taskState(b.getState(), result.missionId)).toBe('completada');
  });
  it('la dificultad interna nunca se muestra al jugador', () => {
    const b = bridge(); b.newGame({ seed: 'oculto' });
    const html = S.missionHTML(b.getView()) + S.diaryHTML(b.getView(), b.getState());
    expect(html).not.toMatch(/\bNivel \d|\bf[aá]cil\b|\bdif[ií]cil\b|\bdifficulty\b/i);
  });
});

describe('Avatar', () => {
  it('los 16 personajes del kit son válidos y generan SVG vista interior y exterior', () => {
    expect(PRESETS).toHaveLength(16);
    for (const p of PRESETS) {
      expect(normalizeAvatar(p), p.name).toBeTruthy();
      for (const helmet of [false, true]) { const svg = avatarSvg(p, helmet); expect(svg).toContain('viewBox="0 0 32 46"'); }
    }
  });
  it('cada categoría cambia el resultado y las combinaciones inválidas se rechazan', () => {
    const base = defaultAvatar();
    for (const c of CATEGORIES) {
      const other = c.key === 'accessory' ? 'glasses' : c.key === 'expression' ? 'happy' : (base[c.key] + 1) % c.list.length;
      expect(avatarKey({ ...base, [c.key]: other }, false) !== avatarKey(base, false) || c.key === 'emblem').toBe(true);
    }
    expect(normalizeAvatar({ ...base, hair: 99 })).toBeNull();
    expect(normalizeAvatar({ ...base, accessory: 'cola' })).toBeNull();
    expect(normalizeAvatar({ ...base, name: '  <b>Ana</b>  ' }).name).toBe('bAnab');
  });
  it('el personaje elegido se guarda en la partida y vuelve al cargar', () => {
    const st = mem(); const b = createBridge({ storage: st, seed: 'av' }); b.newGame({ seed: 'av' });
    b.setAvatar({ ...PRESETS[9], name: 'Kai' });
    const b2 = createBridge({ storage: st });
    expect(b2.getView().world.avatar.style).toBe(PRESETS[9].style);
    expect(b2.getView().world.avatar.name).toBe('Kai');
  });
});

describe('Kita', () => {
  const v = (metrics = {}, statuses = []) => ({ metrics: { oxygen: 80, water: 80, energy: 80, food: 80, health: 80, ...metrics }, statuses });
  it('prioridades: crítico > sin señal > pausa > trabajo > reposo', () => {
    expect(baseClip({ view: v() })).toBe('idle');
    expect(baseClip({ view: v(), working: true })).toBe('working');
    expect(baseClip({ view: v(), working: true, paused: true })).toBe('sleep');
    expect(baseClip({ view: v({}, ['sin_respuesta']), paused: true })).toBe('offline');
    expect(baseClip({ view: v({ oxygen: 12 }, ['sin_respuesta']) })).toBe('alert');
  });
  it('las reacciones no se apilan y un aviso crítico no se desplaza', () => {
    const root = { innerHTML: '', querySelector: () => ({ style: {}, classList: { toggle() {}, remove() {} }, offsetWidth: 0, textContent: '' }), classList: { toggle() {}, remove() {} }, dataset: {} };
    const k = createKita(root);
    k.react('success');
    k.react('success');
    expect(k.log.filter((n) => n === 'success')).toHaveLength(1);
    k.setBase({ view: v({ water: 5 }) });
    expect(k.clip).toBe('alert');
    k.react('success');
    expect(k.clip).toBe('alert');
    k.dispose();
    expect(Object.keys(CLIPS).length).toBeGreaterThan(8);
  });
});

describe('Traje y tiempo de los puzzles', () => {
  it('un tanque mal llenado acorta solo los retos de afuera', () => {
    const b = bridge(); b.newGame({ seed: 'traje' });
    b.fillTank(20);
    const suit = b.getView().world.suit;
    expect(suit.evaMax).toBeLessThan(120);
    for (const cat of OUTDOOR_CATEGORIES) expect(suitFactor(suit, cat)).toBeLessThan(1);
    for (const cat of ['life', 'food', 'comms']) expect(suitFactor(suit, cat)).toBe(1);
    expect(minigameSeconds({ timeMultiplier: 1 }, suitFactor(suit, 'energy'))).toBeLessThan(25);
  });
});

describe('Partida completa con el mundo conectado', () => {
  it('recorre 14 turnos, compra con pedido físico, recoge y llega a un final conservando todo', () => {
    const b = bridge(); b.newGame({ seed: 'completa' });
    b.setAvatar({ ...PRESETS[0] });
    let bought = false;
    for (let i = 0; i < 40 && b.getView().phase === 'active'; i++) {
      const view = b.getView();
      if (view.scene === 'weather') { b.respondWeather('shelter'); continue; }
      expect(placeOf(view.mission), `#${view.mission.id}`).toBeTruthy();
      b.chooseCard('A', { performance: { completed: true, accuracy: 85, mistakes: 0, hintsUsed: 0 } });
      if (!bought && b.getView().coins >= 35) { b.order('agua', { requestId: `compra-${i}-aaaaaaaa` }); b.tick(30); b.collect({ requestId: `recoge-${i}-aaaaaaaa` }); bought = true; }
    }
    const v = b.getView();
    expect(v.phase).toBe('completed');
    expect(v.ending.endingId).toBeGreaterThan(0);
    expect(v.world.avatar.name).toBe('Luna');
    expect(bought).toBe(true);
    expect(v.orders.filter((o) => o.status === 'collected')).toHaveLength(1);
  });
});

describe('Reglas de salida y datos de la NASA', () => {
  it('la esclusa exige un tanque lleno, lo usa y al volver queda vacío', () => {
    const b = bridge(); b.newGame({ seed: 'esclusa' });
    expect(SCENES.zora.doors[0].needsTank).toBe(true);
    expect(() => b.leaveBase({ requestId: 'salida-00000001' })).toThrow(/TANK_NOT_LOADED/);
    b.fillTank(100);
    expect(b.getView().metrics.oxygen).toBe(75); // 78 − 3 de la base
    b.leaveBase({ requestId: 'salida-00000002' });
    expect(b.getView().world.suit.outside).toBe(true);
    b.enterBase();
    expect(b.getView().world.suit.loaded).toBe(false);
  });
  it('cada categoría de equipo tiene una ficha con fuente de la NASA', () => {
    const ids = { comms: 'comms', radiation: 'radiation', life: 'oxygen', food: 'plant', energy: 'power' };
    for (const [cat, id] of Object.entries(ids)) {
      const f = catalog.facts.find((x) => x.id === id);
      expect(f, cat).toBeTruthy();
      expect(f.sourceUrl, cat).toMatch(/^https:\/\//);
    }
    const html = S.fichaHTML(catalog.facts.find((x) => x.id === 'radiation'), { label: 'Baliza de medición' }, bridge().getView());
    expect(html).toContain('13,22');
    expect(html).toContain('Dato verificado de la NASA');
  });
});

describe('vista del astronauta al caminar', () => {
  it('de costado se ve de perfil aunque la ruta suba o baje un poco (no camina de espaldas)', () => {
    expect(choosePose('side', 10, -3)).toBe('side');
    expect(choosePose('front', 10, -3)).toBe('side');
    expect(choosePose('back', -10, 2)).toBe('side');
  });
  it('subiendo o bajando claro se ve de espaldas o de frente', () => {
    expect(choosePose('side', 1, -10)).toBe('back');
    expect(choosePose('side', 1, 10)).toBe('front');
  });
  it('en las diagonales no parpadea: conserva la vista que traía', () => {
    expect(choosePose('side', 10, 11)).toBe('side');
    expect(choosePose('front', 11, 10)).toBe('front');
    expect(choosePose('back', 0, 0)).toBe('back');
  });
});

describe('límites de los pasillos de Zora', () => {
  // puntos medidos sobre el PNG de Zora (1440 × 960 px, 3 px por unidad)
  const at = (x, y) => walkable('zora', x / 3, y / 3);
  it('se camina sobre las baldosas de los pasillos', () => {
    expect(at(300, 330)).toBe(true); // pasillo superior
    expect(at(1000, 400)).toBe(true); // pasillo derecho
    expect(at(700, 720)).toBe(true); // pasillo inferior
  });
  it('no se puede pisar el vacío entre pasillos', () => {
    expect(at(780, 390)).toBe(false); // codo del pasillo superior (la captura del reporte)
    expect(at(560, 660)).toBe(false); // entre el taller y la atención médica
    expect(at(960, 660)).toBe(false); // entre la atención médica y soporte vital
    expect(at(300, 400)).toBe(false); // debajo del pasillo superior
  });
});

describe('hondonada del exterior', () => {
  const { w: W, h: H } = SCENES.exterior;
  const c = cliffCells(W, H);
  const at = (x, y) => c.px[(y + c.oy) * c.w + (x + c.ox)]; // coordenadas del mapa
  it('el fondo es el mapa (transparente) y todo lo de afuera tiene color', () => {
    expect(at(288, 210)).toBeNull();
    expect(at(100, 150)).toBeNull();
    let empty = 0;
    for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
      const inMap = x >= c.ox && x < c.ox + W && y >= c.oy && y < c.oy + H;
      if (!inMap && !/^#[0-9a-f]{6}$/i.test(c.px[y * c.w + x] || '')) empty++;
    }
    expect(empty).toBe(0);
  });
  it('arriba sube una pared de roca y detrás sigue la meseta', () => {
    const col = Array.from({ length: c.oy }, (_, k) => at(288, -1 - k)); // de abajo hacia arriba
    expect(col.slice(0, 30).filter((p) => ['#a6869f', '#8f6f8d', '#775b7b', '#62496a', '#46334f'].includes(p) || /^#[4-9]/.test(p)).length).toBeGreaterThan(15);
    expect(col).toContain('#dcc0b9'); // canto claro de la meseta
  });
  it('al frente, la meseta vuelve a caer en un barranco', () => {
    const col = Array.from({ length: c.h - c.oy - H }, (_, k) => at(300, H + k));
    expect(col.some((p) => ['#c6a29f', '#b394a6', '#c0a08f', '#d4b4ac'].includes(p))).toBe(true);
    expect(col.slice(-20).every((p) => p === '#1e1629' || p === '#2a1f3b')).toBe(true);
  });
  it('el astronauta camina solo dentro del fondo', () => {
    for (const [x0, y0, x1, y1] of SCENES.exterior.walk) {
      for (const [x, y] of [[x0, y0], [x1 - 1, y0], [x0, y1 - 1], [x1 - 1, y1 - 1]]) {
        if (walkable('exterior', x, y)) expect(at(x, y)).toBeNull();
      }
    }
    expect(walkable('exterior', 4, 200)).toBe(false);
    expect(walkable('exterior', 288, 210)).toBe(true);
  });
  it('si el mapa trae cielo arriba, la pared lo tapa', () => {
    const g = cliffCells(W, H, { ground: (x, y) => (x > 200 && x < 400 && y < 15 ? '#261038' : '#c6a29f') });
    const pick = (x, y) => g.px[(y + g.oy) * g.w + (x + g.ox)];
    expect(pick(300, 5)).not.toBeNull(); // el cielo queda tapado
    expect(pick(100, 5)).toBeNull(); // donde no hay cielo, se ve el mapa
  });
});
