import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createEngine} from '../src/core/engine.js';
import {createFrontendBridge} from '../src/core/frontend-bridge.js';
const data=n=>JSON.parse(readFileSync(new URL(`../data/${n}.json`,import.meta.url),'utf8'));
const catalog={challenges:data('challenges'),items:data('shop'),endings:data('endings'),facts:data('science-facts'),events:data('nasa-events'),statusNames:data('status-names'),i18n:{en:data('i18n/en')}};
const mem=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
const mk=(storage=mem())=>createFrontendBridge({...createEngine(catalog),catalog},{storage,seed:'idiomas'});

test('el idioma cambia retos, tienda y estados; la partida no cambia',()=>{
  const b=mk();b.setLanguage('es');assert.equal(b.getView().lang,'es');
  const es=b.getView();
  const en=b.setLanguage('en');
  assert.equal(en.lang,'en');assert.notEqual(en.mission.name,es.mission.name);assert.equal(en.mission.id,es.mission.id);
  assert.equal(en.shop.length,es.shop.length);assert.equal(en.shop[0].name,'💧 Water reserve');
  assert.notEqual(en.statusNames.tos,es.statusNames.tos);
  assert.deepEqual(en.metrics,es.metrics);
  assert.equal(b.setLanguage('es').mission.name,es.mission.name);
});
test('idioma inválido o sin traducir se rechaza; la preferencia se guarda',()=>{
  const st=mem();const b=mk(st);b.setLanguage('es');
  assert.throws(()=>b.setLanguage('fr'),/INVALID_LANGUAGE/);
  b.setLanguage('en');assert.equal(mk(st).getView().lang,'en');
  assert.deepEqual(b.getLanguages().map(l=>l.code),['es','en']);
});
test('las 50 tareas y los textos de LUNI están traducidos',()=>{
  const e=createEngine(catalog);const L=e.localize('en');
  L.challenges.forEach((c,i)=>{assert.notEqual(c.name,catalog.challenges[i].name,'reto '+c.id);assert.equal(c.choices.length,2)});
  L.facts.forEach((f,i)=>assert.notEqual(f.answer,catalog.facts[i].answer));
  assert.ok(Object.keys(data('status-names')).every(k=>L.statusNames[k]));
});
test('Kita contesta en inglés y en español',()=>{
  const b=mk();b.setLanguage('en');
  const h=b.askLuni('hello');assert.match(h.answer,/I am Kita/);assert.equal(h.npc,'Kita');
  assert.match(b.askLuni('What does CME mean?').answer,/coronal mass ejection/);
  assert.match(b.askLuni('how is my base?').answer,/oxygen/);
  b.setLanguage('es');assert.match(b.askLuni('hola').answer,/Soy Kita/);
});
