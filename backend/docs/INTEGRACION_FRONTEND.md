# Cómo conectar HTML/CSS/JS al motor de Farid

## Ruta recomendada para el hackathon: motor offline

En el proyecto HTML del frontend, copiar `public/offline-engine.js` junto al `index.html`, y agregar:

```html
<script src="./offline-engine.js"></script>
<script>
  const engine = window.MoonSurvival;
  const key = 'moon-survival-partida-v03';
  const previous = localStorage.getItem(key);
  let game = previous ? JSON.parse(previous) : engine.createGame({
    seed: 'aula-1', scienceEvents: engine.catalog.events
  });
  function guardar() { localStorage.setItem(key, JSON.stringify(game)); }
  function elegirA(){
    const id=game.currentMissionId;
    game=engine.resolveMission(game,id,'A',{
      performance:{completed:true,accuracy:90,mistakes:1,hintsUsed:0}
    }).state;
    guardar();dibujarInterfaz();
  }
  function dibujarInterfaz(){
    // Sara/Solieth: actualizar barras, retos, tienda y el mapa.
  }
</script>
```

**IMPORTANTE:** Para la duración de un minijuego usen `engine.nextMission(game).next.modifiers.timeMultiplier`, que puede disminuir si hubo daños o reparaciones incompletas. Este multiplicador es ficticio de jugabilidad. Revisar `game.weather.pending` ANTES de `resolveMission()`. Si hay alerta, primero mostrar refugio / salir y usar `engine.respondWeather(game,'shelter')`.

Esta forma no depende de tener la computadora de Farid encendida ni de una API en Internet. La mascota funciona también offline:

```js
const {state,response}=engine.npcAsk(game,'¿Qué pasa con las tormentas solares?',{hint:true});
game=state;
alert(response.answer + '\n' + (response.hint||''));
guardar();
```

Tienda:

```js
const articulos=engine.shop(game);
game=engine.purchase(game,'agua').state;
guardar();
```

Repetir una jornada:

```js
game=engine.repeatDay(game,game.day).state;
guardar();
```

Final:

```js
if(game.phase==='completed') {
  const r=engine.report(game);
  console.log(r.ending.title,r.why.criteria,r.why.evidence);
}
```

## Alternativa: API HTTP de Node.js

Si van a ejecutar el servidor en local durante las pruebas:

```js
const BASE='http://127.0.0.1:3001/api/v1';
const partida=await fetch(`${BASE}/games`,{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({seed:'equipo-FZ'})
}).then(r=>r.json());

const id=partida.game.id;
const resultado=await fetch(`${BASE}/games/${id}/missions/1/resolve`,{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({choiceId:'A',performance:{completed:true,accuracy:95,mistakes:0,hintsUsed:0},requestId:crypto.randomUUID()})
}).then(r=>r.json());
console.log(resultado.game.metrics);
```

Para Vite: puerto 5173 permitido en CORS. Para Live Server: 5500. En otros puertos, editar `FRONTEND_ORIGINS`.

## ¿Qué necesitan decidir diseño y frontend?

1. Qué minijuego corresponde a cada reto priorizado para la demo y cómo se obtiene `accuracy`.
2. Cuál es el criterio de cada minijuego para `completed` y cuántos errores contar.
3. Si muestran toda la secuencia de 14 turnos o una demo reducida ante jurado.
4. Cómo visualizar la alerta de día 5 y la mascota LUNI.
5. Si al repetir un día necesitan mostrar explícitamente que se deshicieron compras y estados posteriores.

No hace falta que el frontend use React: HTML, CSS y JavaScript normales bastan; Phaser puede encargarse del mapa y los minijuegos.
