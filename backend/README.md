# Moon Survival — Backend v0.3.1

**Responsable del backend:** Farid · Proyecto NASA Space Apps Challenge

**Estado:** prototipo funcional de integración; 50 retos originales y tienda; **44 pruebas automatizadas aprobadas** el 14 de noviembre de 2026 en Node.js v22.16.0. Es un punto de partida técnicamente funcional, no un sistema de producción ni un simulador validado de ingeniería espacial.

## 1. Qué incluye

- Catálogo exacto del HTML: **50 retos, 10 dificultades, dos opciones por reto**, **7 artículos de tienda y 10 finales**.
- **7 días terrestres** de campaña, 2 retos por día: máximo **14 turnos**; emergencias pueden finalizar antes.
- **9 medidores**: oxígeno, agua, energía, comida, protección, comunicaciones, salud, moral e investigación.
- **Dificultad adaptativa**: comienza en retos sencillos; avance según resultados del minijuego, uso de ayudas y estado de la base; una crisis puede imponer una misión especial.
- **Semilla aleatoria reproducible:** mismo valor `seed` + mismas decisiones y minijuegos = misma secuencia de selección y premios; `id` y fecha no forman parte de la secuencia.
- **Minijuegos:** `performance` con `accuracy`, `completed`, `mistakes`, `hintsUsed`; entrega `completed`, `partial`, `failed`. Si el frontend solo manda A/B, el motor lo deja como `decision_only` sin afirmar que hubo precisión medida.
- **Fallos y omisiones** crean consecuencias en recursos y estados persistentes; los siguientes retos pueden depender de ellas.
- **Tienda**: 7 artículos, monedas, stock, consumo inmediato, compras verificadas. Doble clic protegible con `requestId` idempotente.
- **Comunicaciones:** mensajes `status_report`, `science_report`, `rescue_request`, entrega/confirmación en turnos y posibles retrasos por fallos. **Estos turnos representan operación/protocolos, NO segundos de viaje-luz Luna–Tierra.**
- **Clima espacial:** escenario de entrenamiento en día 5 respaldado por evento histórico DONKI (si hay evento SEP/CME), con elección refugio/salida y consecuencias **ficticias**. No convierte datos DONKI en una dosis lunar.
- **10 finales**: el backend escoge el desenlace mediante las reglas acordadas y devuelve indicadores, estados y un `why` explicativo.
- **Repetir día:** vuelve al comienzo de cualquier día ya alcanzado, deshaciendo decisiones, compras y recursos posteriores, y restaurando el estado de la semilla. La auditoría técnica puede conservar que hubo repetición.
- **Mascota LUNI:** diálogo educativo, búsqueda de temas, referencias DONKI y pistas sin dar necesariamente A/B. Funciona sin red, **no es un modelo generativo**.
- **Dos modalidades:** API local Node + SQLite; módulo offline reutilizable en HTML/JS con localStorage, PWA/service worker opcional.
- **Registros científicos NASA**: dos eventos históricos archivados y verificables preincluidos, más importador para DONKI actual/histórico.

## 2. Instalar en Windows con Visual Studio Code

1. Instalar **Node.js 24 LTS** de https://nodejs.org/ (también probado con Node 22.16.0; puede mostrar advertencia experimental de SQLite).
2. Descomprimir el ZIP y abrir **la carpeta que contiene `package.json`** con **Archivo → Abrir carpeta** en VS Code. El ZIP NO tiene una segunda subcarpeta.
3. Abrir **Terminal → New Terminal**.
4. Ejecutar:

```powershell
node -v
dir package.json
npm.cmd test
npm.cmd run demo
npm.cmd start
```

Dejá `npm.cmd start` en ejecución; visitar:

- http://127.0.0.1:3001/health
- http://127.0.0.1:3001/api/v1/missions
- http://127.0.0.1:3001/api/v1/shop
- http://127.0.0.1:3001/api/v1/science-events

No es un error si muestra JSON en vez de juego: eso es el backend.

> PowerShell suele bloquear `npm.ps1`. Si sucede, ejecutá **`npm.cmd`**, no `npm`.

## 3. Probar videojuego offline ya incluido

El paquete incorpora `public/offline-demo.html`, un **panel técnico jugable** para probar las decisiones, tienda, NPC y repetición de días sin el frontend artístico.

```powershell
npm.cmd run build:offline
npm.cmd run serve:offline
```

Abrí **http://127.0.0.1:4173**. El servidor es local y funciona **aunque no tengas Internet**. Se necesita mantener Node ejecutándose para servir las páginas de esta modalidad. El navegador guarda la partida en `localStorage`.

También podés abrir `public/offline-standalone.html` directamente (un solo archivo HTML con el motor integrado), pero algunos navegadores limitan el almacenamiento de páginas `file://`; para comprobar el guardado, usá la dirección `127.0.0.1:4173`.

La versión offline se entrega como **`public/offline-engine.js`**, más `public/offline-standalone.html` para mostrar una demo completa con un solo archivo. Se puede cargar con `<script src="offline-engine.js"></script>` y usar `window.MoonSurvival` desde **HTML/CSS/JavaScript o Phaser**. No requiere React.

`public/sw.js` permite almacenar estos archivos en caché en un origen local/HTTPS después de la primera visita (PWA básica, no un instalador completo). Para publicar como PWA en producción se recomienda agregar iconos e instalar por HTTPS.

## 4. Cómo funciona SQLite

**No instalés MySQL, SQL Server ni un servicio SQLite.** Node.js incluye `node:sqlite` y crea automáticamente el archivo de base de datos al arrancar la API:

`data/moon-v03.sqlite`

La extensión `.sqlite` se abre con una extensión SQLite Viewer en VS Code o con la aplicación gratuita SQLite Browser (opcional). Consultá el resumen sin instalar nada adicional:

```powershell
npm.cmd run db:status
```

El sistema crea tablas `games`, `mission_history`, `purchase_history`, `audit_events` y `science_events`. Guarda el estado completo en `games.state_json`. La partida persiste aunque se cierre la terminal y se vuelva a iniciar el servidor. **No borrés el archivo `.sqlite` si querés conservar las partidas**.

SQLite no se comparte automáticamente con otros equipos. Para usar una API en Internet necesitarán hosting, autenticación básica/seguridad para las partidas y una estrategia de persistencia del servidor. Para hackathon con frontend offline, la versión de navegador evita esos requisitos.

## 5. NASA: cómo conseguir registros DONKI

Se incluyen dos **notificaciones reales y archivadas** del sistema NASA CCMC DONKI correspondientes a mayo de 2024. Una SEP observada por STEREO A y una GST observada en la magnetosfera terrestre. **No se presentan como mediciones en la Luna ni datos actuales**.

1. Conseguir clave gratuita en https://api.nasa.gov/ (botón de generación de API key). La clave es personal: no compartirla en Git ni escribirla en HTML.
2. Crear archivo `.env` copiando `.env.example` y editándolo (si querés un intervalo histórico, por ejemplo mayo de 2024). En Windows:

```powershell
Copy-Item .env.example .env
```

3. Editar `NASA_API_KEY`, `NASA_START_DATE` y `NASA_END_DATE` en `.env`.
4. Ejecutar **con carga explícita de variables**:

```powershell
node --env-file=.env scripts/sync-donki.js
```

5. Verificar `data/nasa-events.json` y `npm.cmd run db:status`. Para que los registros importados funcionen **sin Internet** después, ejecutar `npm.cmd run build:offline` de nuevo.
6. Reiniciar `npm.cmd start` si el servidor ya estaba ejecutándose y querés que relea archivos actualizados. Los eventos sincronizados con SQLite pueden consultarse en el endpoint sin reiniciar.

El importador consulta **SEP, CME y GST** usando la API de NASA, valida que la respuesta sea un arreglo, guarda fecha de observación y de descarga, URL de fuente y tipo. Si NASA falla, conserva el archivo histórico sin fabricar valores. Requiere conexión **solamente en el momento de sincronizar**, no al jugar.

### Datos y límites científicos

- NASA DONKI registra actividad espacial; una alerta SEP, CME o tormenta geomagnética no proporciona automáticamente una **dosis exacta** dentro de un hábitat lunar.
- `science-events` devuelve fuente, fecha, tipo y la diferencia entre `registro_historico_verificado` y `registro_nasa_descargado`.
- Las barras de 0–100, penalizaciones, probabilidades, retrasos por turno y recompensas son **mecánicas educativas inventadas**, no cifras de NASA.
- Una GST/Kp observada en Tierra **no debe** describirse como radiación medida en Luna.

Fuentes NASA: https://api.nasa.gov/ · https://ccmc.gsfc.nasa.gov/tools/DONKI/ · https://ccmc.gsfc.nasa.gov/storms/may2024/ .

## 6. NPC LUNI

No necesita API de IA ni recopila datos personales. Busca temas definidos en `data/science-facts.json`, agrega referencias científicas e incorpora registros de DONKI cuando corresponde. Puede dar una pista científica del reto activo (`hint:true`) sin revelar directamente la opción óptima. Solo se guarda el contador de ayudas, **no el texto completo que escribió el niño**.

Si quieren una mascota con IA generativa real, eso es otra fase: necesita proveedor/modelo, una clave **solo en el backend**, filtros para menores, políticas de costo y privacidad, y una capa de recuperación de información con fuentes. **No está implementada en v0.3.**

## 7. Archivos más importantes

- `src/core/engine.js`: motor **puro** compatible con navegador.
- `src/server.js`: API HTTP + SQLite.
- `data/challenges.json`: los 50 retos originales, sin cambiar sus textos A/B.
- `data/shop.json`, `data/endings.json`: tienda y finales del HTML.
- `data/nasa-events.json`: registros DONKI archivados / nuevos importados.
- `data/science-facts.json`: respuestas base de LUNI.
- `scripts/sync-donki.js`: importación de NASA.
- `scripts/build-offline.js`: compila el mismo motor para HTML.
- `public/offline-demo.html`: demo offline funcional.
- `docs/API.md`: endpoints con ejemplos.
- `docs/INTEGRACION_FRONTEND.md`: cómo conectar Sara y Solieth.
- `tests/backend.test.js`: 39 pruebas.

## 8. Lo que todavía necesita el equipo

**No se suministran automáticamente minijuegos visuales ni assets.** Sara y Solieth deben implementar el mapa, las interacciones y enviar el resultado `performance` de cada minijuego. Franya y Angie deben confirmar qué tareas miden los minijuegos y si ciertos umbrales o consecuencias cambian.

**Privacidad y despliegue:** la API local no implementa login/autorización ni protección de partidas si se hace pública. Por seguridad no hay perfiles reales de menores. Para publicación pública, preferí el motor offline/PWA o añadí controles de acceso antes de subir Node a Internet.

**No se garantiza que todas las rutas narrativas hayan sido testeadas con niños ni que las reglas de supervivencia sean científicamente precisas.** Las 39 pruebas verifican funcionamiento técnico representativo. Las reglas se mantienen editables.


## Actualización LUNI 0.3.1

LUNI ahora distingue saludos, estado de la partida, consejos sobre el reto activo, temas de STEM y preguntas sobre datos NASA DONKI. Si no entiende algo, **no** vuelve automáticamente a la ficha de oxígeno; reconoce sus límites. Los eventos consultados proceden de la caché descargada y muestra fecha/fuente, nunca afirma consultar NASA en tiempo real.

Para actualizar sin perder SQLite ni tu descarga DONKI, aplicá el parche de archivos de código sobre la misma carpeta (no reemplaces `data/`, `.env` o `*.sqlite`). Después ejecutá `npm.cmd run build:offline`, `npm.cmd test` y reiniciá `npm.cmd start`. En el navegador offline recargá para que se actualice el service worker. El servidor integra los eventos que llegaron a SQLite incluso en partidas iniciadas antes de la sincronización.

LUNI **sigue sin ser un modelo de IA generativa**. Para responder cualquier pregunta con lenguaje libre hará falta una integración adicional con un modelo y recuperación verificable de datos, con controles de privacidad adecuados para menores.
