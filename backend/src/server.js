import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {createEngine} from './core/engine.js';
const read=(name)=>JSON.parse(readFileSync(new URL(`../data/${name}`,import.meta.url),'utf8'));
const catalog={challenges:read('challenges.json'),items:read('shop.json'),endings:read('endings.json'),facts:read('science-facts.json')};
export const curatedEvents=read('nasa-events.json');
export const engine=createEngine(catalog);
export function openDatabase(file=process.env.DATABASE_PATH||'./data/moon-v03.sqlite'){
  if(file!==':memory:')mkdirSync(dirname(resolve(file)),{recursive:true});
  const db=new DatabaseSync(file);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS mission_history (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT NOT NULL, day INTEGER NOT NULL, mission_id INTEGER NOT NULL, result_json TEXT NOT NULL, FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS purchase_history (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT NOT NULL, day INTEGER NOT NULL, item_id TEXT NOT NULL, result_json TEXT NOT NULL, FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS audit_events (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id TEXT NOT NULL, action TEXT NOT NULL, data_json TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS science_events (id TEXT PRIMARY KEY, type TEXT NOT NULL, observed_at TEXT, payload_json TEXT NOT NULL, retrieved_at TEXT);
  `);
  return db;
}
const iso=()=>new Date().toISOString();
function transaction(db,fn){db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}
function getGame(db,id){const row=db.prepare('SELECT state_json FROM games WHERE id=?').get(id);if(!row){const e=new Error('GAME_NOT_FOUND');e.status=404;throw e}return JSON.parse(row.state_json)}
const saveGame=(db,g)=>db.prepare('INSERT INTO games(id,state_json,updated_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET state_json=excluded.state_json,updated_at=excluded.updated_at').run(g.id,JSON.stringify(g),iso());
function logAudit(db,id,action,data){db.prepare('INSERT INTO audit_events(game_id,action,data_json,created_at) VALUES (?,?,?,?)').run(id,action,JSON.stringify(data),iso())}
function scienceEvents(db){
  const synced=db.prepare('SELECT payload_json FROM science_events ORDER BY observed_at DESC LIMIT 100').all().map(row=>JSON.parse(row.payload_json));
  const ids=new Set(synced.map(x=>x.id));return [...synced,...curatedEvents.filter(x=>!ids.has(x.id))];
}
const origins=['http://localhost:5173','http://127.0.0.1:5173','http://localhost:5500','http://127.0.0.1:5500','http://localhost:4173','http://127.0.0.1:4173'];
const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data,null,2))};
async function body(req){let text='';for await(const chunk of req){text+=chunk;if(text.length>16000)throw new Error('BODY_TOO_LARGE')}if(!text.trim())return{};try{const b=JSON.parse(text);if(!b||Array.isArray(b)||typeof b!=='object')throw Error();return b}catch{throw new Error('BAD_JSON')}}
const errorCodes={BODY_TOO_LARGE:413,BAD_JSON:400,GAME_NOT_FOUND:404,OLD_SAVE_VERSION:409,GAME_FINISHED:409,MISSION_NOT_FOUND:404,NOT_CURRENT_MISSION:409,
INVALID_CHOICE:400,INVALID_HINT:400,INVALID_PERFORMANCE:400,NO_CURRENT_MISSION:409,ITEM_NOT_FOUND:404,OUT_OF_STOCK:409,INSUFFICIENT_COINS:409,
INVALID_MESSAGE_TYPE:400,WEATHER_RESPONSE_REQUIRED:409,NO_PENDING_WEATHER:409,INVALID_WEATHER_CHOICE:400,INSUFFICIENT_ENERGY:409,INVALID_REPLAY_DAY:409,INVALID_QUESTION:400,REPORT_NOT_READY:409,INVALID_REQUEST_ID:400};
function mutate(db,id,action,input,handler){
  return transaction(db,()=>{
    const g=getGame(db,id);const rid=input.requestId;
    if(rid!==undefined&&(typeof rid!=='string'||rid.length<8||rid.length>120))throw Error('INVALID_REQUEST_ID');
    if(rid&&g.receipts?.[rid]){const previous=g.receipts[rid];if(previous.action!==action)throw Error('INVALID_REQUEST_ID');return {game:g,alreadyProcessed:true,result:previous.result,next:engine.nextMission(g)}}
    const out=handler(g);
    const updated=out.state;updated.receipts ||= {};
    if(rid){updated.receipts[rid]={action,result:out.result||out.response};const keys=Object.keys(updated.receipts);if(keys.length>100)delete updated.receipts[keys[0]]}
    saveGame(db,updated);
    const summary={action,requestId:rid||null,turn:updated.turn,day:updated.day};
    logAudit(db,id,action,summary);
    if(action==='RESOLVE'||action==='SKIP')db.prepare('INSERT INTO mission_history(game_id,day,mission_id,result_json) VALUES (?,?,?,?)').run(id,out.result.day,out.result.missionId,JSON.stringify(out.result));
    if(action==='BUY')db.prepare('INSERT INTO purchase_history(game_id,day,item_id,result_json) VALUES (?,?,?,?)').run(id,out.result.day,out.result.itemId,JSON.stringify(out.result));
    if(action==='REPLAY'){
      db.prepare('DELETE FROM mission_history WHERE game_id=? AND day>=?').run(id,out.result.replayedDay);
      db.prepare('DELETE FROM purchase_history WHERE game_id=? AND day>=?').run(id,out.result.replayedDay);
    }
    return {game:updated,result:out.result,response:out.response,next:engine.nextMission(updated),daySummary:out.daySummary||null};
  });
}
export function createApp({db=openDatabase(':memory:'),allowedOrigins=origins}={}){
  const server=http.createServer(async(req,res)=>{
    const origin=req.headers.origin;
    if(origin&&allowedOrigins.includes(origin)){
      res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
      res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
    }
    if(req.method==='OPTIONS'){res.writeHead(origin&&!allowedOrigins.includes(origin)?403:204);res.end();return}
    try{
      const url=new URL(req.url,'http://127.0.0.1');const path=url.pathname;
      if(req.method==='GET'&&(path==='/'||path==='/health'))return send(res,200,{ok:true,service:'moon-survival-backend',version:'0.3.1',api:'/api/v1',offline:'public/offline-demo.html'});
      if(req.method==='GET'&&path==='/api/v1/catalog')return send(res,200,{missions:catalog.challenges.length,shop:catalog.items.length,endings:Object.keys(catalog.endings).length,scienceEvents:scienceEvents(db).length});
      if(req.method==='GET'&&path==='/api/v1/missions'){
        const difficulty=url.searchParams.get('difficulty');const category=url.searchParams.get('category');
        const list=catalog.challenges.filter(c=>(!difficulty||String(c.difficulty)===difficulty)&&(!category||c.category===category));return send(res,200,{total:list.length,missions:list});
      }
      if(req.method==='GET'&&path==='/api/v1/shop')return send(res,200,{items:catalog.items});
      if(req.method==='GET'&&path==='/api/v1/science-events')return send(res,200,{events:scienceEvents(db),disclaimer:'Son registros NASA históricos, no lecturas del hábitat lunar; efectos del juego simulados.'});
      if(req.method==='GET'&&path==='/api/v1/science/facts')return send(res,200,{facts:catalog.facts});
      if(req.method==='GET'&&path==='/api/v1/science/sources')return send(res,200,{sources:[{name:'NASA CCMC DONKI',url:'https://ccmc.gsfc.nasa.gov/tools/DONKI/'},{name:'NASA Open APIs',url:'https://api.nasa.gov/'},{name:'NASA OSDR',url:'https://science.nasa.gov/biological-physical/data/osdr/'},{name:'CSA Food Production',url:'https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/'}]});
      if(req.method==='POST'&&path==='/api/v1/games'){
        const b=await body(req);if(b.seed!==undefined&&!['string','number'].includes(typeof b.seed))throw Error('BAD_JSON');
        const g=engine.createGame({id:randomUUID(),seed:b.seed??1,scienceEvents:scienceEvents(db)});
        transaction(db,()=>{saveGame(db,g);logAudit(db,g.id,'CREATE',{seed:g.seed})});
        return send(res,201,{game:g,next:engine.nextMission(g),shop:engine.shop(g)});
      }
      const m=path.match(/^\/api\/v1\/games\/([a-zA-Z0-9-]{12,80})(?:\/(.*))?$/);
      if(m){const id=m[1],act=m[2]||'';
        if(req.method==='GET'&&!act){const g=getGame(db,id);return send(res,200,{game:g,next:engine.nextMission(g)})}
        if(req.method==='GET'&&(act==='next-mission'||act==='missions')){const g=getGame(db,id);return send(res,200,{day:g.day,skill:g.skill,...engine.nextMission(g)})}
        if(req.method==='GET'&&act==='shop'){const g=getGame(db,id);return send(res,200,{coins:g.coins,items:engine.shop(g)})}
        if(req.method==='GET'&&act==='weather'){const g=getGame(db,id);return send(res,200,{weather:g.weather,science:g.science})}
        if(req.method==='GET'&&act==='communications'){const g=getGame(db,id);return send(res,200,{messages:g.messages})}
        if(req.method==='GET'&&act==='history'){const g=getGame(db,id);return send(res,200,{missions:g.history,purchases:g.purchases,events:g.events,mode:'linea_temporal_actual; sqlite conserva auditoria interna'})}
        if(req.method==='GET'&&act==='report'){const g=getGame(db,id);return send(res,200,{report:engine.report(g)})}
        if(req.method==='POST'&&act==='skip-turn'){const b=await body(req);return send(res,200,mutate(db,id,'SKIP',b,g=>engine.skipMission(g)))}
        if(req.method==='POST'&&act==='repeat-day'){const b=await body(req);return send(res,200,mutate(db,id,'REPLAY',b,g=>engine.repeatDay(g,b.day??g.day)))}
        if(req.method==='POST'&&act==='shop/purchase'){const b=await body(req);return send(res,200,mutate(db,id,'BUY',b,g=>engine.purchase(g,b.itemId)))}
        if(req.method==='POST'&&act==='weather/respond'){const b=await body(req);return send(res,200,mutate(db,id,'WEATHER',b,g=>engine.respondWeather(g,b.choice)))}
        if(req.method==='POST'&&act==='communications/send'){const b=await body(req);return send(res,200,mutate(db,id,'SEND_MESSAGE',b,g=>engine.sendMessage(g,b.type)))}
        if(req.method==='POST'&&act==='npc/ask'){const b=await body(req);const out=mutate(db,id,'NPC_ASK',b,g=>{const events=scienceEvents(db);const known=new Map((g.scienceEventPool||[]).map(e=>[e.id,e]));for(const e of events)known.set(e.id,e);g.scienceEventPool=[...known.values()];return engine.npcAsk(g,b.question,{hint:b.hint===true})});return send(res,200,{npc:out.response,game:out.game,alreadyProcessed:out.alreadyProcessed||false})}
        const r=act.match(/^missions\/(\d+)\/resolve$/);
        if(req.method==='POST'&&r){const b=await body(req);return send(res,200,mutate(db,id,'RESOLVE',b,g=>engine.resolveMission(g,Number(r[1]),b.choiceId,{performance:b.performance,hintUsed:b.hintUsed??false})))}
      }
      return send(res,404,{error:{code:'NOT_FOUND',message:'Ruta desconocida'}});
    }catch(e){const code=(e.message||'').split(':')[0];const status=e.status||errorCodes[code]||500;if(status===500)console.error(e);return send(res,status,{error:{code:status===500?'SERVER_ERROR':code,message:status===500?'Error interno':e.message}})}
  });
  return {server,db};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const db=openDatabase();const {server}=createApp({db,allowedOrigins:(process.env.FRONTEND_ORIGINS||origins.join(',')).split(',').map(s=>s.trim())});
  const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||3001);
  server.listen(port,host,()=>console.log(`Moon Survival v0.3 disponible en http://${host}:${port}/health · SQLite ${process.env.DATABASE_PATH||'./data/moon-v03.sqlite'}`));
}
