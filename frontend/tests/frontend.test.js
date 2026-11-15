// Pruebas del frontend con el motor REAL de backend/ (no hay motor de prueba).
import { describe, it, expect } from 'vitest';
import { catalog, createBridge, statusNames } from '../src/engine.js';
import { ROOM_OF, MINIGAME_OF, CATEGORY, METRICS, hasMinigame, makePerformance, minigameSeconds, statusName, cleanCode, randomCode } from '../src/rules.js';
import { withTerms, esc, safeUrl } from '../src/ui/text.js';

const memory = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };

describe('catálogo del backend', () => {
  it('trae 50 retos, 10 finales, 7 artículos y registros DONKI', () => {
    expect(catalog.challenges).toHaveLength(50);
    expect(Object.keys(catalog.endings)).toHaveLength(10);
    expect(catalog.items).toHaveLength(7);
    expect(catalog.events.length).toBeGreaterThan(0);
  });

  it('cada categoría tiene sala, minijuego y nombre', () => {
    for (const c of catalog.challenges) {
      expect(ROOM_OF[c.category], `reto ${c.id}`).toBeTruthy();
      expect(MINIGAME_OF[c.category], `reto ${c.id}`).toBeTruthy();
      expect(CATEGORY[c.category], `reto ${c.id}`).toBeTruthy();
    }
  });

  it('cada indicador que mueven los retos y la tienda se muestra en el HUD', () => {
    const keys = new Set(METRICS.map((m) => m.key));
    for (const c of catalog.challenges) for (const o of c.choices) for (const k of Object.keys(o.delta)) expect(keys, `reto ${c.id}: ${k}`).toContain(k);
    for (const i of catalog.items) for (const k of Object.keys(i.delta)) expect(keys, i.id).toContain(k);
  });

  it('cada estado de los retos tiene un nombre legible', () => {
    const all = new Set();
    for (const c of catalog.challenges) for (const o of c.choices) [...o.add, ...o.remove].forEach((s) => all.add(s));
    for (const s of all) expect(statusName(s), s).not.toMatch(/_/);
    expect(statusName('reparacion_pendiente_life')).toBe('Reparación pendiente: soporte vital');
    expect(Object.keys(statusNames).length).toBeGreaterThan(20);
  });

  it('todas las fuentes y registros tienen enlace https', () => {
    for (const f of catalog.facts) expect(safeUrl(f.sourceUrl), f.id).toMatch(/^https:/);
    for (const e of catalog.events) expect(safeUrl(e.sourceUrl), e.id).toMatch(/^https:/);
  });
});

describe('minijuegos → performance del motor', () => {
  it('ganar rápido y sin errores da "completed"', () => {
    const p = makePerformance({ done: true, timeLeftFrac: 0.5, mistakes: 0 });
    expect(p).toEqual({ completed: true, accuracy: 85, mistakes: 0, hintsUsed: 0 });
  });
  it('quedarse sin tiempo nunca es "completed"', () => {
    const p = makePerformance({ done: false, progress: 0.9 });
    expect(p.completed).toBe(false);
    expect(p.accuracy).toBe(63);
  });
  it('los valores siempre están dentro de lo que acepta el motor', () => {
    const p = makePerformance({ done: true, timeLeftFrac: 9, mistakes: 500, hintsUsed: 99 });
    expect(p.accuracy).toBeLessThanOrEqual(100);
    expect(p.mistakes).toBeLessThanOrEqual(100);
    expect(p.hintsUsed).toBeLessThanOrEqual(20);
  });
  it('el tiempo se acorta con timeMultiplier del motor', () => {
    expect(minigameSeconds({ timeMultiplier: 1 })).toBe(25);
    expect(minigameSeconds({ timeMultiplier: 0.8 })).toBe(20);
    expect(minigameSeconds({ timeMultiplier: 0.1 })).toBe(10);
  });
  it('solo las opciones cuidadosas (riesgo 0) tienen minijuego', () => {
    expect(hasMinigame({ risk: 0 })).toBe(true);
    expect(hasMinigame({ risk: 2 })).toBe(false);
  });
});

describe('partida con el puente del backend', () => {
  it('juega 14 turnos con minijuegos, tienda, mensajes y clima, y llega a un final', () => {
    const b = createBridge({ storage: memory(), seed: 'TEST-1' });
    b.newGame({ seed: 'AULA-1' });
    let v = b.getView();
    expect(v.mission.id).toBe(1);
    let guard = 0, sawWeather = false;
    while (v.phase === 'active' && guard++ < 40) {
      if (v.scene === 'weather') { sawWeather = true; b.respondWeather('shelter'); v = b.getView(); continue; }
      const opt = v.mission.options[0];
      if (hasMinigame(opt)) {
        b.prepareMinigame(opt.id);
        b.finishMinigame(makePerformance({ done: true, timeLeftFrac: 0.6 }));
      } else b.chooseCard(opt.id);
      v = b.getView();
      const cheap = v.shop.find((i) => i.available);
      if (cheap && v.phase === 'active') b.buy(cheap.id);
      if (v.turn === 3 && v.phase === 'active') b.sendMessage('status_report');
      v = b.getView();
    }
    expect(v.phase).toBe('completed');
    expect(v.ending.ending.title).toBeTruthy();
    expect(v.ending.why.criteria.length).toBeGreaterThan(0);
    expect(sawWeather || v.turn < 10).toBe(true);
  });

  it('la misma semilla da los mismos retos', () => {
    const a = createBridge({ storage: memory() }); a.newGame({ seed: 'KTRMXA' });
    const c = createBridge({ storage: memory() }); c.newGame({ seed: 'KTRMXA' });
    a.chooseCard('B'); c.chooseCard('B');
    expect(a.getView().mission.id).toBe(c.getView().mission.id);
  });

  it('continúa la partida guardada y la borra con clearProgress', () => {
    const store = memory();
    const a = createBridge({ storage: store }); a.newGame({ seed: 'GUARDAR' }); a.chooseCard('B');
    const b = createBridge({ storage: store });
    expect(b.getView().turn).toBe(1);
    b.clearProgress();
    expect(createBridge({ storage: store }).getView().phase).toBe('not_started');
  });

  it('repetir un día vuelve a su inicio', () => {
    const b = createBridge({ storage: memory() }); b.newGame({ seed: 'REPETIR' });
    b.chooseCard('B'); b.chooseCard('B'); b.chooseCard('B');
    expect(b.getView().day).toBe(2);
    b.repeatDay(1);
    expect(b.getView().turn).toBe(0);
  });

  it('LUNI responde con sugerencias para mostrar como botones', () => {
    const b = createBridge({ storage: memory() }); b.newGame({ seed: 'LUNI' });
    const r = b.askLuni('¿Qué significa CME?');
    expect(r.answer).toMatch(/masa coronal/);
    expect(r.suggestions.length).toBeGreaterThanOrEqual(2);
  });
});

describe('textos', () => {
  it('escapa HTML y marca términos del glosario', () => {
    expect(esc('<b>')).toBe('&lt;b&gt;');
    expect(withTerms('Llegó una CME <script>')).toContain('data-term="cme"');
    expect(withTerms('Llegó una CME <script>')).not.toContain('<script>');
  });
  it('códigos de misión', () => {
    expect(cleanCode(' aula 1 ')).toBe('AULA-1');
    expect(cleanCode('a')).toBeNull();
    expect(randomCode()).toMatch(/^[A-Z]{6}$/);
  });
  it('no se usan enlaces que no sean http(s)', () => {
    expect(safeUrl('javascript:alert(1)')).toBeNull();
  });
});
