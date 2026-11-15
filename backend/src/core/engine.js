// Motor puro, sin Node, HTTP, base de datos ni conexión. Reutilizable en navegador.
export function createEngine(catalog) {
  // Idiomas: el catálogo base está en español; catalog.i18n = { en: { shop, status, endings, facts, challenges } }.
  // Lo que falta en un idioma cae al español (nunca queda un texto vacío).
  const LANGUAGES = [{code:'es',name:'Español',native:'Español'},{code:'en',name:'English',native:'English'}];
  const baseCatalog = catalog;
  const merge = (a,b) => (b && typeof b==='object' && !Array.isArray(b)) ? Object.assign({},a,Object.fromEntries(Object.entries(b).filter(([,v])=>v!==undefined&&v!==null&&v!==''))) : a;
  function localize(lang='es') {
    const ov = lang==='es' ? null : baseCatalog.i18n?.[lang];
    if (!ov) return {challenges:baseCatalog.challenges,items:baseCatalog.items,endings:baseCatalog.endings,facts:baseCatalog.facts||[],statusNames:baseCatalog.statusNames||{},lang:'es'};
    return {lang,
      challenges:baseCatalog.challenges.map(c=>{const t=ov.challenges?.[c.id];if(!t)return c;
        const {choices:tc,...rest}=t;return {...merge(c,rest),choices:c.choices.map((ch,i)=>merge(ch,tc?.[i]))}}),
      items:baseCatalog.items.map(i=>merge(i,ov.shop?.[i.id])),
      endings:Object.fromEntries(Object.entries(baseCatalog.endings).map(([k,v])=>[k,merge(v,ov.endings?.[k])])),
      facts:(baseCatalog.facts||[]).map(f=>merge(f,ov.facts?.[f.id])),
      statusNames:{...(baseCatalog.statusNames||{}),...(ov.status||{})}};
  }
  let lang = 'es';
  // Textos de los registros DONKI (vienen en español en nasa-events.json): se traducen por patrón.
  const MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'],MONTHS_ES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const NOTE_EN={'La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados.':'The recorded activity does NOT show a Moon radiation dose. The game effects are simulated.','Kp describe actividad geomagnética cerca de la Tierra. No mide directamente la radiación de una base lunar.':'Kp describes geomagnetic activity near Earth. It does not directly measure radiation at a Moon base.','Escenario ficticio de entrenamiento inspirado en observaciones. No es pronóstico de riesgo lunar.':'Made-up training scenario inspired by real observations. It is not a Moon risk forecast.','No mide la dosis lunar.':'It does not measure the Moon dose.','Magnetosfera terrestre':'Earth magnetosphere','Observación solar':'Solar observation','Evento histórico como referencia, riesgo y efectos son hipotéticos; no se calculan dosis lunares.':'Historical event as a reference; the risk and effects are made up, and no Moon doses are calculated.','Consecuencias numéricas ficticias, no cálculo de dosis NASA.':'Made-up numeric effects, not a NASA dose calculation.'};
  const evText=(x)=>{
    if(lang!=='en'||typeof x!=='string')return x;
    if(NOTE_EN[x])return NOTE_EN[x];
    let m;
    if((m=/^Registro (\w+) de DONKI\.(?: Índices Kp observados: (.*))?$/.exec(x)))return `DONKI ${m[1]} record.${m[2]?` Observed Kp values: ${m[2]}`:''}`;
    if((m=/^DONKI registró Kp ([\d.]+) en la magnetosfera terrestre durante el intervalo (.+?) UTC del (\d+) de (\w+) de (\d+)\.$/.exec(x))){const mo=MONTHS_EN[MONTHS_ES.indexOf(m[4])]||m[4];return `DONKI recorded Kp ${m[1]} in Earth's magnetosphere between ${m[2]} UTC on ${mo} ${m[3]}, ${m[5]}.`}
    return x;
  };
  const evLocal=(e)=>e&&lang==='en'?{...e,summary:evText(e.summary),note:evText(e.note),location:evText(e.location)}:e;
  let challenges, items, endings, facts, statusNames, challengeMap, itemMap;
  function setLanguage(code) {
    if (!LANGUAGES.some(l=>l.code===code)) throw new Error('INVALID_LANGUAGE');
    const L = localize(code);
    challenges=L.challenges; items=L.items; endings=L.endings; facts=L.facts; statusNames=L.statusNames; lang=L.lang===code?code:'es';
    challengeMap=new Map(challenges.map(c=>[c.id,c])); itemMap=new Map(items.map(i=>[i.id,i]));
    return lang;
  }
  setLanguage('es');
  const clamp = (n, min=0, max=100) => Math.max(min, Math.min(max, n));
  const has = (g, key) => g.statuses.includes(key);
  const add = (g,key) => {if (!has(g,key)) g.statuses.push(key)};
  const remove = (g,key) => {g.statuses=g.statuses.filter(s=>s!==key)};
  const clone = obj => structuredClone(obj);
  const seedNum = seed => {
    if (typeof seed==='number' && Number.isSafeInteger(seed)) return seed>>>0 || 1;
    const str=String(seed ?? 'Luna7');let h=2166136261;
    for(const c of str){h^=c.codePointAt(0);h=Math.imul(h,16777619)}
    return h>>>0 || 1;
  };
  const nextRoll = g => {g.rngState=(Math.imul(g.rngState,1664525)+1013904223)>>>0;return g.rngState/4294967296};
  const randInt = (g,lo,hi) => lo+Math.floor(nextRoll(g)*(hi-lo+1));
  const queue = (g,id,reason,urgent=false)=>{
    if(!challengeMap.has(id)||g.visited.includes(id)||g.currentMissionId===id||g.queue.some(x=>x.id===id))return;
    g.queue.push({id,reason,urgent,at:g.turn});
  };
  function snapshot(g) {
    const s=clone(g);delete s.snapshots;delete s.receipts;return s;
  }
  function saveCheckpoint(g){g.snapshots[String(g.day)]=snapshot(g)}
  function createGame({id,seed=1,scienceEvents=[]}={}) {
    const normalized = seedNum(seed);
    const g={id:id||`offline-${Date.now()}-${Math.floor(Math.random()*1e7)}`, schemaVersion:3,
      phase:'active',turn:0,day:1,maxTurns:14,maxDays:7,seed, rngState:normalized,skill:2,
      metrics:{oxygen:78,water:76,energy:78,food:71,shield:74,comms:75,health:90,morale:80,research:0},
      statuses:[],visited:[],queue:[],currentMissionId:1,consecutiveRisk:0,
      coins:25,earned:0,spent:0,inventory:{},missionResults:{},history:[],
      purchases:[],performance:{completed:0,partial:0,failed:0,skipped:0,hints:0,safeChoices:0,riskyChoices:0,scores:[],mastery:50},
      daySummaries:[],science:{sourceMode:scienceEvents.length?'archivo_real_nasa':'sin_datos',registeredEvent:null},
      events:[],messages:[],communicationSequence:0,npcHelpCount:0,endingId:null,
      createdAt:new Date().toISOString(),snapshots:{},receipts:{},criticalAlert:null,weather:null,
      orders:[],bag:{},world:{avatar:null,scene:'exterior',pos:null,clock:0,suit:{fill:0,eva:0,evaMax:180,loaded:false,outside:false}}};
    g.scienceEventPool=scienceEvents.filter(x=>x&&typeof x.id==='string'&&['SEP','CME','GST'].includes(x.type)).map(e=>({id:e.id,type:e.type,observedAt:e.observedAt,title:e.title,source:e.source,sourceUrl:e.sourceUrl,summary:e.summary,datasetType:e.datasetType,location:e.location,note:e.note}));
    saveCheckpoint(g);
    return g;
  }
  function assertGame(g,allowFinished=false){
    if(g.schemaVersion!==3)throw new Error('OLD_SAVE_VERSION: se requiere partida v0.3');
    if(!allowFinished && g.phase!=='active')throw new Error('GAME_FINISHED: no se puede modificar una partida terminada');
  }
  const currentMission = g=>g.phase==='active'?challengeMap.get(g.currentMissionId)||null:null;
  function missionModifiers(g,c){
    let time=1,cost=1;const reasons=[];
    if((c.category==='radiation'||c.category==='life')&&has(g,'fuga_activa')){time*=0.8;reasons.push('Fuga activa: menos margen operativo')}
    if(c.category==='radiation'&&has(g,'traje_comprometido')){time*=0.75;reasons.push('Traje comprometido: EVA requiere protocolo extra')}
    if(c.category==='comms'&&(has(g,'reporte_pendiente')||has(g,'enlace_saturado'))){time*=0.85;reasons.push('Retraso previo en comunicaciones')}
    if(c.category==='food'&&has(g,'cultivo_retrasado')){cost*=1.15;reasons.push('Cultivo retrasado: tareas consumen más recursos')}
    if(c.category==='energy'&&has(g,'energia_comprometida')){cost*=1.15;reasons.push('Red inestable: más gasto de recursos')}
    if(has(g,`reparacion_pendiente_${c.category}`)){time*=0.9;reasons.push('Reparación anterior incompleta')}
    const EN_R={'Fuga activa: menos margen operativo':'Active leak: less room to work','Traje comprometido: EVA requiere protocolo extra':'Suit damaged: the spacewalk needs extra steps','Retraso previo en comunicaciones':'Earlier delay in communications','Cultivo retrasado: tareas consumen más recursos':'Crop behind schedule: tasks use more resources','Red inestable: más gasto de recursos':'Unstable power grid: resources run out faster','Reparación anterior incompleta':'An earlier repair was not finished'};
    return {timeMultiplier:Math.round(time*100)/100,resourceCostMultiplier:Math.round(cost*100)/100,reasons:lang==='en'?reasons.map(r=>EN_R[r]||r):reasons,note:lang==='en'?'Simplified game rules, not NASA physics values.':'Reglas simplificadas de jugabilidad, no parámetros físicos NASA.'};
  }
  function nextMission(g){const c=currentMission(g);return c?{next:{...c,status:'available',day:g.day,turn:g.turn+1,modifiers:missionModifiers(g,c),options:c.choices.map((o,i)=>({id:i?'B':'A',label:o.label,consequence:o.consequence}))},pendingCount:1}:{next:null,pendingCount:0}}
  function crisisTriggers(g) {
    const m=g.metrics;
    if(m.oxygen<38)queue(g,26,'Nivel bajo de aire',true);
    if(m.oxygen<52&&has(g,'fuga_activa'))queue(g,46,'Despresurización',true);
    if(m.water<38)queue(g,21,'Falta de agua',true);
    if(m.energy<38)queue(g,23,'Escasez de energía',true);
    if(m.energy<35&&has(g,'apagones'))queue(g,48,'Apagón en cascada',true);
    if(m.food<34||has(g,'contaminacion'))queue(g,29,'Higiene alimentaria',true);
    if(m.shield<34)queue(g,27,'Protección insuficiente',true);
    if(m.shield<50&&has(g,'traje_comprometido'))queue(g,47,'Traje comprometido',true);
    if(m.comms<34)queue(g,25,'Enlace débil',true);
    if(m.comms<33)queue(g,50,'Sin respuesta',true);
    if(m.health<43)queue(g,31,'Fatiga',true);
    if(m.morale<30)queue(g,35,'Baja moral',false);
    if(has(g,'fuga_activa'))queue(g,36,'Fuga pendiente',true);
    if(has(g,'red_sobrecargada'))queue(g,23,'Red sobrecargada',false);
  }
  function selectNext(g) {
    crisisTriggers(g);
    // Dosificamos retos: empezamos fácil y los niveles 9-10 son posibles con buen dominio.
    const completed=g.performance.completed;
    const gradualCap=Math.min(10,g.skill+1,2+Math.floor(completed*0.68));
    const critical=has(g,'fuga_activa')||has(g,'hipoxia_grave')||has(g,'eva_sin_rescate')||g.metrics.oxygen<20||g.metrics.health<20;
    const emergencyCap=critical?Math.max(7,gradualCap):gradualCap;
    const candidates=g.queue.filter(q=>!g.visited.includes(q.id));
    const easiest=(a,b)=>challengeMap.get(a.id).difficulty-challengeMap.get(b.id).difficulty||a.at-b.at||a.id-b.id;
    const target=Math.min(gradualCap,g.skill);
    const nearest=(a,b)=>Math.abs(challengeMap.get(a.id).difficulty-target)-Math.abs(challengeMap.get(b.id).difficulty-target)||a.at-b.at||a.id-b.id;
    let choice=candidates.filter(q=>q.urgent&&challengeMap.get(q.id).difficulty<=emergencyCap).sort(easiest)[0];
    if(!choice)choice=candidates.filter(q=>challengeMap.get(q.id).difficulty<=gradualCap).sort(nearest)[0];
    if(choice){g.queue=g.queue.filter(q=>q!==choice);return choice.id}
    const maxWanted=Math.min(10,Math.max(1,g.skill));
    const pool=challenges.filter(c=>!g.visited.includes(c.id)&&c.difficulty<=gradualCap);
    if(!pool.length)return challenges.find(c=>!g.visited.includes(c.id))?.id||null;
    pool.sort((a,b)=>Math.abs(a.difficulty-maxWanted)-Math.abs(b.difficulty-maxWanted)||a.difficulty-b.difficulty||a.id-b.id);
    const preferred=pool.filter(c=>Math.abs(c.difficulty-maxWanted)===Math.abs(pool[0].difficulty-maxWanted)).slice(0,5);
    return preferred[Math.floor(nextRoll(g)*preferred.length)].id;
  }
  const failureStatus={life:'fuga_activa',radiation:'traje_comprometido',energy:'energia_comprometida',food:'cultivo_retrasado',comms:'reporte_pendiente'};
  function assess(performance) {
    if(performance===undefined||performance===null)return {status:'completed',score:null,mode:'decision_only',hintsUsed:0};
    if(typeof performance!=='object'||Array.isArray(performance))throw Error('INVALID_PERFORMANCE');
    const {completed,accuracy,mistakes=0,hintsUsed=0}=performance;
    if(typeof completed!=='boolean'||typeof accuracy!=='number'||!Number.isFinite(accuracy)||accuracy<0||accuracy>100||!Number.isInteger(mistakes)||mistakes<0||mistakes>100||!Number.isInteger(hintsUsed)||hintsUsed<0||hintsUsed>20)throw Error('INVALID_PERFORMANCE');
    const score=clamp(Math.round(accuracy*0.75+(completed?25:0)-mistakes*5-hintsUsed*3));
    return {status:completed&&score>=75?'completed':score>=45?'partial':'failed',score,mode:'minigame',hintsUsed};
  }
  function upkeep(g) {
    const daily={oxygen:-4,water:-4,energy:5,food:-3,morale:-1};
    for(const[k,v]of Object.entries(daily))g.metrics[k]=clamp(g.metrics[k]+v);
    if(has(g,'fuga_activa'))g.metrics.oxygen=clamp(g.metrics.oxygen-7);
    if(has(g,'contaminacion')){g.metrics.food=clamp(g.metrics.food-5);g.metrics.health=clamp(g.metrics.health-3)}
    if(has(g,'fatiga'))g.metrics.health=clamp(g.metrics.health-3);
    if(has(g,'deshidratacion'))g.metrics.health=clamp(g.metrics.health-4);
    if(has(g,'apagones'))g.metrics.energy=clamp(g.metrics.energy-9);
    if(has(g,'red_sobrecargada'))g.metrics.energy=clamp(g.metrics.energy-5);
    if(has(g,'fallo_red'))g.metrics.energy=clamp(g.metrics.energy-6);
    if(g.metrics.oxygen<28||g.metrics.water<25)g.metrics.health=clamp(g.metrics.health-6);
    if(g.metrics.health<25)g.metrics.morale=clamp(g.metrics.morale-6);
    const result={day:g.day,metrics:clone(g.metrics),statuses:[...g.statuses],coins:g.coins,skill:g.skill};
    g.daySummaries.push(result);return result;
  }
  function messageTick(g) {
    for(const m of g.messages){
      if(m.status==='pending'&&m.arrivalTurn<=g.turn){
        if(g.metrics.comms<25||has(g,'sin_respuesta')){
          m.arrivalTurn+=1;m.delayCount++;
          g.events.push({type:'COMMS_DELAY',turn:g.turn,messageId:m.id,reason:'averia_de_enlace'});
        }else{
          m.status='acknowledged';m.receivedTurn=g.turn;
          g.events.push({type:'COMMS_ACK',turn:g.turn,messageId:m.id});
          if(m.type==='rescue_request')add(g,'plan_rescate');
          if(m.type==='status_report')remove(g,'reporte_pendiente');
        }
      }
    }
  }
  function scriptedWeather(g) {
    if(g.day!==5||g.events.some(e=>e.type==='WEATHER_TRAINING'))return;
    const eligible=g.scienceEventPool.filter(e=>e.type==='SEP'||e.type==='CME');
    const nasaEvent=eligible.length?eligible[Math.floor(nextRoll(g)*eligible.length)]:null;
    g.science={sourceMode:nasaEvent?'registro_historico_nasa':'escenario_didactico_sin_registro',registeredEvent:nasaEvent};
    g.weather={pending:true,day:g.day,event:nasaEvent,mode:g.science.sourceMode,choices:['shelter','continue_eva'],note:'Escenario ficticio de entrenamiento inspirado en observaciones. No es pronóstico de riesgo lunar.'};
    g.events.push({type:'WEATHER_TRAINING',day:g.day,turn:g.turn,scenario:'ensayo_de_protocolo_de_refugio',sourceMode:g.science.sourceMode,nasaEventId:nasaEvent?.id||null,explanation:'Evento histórico como referencia, riesgo y efectos son hipotéticos; no se calculan dosis lunares.'});
    queue(g,17,'Entrenamiento con datos DONKI',false);
  }
  function deathType(g){const m=g.metrics;
    if(m.shield<=15&&m.oxygen<=55&&has(g,'eva_sin_rescate'))return 10;
    if(m.oxygen<=14&&m.health<=45&&(has(g,'fuga_activa')||has(g,'hipoxia_grave')||has(g,'crisis_sin_resolver')))return 9;
    return 0;
  }
  function isCritical(g){return Boolean(deathType(g))||g.metrics.oxygen<=7||g.metrics.water<=7||g.metrics.health<=7}
  function endingFor(g) {
    const death=deathType(g);if(death)return death;
    const m=g.metrics;if(isCritical(g)||m.health<25)return 8;
    if(m.comms<25&&m.health>=35)return 7;
    if(m.health>=70&&['oxygen','water','energy','food','shield','comms'].filter(k=>m[k]>=45).length>=5&&m.research>=30)return 1;
    if(m.food>=67&&m.water>=48&&m.energy>=15&&m.health>=45)return 2;
    if(m.research>=55&&m.health>=42&&m.oxygen>=35&&m.comms>=40)return 3;
    if(m.comms>=75&&m.health>=45&&m.energy>=15)return 4;
    if(m.health>=45&&m.morale>=62&&m.oxygen>=30&&m.water>=30)return 5;
    return 6;
  }
  function explanationFor(g,endingId) {
    const T=(es,en)=>lang==='en'?en:es;const sn=k=>statusNames[k]||k;
    const m=g.metrics;const notes=[];
    const low=Object.entries(m).filter(([,n])=>n<30).map(([k,v])=>`${k} (${v}/100)`);
    if(low.length)notes.push(T(`Recursos o indicadores comprometidos: ${low.join(', ')}.`,`Resources or meters in trouble: ${low.join(', ')}.`));
    if(g.statuses.length)notes.push(T(`Estados pendientes: ${g.statuses.map(sn).join(', ')}.`,`Pending alerts: ${g.statuses.map(sn).join(', ')}.`));
    if(g.performance.failed||g.performance.skipped)notes.push(T(`Hubo ${g.performance.failed} retos fallidos y ${g.performance.skipped} omitidos.`,`${g.performance.failed} tasks failed and ${g.performance.skipped} were skipped.`));
    if(g.messages.some(x=>x.type==='rescue_request'&&x.status==='acknowledged'))notes.push(T('La solicitud de ayuda obtuvo confirmación de Tierra.','Earth confirmed your call for help.'));
    if(g.messages.some(x=>x.status==='pending'))notes.push(T('Quedan mensajes pendientes de confirmación.','Some messages are still waiting for confirmation.'));
    if(!notes.length)notes.push(T('La tripulación terminó sin alertas persistentes y conservó el equilibrio de recursos.','The crew finished with no lasting alerts and kept resources balanced.'));
    const reasonsEn={
      1:['Health ≥ 70','Five of six basic systems ≥ 45','Research ≥ 30'],
      2:['Food ≥ 67','Water ≥ 48','Energy ≥ 15','Health ≥ 45'],
      3:['Research ≥ 55','Health ≥ 42','Oxygen ≥ 35','Communication ≥ 40'],
      4:['Communication ≥ 75','Energy ≥ 15','Health ≥ 45'],
      5:['Health ≥ 45','Morale ≥ 62','Oxygen and water ≥ 30'],
      6:['No other ending was reached','Enough health to finish without a critical retreat'],
      7:['Communication < 25','Health ≥ 35'],
      8:['Life support or health fell to a critical level; or health < 25 at the end'],
      9:['Oxygen ≤ 14','Health ≤ 45','Leak, severe hypoxia or an unsolved crisis'],
      10:['Protection ≤ 15','Oxygen ≤ 55','Spacewalk without quick rescue']
    };
    const reasonsEs={
      1:['Salud ≥ 70','Cinco de seis sistemas básicos ≥ 45','Investigación ≥ 30'],
      2:['Alimentos ≥ 67','Agua ≥ 48','Energía ≥ 15','Salud ≥ 45'],
      3:['Investigación ≥ 55','Salud ≥ 42','Oxígeno ≥ 35','Comunicaciones ≥ 40'],
      4:['Comunicaciones ≥ 75','Energía ≥ 15','Salud ≥ 45'],
      5:['Salud ≥ 45','Moral ≥ 62','Oxígeno y agua ≥ 30'],
      6:['No se alcanzaron otros criterios','Salud suficiente para finalizar sin retirada crítica'],
      7:['Comunicaciones < 25','Salud ≥ 35'],
      8:['Soporte vital o salud cayó a umbral crítico; o salud < 25 al cierre'],
      9:['Oxígeno ≤ 14','Salud ≤ 45','Fuga, hipoxia grave o crisis pendiente'],
      10:['Protección ≤ 15','Oxígeno ≤ 55','EVA sin rescate inmediato']
    };
    const reasons=lang==='en'?reasonsEn:reasonsEs;
    return {criteria:reasons[endingId]||[],evidence:notes,endingId,priorityNote:T('Se evalúan primero las crisis graves y luego los criterios de final. Los umbrales son ficticios del videojuego.','Serious crises are checked first, then the ending rules. The thresholds are made up for the game.')};
  }
  function endTurn(g) {
    g.turn++;
    let daySummary=null;
    if(g.turn%2===0){daySummary=upkeep(g)}
    messageTick(g);
    if(isCritical(g)||g.turn>=g.maxTurns){g.phase='completed';g.endingId=endingFor(g);g.currentMissionId=null;g.day=Math.min(7,Math.ceil(g.turn/2));}
    else{
      g.day=Math.floor(g.turn/2)+1;
      scriptedWeather(g);
      g.currentMissionId=selectNext(g);
      if(!g.currentMissionId){g.phase='completed';g.endingId=endingFor(g)}
      if(g.turn%2===0&&g.phase==='active')saveCheckpoint(g);
    }
    return daySummary;
  }
  function recordResult(g,c,result) {
    g.visited.push(c.id);g.missionResults[c.id]=result;g.history.push(result);
    if(result.status==='completed')g.performance.completed++;
    if(result.status==='partial')g.performance.partial++;
    if(result.status==='failed')g.performance.failed++;
    if(result.status==='missed')g.performance.skipped++;
  }
  function resolveMission(original,missionId,choiceId,{performance,hintUsed=false}={}) {
    assertGame(original);
    if(original.weather?.pending)throw Error('WEATHER_RESPONSE_REQUIRED');
    const c=challengeMap.get(Number(missionId));
    if(!c)throw Error('MISSION_NOT_FOUND');
    if(c.id!==original.currentMissionId)throw Error('NOT_CURRENT_MISSION');
    const idx=choiceId==='A'||choiceId===0?0:choiceId==='B'||choiceId===1?1:-1;
    if(idx<0)throw Error('INVALID_CHOICE');
    if(typeof hintUsed!=='boolean')throw Error('INVALID_HINT');
    const assessment=assess(performance),o=c.choices[idx],g=clone(original),before=clone(g.metrics);
    const factor=assessment.status==='completed'?1:assessment.status==='partial'?0.5:0;
    const modifiers=missionModifiers(g,c);
    for(const[k,d]of Object.entries(o.delta))g.metrics[k]=clamp(g.metrics[k]+Math.round(d>0?d*factor:d*modifiers.resourceCostMultiplier));
    for(const st of o.add)add(g,st);
    if(assessment.status==='completed'){for(const st of o.remove)remove(g,st);remove(g,`reparacion_pendiente_${c.category}`)}
    if(assessment.status==='failed')add(g,failureStatus[c.category]);
    if(assessment.status==='partial')add(g,`reparacion_pendiente_${c.category}`);
    for(const id of o.next)queue(g,id,`Consecuencia del reto ${c.id}`,false);
    const lowCount=m=>['oxygen','water','energy','food','shield','comms','health'].filter(k=>m[k]<30).length;
    g.consecutiveRisk=o.risk===2?g.consecutiveRisk+1:0;
    const quality=assessment.score;
    if(assessment.status==='failed'||lowCount(g.metrics)>lowCount(before)||g.consecutiveRisk>=2)g.skill=Math.max(1,g.skill-1);
    else if(assessment.status==='completed' && ((quality===null&&o.risk===0)||(quality!==null&&quality>=82)))g.skill=Math.min(10,g.skill+1);
    else if(assessment.status==='partial')g.skill=Math.max(1,g.skill-1);
    if(quality!==null){g.performance.scores.push(quality);g.performance.scores=g.performance.scores.slice(-10);g.performance.mastery=Math.round(g.performance.scores.reduce((a,b)=>a+b,0)/g.performance.scores.length)}
    if(o.risk===2)g.performance.riskyChoices++;if(o.risk===0)g.performance.safeChoices++;
    const totalHints=assessment.hintsUsed+(hintUsed?1:0);
    g.performance.hints+=totalHints;
    const baseReward=randInt(g,c.rewardMin,c.rewardMax);
    const reward=assessment.status==='completed'?baseReward:assessment.status==='partial'?Math.floor(baseReward/2):0;
    g.coins+=reward;g.earned+=reward;
    const result={missionId:c.id,name:c.name,day:g.day,turn:g.turn+1,difficulty:c.difficulty,category:c.category,status:assessment.status,
      assessmentMode:assessment.mode,qualityScore:quality,choiceId:idx?'B':'A',risk:o.risk,consequence:o.consequence,
      attemptedDelta:clone(o.delta),modifiersApplied:modifiers,metricsBefore:before,metricsAfter:clone(g.metrics),addedStatuses:[...o.add],removedStatuses:assessment.status==='completed'?[...o.remove]:[],
      nextCandidates:[...o.next],coinsAwarded:reward,hintsUsed:totalHints,skillAfter:g.skill};
    if(c.id===17)result.scienceReference=clone(g.science);
    recordResult(g,c,result);
    const daySummary=endTurn(g);
    return {state:g,result,daySummary};
  }
  function skipMission(original){
    assertGame(original);
    if(original.weather?.pending)throw Error('WEATHER_RESPONSE_REQUIRED');
    const c=currentMission(original);if(!c)throw Error('NO_CURRENT_MISSION');
    const g=clone(original);g.skill=Math.max(1,g.skill-1);g.consecutiveRisk=0;
    add(g,failureStatus[c.category]);
    const penalty={life:{oxygen:-8},radiation:{shield:-7},energy:{energy:-8},food:{food:-7},comms:{comms:-8}}[c.category];
    for(const[k,v]of Object.entries(penalty))g.metrics[k]=clamp(g.metrics[k]+v);
    for(const id of c.choices[1].next)queue(g,id,`Omisión de ${c.id}`,false);
    const result={missionId:c.id,name:c.name,day:g.day,turn:g.turn+1,difficulty:c.difficulty,category:c.category,status:'missed',choiceId:null,qualityScore:null,
      coinsAwarded:0,reason:'reto_omitido',penalty,addedStatuses:[failureStatus[c.category]],metricsAfter:clone(g.metrics),skillAfter:g.skill};
    recordResult(g,c,result);const daySummary=endTurn(g);
    return {state:g,result,daySummary};
  }
  function purchase(original,itemId) {
    assertGame(original);const item=itemMap.get(itemId);if(!item)throw Error('ITEM_NOT_FOUND');
    const used=original.inventory[item.id]||0;if(used>=item.limit)throw Error('OUT_OF_STOCK');
    if(original.coins<item.price)throw Error('INSUFFICIENT_COINS');
    const g=clone(original);g.coins-=item.price;g.spent+=item.price;g.inventory[item.id]=used+1;
    for(const[k,v]of Object.entries(item.delta))g.metrics[k]=clamp(g.metrics[k]+v);
    for(const st of item.remove)remove(g,st);
    const result={itemId:item.id,name:item.name,price:item.price,day:g.day,turn:g.turn,delta:clone(item.delta),removedStatuses:clone(item.remove),coinsAfter:g.coins};
    g.purchases.push(result);return {state:g,result};
  }
  function respondWeather(original,choice){
    assertGame(original);
    if(!original.weather?.pending)throw Error('NO_PENDING_WEATHER');
    if(!['shelter','continue_eva'].includes(choice))throw Error('INVALID_WEATHER_CHOICE');
    const g=clone(original);
    const deltas=choice==='shelter'?{energy:-8,shield:11,research:-5}:{research:9,oxygen:-5,shield:-12,health:-7};
    for(const[k,v]of Object.entries(deltas))g.metrics[k]=clamp(g.metrics[k]+v);
    if(choice==='shelter'){remove(g,'eva_riesgosa');remove(g,'exposicion_sin_control')}
    else{add(g,'eva_riesgosa');add(g,'exposicion_sin_control')}
    g.weather.pending=false;g.weather.choice=choice;
    const result={choice,day:g.day,turn:g.turn,delta:deltas,reference:g.weather.event?.id||null,
      note:'Consecuencias numéricas ficticias, no cálculo de dosis NASA.'};
    g.events.push({type:'WEATHER_DECISION',...result});
    if(isCritical(g)){g.phase='completed';g.endingId=endingFor(g);g.currentMissionId=null}
    return {state:g,result};
  }
  function sendMessage(original,type){
    assertGame(original);
    const allowed=['status_report','science_report','rescue_request'];if(!allowed.includes(type))throw Error('INVALID_MESSAGE_TYPE');
    if(original.metrics.energy<5)throw Error('INSUFFICIENT_ENERGY');
    const g=clone(original);g.metrics.energy-=5;
    const signalPoor=g.metrics.comms<45||has(g,'enlace_saturado')||has(g,'sin_respuesta');
    const delay=signalPoor?3:1; // turnos de trabajo por interrupciones/protocolos, NO tiempo-luz físico.
    const message={id:`msg-${++g.communicationSequence}`,type,sentTurn:g.turn,arrivalTurn:g.turn+delay,status:'pending',delayCount:0,simulatedDelayTurns:delay};
    g.messages.push(message);g.events.push({type:'MESSAGE_SENT',turn:g.turn,messageId:message.id,messageType:type});
    return {state:g,result:message};
  }
  function repeatDay(original,requestedDay=original.day){
    assertGame(original,true);
    const n=Number(requestedDay),snap=original.snapshots[String(n)];
    if(!Number.isInteger(n)||n<1||n>original.day||!snap)throw Error('INVALID_REPLAY_DAY');
    const restored=clone(snap);restored.snapshots={};
    for(const[k,v]of Object.entries(original.snapshots)){if(Number(k)<=n)restored.snapshots[k]=clone(v)}
    restored.receipts={};restored.world={...(restored.world||{}),avatar:original.world?.avatar??null,scene:original.world?.scene??'exterior',pos:original.world?.pos??null};restored.events.push({type:'DAY_REPEATED',day:n,previousTurn:original.turn});
    return {state:restored,result:{replayedDay:n,turn:restored.turn,day:restored.day,warning:'La repetición restaura recursos, decisiones, compras y aleatoriedad de ese día y elimina cambios posteriores del estado activo.'}};
  }
  // Glosario de clima espacial de Kita (v0.4). Definiciones generales, sin cifras inventadas.
  const GLOSSARY={
    CME:'Una CME (eyección de masa coronal) es una nube enorme de gas con carga eléctrica y campo magnético que el Sol lanza al espacio. DONKI registra cuándo sale y a qué velocidad viaja.',
    SEP:'Las SEP (partículas energéticas solares) son protones y otras partículas que el Sol acelera a gran velocidad. Fuera de la protección magnética de la Tierra pueden aumentar la radiación; por eso una base lunar necesita un refugio.',
    GST:'Una GST es una tormenta geomagnética: el campo magnético de la Tierra se agita cuando llega una CME o viento solar rápido. Ocurre alrededor de la Tierra, así que no mide la radiación en la Luna.',
    KP:'El índice Kp va de 0 a 9 y mide cuánto se agita el campo magnético de la Tierra. Desde Kp 5 se considera tormenta geomagnética. Es una medida de la Tierra, no de la Luna.',
    DONKI:'DONKI (Space Weather Database Of Notifications, Knowledge, Information) es la base de datos de clima espacial de NASA, del Community Coordinated Modeling Center (CCMC). Guarda eventos como CME, SEP y tormentas geomagnéticas.'
  };
  const GLOSSARY_EN={
    CME:'A CME (coronal mass ejection) is a huge cloud of charged gas and magnetic field that the Sun throws into space. DONKI records when it leaves and how fast it travels.',
    SEP:'SEPs (solar energetic particles) are protons and other particles that the Sun speeds up to very high speeds. Outside the Earth\'s magnetic shield they can raise radiation, so a Moon base needs a shelter.',
    GST:'A GST is a geomagnetic storm: the Earth\'s magnetic field shakes when a CME or fast solar wind arrives. It happens around the Earth, so it does not measure radiation on the Moon.',
    KP:'The Kp index goes from 0 to 9 and shows how much the Earth\'s magnetic field is shaking. From Kp 5 it counts as a geomagnetic storm. It is a measure for Earth, not the Moon.',
    DONKI:'DONKI (Space Weather Database Of Notifications, Knowledge, Information) is NASA\'s space weather database at the Community Coordinated Modeling Center (CCMC). It stores events like CMEs, SEPs and geomagnetic storms.'
  };
  const SUGGESTIONS_EN={
    storm:['What does SEP mean?','What is the latest DONKI event saved?','What is the Kp index?'],
    life:['What happens if there is a leak?','How is my base?','What does CME mean?'],
    food:['How much water do plants need?','How is my base?','What do I do in this challenge?'],
    energy:['What are batteries for?','How is my base?','What do I do in this challenge?'],
    comms:['How long does a message to Earth take?','What does CME mean?','How is my base?'],
    radiation:['What does SEP mean?','What is the latest DONKI event saved?','What do I do in this challenge?'],
    default:['What does CME mean?','How is my base?','What do I do in this challenge?']
  };
  // Preguntas que Kita sugiere después de cada respuesta, según el tema.
  const SUGGESTIONS={
    storm:['¿Qué significa SEP?','¿Cuál es el último evento DONKI guardado?','¿Qué es el índice Kp?'],
    life:['¿Qué pasa si hay una fuga?','¿Cómo va mi base?','¿Qué significa CME?'],
    food:['¿Cuánta agua necesitan las plantas?','¿Cómo va mi base?','¿Qué hago en este reto?'],
    energy:['¿Para qué sirven las baterías?','¿Cómo va mi base?','¿Qué hago en este reto?'],
    comms:['¿Cuánto tarda un mensaje a la Tierra?','¿Qué significa CME?','¿Cómo va mi base?'],
    radiation:['¿Qué significa SEP?','¿Cuál es el último evento DONKI guardado?','¿Qué hago en este reto?'],
    default:['¿Qué significa CME?','¿Cómo va mi base?','¿Qué hago en este reto?']
  };
  // Kita funciona sin Internet y solo utiliza el catálogo y eventos ya descargados.
  function npcAsk(original,question,{hint=false}={}){
    if(typeof question!=='string'||question.length>350||question.trim().length<2)throw Error('INVALID_QUESTION');
    const g=clone(original);const EN=lang==='en';const T=(es,en)=>EN?en:es;
    const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
    const q=norm(question);
    const hasWord=word=>(' '+q+' ').includes(' '+norm(word)+' ');
    const any=(...words)=>words.some(hasWord);
    const current=currentMission(g);
    const groups={
      donki:['donki','tormenta','tormentas','solar','solares','sol','sep','cme','gst','kp','radiacion','dosimetro','dosis','particula','particulas','refugio','crater','storm','storms','radiation','dose','particles','shelter','sun','flare'],
      oxygen:['oxigeno','aire','respirar','co2','dioxido','fuga','fugas','tanque','tanques','presion','ventilacion','oxygen','air','breathe','breathing','leak','leaks','tank','tanks','pressure'],
      plant:['agua','riego','cultivo','cultivos','comida','alimento','alimentos','invernadero','semilla','semillas','planta','plantas','hidroponia','water','plants','plant','crops','crop','food','greenhouse','seeds','garden'],
      power:['energia','bateria','baterias','panel','paneles','electricidad','apagon','apagones','circuito','energy','power','battery','batteries','solar panel','panels','electricity','blackout'],
      comms:['comunicacion','comunicaciones','mensaje','mensajes','antena','antenas','latencia','retraso','senal','transmitir','communication','communications','message','messages','antenna','delay','signal','radio'],
      sources:['fuente','fuentes','referencias','bibliografia','sources','references','source']
    };
    const scores=Object.fromEntries(Object.entries(groups).map(([id,terms])=>[id,terms.filter(hasWord).length]));
    const topic=Object.entries(scores).filter(([id])=>id!=='sources').sort((a,b)=>b[1]-a[1])[0];
    const nasaAsk=any('nasa','donki','space weather','solar storm','solar event','evento solar','eventos solares','tormenta','tormentas','cme','sep','gst','kp','actividad solar','clima espacial')||(any('evento','eventos','registro','registros')&&any('ultimo','ultima','reciente','hoy','ayer','2024','2025','2026'));
    const askMission=any('que hago','que hago ahora','que debo hacer','que deberia hacer','pista','ayuda','ayudame','esta mision','este reto','mi reto','consejo','what do i do','what should i do','hint','help','this challenge','my challenge','advice','tip');
    const askStatus=any('como voy','como va mi base','como esta mi base','como esta la base','estado de la base','mi estado','mis recursos','cuanta energia','cuanto oxigeno','cuanta agua','cuanta comida','cuanto queda','how am i doing','how is my base','how is the base','my base','status','my resources','how much');
    const askHello=any('hola','buenas','gracias','quien eres','como te llamas','hello','hi','hey','thanks','thank you','who are you','your name');
    const type=any('sep','particulas energeticas','solar energetic particles')?'SEP':any('cme','eyeccion de masa','coronal mass')?'CME':any('gst','kp','geomagnetica','geomagnetic')?'GST':null;
    const askDefinition=any('que significa','que es','que son','que quiere decir','significado','definicion','define','what does','what is','what are','meaning','definition');
    const term=hasWord('kp')?'KP':type||(hasWord('donki')?'DONKI':null);
    const archived=(g.scienceEventPool||[]).slice();
    if(g.science?.registeredEvent&&!archived.some(x=>x.id===g.science.registeredEvent.id))archived.push(g.science.registeredEvent);
    archived.sort((a,b)=>String(b.observedAt||'').localeCompare(String(a.observedAt||'')));
    const year=(q.match(/\b20\d{2}\b/)||[])[0]||null;
    const matching=archived.filter(e=>(!type||e.type===type)&&(!year||String(e.observedAt||'').startsWith(year)));
    const event=matching[0]||null;
    const sources=[];
    const source=(name,url,kind)=>{if(url?.startsWith('https://')&&!sources.some(s=>s.url===url))sources.push({title:name,url,kind})};
    let answer='',observation=null,matchedTopic=null;
    if(askHello&&!nasaAsk){
      answer=T('¡Hola! Soy Kita, la mascota de Luna-7. Podés preguntarme por oxígeno, energía, agua, cultivos, comunicaciones y tormentas solares. También puedo ofrecer pistas sobre el reto actual o mostrar datos archivados de NASA.','Hi! I am Kita, the mascot of Luna-7. You can ask me about oxygen, energy, water, crops, communications and solar storms. I can also give hints about your current challenge or show archived NASA data.');
    }else if(askStatus&&!nasaAsk){
      answer=EN?`Day ${g.day}: oxygen ${g.metrics.oxygen}/100, water ${g.metrics.water}/100, energy ${g.metrics.energy}/100, food ${g.metrics.food}/100, health ${g.metrics.health}/100 and communications ${g.metrics.comms}/100. These scales are made up for the game, not NASA measurements.`:`Día ${g.day}: oxígeno ${g.metrics.oxygen}/100, agua ${g.metrics.water}/100, energía ${g.metrics.energy}/100, comida ${g.metrics.food}/100, salud ${g.metrics.health}/100 y comunicaciones ${g.metrics.comms}/100. Estas escalas son inventadas para el videojuego, no medidas de NASA.`;
      if(g.statuses.length)answer+=T(' Alertas pendientes: ',' Pending alerts: ')+g.statuses.slice(0,3).map(k=>statusNames[k]||k).join(', ')+'.';
    }else if(askMission&&!nasaAsk&&(!topic||topic[1]===0)&&current){
      answer=EN?`Your challenge #${current.id} is "${current.name}". ${current.intro} ${current.science} To decide, compare the effects on people and resources: a quick fix can cause problems later.`:`Tu reto #${current.id} es «${current.name}». ${current.intro} ${current.science} Para decidir, compará las consecuencias para las personas y los recursos: una solución rápida puede ocasionar problemas después.`;
      const f=facts.find(f=>f.topic===current.category);if(f)source(f.source,f.sourceUrl,f.kind);
      matchedTopic=current.category;
    }else if(askDefinition&&term&&!askMission){
      // Glosario de clima espacial (v0.4): definiciones cortas para niños, con fuente NASA.
      matchedTopic='storm';
      answer=(EN?GLOSSARY_EN:GLOSSARY)[term];
      source('NASA CCMC DONKI','https://ccmc.gsfc.nasa.gov/tools/DONKI/','glosario');
      const ofType=term==='DONKI'?archived:archived.filter(e=>e.type===(term==='KP'?'GST':term));
      if(ofType.length){
        const e=ofType[0];
        observation={id:e.id,type:e.type,title:e.title,observedAt:e.observedAt,source:e.source,sourceUrl:e.sourceUrl,disclaimer:evText(e.note||'No mide la dosis lunar.')};
        answer+=EN?`\n\nIn this game there ${ofType.length===1?'is':'are'} ${ofType.length} saved ${term==='DONKI'?'DONKI':e.type} record${ofType.length===1?'':'s'}; the latest is from ${String(e.observedAt||'').slice(0,10)}. They are archive records, not a live NASA query.`:`\n\nEn esta partida hay ${ofType.length} registro${ofType.length===1?'':'s'} ${term==='DONKI'?'de DONKI':e.type} guardado${ofType.length===1?'':'s'}; el más reciente es del ${String(e.observedAt||'').slice(0,10)}. Son registros de archivo, no una consulta NASA en vivo.`;
        source(e.source,e.sourceUrl,'registro_nasa_descargado');
      }
    }else if(nasaAsk&&(any('nasa','donki','evento','eventos','solar','solares','tormenta','tormentas','sep','cme','gst','kp','clima espacial'))){
      const f=facts.find(f=>f.id==='donki');
      matchedTopic='storm';
      answer=f?.answer||T('DONKI es el registro de clima espacial de NASA.','DONKI is the NASA space weather record.');
      source(f?.source||'NASA DONKI',f?.sourceUrl||'https://ccmc.gsfc.nasa.gov/tools/DONKI/','hecho_cientifico');
      if(event){
        const date=String(event.observedAt||'fecha no disponible').slice(0,10);
        observation={id:event.id,type:event.type,title:event.title,observedAt:event.observedAt,source:event.source,sourceUrl:event.sourceUrl,disclaimer:evText(event.note||'No mide la dosis lunar.')};
        answer+=EN?`\n\nOf the ${archived.length} records saved in this game, I found: ${event.title} (${event.type}), dated ${date}. ${evText(event.summary)||''}`:`\n\nDe los ${archived.length} registros guardados en esta partida, encontré: ${event.title} (${event.type}), con fecha ${date}. ${event.summary||''}`;
        source(event.source,event.sourceUrl,'registro_nasa_descargado');
      }else answer+=archived.length?T('\n\nNo hay eventos guardados del tipo o año solicitado.','\n\nThere are no saved events of that type or year.'):T('\n\nNo hay eventos DONKI cargados en esta partida.','\n\nNo DONKI events are loaded in this game.');
      answer+=T('\n\nLos registros son de archivo, no una consulta NASA en vivo ni mediciones de radiación en la base lunar.','\n\nThese are archive records, not a live NASA query or radiation measurements at the Moon base.');
    }else if(scores.sources>0){
      const f=facts.find(f=>f.id==='sources');answer=f?.answer||T('Las referencias científicas acompañan a los retos.','Scientific references come with the challenges.');
      if(f)source(f.source,f.sourceUrl,f.kind);
    }else if(topic&&topic[1]>0){
      // Preguntas por radiación o dosis usan la ficha medida cerca de la Luna (RadLab · LRO CRaTER).
      const wantsDose=topic[0]==='donki'&&any('radiacion','dosis','dosimetro','crater','radiation','dose');
      const f=(wantsDose&&facts.find(f=>f.id==='radiation'))||facts.find(f=>f.id===topic[0]);
      if(f){
        answer=f.answer;matchedTopic=f.topic;source(f.source,f.sourceUrl,f.kind);
        const metric={donki:'shield',oxygen:'oxygen',plant:'food',power:'energy',comms:'comms'}[topic[0]];
        if(metric)answer+=EN?`\n\nIn this game, the ${metric} meter is at ${g.metrics[metric]}/100. It is a teaching scale.`:`\n\nEn esta partida, el indicador de ${metric} está en ${g.metrics[metric]}/100. Es una escala didáctica.`;
      }
    }
    if(!answer)answer=T('No tengo una ficha científica verificable para esa pregunta todavía. Probá preguntarme por oxígeno, agua, cultivos, baterías, comunicaciones, radiación, DONKI o por el reto actual. Prefiero reconocer mis límites a inventar datos.','I do not have a checked science card for that question yet. Try asking about oxygen, water, crops, batteries, communications, radiation, DONKI or your current challenge. I prefer to admit my limits than to make up facts.');
    if(hint){g.npcHelpCount++;g.performance.hints++}
    const asked=norm(question);
    const SG=EN?SUGGESTIONS_EN:SUGGESTIONS;const suggestions=(SG[matchedTopic]||SG.default).filter(s=>norm(s)!==asked).slice(0,3);
    const response={npc:'Kita',mode:'asistente_educativo_por_reglas_sin_IA_generativa',answer,observation,matchedTopic,
      hint:hint&&current?T(`Pista del reto #${current.id}: ${current.science} Pensá qué recursos y qué riesgos cambian.`,`Hint for challenge #${current.id}: ${current.science} Think about which resources and risks change.`):null,
      sources,suggestions,disclaimer:T('Kita no utiliza IA generativa y no consulta DONKI en vivo. Los datos NASA son registros históricos; los indicadores de la base son simulaciones ficticias.','Kita does not use generative AI and does not query DONKI live. NASA data are historical records; the base meters are made-up simulations.')};
    return {state:g,response};
  }
  function report(g){
    if(g.phase!=='completed')throw Error('REPORT_NOT_READY');
    return {gameId:g.id,endingId:g.endingId,ending:{id:g.endingId,...endings[g.endingId]},why:explanationFor(g,g.endingId),day:g.day,
      turnsPlayed:g.turn,metrics:g.metrics,statuses:g.statuses,coins:g.coins,earned:g.earned,spent:g.spent,
      inventory:g.inventory,performance:g.performance,missions:g.history,daySummaries:g.daySummaries,science:g.science,messages:g.messages};
  }
  function shop(g){return items.map(i=>({...i,purchased:g.inventory[i.id]||0,remaining:i.limit-(g.inventory[i.id]||0),affordable:g.coins>=i.price,available:g.phase==='active'&&g.coins>=i.price&&(g.inventory[i.id]||0)<i.limit}))}

  // ── Mundo jugable (v0.5): pedidos físicos, bolsa, traje y guardado del mundo ──────────────────────────
  // El frontend simula el movimiento; el motor decide saldo, pedidos, bolsa y efectos. Cada operación acepta
  // un requestId: repetirla devuelve el mismo resultado sin volver a cobrar ni a entregar.
  const EVA_BASE=180,ORDER_SECONDS=20,BAG_CAPACITY=12;
  const WORLD_SCENES=['exterior','zora','invernadero','paneles','crater'];
  const AV={skin:8,hair:10,style:15,eyes:6,suit:6,emblem:16};
  const ACCESSORIES=['none','freckles','glasses','beard'],EXPRESSIONS=['neutral','happy','determined'];
  function ensureWorld(g){
    g.orders=g.orders||[];g.bag=g.bag||{};g.receipts=g.receipts||{};
    g.world=g.world||{avatar:null,scene:'exterior',pos:null,clock:0};
    g.world.suit=g.world.suit||{fill:0,eva:0,evaMax:EVA_BASE,loaded:false,outside:false};
    if(typeof g.world.clock!=='number')g.world.clock=0;
    return g;
  }
  function replay(original,requestId,action){
    if(requestId===undefined||requestId===null)return null;
    if(typeof requestId!=='string'||requestId.length<8||requestId.length>120)throw Error('INVALID_REQUEST_ID');
    const prev=original.receipts?.[requestId];
    if(!prev)return null;
    if(prev.action!==action)throw Error('INVALID_REQUEST_ID');
    return {state:clone(original),result:{...clone(prev.result),duplicate:true}};
  }
  function remember(g,requestId,action,result){
    if(!requestId)return;
    g.receipts[requestId]={action,result:clone(result)};
    const keys=Object.keys(g.receipts);if(keys.length>100)delete g.receipts[keys[0]];
  }
  const bagCount=g=>Object.values(g.bag).reduce((a,b)=>a+b,0);
  function orderItem(original,itemId,{requestId}={}) {
    assertGame(original);
    const again=replay(original,requestId,'ORDER');if(again)return again;
    const item=itemMap.get(itemId);if(!item)throw Error('ITEM_NOT_FOUND');
    const used=original.inventory[item.id]||0;if(used>=item.limit)throw Error('OUT_OF_STOCK');
    if(original.coins<item.price)throw Error('INSUFFICIENT_COINS');
    const g=ensureWorld(clone(original));
    g.coins-=item.price;g.spent+=item.price;g.inventory[item.id]=used+1;
    const order={id:`P${(g.orderSeq=(g.orderSeq||0)+1)}`,itemId:item.id,name:item.name,price:item.price,status:'confirmed',
      day:g.day,turn:g.turn,orderedAt:g.world.clock,readyAt:g.world.clock+ORDER_SECONDS};
    g.orders.push(order);
    const result={order:clone(order),coinsAfter:g.coins,day:g.day,turn:g.turn};
    g.events.push({type:'ORDER_PLACED',orderId:order.id,itemId:item.id,day:g.day,turn:g.turn});
    remember(g,requestId,'ORDER',result);
    return {state:g,result};
  }
  function tickWorld(original,{seconds=0,outside=false}={}) {
    assertGame(original);
    const dt=Math.max(0,Math.min(120,Number(seconds)||0));
    const g=ensureWorld(clone(original));
    g.world.clock=Math.round((g.world.clock+dt)*1000)/1000;
    const ready=[];
    for(const o of g.orders)if(o.status==='confirmed'&&g.world.clock>=o.readyAt){o.status='ready';ready.push(o.id)}
    const suit=g.world.suit;let exhausted=false;
    if(outside&&suit.loaded){
      suit.eva=Math.max(0,Math.round((suit.eva-dt)*1000)/1000);
      if(suit.eva<=0&&!suit.exhausted){
        suit.exhausted=true;exhausted=true;
        g.metrics.health=clamp(g.metrics.health-8);g.metrics.oxygen=clamp(g.metrics.oxygen-4);add(g,'oxigeno_agotado');
        g.events.push({type:'EVA_EXHAUSTED',day:g.day,turn:g.turn,delta:{health:-8,oxygen:-4}});
        if(isCritical(g)){g.phase='completed';g.endingId=endingFor(g);g.currentMissionId=null}
      }
    }
    return {state:g,result:{clock:g.world.clock,ready,exhausted,eva:suit.eva,evaMax:suit.evaMax,loaded:suit.loaded,outside:suit.outside}};
  }
  function collectOrders(original,{requestId}={}) {
    assertGame(original);
    const again=replay(original,requestId,'COLLECT');if(again)return again;
    const g=ensureWorld(clone(original));
    const ready=g.orders.filter(o=>o.status==='ready');
    if(!ready.length)throw Error('NO_ORDER_READY');
    const collected=[];
    for(const o of ready){if(bagCount(g)>=BAG_CAPACITY)break;o.status='collected';o.collectedAt=g.world.clock;g.bag[o.itemId]=(g.bag[o.itemId]||0)+1;collected.push(o.id)}
    if(!collected.length)throw Error('BAG_FULL');
    const result={collected,left:ready.length-collected.length,bag:clone(g.bag)};
    g.events.push({type:'ORDER_COLLECTED',orders:collected,day:g.day,turn:g.turn});
    remember(g,requestId,'COLLECT',result);
    return {state:g,result};
  }
  function useItem(original,itemId,{requestId}={}) {
    assertGame(original);
    const again=replay(original,requestId,'USE_ITEM');if(again)return again;
    const item=itemMap.get(itemId);if(!item)throw Error('ITEM_NOT_FOUND');
    const g=ensureWorld(clone(original));
    if((g.bag[item.id]||0)<1)throw Error('ITEM_NOT_IN_BAG');
    g.bag[item.id]-=1;if(!g.bag[item.id])delete g.bag[item.id];
    for(const[k,v]of Object.entries(item.delta))g.metrics[k]=clamp(g.metrics[k]+v);
    for(const st of item.remove)remove(g,st);
    const result={itemId:item.id,name:item.name,delta:clone(item.delta),removedStatuses:clone(item.remove),bag:clone(g.bag)};
    g.events.push({type:'ITEM_USED',itemId:item.id,day:g.day,turn:g.turn});
    remember(g,requestId,'USE_ITEM',result);
    return {state:g,result};
  }
  // Cada salida de Zora gasta un tanque: hay que llenarlo en los depósitos de soporte vital (cuesta oxígeno de la base).
  const TANK_COST=3,TANK_MIN_STATION=10;
  function tankFill(original,percent,{requestId}={}) {
    assertGame(original);
    const again=replay(original,requestId,'TANK_FILL');if(again)return again;
    const p=Number(percent);if(!Number.isFinite(p))throw Error('INVALID_PERCENT');
    const g=ensureWorld(clone(original));const suit=g.world.suit;
    if(suit.outside)throw Error('TANK_FILL_OUTSIDE');
    if(g.metrics.oxygen<TANK_MIN_STATION)throw Error('INSUFFICIENT_STATION_OXYGEN');
    const fill=Math.round(clamp(p));
    g.metrics.oxygen=clamp(g.metrics.oxygen-TANK_COST);
    suit.fill=fill;suit.evaMax=Math.round(EVA_BASE*(0.4+0.6*fill/100));suit.eva=suit.evaMax;suit.exhausted=false;suit.loaded=true;
    remove(g,'oxigeno_agotado');
    if(fill<60)add(g,'tanque_incompleto');else remove(g,'tanque_incompleto');
    const result={fill,evaMax:suit.evaMax,insufficient:fill<60,stationCost:TANK_COST,day:g.day,turn:g.turn};
    g.events.push({type:'TANK_FILL',...result});
    remember(g,requestId,'TANK_FILL',result);
    return {state:g,result};
  }
  // Salir de Zora exige un tanque lleno; el tanque se usa (queda en uso hasta volver).
  function leaveBase(original,{requestId}={}) {
    assertGame(original);
    const again=replay(original,requestId,'LEAVE_BASE');if(again)return again;
    const g=ensureWorld(clone(original));const suit=g.world.suit;
    if(suit.outside)return {state:g,result:{outside:true,eva:suit.eva,evaMax:suit.evaMax,already:true}};
    if(!suit.loaded)throw Error('TANK_NOT_LOADED');
    suit.outside=true;
    const result={outside:true,eva:suit.eva,evaMax:suit.evaMax,fill:suit.fill};
    g.events.push({type:'LEAVE_BASE',day:g.day,turn:g.turn,fill:suit.fill});
    remember(g,requestId,'LEAVE_BASE',result);
    return {state:g,result};
  }
  // Volver a Zora vacía el tanque: para la próxima salida hay que llenar otro.
  function enterBase(original) {
    assertGame(original,true);
    const g=ensureWorld(clone(original));const suit=g.world.suit;
    const wasOutside=suit.outside;
    suit.outside=false;suit.loaded=false;suit.eva=0;suit.exhausted=false;
    if(wasOutside)g.events.push({type:'ENTER_BASE',day:g.day,turn:g.turn});
    return {state:g,result:{outside:false,loaded:false,wasOutside}};
  }
  function setAvatar(original,avatar) {
    assertGame(original,true);
    const a=avatar||{};const int=(v,n)=>Number.isInteger(v)&&v>=0&&v<n;
    if(!int(a.skin,AV.skin)||!int(a.hair,AV.hair)||!int(a.style,AV.style)||!int(a.eyes,AV.eyes)||!int(a.suit,AV.suit)||!int(a.emblem??0,AV.emblem)
      ||!ACCESSORIES.includes(a.accessory)||!EXPRESSIONS.includes(a.expression))throw Error('INVALID_AVATAR');
    const name=String(a.name||'').replace(/[^\p{L}\p{N} _-]/gu,'').trim().slice(0,16)||'Astro';
    const g=ensureWorld(clone(original));
    g.world.avatar={name,skin:a.skin,hair:a.hair,style:a.style,eyes:a.eyes,suit:a.suit,accessory:a.accessory,expression:a.expression,emblem:a.emblem??0};
    return {state:g,result:{avatar:clone(g.world.avatar)}};
  }
  function setWorldState(original,{scene,pos}={}) {
    assertGame(original,true);
    if(!WORLD_SCENES.includes(scene))throw Error('INVALID_SCENE');
    const ok=pos&&Number.isFinite(pos.x)&&Number.isFinite(pos.y)&&pos.x>=0&&pos.y>=0&&pos.x<=2000&&pos.y<=2000;
    if(!ok)throw Error('INVALID_POSITION');
    const g=ensureWorld(clone(original));
    g.world.scene=scene;g.world.pos={x:Math.round(pos.x*10)/10,y:Math.round(pos.y*10)/10};
    return {state:g,result:{scene,pos:g.world.pos}};
  }
  return {evText,evLocal,setLanguage,getLanguage:()=>lang,languages:()=>LANGUAGES.map(l=>({...l,ready:l.code==='es'||!!baseCatalog.i18n?.[l.code]})),localize,statusNames:()=>({...statusNames}),createGame,nextMission,resolveMission,skipMission,purchase,orderItem,tickWorld,collectOrders,useItem,tankFill,leaveBase,enterBase,setAvatar,setWorldState,ensureWorld,sendMessage,respondWeather,repeatDay,npcAsk,report,shop,endingFor,assess,currentMission,challengeMap};
}
