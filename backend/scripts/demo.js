import {engine,curatedEvents} from '../src/server.js';
let g=engine.createGame({seed:'Farid-demo',scienceEvents:curatedEvents});
console.log('MOON SURVIVAL 0.3 · Prueba sin frontend · semilla',g.seed);
console.log('LUNI:',engine.npcAsk(g,'¿Qué dice NASA sobre las tormentas solares?').response.answer);
const b=engine.sendMessage(g,'status_report');g=b.state;
for(let turn=1;turn<=14&&g.phase==='active';turn++){
 if(g.weather?.pending){g=engine.respondWeather(g,'shelter').state;console.log('Refugio activado: clima espacial de entrenamiento')}
 const m=engine.nextMission(g).next;
 const performance={completed:turn%6!==0,accuracy:turn%6===0?25:95,mistakes:turn%6===0?5:0,hintsUsed:0};
 const out=engine.resolveMission(g,m.id,'A',{performance});g=out.state;
 console.log(`Día ${out.result.day} / turno ${turn}: #${m.id} ${m.name} | ${out.result.status} | +${out.result.coinsAwarded} 🪙 | habilidad ${g.skill}`);
 if(turn===2&&g.coins>=35){g=engine.purchase(g,'agua').state;console.log('Tienda: agua comprada; monedas',g.coins)}
 if(turn===8)console.log('DONKI:',g.science.sourceMode,g.science.registeredEvent?.id||'sin_evento');
}
console.log('Resumen final:',engine.report(g).ending.title);console.log('Por qué:',engine.report(g).why.evidence.join(' '));
const retry=engine.repeatDay(g,7).state;
console.log('Repetir día 7: turno restaurado',retry.turn,'día',retry.day,'fase',retry.phase);
