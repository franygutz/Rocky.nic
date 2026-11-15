// Evidencia de cobertura con el MOTOR REAL: juega partidas simuladas y cuenta qué tareas y finales aparecen.
// Uso:  node tools/simular-alcance.mjs [partidas=2000]
import { readFileSync } from 'node:fs';
import { createEngine } from '../../backend/src/core/engine.js';
const data = (n) => JSON.parse(readFileSync(new URL(`../../backend/data/${n}.json`, import.meta.url), 'utf8'));
const engine = createEngine({ challenges: data('challenges'), items: data('shop'), endings: data('endings'), facts: data('science-facts'), events: data('nasa-events') });
const N = Number(process.argv[2] || 2000);
const seen = new Set(), endings = new Map();

// Estrategias: probabilidad de elegir A, de superar el puzzle y una política especial para provocar fallos concretos.
const POLICIES = [
  { a: 0.3, ok: 0.3 }, { a: 0.6, ok: 0.7 }, { a: 0.85, ok: 0.95 }, { a: 1, ok: 1 },
  { a: 1, ok: 1, failCat: 'comms' }, { a: 0.7, ok: 0.9, failCat: 'comms', skipCat: 'comms' }, { a: 0.5, ok: 0.5, failCat: 'life' }, { a: 0.5, ok: 1, worstComms: true }
];
for (let seed = 0; seed < N; seed++) {
  const pol = POLICIES[seed % POLICIES.length];
  let g = engine.createGame({ seed: 's' + seed });
  let r = seed + 7;
  const rnd = () => { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; };
  for (let t = 0; t < 40 && g.phase === 'active'; t++) {
    const m = engine.nextMission(g).next;
    if (!m) break;
    seen.add(m.id);
    if (g.weather?.pending) { g = engine.respondWeather(g, rnd() < 0.5 ? 'shelter' : 'continue_eva').state; continue; }
    try {
      if (pol.skipCat === m.category) { g = engine.skipMission(g).state; continue; }
      if (pol.worstComms && m.category === 'comms') { g = rnd() < 0.5 ? engine.skipMission(g).state : engine.resolveMission(g, m.id, 'B', {}).state; continue; }
      const choice = rnd() < pol.a ? 'A' : 'B';
      const ok = pol.failCat === m.category ? false : rnd() < pol.ok;
      g = engine.resolveMission(g, m.id, choice, { performance: choice === 'A' ? { completed: ok, accuracy: ok ? 80 + Math.round(rnd() * 20) : 20, mistakes: ok ? 0 : 3, hintsUsed: 0 } : undefined }).state;
    } catch { break; }
  }
  if (g.endingId) endings.set(g.endingId, (endings.get(g.endingId) || 0) + 1);
}
const missing = Array.from({ length: 50 }, (_, i) => i + 1).filter((i) => !seen.has(i));
console.log(`Partidas: ${N}`);
console.log(`Tareas alcanzadas: ${seen.size} de 50${missing.length ? ' · faltan ' + missing.join(', ') : ''}`);
console.log('Finales:', [...endings.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `#${k}×${v}`).join('  '));
