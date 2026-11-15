# Vita Lunae · Frontend

Juego 2D para el navegador: el jugador recorre la nave **Zora** y su base lunar, resuelve tareas con puzzles, cuida los recursos, pide artículos en la plataforma de entregas y llega a uno de **10 finales**. Está conectado al motor real de `backend/` (v0.5.0): no hay un motor de prueba aparte.

```
Rocky.nic/
├── backend/    ← motor, 50 retos, datos NASA y API (se amplió en v0.5.0, ver backend/docs/API.md)
└── frontend/   ← esta carpeta
```

## Instalar y ejecutar

Requisitos: **Node.js 22.13 o más nuevo** (`node -v`).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173  (y la dirección Network para el celular)
npm test           # 40 pruebas del frontend (usan el motor real)
npm run build      # dist/: index.html + assets/ (ábrelo desde un servidor estático)
npm run preview    # prueba la versión compilada
npm run docs       # regenera docs/MATRIZ_TAREAS.md
```

Sin variables de entorno ni secretos (ver `.env.example`). La partida se guarda en `localStorage` con la clave `moon-survival-partida-v03` (la del backend) y los ajustes con `vita-lunae-ajustes`. **Borrar progreso** (Ajustes) es lo único que la elimina.

> Tip: abre `http://localhost:5173/?debug` para exponer `window.__moon` y `window.__phaser` (pruebas manuales). `?touch` fuerza la cruceta táctil.

## Cómo se juega

| Acción | Control |
| --- | --- |
| Moverse | **WASD** o flechas · tocar el mapa (ruta automática) · cruceta en pantallas táctiles |
| Usar lo que tengas cerca (puertas, equipos, nave de carga) | **E**, **Espacio** o **Enter** · o el botón amarillo que aparece |
| Pausar / cerrar un panel | **Esc** |
| Correr (esquí lunar) | mantener **Mayús** · o tocar el mapa para ir por ruta |
| Que la **!** te lleve al reto | botón **Guíame** |

Recorrido: Nueva misión → crear astronauta → recorrer el mundo → ir al equipo marcado con **!** → elegir A o B → (si es la opción cuidadosa) puzzle → resultado → … → 14 retos → final con su «por qué».

- **Zora** (interior): energía, comunicaciones, cabina (LUNI), taller, atención médica, depósitos de soporte vital (**tanque del traje**), dormitorios, almacén (bolsa) y esclusa.
- **Exterior**: Zora, invernadero, antena, paneles, cráter y la **plataforma de entregas** (abajo a la izquierda).
- **Tanque del traje (regla clave)**: **la esclusa no abre sin un tanque lleno**. Se llena en los depósitos de soporte vital (cuesta 3 de oxígeno de la base). Salir lo usa y volver a Zora lo deja vacío: cada salida pide otro. El aire se gasta solo afuera (exterior, paneles, cráter): hasta 180 s con un llenado perfecto; menos de 60 % deja *Tanque incompleto*, menos aire y menos tiempo en los retos de afuera. Si se acaba, el astronauta se cae, vuelve a Zora y paga una consecuencia única.
- **Tienda física**: acercarte a la plataforma abre la tienda. Pedir descuenta las monedas una vez y crea un pedido; a los ~20 s de juego aparece la **nave de carga** en la plataforma; al recogerla, el artículo pasa a la **bolsa** y desde ahí se usa.
- **Kita** (esquina del HUD) reacciona a la partida y **no** sigue al jugador. **LUNI** (cabina de Zora o botón del dock) es el asistente de reglas del backend.

## Arquitectura

```
src/
├── main.js            arranque: motor + guardado primero, luego Phaser
├── engine.js          conexión con backend/ (createEngine + createFrontendBridge)
├── bus.js             mensajes juego ↔ interfaz y estado de sesión
├── rules.js           reglas de presentación (indicadores, iconos, tiempo de puzzles, traje)
├── world/             PURO (sin Phaser, probado): escenarios, colisiones, rutas, tareas, avatar
│   ├── scenes.js      mapas en unidades, áreas transitables, obstáculos, puertas, puntos, equipo de cada tarea
│   ├── path.js        A* para tocar-para-caminar y la guía
│   ├── tasks.js       estado de cada tarea y matriz de cobertura
│   └── avatar.js      creador por capas con los rasgos del Kit (32×46 px)
├── game/
│   ├── WorldScene.js  un Scene de Phaser que arma los 5 escenarios, el avatar, la nave de carga y los estados visibles
│   ├── minigames/     los 5 puzzles (uno por categoría) y la base con tiempo, rendirse y resultado
│   ├── kita.js        controlador de estados y prioridades de Kita
│   └── sfx.js         sonido sintetizado (sin archivos)
└── ui/                HUD, pantallas HTML, LUNI, controles táctiles y el controlador de la partida (app.js)
```

Capas del mundo (profundidad): fondo → decoración → avatar y objetos ordenados por la posición de los **pies** → primer plano (paneles delanteros) → marcadores → HUD en HTML.

**Quién decide qué.** El cliente simula movimiento y puzzles. El motor (mismo código en el navegador y en el servidor) valida y guarda: saldo, pedidos, bolsa, aire del traje, avatar, escenario y posición, recompensas y finales. Cada operación lleva `requestId` para que doble clic, recarga o reintento de red no dupliquen cobros, entregas ni efectos. El guardado ocurre en puntos relevantes (tarea, compra, recogida, cambio de zona, pausa, cerrar o salir de la pestaña, cada 30 s de juego), nunca por fotograma.

## Documentación

- [`docs/MATRIZ_TAREAS.md`](docs/MATRIZ_TAREAS.md): las 50 tareas con escenario, equipo, puzzle, costos, recompensa y consecuencias.
- [`docs/ASSETS_MANIFIESTO.json`](docs/ASSETS_MANIFIESTO.json): cada recurso con ruta, formato, tamaño, uso y notas.
- [`docs/DECISIONES_Y_LIMITACIONES.md`](docs/DECISIONES_Y_LIMITACIONES.md): contradicciones encontradas, supuestos y lo que sigue pendiente.
- [`docs/EVIDENCIA.md`](docs/EVIDENCIA.md): qué se verificó y cómo repetirlo.
- [`docs/REFERENCIAS_CIENTIFICAS.md`](docs/REFERENCIAS_CIENTIFICAS.md): procedencia de los datos.
- [`../backend/docs/API.md`](../backend/docs/API.md): operaciones nuevas del motor y de la API (entrada, salida y errores).

## Créditos

Arte y animaciones: carpeta de diseño del equipo (paleta Moon Pop, mapas, 16 astronautas, mascota Kita, iconos y símbolos). Proyecto conceptual del equipo, sin patrocinio oficial de NASA.
