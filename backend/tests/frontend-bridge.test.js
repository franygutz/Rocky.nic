import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createEngine} from '../src/core/engine.js';
import {createFrontendBridge} from '../src/core/frontend-bridge.js';
const data=n=>JSON.parse(readFileSync(new URL(`../data/${n}.json`,import.meta.url),'utf8'));
const catalog={challenges:data('challenges'),items:data('shop'),endings:data('endings'),facts:data('science-facts'),events:data('nasa-events')};
const engine={...createEngine(catalog),catalog};
function memoryStorage(){const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),_map:m};}
const create=(opts={})=>createFrontendBridge(engine,{storage:memoryStorage(),seed:'luna-test',...opts});

test('Contrato de frontend publica la Luna: 50 retos, 7 días, 14 turnos, 10 finales',()=>{
 const app=create(),v=app.getView();
 assert.equal(catalog.challenges.length,50);
 assert.equal(Object.keys(catalog.endings).length,10);
 assert.equal(v.maxDays,7);assert.equal(v.maxTurns,14);
 assert.equal(v.mission.id,1);assert.equal(v.mission.options.length,2);
 assert.equal(typeof v.metrics.oxygen,'number');
});
test('Una decisión directa avanza un turno y persiste sin perder semilla',()=>{
 const storage=memoryStorage();
 const a=create({storage});const before=a.getView();
 const result=a.chooseCard('A');
 assert.equal(result.result.missionId,1);
 assert.equal(result.view.turn,1);
 const b=createFrontendBridge(engine,{storage});
 assert.equal(b.getView().turn,1);
 assert.equal(b.getView().seed,before.seed);
});
test('Un minijuego no avanza al elegir; al finalizar registra la precisión y la consecuencia',()=>{
 const app=create();
 app.prepareMinigame('B');
 assert.equal(app.getView().turn,0);
 assert.equal(app.getView().pendingChoice,'B');
 const outcome=app.finishMinigame({completed:false,accuracy:10,mistakes:4,hintsUsed:0});
 assert.equal(outcome.view.turn,1);
 assert.equal(outcome.result.status,'failed');
 assert.equal(outcome.view.pendingChoice,null);
 assert.equal(outcome.result.coinsAwarded,0);
});
test('La elección de minijuego pendiente se recupera al recargar',()=>{
 const storage=memoryStorage();
 const a=create({storage});a.prepareMinigame('A');
 const b=createFrontendBridge(engine,{storage});
 assert.equal(b.getView().pendingChoice,'A');
 assert.equal(b.getView().turn,0);
 assert.equal(b.finishMinigame({completed:true,accuracy:100,mistakes:0,hintsUsed:0}).view.turn,1);
});
test('La interfaz recibe eventos por suscripción y puede dejar de recibirlos',()=>{
 const app=create(),actions=[];
 const unsub=app.subscribe((_view,{action})=>actions.push(action));
 app.chooseCard('A');unsub();
 app.askLuni('Hola LUNI');
 assert.deepEqual(actions,['SUBSCRIBED','CHOOSE_CARD']);
});
test('LUNI pregunta a DONKI sin Internet y no modifica los turnos',()=>{
 const app=create(),before=app.getView().turn;
 const r=app.askLuni('¿Qué significa CME?');
 assert.match(r.answer,/eyección de masa coronal/i);
 assert.equal(app.getView().turn,before);
 assert.ok(Array.isArray(r.sources));
});
test('NASA archivada puede refrescarse sin reiniciar la partida ni descargar clave API',()=>{
 const app=create();app.chooseCard('A');
 const oldCount=app.getState().scienceEventPool.length;
 const evt={id:'NASA-NEW-1',type:'SEP',observedAt:'2026-11-12T00:00:00Z',sourceUrl:'https://api.nasa.gov/DONKI/SEP',source:'NASA DONKI'};
 const out=app.refreshNASA([evt,evt,{id:'INVALID',type:'FAKE'}]);
 assert.equal(out.count,oldCount+1);
 assert.equal(app.getState().turn,1);
 assert.equal(app.getState().scienceEventPool.filter(e=>e.id==='NASA-NEW-1').length,1);
});
test('El estado visual es una copia: el frontend no puede modificar recursos con una referencia',()=>{
 const app=create();const view=app.getView();view.metrics.oxygen=0;
 assert.equal(app.getView().metrics.oxygen,78);
 const state=app.getState();state.metrics.water=0;
 assert.equal(app.getState().metrics.water,76);
});
test('Sin localStorage o con almacenamiento bloqueado el juego sigue',()=>{
 const failing={getItem(){throw Error('private')},setItem(){throw Error('quota')},removeItem(){throw Error('private')}};
 const app=create({storage:failing});
 assert.equal(app.getView().storage.available,false);
 assert.equal(app.chooseCard('A').view.turn,1);
 assert.equal(app.getView().storage.error,'STORAGE_WRITE_FAILED');
});
test('Guardar anterior en formato v0.3 sigue siendo recuperable',()=>{
 const storage=memoryStorage();
 const raw=engine.createGame({seed:'anterior',scienceEvents:catalog.events});
 storage.setItem('moon-survival-partida-v03',JSON.stringify(raw));
 const app=createFrontendBridge(engine,{storage});
 assert.equal(app.getView().seed,'anterior');
});

test('También recupera las partidas de la demo offline original',()=>{
 const storage=memoryStorage();
 const raw=engine.createGame({seed:'demo-antigua',scienceEvents:catalog.events});
 storage.setItem('moon-survival-v03-offline',JSON.stringify(raw));
 const app=createFrontendBridge(engine,{storage});
 assert.equal(app.getView().seed,'demo-antigua');
 app.clearProgress();
 assert.equal(storage.getItem('moon-survival-v03-offline'),null);
});
test('Repetir día restaura métricas y turno; borrar progreso elimina el guardado local',()=>{
 const storage=memoryStorage(),app=create({storage});
 app.chooseCard('A');const after=app.getView();assert.equal(after.turn,1);
 const repeated=app.repeatDay(1);assert.equal(repeated.view.turn,0);
 app.clearProgress();assert.equal(app.getView().phase,'not_started');
 assert.equal(storage.getItem('moon-survival-partida-v03'),null);
});
test('Errores de entrada impiden finalizar un minijuego sin decisión y no alteran estado',()=>{
 const app=create();assert.throws(()=>app.finishMinigame({completed:true,accuracy:100}),/NO_PENDING_MINIGAME/);
 assert.throws(()=>app.chooseCard('Z'),/INVALID_CHOICE/);
 assert.equal(app.getView().turn,0);
});
