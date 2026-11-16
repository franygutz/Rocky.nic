# Decisiones, contradicciones y pendientes

## Contradicciones encontradas (y cómo se resolvieron)

| Tema | Qué decían las fuentes | Decisión |
| --- | --- | --- |
| Nombre de la base | El prompt habla de la nave **Zora**; el backend y la demo hablan de la base **Luna-7**. | La interfaz usa **Zora** para la nave y su base. El backend conserva «Luna-7» en sus fichas y glosario; no se renombraron datos. |
| Dónde ocurre cada tarea | El prompt pide ubicar las 50 tareas en escenario y equipo, pero **ningún material** da esa relación (la demo usaba 5 salas esquemáticas, una por categoría). | Supuesto de diseño, en `src/world/scenes.js` (`SLOTS` y `FIXED`): soporte vital → Zora (taller, médica, depósitos, reciclador); comunicaciones → Zora (antena y radio); energía → paneles solares y la sala de energía de Zora; alimentos → invernadero (bandejas, riego, aislamiento, mesa); radiación → cráter y soporte del traje en la esclusa. Cada tarea tiene un equipo propio y fijo (ver `MATRIZ_TAREAS.md`). |
| Dificultad visible | La demo mostraba «Nivel n/10» en cada reto. El prompt pide ocultarla. | Se quitó de la pantalla del reto y del diario. Sigue en el backend y en la matriz de auditoría. |
| Tienda | La demo compraba con efecto inmediato desde un botón. El prompt pide recogida física. | La tienda se abre al entrar a la plataforma. Pedir crea un pedido; la nave de carga aparece cuando está listo; el efecto llega al **usarlo** desde la bolsa. `purchase` (inmediato) queda en el backend solo por compatibilidad. |
| Salir de Zora y los tanques | El prompt lo trata como una tarea con consecuencia sobre «la siguiente tarea exterior», pero el catálogo no tiene esa tarea. | Se agregó como **operación del mundo** (`fillTank`, minijuego del dosímetro en los depósitos de Zora). **Regla (v0.5.1):** la esclusa de Zora **no abre sin un tanque lleno**; llenar cuesta 3 de oxígeno de la base; salir usa el tanque y **volver lo vacía**, así que cada salida exige otro. Un llenado menor de 60 % deja el estado *Tanque incompleto*, reduce el aire del traje y acorta el tiempo de **todos** los retos de afuera (paneles y cráter) hasta el siguiente llenado. |
| Finales con «regreso a la Tierra en otra ubicación» | El prompt lo menciona; los 10 finales del backend no incluyen esa variante. | No se tocaron las reglas de los finales. Comunicaciones sigue influyendo (`sin_respuesta`, final #7 con comunicaciones < 25). Si fallan a la vez comunicaciones y protección, manda la regla de prioridad del motor: salud baja → #8 antes que #7. |
| Figuras del anexo (7 capturas) | El prompt las referencia como `Vita_Lunae_Markdown/imagenes/…`; **no llegaron** en los archivos. | Se usaron las descripciones del texto y los SVG originales de la carpeta de diseño. |

## Supuestos de implementación

- **Avatar y movimiento.** Los SVG de personajes del kit son **frontales y estáticos**: se usan en el creador y en las vistas previas. En el mundo el astronauta se mueve con las **animaciones lunares de `vita-lunae-animaciones`** (perfil con esqueleto de cinemática inversa y g = 1,62 m/s²), generadas en código para el avatar elegido (`src/world/lunar.js`): **trote** al caminar, **esquí lunar** con Mayús o al seguir una ruta, **salto con saludo** al superar una tarea, **caída y levantarse** cuando se acaba el aire y **arrodillarse a tomar una muestra** al revisar equipos del cráter. Adentro de Zora va sin casco. El ritmo de los pasos sigue la velocidad real (los pies no patinan); arriba y abajo se usa el mismo perfil. Las colisiones usan solo la posición de los pies.
- **Paneles solares.** El SVG original traía un astronauta incrustado: se separó el fondo del primer plano (y ≥ 208 u) y el avatar guardado queda parcialmente tapado por los paneles delanteros, sin poder atravesarlos.
- **Nave de carga.** Viene dentro de la imagen de la plataforma y no existe suelta; se dibujó en pixel art con la paleta Moon Pop (`WorldScene.js`). La plataforma del mapa exterior sí está vacía.
- **Colisiones.** Definidas a mano sobre cada mapa y calibradas con una superposición visual; son rectángulos y una elipse (cráter), no una máscara por píxel.
- **Reloj del mundo.** Corre una vez por segundo **solo mientras se explora** (no en pausa, menús, pantallas ni puzzles, ni con la pestaña oculta). Los puzzles pausan su propio tiempo si la pestaña se oculta. Así nadie pierde aire ni tiempo por una pestaña inactiva.
- **Puzzle interrumpido.** Si se recarga a mitad de un puzzle, el motor conserva la opción elegida (`pendingChoice`) y el puzzle **reinicia** con su tiempo completo. Cerrar el reto sin resolverlo no da recompensa ni cuenta como éxito.
- **Cultivos y energía.** No hay una simulación continua por bandeja o por panel: los retos del catálogo cambian estados del motor (`cultivo_retrasado`, `contaminacion`, `riego_excesivo`, `red_sobrecargada`, `apagones`…) y el mundo los muestra (iconos sobre las bandejas, paneles oscurecidos, lámpara de la antena en rojo, filtro rojo en el cráter con exposición sin control).
- **Dormitorios.** Muestran un mensaje explicando que dormir no cambia el reloj de la misión (no hay mecánica de descanso en el motor).
- **Sonido.** Sintetizado con Web Audio, sin archivos ni licencias.

## Pendiente o no verificado

- **Rendimiento en un dispositivo real.** Se midió solo en Electron con render por software (58 fps a 1366 × 768). No hay medición en un celular ni en una compu de gama baja.
- **Servidor.** El juego usa el motor **dentro del navegador** (mismo código que el servidor). Las rutas HTTP nuevas están probadas en el backend (`tests/world.test.js`), pero el frontend no las llama todavía; conectarlas es cambiar el puente por un cliente `fetch` con los mismos métodos.
- **Hosting.** No se publicó nada ni se subió a ningún repositorio.
- **Accesibilidad.** Hay foco visible, nombres accesibles, valores del HUD con texto y símbolo, «menos movimiento» y sonido ajustable, pero **no se auditó con un lector de pantalla**.
- **Puzzles con color.** Los puzzles del demo dependen de colores en algunos pasos; los 16 símbolos de pares del kit están incluidos (parche del astronauta) pero **no se integraron** a esos puzzles.

## Datos de la NASA dentro del juego

Cada equipo del mundo abre una **ficha científica** (`science-facts.json`) con su fuente y su tipo («Dato verificado de la NASA», «Explicación educativa»…): radiación → CRaTER/RadLab en la baliza y el equipo del cráter; comunicaciones → retraso Tierra–Luna de JPL Horizons en la antena y la radio; soporte vital, cultivos y energía → explicaciones educativas. La alerta del día 5 usa un registro real de DONKI. Los números del juego (aire del traje, costos, probabilidades) son **balance**, y así se dice.
