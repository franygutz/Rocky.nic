# Vita Lunae v0.5.0 — Contrato de API (Sara / Solieth / Farid)

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
| GET | `/api/v1/science/sources` | enlaces de origen (DONKI, Open APIs, OSDR, RadLab, JPL Horizons, CSA) |
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

## Mundo jugable (v0.5.0)

El frontend 2D simula el movimiento; el motor decide saldo, pedidos, bolsa, aire del traje y guardado del mundo. Todas las operaciones `POST` aceptan `requestId` (8 a 120 caracteres): repetir el mismo `requestId` devuelve el mismo resultado con `duplicate: true`, sin volver a cobrar, entregar ni aplicar efectos.

| Método | Ruta | Entrada | Resultado |
| --- | --- | --- | --- |
| POST | `/api/v1/games/:id/shop/order` | `{ "itemId":"agua", "requestId":"…" }` | Descuenta las monedas una sola vez, cuenta contra el límite del artículo y crea un pedido `confirmed` que estará listo a los 20 s de reloj de mundo. **No** toca la bolsa ni aplica efectos. |
| POST | `/api/v1/games/:id/world/tick` | `{ "seconds":1, "outside":true }` | Avanza el reloj del mundo (máx. 120 s por llamada). Los pedidos `confirmed` pasan a `ready`. Afuera, con el tanque en uso, se gasta `suit.eva`; al llegar a 0 hay una sola consecuencia (salud −8, oxígeno −4, estado `oxigeno_agotado`). Sin tanque cargado no se gasta nada. |
| POST | `/api/v1/games/:id/orders/collect` | `{ "requestId":"…" }` | Pasa los pedidos `ready` a `collected` y suma los artículos a la bolsa (capacidad 12). Errores: `NO_ORDER_READY`, `BAG_FULL`. |
| POST | `/api/v1/games/:id/inventory/use` | `{ "itemId":"agua", "requestId":"…" }` | Aplica el efecto del artículo y lo resta de la bolsa. Error: `ITEM_NOT_IN_BAG`. |
| POST | `/api/v1/games/:id/world/tank` | `{ "percent":0-100, "requestId":"…" }` | **Llena un tanque** (solo adentro de Zora): cuesta **3 de oxígeno de la base** (mínimo 10 en la base), carga el tanque y fija `evaMax = round(180 × (0.4 + 0.6 × percent/100))` s. Con menos de 60 % queda el estado `tanque_incompleto`. Errores: `TANK_FILL_OUTSIDE`, `INSUFFICIENT_STATION_OXYGEN`. |
| POST | `/api/v1/games/:id/world/leave` | `{ "requestId":"…" }` | **Salir de Zora**: exige un tanque cargado (`TANK_NOT_LOADED` si no) y lo pone en uso. |
| POST | `/api/v1/games/:id/world/enter` | `{}` | **Volver a Zora**: el tanque queda **vacío**; para otra salida hay que llenar otro. |
| POST | `/api/v1/games/:id/world/avatar` | `{ "avatar":{ "name","skin","hair","style","eyes","suit","accessory","expression","emblem" } }` | Guarda el astronauta tras validar rangos (piel 0–7, color de cabello 0–9, peinado 0–14, ojos 0–5, traje 0–5, parche 0–15; accesorio `none/freckles/glasses/beard`; expresión `neutral/happy/determined`). Error: `INVALID_AVATAR`. |
| POST | `/api/v1/games/:id/world/state` | `{ "scene":"zora", "pos":{ "x":46, "y":186 } }` | Guarda escenario (`exterior`, `zora`, `invernadero`, `paneles`, `crater`) y posición. Errores: `INVALID_SCENE`, `INVALID_POSITION`. |

Campos nuevos de una partida: `orders[]` (`id`, `itemId`, `status` `confirmed|ready|collected`, `readyAt`), `bag{ itemId: cantidad }` y `world{ avatar, scene, pos, clock, suit{ fill, eva, evaMax } }`. Un guardado v0.4 sin esos campos se abre sin pérdida: se crean al primer uso. Repetir un día restaura todo lo del día salvo el avatar, el escenario y la posición, que se conservan.

En el módulo offline son los mismos métodos del puente: `order`, `collect`, `useItem`, `fillTank`, `setAvatar`, `tick(seconds,{outside})` y `checkpoint(scene,pos)`. `purchase`/`buy` (efecto inmediato) sigue disponible por compatibilidad.

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
- Dialogar NPC: respuesta `npc.answer`, `npc.hint`, `npc.observation`, `npc.sources` y `npc.suggestions` (2 o 3 preguntas que LUNI sabe responder, para mostrarlas como botones).
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

## Idiomas (v0.5.1)

- Puente: `bridge.setLanguage('es'|'en')` y `bridge.getLanguages()`. La vista trae `lang`, `languages` (con `ready`) y `statusNames`. La preferencia se guarda aparte de la partida (`<storageKey>-lang`); la primera vez toma el idioma del navegador.
- HTTP: `GET /api/v1/languages` y `?lang=en` (o cabecera `Accept-Language`) en catálogo, misiones, tienda, hechos científicos y rutas de partida.
- Textos en `data/i18n/<código>.json` (shop, status, endings, facts, challenges). Lo que falte cae al español. Para agregar un idioma: crear su archivo, sumarlo a `LANGUAGES` en `engine.js` y cargarlo en `server.js`, `build-offline.js` y `frontend/src/engine.js`.
- Kita (el chat) entiende preguntas y responde en ambos idiomas.
