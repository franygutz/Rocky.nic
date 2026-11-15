// Catálogo de las 50 tareas (retos del backend) enlazadas con su escenario, equipo y puzzle.
// Fuente de verdad: backend/data/challenges.json. Aquí solo se agregan los campos técnicos del mundo.
import { placeOf, SCENES } from './scenes.js';
import { MINIGAME_OF, CATEGORY } from '../rules.js';

export const PUZZLE_NAME = {
  Leak: 'Tapar fugas en orden',
  Dust: 'Limpiar el polvo de los paneles',
  Water: 'Repetir la secuencia de riego',
  Dose: 'Leer el dosímetro en la zona verde',
  Antenna: 'Orientar la antena hacia la Tierra'
};

// Estado de cada tarea según la partida: bloqueada, disponible, activa, completada o fallida.
// "Omitida" cuenta como fallida: no hubo éxito ni recompensa.
export function taskState(game, id) {
  const r = game?.missionResults?.[id];
  if (r) return r.status === 'completed' || r.status === 'partial' ? 'completada' : 'fallida';
  if (game?.currentMissionId === id && game.phase === 'active') return 'activa';
  if (game?.queue?.some((q) => q.id === id)) return 'disponible';
  return 'bloqueada';
}

export const STATE_LABEL = { activa: 'En curso', disponible: 'Disponible', completada: 'Hecha', fallida: 'No salió', bloqueada: 'Por descubrir' };

// Matriz completa: una fila por tarea (para la documentación y para las pruebas de cobertura).
export function taskMatrix(challenges) {
  return challenges.map((c) => {
    const place = placeOf(c);
    const careful = c.choices[0], shortcut = c.choices[1];
    const costs = (d) => Object.entries(d || {}).filter(([, v]) => v < 0).map(([k, v]) => `${k} ${v}`).join(', ') || '—';
    return {
      id: c.id,
      nombre: c.name,
      categoria: c.category,
      escenario: place ? SCENES[place.scene].name : null,
      escenarioId: place?.scene || null,
      equipo: place?.label || null,
      puntoId: place?.id || null,
      puzzle: PUZZLE_NAME[MINIGAME_OF[c.category]],
      dificultadInterna: c.difficulty, // nunca se muestra al jugador
      prerrequisitos: c.id === 1 ? 'ninguno (primera misión)' : 'las tareas que la desbloquean (campo `next` de otras)',
      desbloquea: [...new Set([...(careful.next || []), ...(shortcut.next || [])])],
      recursosOpcionA: costs(careful.delta),
      recursosOpcionB: costs(shortcut.delta),
      recompensa: `${c.rewardMin}–${c.rewardMax} monedas`,
      consecuencia: [...new Set([...(careful.add || []), ...(shortcut.add || [])])].join(', ') || '—',
      reintento: 'repetir el día desde la pausa'
    };
  });
}

export const categoryLabel = (c) => CATEGORY[c]?.label || c;
