# Moon Survival v0.3 — Contrato de API (Sara / Solieth / Farid)

Base URL local: `http://127.0.0.1:3001`

JSON en todas las respuestas. Solicitudes POST usan `Content-Type: application/json`.

## Consulta

| Método | Ruta | Uso |
|---|---|---|
| GET | `/health` | estado del servidor |
| GET | `/api/v1/catalog` | cantidades de retos, tienda y datos |
| GET | `/api/v1/missions` | 50 retos; acepta `?difficulty=3&category=life` |
| GET | `/api/v1/shop` | catálogo de tienda |
| GET | `/api/v1/science-events` | registros históricos NASA y datos sincronizados |
| GET | `/api/v1/science/facts` | fichas científicas que usa LUNI |
| GET | `/api/v1/science/sources` | enlaces de origen |
| GET | `/api/v1/games/:id` | estado actual y próximo reto |
| GET | `/api/v1/games/:id/next-mission` | misión activa |
| GET | `/api/v1/games/:id/shop` | precios, compras, disponibilidad |
| GET | `/api/v1/games/:id/history` | línea temporal activa de la partida |
| GET | `/api/v1/games/:id/communications` | mensajes y confirmaciones |
| GET | `/api/v1/games/:id/weather` | alerta pendiente y fuente NASA |
| GET | `/api/v1/games/:id/report` | final y explicación, solo si termina |

## Acciones

| Método | Ruta | JSON de entrada |
|---|---|---|
| POST | `/api/v1/games` | `{ "seed": "mi-semilla" }` |
| POST | `/api/v1/games/:id/missions/:missionId/resolve` | `{"choiceId":"A","performance":{"completed":true,"accuracy":92,"mistakes":1,"hintsUsed":0},"requestId":"accion-123456"}` |
| POST | `/api/v1/games/:id/skip-turn` | `{}` |
| POST | `/api/v1/games/:id/shop/purchase` | `{ "itemId":"agua","requestId":"compra-123456" }` |
| POST | `/api/v1/games/:id/repeat-day` | `{ "day":3 }` |
| POST | `/api/v1/games/:id/weather/respond` | `{ "choice":"shelter" }` o `continue_eva` |
| POST | `/api/v1/games/:id/communications/send` | `{ "type":"status_report" }` o `science_report`, `rescue_request` |
| POST | `/api/v1/games/:id/npc/ask` | `{ "question":"¿Qué es DONKI?", "hint":true }` |

`requestId` opcional, pero **muy recomendado** para botones de compra y resolución: evitamos procesar dos veces una misma acción. Generar identificador único por clic (por ejemplo `crypto.randomUUID()` desde frontend). **No reutilizarlo para otra acción.**

## Ejemplo completo desde PowerShell

Con `npm.cmd start` ejecutándose en una terminal distinta:

```powershell
$base = 'http://127.0.0.1:3001/api/v1'
$p = Invoke-RestMethod -Uri "$base/games" -Method Post -ContentType 'application/json' -Body '{"seed":"Farid-1"}'
$id = $p.game.id
$id
$next = Invoke-RestMethod -Uri "$base/games/$id/next-mission"
$next.next.name
$result = Invoke-RestMethod -Uri "$base/games/$id/missions/1/resolve" -Method Post -ContentType 'application/json' -Body '{"choiceId":"A","performance":{"completed":true,"accuracy":95,"mistakes":0,"hintsUsed":0},"requestId":"reto-000001"}'
$result.result.status
$result.game.metrics
Invoke-RestMethod -Uri "$base/games/$id/history"
```

## Cómo interpreta un minijuego

`performance.completed` = completó la tarea (true/false). `accuracy` = calidad de ejecución del 0 al 100. `mistakes` = errores, `hintsUsed` = pistas vistas en esa acción. El backend calcula un puntaje educativo (no NASA) con ponderaciones ajustables en `src/core/engine.js`, y entrega:

- `completed`: avances y monedas del rango del HTML.
- `partial`: parte del beneficio, mitad de monedas aproximada, deja estado pendiente.
- `failed`: no otorga monedas, no concede beneficios positivos y deja una falla persistente.
- `missed`: omisión penaliza recursos y estado, sin recompensa.

Si el frontend solamente manda `{choiceId:"A"}` por ahora, se acepta compatibilidad (`assessmentMode:"decision_only"`). No fingimos haber medido la calidad de un minijuego que todavía no existe.

## Integración de clima espacial

En el **día 5**, el motor puede crear `game.weather.pending: true`. Mientras esté pendiente, una nueva decisión de misión regresa `409 WEATHER_RESPONSE_REQUIRED`. Mostrá un panel de refugio / salida y llamá al endpoint `weather/respond` para continuar. No es un pronóstico lunar: referencia histórica NASA + escenario educativo simulado.

## Compras

Los artículos tienen `limit`, `price`, `delta`, `remove` definidos en `data/shop.json`. Una compra no consume turno. Nunca actualices monedas directamente en frontend; realizá el POST y refrescá el estado retornado por servidor.

## Datos de una partida

`GET .../next-mission` incluye `next.modifiers`: `timeMultiplier` para ajustar tiempos de minijuegos y `resourceCostMultiplier` para costes adicionales generados por fallas previas (cifras didácticas). El frontend debe leer este campo antes de iniciar cada minijuego.

`game` incluye `day`, `turn`, `phase`, `skill`, `metrics`, `statuses`, `coins`, `inventory`, `missionResults`, `history`, `purchases`, `messages`, `weather`, `events`, `science`, `daySummaries`, `snapshots` y `seed`. Son datos del motor, no imágenes.

## Qué mostrar en frontend

- Estado de recursos: `game.metrics`.
- Tienda: `GET .../shop` (o `window.MoonSurvival.shop(game)` offline).
- Dialogar NPC: respuesta `npc.answer`, `npc.hint`, `npc.observation`, `npc.sources`.
- Final: `report.ending`, `report.why.criteria`, `report.why.evidence`.
- Avisos: si `game.weather?.pending`, mostrar elección del clima espacial antes del siguiente reto.
- Guardar: con API local el backend almacena automáticamente en SQLite; con motor offline el frontend hace `localStorage.setItem(key,JSON.stringify(game))` después de cada acción.

## Errores comunes

- `404 NOT_FOUND`: ruta incorrecta.
- `404 GAME_NOT_FOUND`: id inexistente.
- `409 NOT_CURRENT_MISSION`: tratás de responder un reto ya terminado / que no es el actual.
- `409 WEATHER_RESPONSE_REQUIRED`: resolvé la alerta pendiente primero.
- `409 OUT_OF_STOCK`: límite de compras.
- `409 INSUFFICIENT_COINS`: sin fondos.
- `409 REPORT_NOT_READY`: campaña activa.
- `400 INVALID_PERFORMANCE`: entrada de minijuego inválida.

No usen jamás `http://127.0.0.1:3001` como URL remota desde el equipo de otra persona: `localhost` siempre apunta a la propia computadora. Para colaboración sin backend online, integren el **motor offline**.
