import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createEngine} from '../src/core/engine.js';
import {createFrontendBridge} from '../src/core/frontend-bridge.js';
const data=n=>JSON.parse(readFileSync(new URL(`../data/${n}.json`,import.meta.url),'utf8'));
const catalog={challenges:data('challenges'),items:data('shop'),endings:data('endings'),facts:data('science-facts'),events:data('nasa-events')};
const engine={...createEngine(catalog),catalog};
const memoryStorage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
const create=(storage=memoryStorage())=>createFrontendBridge(engine,{storage,seed:'mundo-1'});
// Partida con 300 monedas (la de verdad empieza con 25 y las gana jugando).
const rich=(storage=memoryStorage())=>{create(storage);const raw=JSON.parse(storage.getItem('moon-survival-partida-v03'));raw.game.coins=300;storage.setItem('moon-survival-partida-v03',JSON.stringify(raw));return create(storage)};
const RID=n=>`req-${n}-00000000`;

test('Pedido: cobra una sola vez, no toca el inventario hasta recogerlo y respeta el límite',()=>{
  const b=rich();const c0=b.getView().coins;
  const {view}=b.order('agua',{requestId:RID(1)});
  assert.equal(view.coins,c0-35);
  assert.equal(view.orders.length,1);assert.equal(view.orders[0].status,'confirmed');
  assert.deepEqual(view.bag,{});
  const again=b.order('agua',{requestId:RID(1)});           // doble clic o reintento de red
  assert.equal(again.view.coins,c0-35);assert.equal(again.view.orders.length,1);assert.equal(again.result.duplicate,true);
  assert.throws(()=>b.collect({requestId:RID(2)}),/NO_ORDER_READY/); // todavía no está listo
});

test('Entrega: pasa a listo con el reloj del mundo, se recoge una vez y llega a la bolsa',()=>{
  const b=rich();b.order('bateria',{requestId:RID(3)});
  assert.deepEqual(b.tick(10).ready,[]);
  assert.deepEqual(b.tick(10).ready,['P1']);
  assert.equal(b.getView().orders[0].status,'ready');
  const r=b.collect({requestId:RID(4)});
  assert.deepEqual(r.view.bag,{bateria:1});assert.equal(r.view.orders[0].status,'collected');
  const dup=b.collect({requestId:RID(4)});assert.deepEqual(dup.view.bag,{bateria:1});
  assert.throws(()=>b.collect({requestId:RID(5)}),/NO_ORDER_READY/);
});

test('Usar un objeto aplica su efecto una vez y lo descuenta de la bolsa',()=>{
  const b=rich();b.order('agua',{requestId:RID(6)});b.tick(25);b.collect({requestId:RID(7)});
  const w0=b.getView().metrics.water;
  const {view}=b.useItem('agua',{requestId:RID(8)});
  assert.equal(view.metrics.water,Math.min(100,w0+18));assert.deepEqual(view.bag,{});
  assert.equal(b.useItem('agua',{requestId:RID(8)}).view.metrics.water,view.metrics.water);   // mismo requestId
  assert.throws(()=>b.useItem('agua',{requestId:RID(9)}),/ITEM_NOT_IN_BAG/);
});

test('Saldo y límite: sin monedas no hay pedido y el tercer artículo agota el stock',()=>{
  const b=create();
  assert.throws(()=>b.order('escudo'),/INSUFFICIENT_COINS/);
  const g=engine.createGame({seed:'x'});g.coins=500;
  let s=g;for(let i=0;i<3;i++)s=engine.orderItem(s,'agua').state;
  assert.throws(()=>engine.orderItem(s,'agua'),/OUT_OF_STOCK/);
});

test('Tanque: un llenado insuficiente deja un estado y reduce la autonomía del traje',()=>{
  const b=create();
  assert.equal(b.getView().world.suit.evaMax,180);
  const bad=b.fillTank(30,{requestId:RID(10)}).view;
  assert.ok(bad.statuses.includes('tanque_incompleto'));
  assert.ok(bad.world.suit.evaMax<180);
  const ok=b.fillTank(100,{requestId:RID(11)}).view;
  assert.ok(!ok.statuses.includes('tanque_incompleto'));assert.equal(ok.world.suit.evaMax,180);
});

test('Autonomía: afuera se gasta el aire del traje; al agotarse hay una sola consecuencia',()=>{
  const b=create();b.fillTank(40);b.leaveBase({requestId:RID(30)});const max=b.getView().world.suit.evaMax;
  const h0=b.getView().metrics.health;
  const r1=b.tick(max-1,{outside:true});assert.equal(r1.exhausted,false);
  const r2=b.tick(5,{outside:true});assert.equal(r2.exhausted,true);
  const v=b.getView();assert.equal(v.metrics.health,h0-8);assert.ok(v.statuses.includes('oxigeno_agotado'));
  assert.equal(b.tick(5,{outside:true}).exhausted,false);assert.equal(b.getView().metrics.health,h0-8);
});

test('Regla del tanque: sin tanque lleno no se sale; salir lo usa; volver lo vacía; llenarlo cuesta oxígeno de la base',()=>{
  const b=create();
  assert.equal(b.getView().world.suit.loaded,false);
  assert.throws(()=>b.leaveBase({requestId:RID(31)}),/TANK_NOT_LOADED/);          // primera salida: hay que llenar
  const o0=b.getView().metrics.oxygen;
  const f=b.fillTank(100,{requestId:RID(32)});
  assert.equal(f.view.metrics.oxygen,o0-3);assert.equal(f.view.world.suit.loaded,true);
  const out=b.leaveBase({requestId:RID(33)});assert.equal(out.view.world.suit.outside,true);
  assert.throws(()=>b.fillTank(100,{requestId:RID(34)}),/TANK_FILL_OUTSIDE/);      // no se rellena afuera
  assert.equal(b.tick(10,{outside:true}).eva,170);
  b.enterBase();
  const inside=b.getView().world.suit;assert.equal(inside.loaded,false);assert.equal(inside.outside,false);
  assert.throws(()=>b.leaveBase({requestId:RID(35)}),/TANK_NOT_LOADED/);            // otra salida = otro tanque
});

test('Sin tanque cargado no se gasta aire aunque el reloj diga "afuera"; con oxígeno de base casi agotado no se puede llenar',()=>{
  const b=create();
  assert.equal(b.tick(30,{outside:true}).exhausted,false);
  const g=engine.createGame({seed:'poco'});g.metrics.oxygen=8;
  assert.throws(()=>engine.tankFill(g,100),/INSUFFICIENT_STATION_OXYGEN/);
});

test('Avatar y mundo: se validan, se guardan y vuelven al cargar',()=>{
  const st=memoryStorage();const b=rich(st);
  const av={name:'  Luna<>  ',skin:3,hair:2,style:7,eyes:1,suit:4,accessory:'glasses',expression:'happy',emblem:5};
  const a=b.setAvatar(av).view.world.avatar;
  assert.equal(a.name,'Luna');assert.equal(a.style,7);
  assert.throws(()=>b.setAvatar({...av,hair:99}),/INVALID_AVATAR/);
  assert.throws(()=>b.setAvatar({...av,accessory:'cola'}),/INVALID_AVATAR/);
  b.checkpoint('invernadero',{x:120.44,y:99});
  assert.throws(()=>b.checkpoint('marte',{x:1,y:1}),/INVALID_SCENE/);
  b.order('comms',{requestId:RID(12)});b.tick(30);
  const b2=create(st);                                            // otra sesión con el mismo guardado
  const v=b2.getView();
  assert.equal(v.world.scene,'invernadero');assert.deepEqual(v.world.pos,{x:120.4,y:99});
  assert.equal(v.world.avatar.name,'Luna');assert.equal(v.orders[0].status,'ready');
});

test('Un guardado v0.4 sin mundo se abre sin perder nada',()=>{
  const st=memoryStorage();const b=rich(st);const raw=JSON.parse(st.getItem('moon-survival-partida-v03'));
  delete raw.game.orders;delete raw.game.bag;delete raw.game.world;st.setItem('moon-survival-partida-v03',JSON.stringify(raw));
  const b2=create(st);assert.equal(b2.getView().phase,'active');
  assert.equal(b2.order('agua',{requestId:RID(13)}).view.orders.length,1);
});

test('Repetir un día conserva el avatar',()=>{
  const b=create();b.setAvatar({name:'Teo',skin:0,hair:0,style:0,eyes:0,suit:0,accessory:'none',expression:'neutral',emblem:0});
  b.chooseCard('A');b.repeatDay(1);
  assert.equal(b.getView().world.avatar.name,'Teo');
});

// ── Rutas HTTP nuevas (servidor Node + SQLite en memoria) ──
import {createApp,openDatabase} from '../src/server.js';
async function withServer(fn){
  const db=openDatabase(':memory:');const {server}=createApp({db});await new Promise(done=>server.listen(0,'127.0.0.1',done));
  const base=`http://127.0.0.1:${server.address().port}`;
  const api=async(method,path,b)=>{const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json'},body:b===undefined?undefined:JSON.stringify(b)});return {status:r.status,json:await r.json()}};
  try{await fn(api)}finally{await new Promise(done=>server.close(done));db.close()}
}
test('API: pedido → listo → recogida → bolsa → uso, con requestId idempotente y errores claros',async()=>withServer(async api=>{
  const id=(await api('POST','/api/v1/games',{seed:'http-mundo'})).json.game.id,g=p=>`/api/v1/games/${id}/${p}`;
  assert.equal((await api('POST',g('shop/order'),{itemId:'escudo',requestId:RID(20)})).json.error.code,'INSUFFICIENT_COINS');
  await api('POST',g('missions/1/resolve'),{choiceId:'A',performance:{completed:true,accuracy:95,mistakes:0,hintsUsed:0},requestId:RID(21)});
  const a=await api('POST',g('shop/order'),{itemId:'agua',requestId:RID(22)});assert.equal(a.status,200);
  const again=await api('POST',g('shop/order'),{itemId:'agua',requestId:RID(22)});
  assert.equal(again.json.alreadyProcessed,true);                                  // un solo cobro
  assert.equal((await api('POST',g('orders/collect'),{requestId:RID(23)})).json.error.code,'NO_ORDER_READY');
  assert.equal((await api('POST',g('world/tick'),{seconds:25})).status,200);
  const c=await api('POST',g('orders/collect'),{requestId:RID(24)});assert.equal(c.status,200);
  assert.deepEqual((await api('GET',`/api/v1/games/${id}`)).json.game.bag,{agua:1});
  assert.equal((await api('POST',g('inventory/use'),{itemId:'agua',requestId:RID(25)})).status,200);
  assert.equal((await api('POST',g('inventory/use'),{itemId:'agua',requestId:RID(26)})).json.error.code,'ITEM_NOT_IN_BAG');
  assert.equal((await api('POST',g('world/tank'),{percent:40,requestId:RID(27)})).status,200);
  assert.equal((await api('POST',g('world/avatar'),{avatar:{name:'Ana',skin:1,hair:1,style:1,eyes:1,suit:1,accessory:'none',expression:'neutral',emblem:2}})).status,200);
  assert.equal((await api('POST',g('world/avatar'),{avatar:{name:'x',skin:99}})).json.error.code,'INVALID_AVATAR');
  assert.equal((await api('POST',g('world/state'),{scene:'crater',pos:{x:148,y:62}})).status,200);
  assert.equal((await api('POST',g('world/state'),{scene:'luna',pos:{x:1,y:1}})).json.error.code,'INVALID_SCENE');
}));
