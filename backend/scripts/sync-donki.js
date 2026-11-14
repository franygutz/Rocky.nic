import {readFileSync,writeFileSync} from 'node:fs';
import {openDatabase} from '../src/server.js';
const path=new URL('../data/nasa-events.json',import.meta.url);
const key=process.env.NASA_API_KEY||'DEMO_KEY';
const until=process.env.NASA_END_DATE||new Date().toISOString().slice(0,10);
const since=process.env.NASA_START_DATE||new Date(Date.now()-14*86400000).toISOString().slice(0,10);
if(!/^\d{4}-\d{2}-\d{2}$/.test(since)||!/^\d{4}-\d{2}-\d{2}$/.test(until)||since>until)throw Error('NASA_START_DATE y NASA_END_DATE deben usar YYYY-MM-DD y estar ordenadas');
const interval=(Date.parse(until)-Date.parse(since))/86400000;
if(interval>30)throw Error('Usá un período de hasta 30 días para evitar consultas excesivas');
const db=openDatabase();
const all=JSON.parse(readFileSync(path,'utf8'));
const known=new Map(all.map(e=>[e.id,e]));
let synced=0, failures=0;
try{
 for(const type of ['SEP','CME','GST']){
  const url=`https://api.nasa.gov/DONKI/${type}?`+new URLSearchParams({startDate:since,endDate:until,api_key:key});
  try{
   const res=await fetch(url,{signal:AbortSignal.timeout(13000)});
   if(!res.ok)throw Error(`HTTP ${res.status}`);
   const raw=await res.json();if(!Array.isArray(raw))throw Error('La respuesta no es un arreglo');
   for(const evt of raw){
    const id=evt.sepID||evt.activityID||evt.gstID||evt.eventID;
    if(typeof id!=='string'||!id)continue;
    const observedAt=evt.eventTime||evt.startTime||evt.beginTime||null;
    const link=(typeof evt.link==='string'&&evt.link.startsWith('https://'))?evt.link:'https://ccmc.gsfc.nasa.gov/tools/DONKI/';
    const kp=type==='GST'&&Array.isArray(evt.allKpIndex)?evt.allKpIndex.map(v=>Number(v.kpIndex)).filter(Number.isFinite):[];
    const item={id,type,observedAt,title:`${type} · ${id}`,source:'NASA Open API / DONKI',sourceUrl:link,
      datasetType:'registro_nasa_descargado',retrievedAt:new Date().toISOString(),location:type==='GST'?'Magnetosfera terrestre':'Observación solar',
      summary:`Registro ${type} de DONKI. ${kp.length?'Índices Kp observados: '+kp.join(', ')+'.':''}`.trim(),
      note:'La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados.'};
    known.set(id,item);
    db.prepare('INSERT INTO science_events(id,type,observed_at,payload_json,retrieved_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET type=excluded.type,observed_at=excluded.observed_at,payload_json=excluded.payload_json,retrieved_at=excluded.retrieved_at').run(id,type,observedAt,JSON.stringify(item),item.retrievedAt);
    synced++;
   }
   console.log(`${type}: ${raw.length} registros recibidos, ${synced} almacenados en total`);
  }catch(error){failures++;console.error(`${type}: error consultando NASA (${error.message}); se conserva el archivo histórico disponible`)}
 }
 if(synced){
  const items=[...known.values()].sort((a,b)=>(b.observedAt||'').localeCompare(a.observedAt||''));
  writeFileSync(path,JSON.stringify(items,null,2)+'\n');
  console.log(`Actualizado data/nasa-events.json con ${items.length} registros, listo para compilación offline.`);
 }
 console.log(`SINCRONIZACIÓN: ${synced} registros guardados; ${failures} consultas fallidas. No se generaron datos ficticios.`);
}finally{db.close()}
