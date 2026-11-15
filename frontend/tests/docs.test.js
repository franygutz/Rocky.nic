// Genera docs/MATRIZ_TAREAS.md (matriz de cobertura de las 50 tareas). Corre con:  npm run docs
import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { taskMatrix } from '../src/world/tasks.js';
import { catalog } from '../src/engine.js';
import { CATEGORY } from '../src/rules.js';

describe('Matriz de cobertura', () => {
  it('escribe docs/MATRIZ_TAREAS.md', () => {
    if (!process.env.GEN_DOCS) return;
    const rows = taskMatrix(catalog.challenges);
    const esc = (s) => String(s).replace(/\|/g, '\\|');
    const head = '| # | Tarea | Categoría | Escenario | Equipo (punto de interacción) | Puzzle | Dif. interna | Costo opción A | Costo opción B | Recompensa | Consecuencias | Desbloquea |\n| ---: | --- | --- | --- | --- | --- | :---: | --- | --- | --- | --- | --- |';
    const body = rows.map((r) => `| ${r.id} | ${esc(r.nombre)} | ${CATEGORY[r.categoria].label} | ${r.escenario} | ${esc(r.equipo)} (\`${r.puntoId}\`) | ${r.puzzle} | ${r.dificultadInterna} | ${r.recursosOpcionA} | ${r.recursosOpcionB} | ${r.recompensa} | ${esc(r.consecuencia)} | ${r.desbloquea.join(', ') || '—'} |`).join('\n');
    const byScene = Object.entries(rows.reduce((a, r) => ((a[r.escenario] = (a[r.escenario] || 0) + 1), a), {})).map(([k, v]) => `- ${k}: ${v} tareas`).join('\n');
    const md = `# Matriz de cobertura de las 50 tareas

Generada con \`npm run docs\` a partir de \`backend/data/challenges.json\`. La dificultad interna (1–10) **no se muestra al jugador**: aquí solo sirve para auditar el balance.

${head}
${body}

## Reparto por escenario

${byScene}

## Cómo se comprobó la cobertura

- **Implementadas y enlazadas:** \`tests/world.test.js\` exige que las 50 tareas tengan escenario, equipo existente, puzzle y recompensa, que cada equipo se pueda alcanzar caminando desde la aparición y que cada escenario se llegue desde el exterior por sus puertas.
- **Alcanzables bajo sus condiciones:** el motor elige la siguiente tarea según el desempeño. Se jugaron **7 000 partidas simuladas** con el motor real (estrategias de opción A/B, éxito o fallo del puzzle y fallos dirigidos de comunicaciones o soporte vital) y se alcanzaron **las 50 tareas y los 10 finales** (\`node tools/simular-alcance.mjs 7000\`; resultado en \`docs/EVIDENCIA.md\`). Una sola partida dura 14 turnos, así que nadie las ve todas en una misma partida: el Diario de tareas muestra cuáles ya apareció.
- **Éxito, fallo, tiempo agotado y reintento:** éxito y fallo los resuelve el motor con el desempeño del puzzle (\`completed\`, \`accuracy\`, \`mistakes\`); «Rendirme» y el tiempo agotado entregan \`completed:false\`; «Omitir reto» cuenta como no hecha y sin recompensa; el reintento es **Repetir un día** desde la pausa.
`;
    mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
    writeFileSync(new URL('../docs/MATRIZ_TAREAS.md', import.meta.url), md);
    expect(rows).toHaveLength(50);
  });
});
