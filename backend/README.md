# Vita Lunae — Backend v0.5.0

**Responsable del backend:** Farid · Proyecto NASA Space Apps Challenge 2026 · reto *Junior Astronaut Mission Trainer*

**Estado:** prototipo funcional de integración para la **base lunar Luna-7**. **58 pruebas automatizadas aprobadas** el 14 de noviembre de 2026 (Node.js v26.13.0; requiere Node.js 22.13 o superior). Es un punto de partida técnicamente funcional, no un sistema de producción ni un simulador validado de ingeniería espacial.

## 1. Qué incluye

- Catálogo exacto del HTML de diseño: **50 retos, 10 dificultades, dos opciones por reto**, **7 artículos de tienda y 10 finales**.
- **7 días terrestres** de campaña, 2 retos por día: máximo **14 turnos**; una emergencia puede terminar la partida antes.
- **9 medidores**: oxígeno, agua, energía, comida, protección, comunicaciones, salud, moral e investigación (escalas de juego de 0 a 100).
- **Dificultad adaptativa**: empieza con retos sencillos y avanza según el resultado de los minijuegos, las ayudas usadas y el estado de la base; una crisis puede imponer una misión especial.
- **Semilla reproducible:** mismo `seed` + mismas decisiones y minijuegos = misma secuencia de retos y premios.
- **Minijuegos:** `performance` con `completed`, `accuracy`, `mistakes`, `hintsUsed` → `completed`, `partial` o `failed`. Si el frontend solo manda A/B, el motor lo marca `decision_only` sin fingir que midió precisión.
- **Fallos y omisiones** dejan consecuencias en recursos y estados persistentes; los retos siguientes pueden depender de ellas.
- **Tienda**: 7 artículos, monedas, límites, compras verificadas y `requestId` para evitar dobles clics.
- **Comunicaciones:** mensajes `status_report`, `science_report` y `rescue_request` con confirmación en turnos. **Los turnos son protocolos de operación, no el tiempo-luz real** (que es de ~1,3 s, ver sección 6).
- **Clima espacial:** en el día 5, escenario de entrenamiento con un registro histórico de DONKI (SEP o CME), elección refugio / salida y consecuencias **ficticias**. No convierte datos DONKI en una dosis lunar.
- **10 finales** elegidos por reglas, con indicadores, estados y un `why` que explica el resultado.
- **Repetir día:** vuelve al inicio de cualquier día alcanzado y restaura recursos, compras y semilla.
- **LUNI v0.4:** mascota educativa por reglas, **sin IA generativa y sin internet**. Saluda, informa el estado de la base, da pistas sin revelar la respuesta, explica **CME, SEP, GST, Kp y DONKI**, busca los registros DONKI guardados, responde con **datos verificados de la Luna** y siempre devuelve `sources` y `suggestions`.
- **Dos modalidades:** API local Node + SQLite, o módulo offline para HTML/JS/Phaser con `localStorage` (PWA básica opcional).
- **Mundo jugable (v0.5.0):** pedidos físicos (confirmado → listo → recogido), bolsa de 12 espacios, aire del traje y tanque, avatar y posición guardados; todo con `requestId` idempotente. Detalle en `docs/API.md` y uso en `../frontend/`.
- **Datos NASA:** 27 registros DONKI archivados y verificables, importador de DONKI, y datos verificados de RadLab y JPL Horizons para la Luna.

## 2. Instalar y probar

Necesitás **Node.js 22.13 o superior** (recomendado Node.js 24 LTS de https://nodejs.org/). Abrí en VS Code **la carpeta `backend`**, la que contiene `package.json`, y abrí **Terminal → New Terminal**.

**Windows (PowerShell):**

```powershell
node -v
npm.cmd test
npm.cmd run demo
npm.cmd start
```

> PowerShell suele bloquear `npm.ps1`. Si pasa, usá **`npm.cmd`** en vez de `npm`.

**Linux / macOS:**

```bash
node -v
npm test
npm run demo
npm start
```

Dejá `start` corriendo y visitá:

- http://127.0.0.1:3001/health
- http://127.0.0.1:3001/api/v1/missions
- http://127.0.0.1:3001/api/v1/shop
- http://127.0.0.1:3001/api/v1/science-events
- http://127.0.0.1:3001/api/v1/science/sources

No es un error si se ve JSON en vez del juego: eso es el backend. Todas las rutas están en `docs/API.md`.

## 3. Probar el videojuego offline incluido

`public/offline-demo.html` es un **panel técnico jugable** para probar decisiones, tienda, LUNI y repetición de días sin el frontend artístico.

```powershell
npm.cmd run build:offline
npm.cmd run serve:offline
```

Abrí **http://127.0.0.1:4173**. Funciona **sin internet** mientras Node sirve las páginas. También podés abrir `public/offline-standalone.html` directamente (un solo HTML con todo adentro), pero algunos navegadores limitan `localStorage` en `file://`; para probar el guardado, usá `127.0.0.1:4173`.

Para el frontend se entrega **`public/offline-engine.js`**: se carga con `<script src="offline-engine.js"></script>` y expone `window.MoonSurvival` (motor) y `window.MoonSurvivalFrontend()` (puente con suscripción y guardado). Sirve para HTML/CSS/JavaScript o Phaser; no requiere React. La guía es `docs/ENTREGA_AL_FRONTEND.md` y la prueba del puente, `public/frontend-bridge-demo.html`.

`public/sw.js` guarda estos archivos en caché en un origen local o HTTPS después de la primera visita (PWA básica). Para publicar como PWA en producción conviene agregar iconos y servir por HTTPS.

**Guardado en el navegador:** la partida queda en `localStorage` **sin fecha de vencimiento**: sigue ahí hasta que el niño toca "Borrar progreso" (`clearProgress()`) o se borran los datos del navegador. No se guarda ningún dato personal.

## 4. Cómo funciona SQLite

**No instalés MySQL, SQL Server ni un servicio SQLite.** Node.js trae `node:sqlite` y crea el archivo al arrancar la API:

`data/moon-v03.sqlite`

(El nombre se conserva para no perder partidas de versiones anteriores.) Se puede abrir con una extensión SQLite Viewer de VS Code o con SQLite Browser. Resumen sin instalar nada:

```powershell
npm.cmd run db:status
```

Tablas: `games`, `mission_history`, `purchase_history`, `audit_events` y `science_events`. El estado completo va en `games.state_json` y persiste aunque se cierre la terminal. **No borrés el `.sqlite` si querés conservar las partidas.**

SQLite no se comparte con otras computadoras. Una API pública necesitaría hosting, autenticación y persistencia en el servidor; para el hackatón, el motor offline evita esos requisitos.

## 5. NASA DONKI: cómo actualizar los registros

`data/nasa-events.json` trae **27 registros** de la tormenta solar de mayo de 2024 (9 al 12 de mayo): **16 CME, 8 SEP y 3 GST**, 26 descargados de la API de NASA el 14-11-2026 y 1 registro histórico verificado a mano. **No se presentan como mediciones en la Luna ni como datos actuales.**

1. Conseguí una clave gratuita en https://api.nasa.gov/. Es personal: no la compartas en Git ni la escribas en HTML.
2. Copiá el ejemplo y editá `NASA_API_KEY`, `NASA_START_DATE` y `NASA_END_DATE` (máximo 30 días):

```powershell
Copy-Item .env.example .env
```

```bash
cp .env.example .env
```

3. Importá **con carga explícita de variables**:

```powershell
node --env-file=.env scripts/sync-donki.js
```

4. Revisá `data/nasa-events.json` y `npm.cmd run db:status`. Para que los registros nuevos funcionen **sin internet**, corré `npm.cmd run build:offline` otra vez.
5. Reiniciá `npm.cmd start` si el servidor ya estaba corriendo. Los eventos que llegan a SQLite se ven en el endpoint sin reiniciar.

El importador consulta **SEP, CME y GST**, valida que la respuesta sea un arreglo, guarda fecha de observación, fecha de descarga, URL de fuente y tipo. Si NASA falla, conserva el archivo sin inventar valores. Solo necesita internet al sincronizar, no al jugar.

## 6. Datos verificados de la Luna (LUNI)

Descargados y verificados el 14-11-2026; están en `data/science-facts.json` con su fuente y la consulta exacta (`verified`):

| Dato | Valor | Fuente |
|---|---|---|
| Retraso de la señal Tierra–Luna | **1,35 s** el 14-11-2026 (Luna a 405 616 km); de 1,19 a 1,36 s entre noviembre y diciembre de 2026 | NASA/JPL Horizons |
| Radiación en un día normal | **13,22 μGy/h** (1–2 de enero de 2020) | NASA OSDR RadLab · LRO CRaTER |
| Radiación en la tormenta del 11-09-2017 | **19 481,6 μGy/h**, unas **1732 veces** lo normal | NASA OSDR RadLab · LRO CRaTER |

CRaTER mide **en órbita lunar, no dentro de un hábitat**; LUNI lo aclara siempre. El detalle está en `docs/DATOS_NASA.md`.

### Límites científicos

- DONKI registra actividad solar; una alerta SEP, CME o una tormenta geomagnética no da una **dosis exacta** dentro de un hábitat lunar.
- Una GST o un índice Kp se mide en la Tierra: **no** describe radiación en la Luna.
- Las barras de 0 a 100, penalizaciones, probabilidades, retrasos por turno y recompensas son **mecánicas educativas inventadas**, no cifras de NASA.

Fuentes: https://api.nasa.gov/ · https://ccmc.gsfc.nasa.gov/tools/DONKI/ · https://ccmc.gsfc.nasa.gov/storms/may2024/ · https://visualization.osdr.nasa.gov/radlab/gui/data-api/ · https://ssd.jpl.nasa.gov/horizons/

## 7. LUNI

No necesita API de IA ni recopila datos personales. Usa los temas de `data/science-facts.json`, el glosario de clima espacial del motor y los registros DONKI guardados. Puede dar una pista del reto activo (`hint:true`) sin revelar la opción óptima. Solo se guarda el contador de ayudas, **no el texto que escribió el niño**. Si no sabe algo, lo dice en vez de inventar.

Una mascota con IA generativa sería otra fase: proveedor y modelo, clave **solo en el backend**, filtros para menores, políticas de costo y privacidad, y recuperación de fuentes. **No está implementada.**

## 8. Archivos más importantes

- `src/core/engine.js`: motor **puro** (sin Node, HTTP ni base de datos), compatible con navegador; incluye LUNI.
- `src/core/frontend-bridge.js`: contrato para el frontend (vista, suscripción, guardado local).
- `src/server.js`: API HTTP + SQLite.
- `data/challenges.json`: los 50 retos originales, sin cambiar sus textos A/B.
- `data/shop.json`, `data/endings.json`, `data/status-names.json`: tienda, finales y nombres de estados.
- `data/nasa-events.json`: registros DONKI archivados e importados.
- `data/science-facts.json`: fichas de LUNI, con datos verificados.
- `scripts/sync-donki.js`: importación de NASA. `scripts/build-offline.js`: compila el motor para HTML.
- `public/offline-engine.js`, `public/offline-standalone.html`, `public/offline-demo.html`, `public/frontend-bridge-demo.html`: versión offline y demos.
- `docs/API.md`, `docs/ENTREGA_AL_FRONTEND.md`, `docs/INTEGRACION_FRONTEND.md`, `docs/DATOS_NASA.md`.
- `tests/backend.test.js` (45 pruebas) y `tests/frontend-bridge.test.js` (13 pruebas).
- `.env.example`: variables para importar DONKI y configurar el servidor.

## 9. Lo que todavía necesita el equipo

**No se incluyen minijuegos visuales ni assets.** Sara y Solieth implementan el mapa, las interacciones y envían el `performance` de cada minijuego. Franya y Angie confirman qué miden los minijuegos y si cambian umbrales o consecuencias.

**Privacidad y despliegue:** la API local no tiene login ni protección de partidas si se hace pública. No hay perfiles reales de menores. Para publicar, preferí el motor offline/PWA o agregá controles de acceso antes de subir Node a internet.

**No se garantiza que todas las rutas narrativas se hayan probado con niños ni que las reglas de supervivencia sean científicamente precisas.** Las 58 pruebas verifican el funcionamiento técnico. Las reglas siguen siendo editables.

## 10. Historial de versiones

- **0.5.0** (pulido): LUNI con glosario de clima espacial y `suggestions`; datos verificados de la Luna (RadLab · LRO CRaTER y JPL Horizons) con su consulta; `/api/v1/science/sources` incluye RadLab y Horizons; `.env.example`; `.gitignore` de la raíz arreglado; versión offline recompilada; caché del service worker renovada; README y docs al día.
- **0.4:** puente para el frontend (`frontend-bridge.js`), minijuegos en dos pasos, guardado local compatible con v0.3, importación de 26 registros DONKI de mayo de 2024.
- **0.3.1:** LUNI distingue saludos, estado de la partida, pistas, temas STEM y preguntas sobre DONKI, y reconoce sus límites.

**Para actualizar sin perder partidas ni descargas:** aplicá los archivos de código sobre la misma carpeta (no reemplaces `data/nasa-events.json`, `.env` ni `*.sqlite`), corré `npm.cmd run build:offline` y `npm.cmd test`, y reiniciá `npm.cmd start`. En el navegador, recargá para que se actualice el service worker.
