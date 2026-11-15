// Marco del juego como "consola del casco": placa de misión, monedas y avisos arriba; indicadores y tanque del traje a un lado;
// acciones abajo. Los valores son los reales del motor y los avisos usan símbolo y texto, no solo color.
import { t, tr, lang } from '../i18n/index.js';
import { isFull, isStandalone } from './fullscreen.js';
import { session } from '../bus.js';
import { METRICS, CATEGORY, ICON, iconUrl } from '../rules.js';
import { placeOf, SCENES, OUTSIDE } from '../world/scenes.js';
import { pix, kitaIcon } from './pix.js';
import { esc } from './text.js';

const $ = (s) => document.querySelector(s);
let built = false;
let builtLang = '';
let last = {};

export function resetHud() { built = false; builtLang = ''; last = {}; }

const icon = (file) => `<img class="ic" src="${iconUrl(file)}" alt="" width="22" height="22" decoding="async">`;
const SEGMENTS = 10;

function build() {
  $('#hud').innerHTML = `
    <div class="vl-top">
      <div class="vl-plate vl-mission" role="group" aria-label="${esc(t('hud.mision'))}">
        <span class="vl-day" data-ref="day"></span>
        <span class="vl-pips" data-ref="pips" role="img">${Array.from({ length: 14 }, () => '<i></i>').join('')}</span>
      </div>
      <span class="vl-spacer"></span>
      <div class="vl-plate vl-coins" role="group" aria-label="${esc(t('coins'))}">${icon(ICON.coin)}<b data-ref="coins"></b></div>
      <button class="vl-btn" data-action="statuses" data-ref="alerts" aria-label="${esc(t('hud.alertas_de_la_base'))}"></button>
      <button class="vl-btn" data-action="map" aria-label="${esc(t('map.open'))}" title="${esc(t('map.open'))}">${pix('map')}</button>
      ${isStandalone() ? '' : `<button class="vl-btn vl-full" data-action="fullscreen" data-ref="full" aria-label="${esc(t('fs.label'))}" title="${esc(t('fs.label'))}">${pix(isFull() ? 'unfull' : 'full')}</button>`}
      <button class="vl-btn" data-action="pause" aria-label="${esc(t('hud.pausa'))}">${pix('pause')}</button>
    </div>
    <div class="vl-rail ${session.showAllMetrics ? '' : 'collapsed'}" role="group" aria-label="${esc(t('hud.indicadores_de_la_base'))}">
      ${[...METRICS.filter((m) => CORE.includes(m.key)).sort((a, b) => CORE.indexOf(a.key) - CORE.indexOf(b.key)), ...METRICS.filter((m) => !CORE.includes(m.key))].map((m) => `<div class="vl-m ${CORE.includes(m.key) ? 'core' : 'extra'}" data-m="${m.key}" role="meter" aria-label="${esc(m.label)}" aria-valuemin="0" aria-valuemax="100" title="${esc(m.label)}">
        ${icon(m.file)}<span class="vl-name">${esc(m.label)}</span>
        <span class="vl-bar"><i style="--c:${m.color}"></i></span><b class="vl-val"></b><em class="vl-flag" aria-hidden="true"></em></div>`).join('')}
      <button class="vl-more" data-action="moreMetrics" aria-expanded="${!!session.showAllMetrics}" aria-label="${esc(t('hud.more_label'))}">${session.showAllMetrics ? t('hud.less') : t('hud.more', { n: METRICS.length - CORE.length })}</button>
      <div class="vl-tank" data-m="suit" role="meter" aria-label="${esc(t('hud.tanque_del_traje'))}" aria-valuemin="0" aria-valuemax="100">
        <span class="vl-tank-title">${pix('tank', { size: 16 })} ${t('hud.tanque_del_traje')}</span>
        <span class="vl-seg" aria-hidden="true">${Array.from({ length: SEGMENTS }, () => '<i></i>').join('')}</span>
        <b class="vl-tank-val"></b><small class="vl-tank-note"></small>
      </div>
    </div>`;
  built = true;
  builtLang = lang();
  last = {};
}

// Los tres recursos centrales que recomienda el reto: soporte vital (aire), energía y blindaje. El resto se pliega,
// pero un indicador plegado aparece solo si baja a nivel de alerta.
export const CORE = ['oxygen', 'energy', 'shield'];

const FLAG = { ok: '', low: '▲', crit: '‼' };
const level = (key, val) => (key === 'research' ? 'ok' : val < 15 ? 'crit' : val < 30 ? 'low' : 'ok');

export function renderHud(v) {
  const hud = $('#hud');
  const show = !!v && v.phase !== 'not_started' && !['menu', 'create'].includes(session.mode);
  hud.hidden = !show;
  if (!show) return;
  if (!built || builtLang !== lang()) build();
  const r = (n) => hud.querySelector(`[data-ref="${n}"]`);
  const set = (n, val, html) => { if (last[n] === val) return; last[n] = val; html ? (r(n).innerHTML = val) : (r(n).textContent = val); };
  set('day', t('dayOfM', { d: v.day, m: v.maxDays }));
  const done = v.phase === 'completed' ? 14 : v.turn;
  if (last.pips !== done) {
    last.pips = done;
    r('pips').querySelectorAll('i').forEach((el, i) => el.classList.toggle('on', i < done));
    r('pips').setAttribute('aria-label', t('tasksDone', { n: done, m: v.maxTurns }));
  }
  set('coins', String(v.coins));
  const n = v.statuses.length;
  set('alerts', n ? `${pix('alert')}<b>${n}</b>` : `${pix('check')}`, true);
  r('alerts').classList.toggle('has', n > 0);
  r('alerts').setAttribute('aria-label', n ? t('alertsN', { n }) : t('hud.sin_alertas_en_la_base'));
  for (const m of METRICS) paint(m.key, Math.round(v.metrics[m.key] ?? 0));
  const s = v.world?.suit;
  if (s) setSuit(s);
}

function paint(key, val) {
  if (last['m' + key] === val) return;
  last['m' + key] = val;
  const el = $('#hud')?.querySelector(`[data-m="${key}"]`);
  if (!el) return;
  const lv = level(key, val);
  el.querySelector('.vl-bar i').style.width = val + '%';
  el.querySelector('.vl-val').textContent = val;
  el.querySelector('.vl-flag').textContent = FLAG[lv];
  el.dataset.level = lv;
  el.setAttribute('aria-valuenow', String(val));
  el.setAttribute('aria-valuetext', t(lv === 'ok' ? 'of100' : lv === 'crit' ? 'of100c' : 'of100l', { v: val }));
}

// Tanque del traje: 3 estados claros. Vacío (adentro, hay que llenarlo), listo (lleno, aún en Zora) y en uso (afuera, gastándose).
export function setSuit(s) {
  const el = $('#hud')?.querySelector('[data-m="suit"]');
  if (!el) return;
  const key = [lang(), s.loaded, s.outside, Math.ceil(s.eva), s.evaMax].join('|');
  if (last.suit === key) return;
  last.suit = key;
  const pct = s.loaded ? Math.round((s.eva / s.evaMax) * 100) : 0;
  const lit = Math.ceil((pct / 100) * SEGMENTS);
  el.querySelectorAll('.vl-seg i').forEach((i, k) => i.classList.toggle('on', k < lit));
  const state = !s.loaded ? 'empty' : s.outside ? 'use' : 'ready';
  el.dataset.state = state;
  el.dataset.level = !s.loaded ? 'crit' : pct < 15 ? 'crit' : pct < 30 ? 'low' : 'ok';
  el.querySelector('.vl-tank-val').textContent = !s.loaded ? t('ui.vacio') : `${Math.ceil(s.eva)} s`;
  el.querySelector('.vl-tank-note').textContent = tr(!s.loaded ? 'Llénalo para salir' : s.outside ? 'En uso afuera' : s.evaMax < 170 ? 'Llenado incompleto' : 'Listo para salir');
  el.setAttribute('aria-valuenow', String(pct));
  el.setAttribute('aria-valuetext', !s.loaded ? t('hud.tanque_vacio_llenalo_en_los') : t(s.outside ? 'airSecsUse' : 'airSecs', { n: Math.ceil(s.eva) }));
}

// ── Barra inferior: una línea con el reto actual y los accesos ──
const btn = (action, ic, label, extra = '', cls = '') => `<button class="vl-act ${cls}" data-action="${action}" aria-label="${label}">${ic === 'kita' ? kitaIcon({ size: 28 }) : pix(ic, { size: 20 })}<span>${label}</span>${extra}</button>`;

export function renderDock(v) {
  const dock = $('#dock');
  const show = session.mode === 'map' && !session.overlay && v?.phase === 'active';
  dock.hidden = !show;
  if (!show) { last.dock = ''; return; }
  const place = v.mission ? placeOf(v.mission) : null;
  const bag = Object.values(v.bag || {}).reduce((a, b) => a + b, 0);
  const orders = (v.orders || []).filter((o) => o.status !== 'collected');
  const ready = orders.filter((o) => o.status === 'ready').length;
  const suit = v.world?.suit || {};
  const inZora = session.world?.scene === 'zora';
  const key = [v.lang, v.mission?.id, place?.id, bag, ready, orders.length, suit.loaded, suit.outside, inZora].join('|');
  if (last.dock === key) return;
  last.dock = key;
  const c = CATEGORY[v.mission?.category] || {};
  const parts = [];
  if (v.mission && place) {
    parts.push(`<div class="vl-goal"><span class="vl-goal-k">${t('yourGoal')}</span><b>${esc(v.mission.name)}</b><small>${esc(tr(place.label))} · ${esc(tr(SCENES[place.scene].name))}</small></div>`);
  }
  parts.push(`<div class="vl-acts">`);
  if (v.mission && place) { parts.push(btn('guide', 'compass', t('guide'), '', 'primary')); parts.push(btn('openMission', 'scroll', t('seeTask'))); }
  parts.push(btn('bag', 'bag', t('bag'), bag ? `<i class="vl-count">${bag}</i>` : ''));
  parts.push(btn('diary', 'book', t('diary')));
  parts.push(btn('luni', 'kita', 'Kita'));
  parts.push(`</div>`);
  const hints = [];
  if (inZora && !suit.loaded) hints.push(`<span class="vl-hint warn">${pix('tank', { size: 16 })} ${t('hintTank')}</span>`);
  if (orders.length && !ready) hints.push(`<span class="vl-hint">${pix('rocket', { size: 16 })} ${t('hintPrep', { n: orders.length })}</span>`);
  if (ready) hints.push(`<span class="vl-hint good">${pix('rocket', { size: 16 })} ${t('hintReady')}</span>`);
  dock.innerHTML = (hints.length ? `<div class="vl-hints" role="status">${hints.join('')}</div>` : '') + `<div class="vl-bar-row">${parts.join('')}</div>`;
}
void OUTSIDE;

// Cambia el ícono del botón de pantalla completa cuando se entra o se sale.
export function syncFullButton() {
  const b = document.querySelector('[data-ref="full"]');
  if (b) b.innerHTML = pix(isFull() ? 'unfull' : 'full');
}
