# Moon Survival — Contrato de integración para frontend (Luna)

**Versión de integración: v0.4.1** (puente v0.4 + LUNI con glosario, sugerencias y datos verificados de la Luna).

## Decisiones definitivas del juego

- **Escenario:** base lunar Luna-7. No usar el mapa de Jezero ni los cálculos físicos de Marte del tablero.
- **Duración:** 7 días terrestres, dos retos por día, 14 turnos máximos.
- **Contenido:** 50 retos originales, dos opciones A/B por reto, 10 finales, 7 artículos de tienda.
- **Recursos:** `oxygen`, `water`, `energy`, `food`, `shield`, `comms`, `health`, `morale`, `research` (0–100); el frontend decide cómo mostrarlos, pero no modifica esos números directamente.
- **LUNI:** asistente científico offline por reglas, con contexto de preguntas y registros históricos DONKI. **No es una IA generativa** ni ofrece datos en vivo cuando trabaja offline.
- **NASA:** el frontend muestra fuente, fecha de observación y aviso de que los efectos de la partida son ficticios; DONKI no mide dosis exactas en nuestra Luna-7.

## Lo único imprescindible que reciben Sara y Solieth

1. `public/offline-engine.js` **generado después de importar DONKI y correr `npm.cmd run build:offline`**. Este único archivo incluye los 50 retos, los diez finales, LUNI, motor y copia de registros DONKI.
2. Este documento `docs/ENTREGA_AL_FRONTEND.md`.
3. Opcionalmente `public/frontend-bridge-demo.html` para ver cómo conectarlo. No es el juego artístico.

**Nunca mandar** `.env` (clave NASA), `data/moon-v03.sqlite` (partidas), archivos `.sqlite-wal`/`.sqlite-shm` ni carpetas enteras `node_modules`.

## Inicio desde HTML/CSS/JS

```html
<script src="./offline-engine.js"></script>
<script>
  const juego = window.MoonSurvivalFrontend();
  juego.subscribe((vista, evento) => {
    console.log(evento.action, vista.day, vista.metrics, vista.mission);
    // Actualizar el DOM, barras, botones y escenas de Phaser.
  });
</script>
```

No se necesita React, ni un servidor Python, ni tener Node.js corriendo durante la partida offline. Con `file://` puede haber limitaciones de `localStorage`; para probar guardado consistente, servir los archivos por HTTP local o HTTPS.

## Acciones que puede utilizar el frontend

| Acción | Cuándo llamar | Resultado |
|---|---|---|
| `juego.getView()` | Dibujar interfaz | Copia del estado, reto actual, tienda, alertas y final |
| `juego.subscribe(fn)` | Al cargar la pantalla | Redibuja después de cada cambio; devuelve función de cancelación |
| `juego.newGame({seed:'luna-7'})` | Nueva partida | Reinicia con semilla fija y datos DONKI incluidos |
| `juego.chooseCard('A')` | Carta sin minijuego | Resuelve A/B inmediatamente como decisión, sin precisión medida |
| `juego.prepareMinigame('B')` | Jugador elige B y empieza minijuego | Guarda la elección, sin pasar turno |
| `juego.finishMinigame({completed:true,accuracy:88,mistakes:1,hintsUsed:0})` | Minijuego termina | Evalúa calidad y aplica consecuencias; pasa turno |
| `juego.skipCard()` | Jugador omite reto | Registra consecuencia de omisión |
| `juego.respondWeather('shelter')` | Alerta climática del día 5 | Resuelve refugio; también existe `continue_eva` |
| `juego.buy('agua')` | Tienda | Aplica compra y verifica recursos/límites |
| `juego.sendMessage('science_report')` | Panel de comunicaciones | Registra mensaje diferido por turnos de protocolo, no tiempo de luz real |
| `juego.askLuni('¿Qué significa CME?')` | Chat de mascota | Respuesta, fuentes y sugerencias; no avanza turno |
| `juego.repeatDay(3)` | Repetir una jornada alcanzada | Restaura estado y semilla al inicio del día 3 |
| `juego.clearProgress()` | Borrar mi progreso | Elimina guardado local y deja juego sin iniciar |
| `juego.refreshNASA(eventos)` | Cuando llegue caché externo actualizado | Incorpora registros verificables sin reiniciar la partida |

## Contrato de minijuego

El frontend define la animación, tiempo, toques y criterios de precisión de cada minijuego. El backend interpreta la respuesta de la forma siguiente:

```js
juego.prepareMinigame('A');
// Aquí el jugador juega. Después:
const resultado = juego.finishMinigame({
  completed: true,
  accuracy: 90, // 0..100
  mistakes: 1,  // entero >=0
  hintsUsed: 0  // entero >=0
});
console.log(resultado.result.status); // completed | partial | failed
```

**No llamar a `chooseCard()` antes de `finishMinigame()`** en un reto que tiene minijuego; esto avanzaría dos veces si luego intentan resolver otra acción.

Las categorías de los 50 retos son `life`, `radiation`, `energy`, `food`, `comms`. Los minijuegos concretos son diseño del frontend: no se introducen ni se exigen cuatro tipos del tablero marciano. Puede haber retos solo de decisión.

## Pantalla LUNI

```js
const respuesta = juego.askLuni('¿Cuál es el último evento DONKI guardado?');
console.log(respuesta.answer);      // Texto seguro de la mascota
console.log(respuesta.sources);     // [{title,url,...}]
console.log(respuesta.suggestions); // 2 o 3 preguntas que LUNI sabe responder (mostrar como botones)
```

Usar `textContent` para el texto del chat. Para enlaces, validar que `url` sea `https:` o `http:`. No insertar respuestas como HTML no confiable.

LUNI es un tutor educativo y no debe prometer la opción correcta. Si después se incorpora un LLM, usarlo desde un servicio con control parental y recuperación de fuentes; nunca poner una clave de IA generativa en `offline-engine.js`.

## Clima espacial y el día 5

```js
const vista = juego.getView();
if (vista.scene === 'weather') {
  // Mostrar alerta didáctica; ofrecer shelter / continue_eva.
  // La fecha es histórica, no un pronóstico actual para la Luna.
  juego.respondWeather('shelter');
}
```

## Guardado y funcionamiento sin Internet

- El adaptador intenta guardar en `localStorage` con la clave compatible `moon-survival-partida-v03`.
- Las partidas previas guardadas como JSON de estado v0.3 se pueden volver a abrir.
- Si el navegador bloquea almacenamiento, la partida sigue y `juego.getView().storage.available` será `false`. Mostrar un aviso al niño.
- **La partida no vence:** queda guardada hasta que el niño toca "Borrar progreso" (`juego.clearProgress()`) o se borran los datos del navegador.
- No se envían datos de menores a ningún servidor. SQLite es **opcional** para pruebas y la API de desarrollo, no es requisito del frontend.
- Luego de cambiar o importar datos DONKI, ejecutar **otra vez** `npm.cmd run build:offline`; el frontend debe recibir la nueva copia del JS para incorporar esos datos.

## Integración y aceptación antes de publicar

1. La primera carta muestra `mission.id === 1` y la Luna.
2. Resolver A/B cambia los indicadores reales y avanza un turno.
3. Un minijuego fallido deja una consecuencia persistente y no otorga monedas.
4. Tras 2 retos, el día cambia; día 5 puede mostrar alerta científica.
5. Los 14 turnos terminan con uno de los 10 finales y su explicación.
6. Repetir el día restaura también la semilla, recursos y compras.
7. LUNI explica CME/SEP/GST, busca eventos archivados y muestra fuentes.
8. Cerrar/reabrir recupera la partida; sin red funciona con la copia DONKI.
9. Probar en computadora y celular; errores en consola = pendiente.

## Nota para backend

Este parche agrega una **capa de presentación**; no cambia los 50 retos ni las reglas del motor. En v0.4.1 hay **58 pruebas** (45 del backend y 13 del puente) y todas pasan. Las partidas y registros NASA del usuario no se incluyen en el ZIP por privacidad y para evitar sobrescritura.
