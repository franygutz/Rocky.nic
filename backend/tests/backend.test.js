import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createApp,openDatabase,engine,curatedEvents} from '../src/server.js';
const file=n=>JSON.parse(readFileSync(new URL(`../data/${n}.json`,import.meta.url)));
const challenges=file('challenges'),items=file('shop'),facts=file('science-facts');
const make=(seed=777)=>engine.createGame({id:'test-uuid',seed,scienceEvents:curatedEvents});
const high={completed:true,accuracy:100,mistakes:0,hintsUsed:0};
const low={completed:false,accuracy:10,mistakes:5,hintsUsed:1};
const partial={completed:true,accuracy:65,mistakes:1,hintsUsed:1};
function nextTurn(g,choice='A',performance=high){
  if(g.weather?.pending)g=engine.respondWeather(g,'shelter').state;
  if(g.phase!=='active')return g;
  return engine.resolveMission(g,g.currentMissionId,choice,{performance}).state;
}
function complete(g=make(),choice='A',quality=high){for(let i=0;i<14&&g.phase==='active';i++)g=nextTurn(g,choice,quality);return g}

test('Catálogo conserva los 50 retos, niveles 1..10, 7 artículos, 10 finales y 2 opciones',()=>{
 assert.equal(challenges.length,50);assert.equal(items.length,7);assert.equal(Object.keys(file('endings')).length,10);
 assert.deepEqual([...new Set(challenges.map(c=>c.difficulty))].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9,10]);
 assert.ok(challenges.every(c=>c.choices.length===2));
 assert.ok(challenges.every(c=>c.choices.every(o=>o.next.every(id=>challenges.some(k=>k.id===id)))));
});
test('Semilla repetible, sin alterar partidas diferentes',()=>{
 const a=complete(make('semilla-ejemplo'));
 const b=complete(make('semilla-ejemplo'));
 assert.deepEqual(a.history.map(x=>[x.missionId,x.coinsAwarded,x.skillAfter]),b.history.map(x=>[x.missionId,x.coinsAwarded,x.skillAfter]));
});
test('Semillas distintas producen al menos una diferencia en 14 turnos',()=>{
 const a=complete(make('abc'));const b=complete(make('xyz'));
 assert.notDeepEqual(a.history.map(x=>x.coinsAwarded),b.history.map(x=>x.coinsAwarded));
});
test('Partida inicial con siete días, 14 turnos y 25 monedas',()=>{
 const g=make();assert.equal(g.day,1);assert.equal(g.turn,0);assert.equal(g.skill,2);assert.equal(g.currentMissionId,1);assert.equal(g.coins,25);
});
test('Decisión original A del reto 1 mantiene beneficios y efectos',()=>{
 const g=engine.resolveMission(make(),1,'A').state;
 assert.equal(g.metrics.oxygen,88);assert.equal(g.metrics.energy,71);assert.equal(g.performance.completed,1);
});
test('Desempeño real de minijuego: éxito, parcial y fallo',()=>{
 assert.equal(engine.assess(high).status,'completed');assert.equal(engine.assess(partial).status,'partial');assert.equal(engine.assess(low).status,'failed');
});
test('Fallo no otorga monedas y deja consecuencia persistente',()=>{
 const {state,result}=engine.resolveMission(make(),1,'A',{performance:low});
 assert.equal(result.status,'failed');assert.equal(result.coinsAwarded,0);
 assert.ok(state.statuses.includes('fuga_activa'));assert.equal(state.metrics.oxygen,78);
});
test('Resultado parcial concede recompensa parcial y estado de reparación pendiente',()=>{
 const {state,result}=engine.resolveMission(make(),1,'A',{performance:partial});
 assert.equal(result.status,'partial');assert.ok(result.coinsAwarded>=0&&result.coinsAwarded<27);
 assert.equal(state.metrics.oxygen,83);assert.ok(state.statuses.includes('reparacion_pendiente_life'));
});
test('Omisión no da recompensa y deja efectos reales',()=>{
 const before=make();const {state,result}=engine.skipMission(before);
 assert.equal(result.status,'missed');assert.equal(state.coins,25);assert.equal(state.metrics.oxygen,70);assert.ok(state.statuses.includes('fuga_activa'));
});
test('Nivel inicial no salta a desafíos avanzados',()=>{
 const g=nextTurn(make());assert.ok(engine.challengeMap.get(g.currentMissionId).difficulty<=2);
});
test('Resultados fallidos no desbloquean retos imposibles en el inicio',()=>{
 let g=make();for(let i=0;i<4&&g.phase==='active';i++)g=nextTurn(g,'A',low);
 assert.equal(g.skill,1);assert.ok(engine.challengeMap.get(g.currentMissionId).difficulty<=3);
});
test('Los progresos altos pueden visitar retos avanzados por distintas rutas',()=>{
 const g=complete(make('high-skill-test'));
 assert.ok(g.history.some(x=>x.difficulty>=9),'Jugador avanzado debería alcanzar nivel 9 o 10');
});
test('Los recursos se limitan de 0 a 100',()=>{
 let g=make();g.metrics.oxygen=100;g.metrics.energy=1;
 g=engine.resolveMission(g,1,'A',{performance:high}).state;
 assert.equal(g.metrics.oxygen,100);assert.equal(g.metrics.energy,0);
});
test('La tienda compra con fondos, aplica beneficios y respeta límite',()=>{
 let g=make();g.coins=200;g=engine.purchase(g,'agua').state;
 assert.equal(g.coins,165);assert.equal(g.metrics.water,94);assert.equal(g.inventory.agua,1);
 for(let i=0;i<2;i++)g=engine.purchase(g,'agua').state;
 assert.equal(g.inventory.agua,3);assert.throws(()=>engine.purchase(g,'agua'),/OUT_OF_STOCK/);
});
test('Comprar sin monedas se rechaza y no modifica original',()=>{
 const g=make();assert.throws(()=>engine.purchase(g,'botiquin'),/INSUFFICIENT_COINS/);assert.equal(g.coins,25);
});
test('Comprar botiquín no arregla una fuga ni una antena por magia',()=>{
 const g=make();g.coins=200;g.statuses=['fatiga','fuga_activa','enlace_saturado'];
 const next=engine.purchase(g,'botiquin').state;
 assert.ok(!next.statuses.includes('fatiga'));assert.ok(next.statuses.includes('fuga_activa'));assert.ok(next.statuses.includes('enlace_saturado'));
});
test('Día avanza automáticamente en cada dos decisiones',()=>{
 let g=make();g=nextTurn(g);assert.equal(g.day,1);g=nextTurn(g);assert.equal(g.day,2);assert.equal(g.daySummaries.length,1);
});
test('Tormenta de entrenamiento del día 5 conserva un registro DONKI verificable',()=>{
 let g=make();for(let i=0;i<8;i++)g=nextTurn(g);
 assert.equal(g.day,5);assert.equal(g.weather.pending,true);
 assert.ok(['SEP','CME'].includes(g.weather.event?.type));
 assert.ok(['registro_historico_verificado','registro_nasa_descargado'].includes(g.weather.event?.datasetType));
 assert.ok(curatedEvents.some(e=>e.id===g.weather.event.id));
 assert.ok(g.weather.event?.observedAt);
 assert.match(g.weather.event?.sourceUrl||'',/^https:\/\//);
 assert.throws(()=>engine.resolveMission(g,g.currentMissionId,'A'),/WEATHER_RESPONSE_REQUIRED/);
});
test('Responder refugio consume energía y evita riesgo, sin suponer dosis lunar',()=>{
 let g=make();for(let i=0;i<8;i++)g=nextTurn(g);
 const previous=g.metrics.energy;const result=engine.respondWeather(g,'shelter');
 assert.equal(result.state.weather.pending,false);assert.equal(result.state.metrics.energy,Math.max(0,previous-8));
 assert.match(result.result.note,/simulad|fictici/);
});
test('La alternativa exterior ante tormenta tiene coste de salud',()=>{
 let g=make();for(let i=0;i<8;i++)g=nextTurn(g);
 const health=g.metrics.health;g=engine.respondWeather(g,'continue_eva').state;
 assert.equal(g.metrics.health,Math.max(0,health-7));assert.ok(g.statuses.includes('eva_riesgosa'));
});
test('Comunicaciones necesitan energía y su confirmación llega tras los turnos',()=>{
 let g=make();const initial=g.metrics.energy;
 g=engine.sendMessage(g,'status_report').state;
 assert.equal(g.metrics.energy,initial-5);assert.equal(g.messages[0].status,'pending');
 g=nextTurn(g);assert.equal(g.messages[0].status,'acknowledged');
});
test('Enlace roto retrasa confirmación, sin fingir viaje físico de varios días',()=>{
 let g=make();g.metrics.comms=20;g=engine.sendMessage(g,'rescue_request').state;
 g=nextTurn(g);assert.equal(g.messages[0].status,'pending');assert.ok(g.messages[0].delayCount>=0);
});
test('Repetir día restaura dinero, recursos, minijuegos, compras y RNG',()=>{
 let g=make();g=nextTurn(g);g=nextTurn(g);assert.equal(g.day,2);
 const base=structuredClone(g);const next=engine.resolveMission(g,g.currentMissionId,'B',{performance:high});
 const r=engine.repeatDay(next.state,2).state;
 assert.equal(r.turn,base.turn);assert.deepEqual(r.metrics,base.metrics);assert.equal(r.rngState,base.rngState);
 assert.equal(r.history.length,base.history.length);assert.equal(r.phase,'active');
});
test('Repetir día inválido se rechaza',()=>assert.throws(()=>engine.repeatDay(make(),5),/INVALID_REPLAY_DAY/));
test('El resultado final utiliza 14 turnos o emergencia',()=>{
 const g=complete(make());assert.equal(g.turn,14);assert.equal(g.phase,'completed');assert.equal(g.day,7);assert.ok(g.endingId>=1&&g.endingId<=10);
});
test('Final explicado contiene pruebas de los hechos que ocurrieron',()=>{
 const g=complete(make());const r=engine.report(g);assert.ok(r.ending.title);assert.ok(r.why.evidence.length>=1);assert.equal(r.turnsPlayed,14);
});
test('Finales graves requieren las condiciones documentadas',()=>{
 const eva=make();eva.metrics.shield=10;eva.metrics.oxygen=50;eva.statuses=['eva_sin_rescate'];assert.equal(engine.endingFor(eva),10);
 const air=make();air.metrics.oxygen=12;air.metrics.health=40;air.statuses=['fuga_activa'];assert.equal(engine.endingFor(air),9);
});
test('NPC reconoce preguntas y usa un registro DONKI disponible sin inventar dosis lunar',()=>{
 const g=make();const {state,response}=engine.npcAsk(g,'¿Qué datos reales DONKI hay sobre tormentas solares?',{hint:true});
 assert.ok(response.sources.some(s=>s.url.startsWith('https://')));
 assert.ok(response.observation);
 assert.ok(['SEP','CME','GST'].includes(response.observation.type));
 assert.ok(curatedEvents.some(e=>e.id===response.observation.id));
 assert.match(response.observation.sourceUrl,/^https:\/\//);
 assert.equal(state.npcHelpCount,1);assert.equal(g.npcHelpCount,0);assert.match(response.disclaimer,/simula/);
});
test('La mascota no requiere conectividad ni un servicio de IA',()=>{
 const g=engine.createGame({id:'offline',seed:3});
 const {response}=engine.npcAsk(g,'¿Qué debo saber del agua?');assert.ok(response.answer.includes('agua'));assert.ok(response.sources.length);
});
test('Entrada NPC y minijuego rechazan valores incorrectos',()=>{
 assert.throws(()=>engine.npcAsk(make(),'x'),/INVALID_QUESTION/);
 assert.throws(()=>engine.resolveMission(make(),1,'A',{performance:{accuracy:100}}),/INVALID_PERFORMANCE/);
});
test('Datos NASA archivados incluyen fecha, fuente y tipo observado',()=>{
 assert.ok(curatedEvents.length>=1);assert.ok(curatedEvents.every(e=>e.sourceUrl.startsWith('https://')&&e.observedAt&&e.datasetType));
 assert.ok(facts.every(f=>f.sourceUrl.startsWith('https://')));
});
test('Versión offline autocontenida incluye motor y 50 retos',()=>{
 const js=readFileSync(new URL('../public/offline-engine.js',import.meta.url),'utf8');
 assert.match(js,/window\.MoonSurvival/);assert.match(js,/Chequeo del aire/);assert.ok(js.length>50000);
 assert.ok(existsSync(new URL('../public/offline-demo.html',import.meta.url)));
});
async function withServer(fn){
 const db=openDatabase(':memory:');const {server}=createApp({db});await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const base=`http://127.0.0.1:${server.address().port}`;
 const api=async(method,path,b)=>{const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json'},body:b===undefined?undefined:JSON.stringify(b)});return {status:r.status,json:await r.json()}};
 try{await fn(api,db)}finally{await new Promise(done=>server.close(done));db.close()}
}
test('API responde en /health y devuelve catálogo y NASA (sin clave)',async()=>withServer(async api=>{
 assert.equal((await api('GET','/health')).json.ok,true);
 assert.equal((await api('GET','/api/v1/missions')).json.total,50);
 assert.equal((await api('GET','/api/v1/shop')).json.items.length,7);
 assert.ok((await api('GET','/api/v1/science-events')).json.events.length>=2);
}));
test('API crea partida, registra minijuego y persiste en SQLite',async()=>withServer(async(api,db)=>{
 const created=await api('POST','/api/v1/games',{seed:'api-seed'});assert.equal(created.status,201);
 const id=created.json.game.id;
 const r=await api('POST',`/api/v1/games/${id}/missions/1/resolve`,{choiceId:'A',performance:high,requestId:'abc-123456'});
 assert.equal(r.json.result.status,'completed');
 assert.equal((await api('GET',`/api/v1/games/${id}/history`)).json.missions.length,1);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM mission_history').get().n,1);
 const again=await api('POST',`/api/v1/games/${id}/missions/1/resolve`,{choiceId:'A',performance:high,requestId:'abc-123456'});
 assert.equal(again.json.alreadyProcessed,true);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM mission_history').get().n,1);
}));
test('API compra y repetir día limpia historial activo de compras',async()=>withServer(async api=>{
 const id=(await api('POST','/api/v1/games',{seed:3})).json.game.id;
 await api('POST',`/api/v1/games/${id}/missions/1/resolve`,{choiceId:'A'});
 const bought=await api('POST',`/api/v1/games/${id}/shop/purchase`,{itemId:'agua'});
 assert.equal(bought.status,200);
 const replay=await api('POST',`/api/v1/games/${id}/repeat-day`,{day:1});assert.equal(replay.status,200);
 const history=await api('GET',`/api/v1/games/${id}/history`);
 assert.equal(history.json.purchases.length,0);assert.equal(history.json.missions.length,0);
}));
test('API NPC y envíos de mensajes sin almacenar texto de preguntas',async()=>withServer(async (api,db)=>{
 const id=(await api('POST','/api/v1/games')).json.game.id;
 const n=await api('POST',`/api/v1/games/${id}/npc/ask`,{question:'¿Qué pasó en DONKI?',hint:true});
 assert.equal(n.status,200);assert.equal(n.json.npc.npc,'LUNI');assert.equal(n.json.game.npcHelpCount,1);
 const m=await api('POST',`/api/v1/games/${id}/communications/send`,{type:'status_report'});assert.equal(m.status,200);
 const stored=db.prepare('SELECT state_json FROM games WHERE id=?').get(id).state_json;
 assert.ok(!stored.includes('¿Qué pasó en DONKI?'));
}));
test('API produce error explícito si el clima espacial está pendiente',async()=>withServer(async api=>{
 const id=(await api('POST','/api/v1/games')).json.game.id;
 let g=(await api('GET',`/api/v1/games/${id}`)).json.game;
 for(let i=0;i<8;i++){
  const out=await api('POST',`/api/v1/games/${id}/missions/${g.currentMissionId}/resolve`,{choiceId:'A',performance:high});
  assert.equal(out.status,200);g=out.json.game;
 }
 const blocked=await api('POST',`/api/v1/games/${id}/missions/${g.currentMissionId}/resolve`,{choiceId:'A'});
 assert.equal(blocked.status,409);assert.equal(blocked.json.error.code,'WEATHER_RESPONSE_REQUIRED');
 const response=await api('POST',`/api/v1/games/${id}/weather/respond`,{choice:'shelter'});
 assert.equal(response.status,200);
}));
test('Problemas previos reducen margen de tiempo de misiones relacionadas',()=>{
 const g=make();g.currentMissionId=12;g.statuses=['fuga_activa','traje_comprometido'];
 const modifiers=engine.nextMission(g).next.modifiers;
 assert.equal(modifiers.timeMultiplier,0.6);
 assert.ok(modifiers.reasons.length>=2);
});
test('Errores de energía elevan costes en misiones posteriores hasta reparación',()=>{
 const g=make();g.currentMissionId=3;g.statuses=['energia_comprometida'];
 const current=engine.nextMission(g).next;
 assert.equal(current.modifiers.resourceCostMultiplier,1.15);
 const a=engine.resolveMission(g,3,'A',{performance:high}).state;
 assert.equal(a.metrics.energy,89); // 78+11, no gasto extra en esta elección positiva
});


test('LUNI contesta preguntas distintas sin caer automáticamente en oxígeno',()=>{
 const g=make();const a=engine.npcAsk(g,'Hola LUNI').response;
 const b=engine.npcAsk(g,'¿Qué sabes de las baterías?').response;
 const c=engine.npcAsk(g,'¿Cómo va mi base?').response;
 const d=engine.npcAsk(g,'¿Hay vida en Europa?').response;
 assert.match(a.answer,/Hola|LUNI/);assert.ok(!a.answer.startsWith('El soporte vital'));
 assert.match(b.answer,/batería|energía/i);assert.ok(b.sources.length);
 assert.match(c.answer,/agua|energía/i);
 assert.match(d.answer,/No tengo una ficha/i);
});
test('LUNI responde al reto actual solo cuando solicitan ayuda contextual',()=>{
 const g=make();const r=engine.npcAsk(g,'¿Qué hago en este reto?',{hint:true});
 assert.match(r.response.answer,/Chequeo del aire/);assert.match(r.response.hint,/Pista del reto #1/);
});
test('LUNI muestra el registro NASA más reciente guardado y su fuente',()=>{
 const events=[...curatedEvents,{id:'SEP-NEW-TEST',type:'SEP',title:'Prueba de archivo',observedAt:'2026-11-14T08:00:00Z',summary:'Notificación de prueba.',source:'NASA DONKI',sourceUrl:'https://api.nasa.gov/DONKI/SEP',datasetType:'registro_nasa_descargado'}];
 const g=engine.createGame({scienceEvents:events});
 const r=engine.npcAsk(g,'¿Cuál es el último evento DONKI guardado?').response;
 assert.equal(r.observation.id,'SEP-NEW-TEST');assert.match(r.answer,/2026-11-14/);
 assert.ok(r.sources.some(s=>s.url.includes('api.nasa.gov')));
 assert.match(r.answer,/no una consulta NASA en vivo/);
});
test('LUNI no presenta mediciones inexistentes cuando no hay eventos coincidentes',()=>{
 const g=engine.createGame({scienceEvents:curatedEvents});
 const r=engine.npcAsk(g,'¿Qué eventos CME ocurrieron en 2035?').response;
 assert.equal(r.observation,null);assert.match(r.answer,/No hay eventos/);
});

test('LUNI ve los eventos NASA importados después de crear una partida en SQLite',async()=>withServer(async(api,db)=>{
 const id=(await api('POST','/api/v1/games',{seed:88})).json.game.id;
 const evt={id:'TEST-SYNC-2026',type:'SEP',title:'Evento sincronizado para prueba',observedAt:'2026-11-14T10:00:00Z',summary:'Evento científico de ejemplo en prueba.',source:'NASA DONKI',sourceUrl:'https://api.nasa.gov/DONKI/SEP',datasetType:'registro_nasa_descargado'};
 db.prepare('INSERT INTO science_events(id,type,observed_at,payload_json,retrieved_at) VALUES (?,?,?,?,?)').run(evt.id,evt.type,evt.observedAt,JSON.stringify(evt),'2026-11-14T10:10:00Z');
 const resp=await api('POST',`/api/v1/games/${id}/npc/ask`,{question:'¿Cuál es el evento DONKI más reciente guardado?'});
 assert.equal(resp.status,200);assert.equal(resp.json.npc.observation.id,evt.id);
 assert.ok(resp.json.game.scienceEventPool.some(e=>e.id===evt.id));
}));
