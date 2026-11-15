# Evidencia de verificación (2026-11-15)

Entorno: Linux, Node.js 26.13, Vite 8.3.8, Phaser 3.90.0, navegador Chromium (Electron) con render por software, 58 fps a 1366 × 768. **No** se probó en un celular real.

## Pruebas automáticas

| Qué | Cómo repetirlo | Resultado |
| --- | --- | --- |
| Backend: motor, API HTTP, puente y mundo | `cd backend && npm test` | **70 de 70** (10 nuevas: pedido único, entrega, recogida única, bolsa, límite y saldo, tanque, aire del traje, avatar y guardado, guardado v0.4 sin mundo, rutas HTTP) |
| Frontend: mundo, tareas, avatar, Kita, traje, partida completa | `cd frontend && npm test` | **42 de 42** (incluye la que genera la matriz) |
| Cobertura de las 50 tareas y los 10 finales (motor real) | `node tools/simular-alcance.mjs 7000` | **50 de 50 tareas y 10 de 10 finales** (los finales #7 y #10 son raros: 4 y 6 de 7 000 partidas) |

Qué cubren las pruebas del frontend: escenarios con aparición transitable; el avatar no atraviesa obstáculos y se desliza por el eje libre; **todos los puntos de interacción y todas las puertas se alcanzan caminando**; entrada y salida al mismo sector; histéresis de la plataforma (cerrar la tienda no la reabre); oclusión parcial en los paneles; **las 50 tareas** con escenario, equipo, puzzle y recompensa; el estado de cada una; la dificultad **nunca** aparece en el HTML del reto ni del diario; los 16 avatares y la validación de combinaciones; Kita (prioridades y reacciones sin repetirse); un tanque mal llenado acorta solo los retos de afuera; una partida de 14 turnos con pedido físico, recogida y final.

## Recorrido real en el navegador (Electron, `?debug`)

Se manejó la aplicación compilada (`dist/`) y no se registró ningún error de consola:

1. Menú → Nueva misión → creador (categorías, vista previa con y sin casco, nombre) → guardar → bienvenida → mundo.
2. Teclado: **D** movió ≈ 42 unidades en 0,8 s; **W** contra Zora se detuvo en la pared (y = 195,3); **E** en la puerta llevó al interior de Zora, a la esclusa.
3. Tarea completa: Zora → monitor de aire → reto → opción A → puzzle de fugas → resultado «completado» → +monedas y +1 turno → vuelta al mundo y siguiente reto.
4. Tienda: al **entrar caminando** a la plataforma se abre sola; pedir (cobro único) → cerrar → a los 25 s de reloj aparece la **nave de carga** → recoger → bolsa → usar (agua 76 → 94) → recargar la página → **Continuar** vuelve al mismo escenario, posición, monedas y bolsa.
5. Tanque: depósitos de Zora → llenar → puzzle fallado → 0 % → `Tanque incompleto`, 72 s de aire (en vez de 180) y aviso. Afuera se agotó el aire → pantalla de regreso, salud −8, vuelve a Zora.
6. Pausa (guardado y controles), ajustes, editar astronauta, diario de tareas.
7. Estados visibles: con `contaminacion`, `red_sobrecargada`, `sin_respuesta` y `exposicion_sin_control` se ven los íconos en las bandejas, la lámpara de la antena en rojo, el HUD con 4 alertas y oxígeno en nivel crítico (símbolo ‼ y número subrayado); Kita pasa a «error».
8. Tamaños: **1366 × 768**, **1920 × 1080**, **768 × 1024** y **390 × 844** con cruceta táctil (movió al avatar).

## Errores encontrados y corregidos durante la verificación

- La nave de carga no aparecía al volver a abrir el escenario: la escena conservaba una referencia a un objeto destruido. Se reinician las referencias en cada `create()`.
- La tienda se abría sola al reaparecer dentro de la plataforma (continuar o teletransporte): ahora solo abre al **entrar**.
- Rutas y colisiones: la entrada a los dormitorios y al almacén estaba tapada por muebles; el A* no llegaba a destinos pegados al borde de la cuadrícula.
- La demo mostraba «Nivel n/10» en el reto; se quitó.

## Auditoría de reglas y rediseño (2026-11-15, segunda pasada)

Hallazgos de la auditoría contra el prompt y su corrección:

| Regla | Antes | Ahora |
| --- | --- | --- |
| Salir de la base usa un tanque de oxígeno | Salir era libre; llenar el tanque era opcional | La esclusa **no abre** sin tanque lleno, llenar cuesta oxígeno de la base, salir lo usa y volver lo vacía (backend + frontend + 3 pruebas nuevas) |
| Usar las animaciones lunares del equipo | El avatar solo rebotaba (imagen frontal) | Trote, esquí, salto, caída y muestra, generadas para el avatar elegido |
| Usar información de la NASA | Solo en LUNI, la alerta del día 5 y «Datos y fuentes» | Además, **ficha científica con fuente en cada equipo** del mundo |
| Dificultad oculta | Se veía «Nivel n/10» | Oculta (ya corregido) |
| Accesibilidad | Sin rol de diálogo ni trampa de foco | `role="dialog"`, `aria-modal`, foco atrapado y devuelto, menos movimiento según el sistema, indicadores con símbolo y número |

Rediseño visual: consola del casco (marco), tarjetas de misión (diálogos), tipografía Jersey 10 + Atkinson Hyperlegible empaquetada, íconos pixel sin emojis en el marco, botones con estados de hover/foco/presionado, minijuegos con franja de título, barra de tiempo segmentada y resultado en tipografía pixel. El mapa se encuadra en el espacio libre (sin quedar tapado por el HUD).

### Minijuegos por dentro (rediseño)

- **Soporte vital:** tuberías con bridas y fugas numeradas con vapor; anillo amarillo sobre la siguiente; teclas 1–9; mensaje claro si tocas la equivocada.
- **Energía:** paneles solares con celdas y brillo, polvo en bloques pixel, **cepillo** que se mueve con mouse/dedo o con flechas + Espacio, porcentaje limpio.
- **Alimentos:** cuatro válvulas con **forma + número + color** (círculo, cuadrado, triángulo, rombo; teclas 1–4), indicador «Mira / Tu turno» y avance en casillas.
- **Radiación:** dosímetro con escala 0–30 y lectura numérica en vivo, botón «Leer» (Espacio) y la referencia real de CRaTER (≈ 13 μGy/h) rotulada como tal; la escala es del juego.
- **Comunicaciones:** antena sobre cielo estrellado, Tierra en pixel, fuerza de señal «n de 5», teclas ← → / A D y el retraso real de 1,35 s (NASA/JPL Horizons).
- Ningún minijuego depende solo del color y todos se juegan con teclado.
