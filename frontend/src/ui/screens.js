import { kitaIcon, pix } from './pix.js';
// Pantallas en HTML. Todo texto que viene del motor pasa por esc() o withTerms().
import { CATEGORY, METRIC, METRICS, RESULT_LABEL, MESSAGE_TYPES, hasMinigame, minigameSeconds, statusName, GOOD_STATUSES, deltaList, iconUrl, ICON } from '../rules.js';
import { CATEGORIES, avatarUri, EMBLEM_FILES, EMBLEMS } from '../world/avatar.js';
import { placeOf, SCENES } from '../world/scenes.js';
import { taskState, STATE_LABEL } from '../world/tasks.js';
import { esc, withTerms, fmtDate, fmtNum, safeUrl, GLOSSARY } from './text.js';
import { catalog } from '../engine.js';

const close = `<button class="btn small close" data-action="back" aria-label="Cerrar">✕</button>`;
const sign = (n) => (n > 0 ? '+' : '−') + Math.abs(n);

export function chips(delta, { factorNote = false } = {}) {
  const list = deltaList(delta);
  if (!list.length) return '';
  return `<div class="fx">${list.map((d) => `<span class="${d.value < 0 ? 'down' : 'up'}" title="${esc(d.label)}">${d.icon} ${sign(d.value)}<span class="sr"> ${esc(d.label)}</span></span>`).join('')}${factorNote ? '' : ''}</div>`;
}
const statusChips = (keys, cls) => keys.map((k) => { const c = GOOD_STATUSES.includes(k) ? 'ok' : cls; return `<span class="${c}">${c === 'ok' ? '✅' : '⚠️'} ${esc(statusName(k))}</span>`; }).join('');

// ── Idioma: dos botones grandes (los idiomas salen del backend) ──
export function langPicker(v) {
  const list = v?.languages?.length ? v.languages : [{ code: 'es', native: 'Español', ready: true }];
  return `<div class="langs" role="group" aria-label="${esc(t('language'))}">${list.map((l) => `<button class="btn small lang ${l.code === lang() ? 'go' : ''}" data-action="setLang" data-lang="${esc(l.code)}" aria-pressed="${l.code === lang()}" ${l.ready ? '' : 'disabled'}><span aria-hidden="true">${l.code === 'en' ? '🇬🇧' : '🇳🇮'}</span> ${esc(l.native)}</button>`).join('')}</div>`;
}

    <p class="tagline">Dirigí la nave <b>Zora</b> y su base lunar durante 7 días. Cada decisión cambia el aire, la energía, la comida y a tu tripulación.</p>
    <div class="menu">
      <div class="main">
        ${canContinue ? `<button class="btn go continue" data-action="continue"><span>▶ ${finished ? t('seeEnd') : t('continue')}<small>${finished ? t('missionDone') : t('dayOf', { d: day })}</small></span></button>` : ''}
        <button class="btn ${canContinue ? '' : 'go'}" data-action="new">${t('newMission')}</button>
      </div>
      <div class="more">
        ${canContinue ? `<button class="btn" data-action="editAvatar">${t('myAstro')}</button>` : ''}
        <button class="btn" data-action="code">${t('code')}</button>
        <button class="btn" data-action="album">${t('album')}</button>
        <button class="btn" data-action="settings">${t('settings')}</button>
        <button class="btn" data-action="sources">${t('sources')}</button>
        <button class="btn" data-action="glossary">${t('glossary')}</button>
        <button class="btn" data-action="teachers">${t('teachers')}</button>
      </div>
    </div>
  </div>`;
}
      ${langPicker(view)}

export function codeHTML(error = '') {
  return `<div class="sheet enter">${close()}
    <h2>${t('screen.jugar_con_un_codigo')}</h2>
    <p>${t('screen.con_el_mismo_codigo_toda')}</p>
    <form data-form="code" autocomplete="off">
      <input class="codein" name="code" maxlength="20" autocapitalize="characters" aria-label="${esc(t('screen.codigo_de_mision'))}" placeholder="AULA-1">
      ${error ? `<p class="err" role="alert">${esc(error)}</p>` : ''}
      <div class="row" style="margin-top:14px"><button class="btn go" type="submit">${t('screen.empezar_esta_mision')}</button></div>
    </form></div>`;
}

export function briefingHTML(v) {
  return `<div class="sheet enter">
    <h2>🧑‍🚀 ${t('welcome', { n: esc(v.world?.avatar?.name || t('screen.astronauta')) })}</h2>
    <p>${withTerms(t('screen.estas_a_cargo_de_zora'))}</p>
    <div class="facts-grid">
      <div class="stat"><span>${t('screen.duracion')}</span><b>${t('screen.7_dias_14_retos')}</b></div>
      <div class="stat"><span>${t('screen.monedas_para_empezar')}</span><b>🪙 ${v.coins}</b></div>
      <div class="stat code"><span>${t('screen.codigo_de_mision')}</span><b>${esc(v.seed)}</b></div>
    </div>
    <ol class="how">
      <li>${t('screen.camina_con_wasd_o_las')}</li>
      <li>${t('screen.segui_la_hasta_el_equipo')}</li>
      <li>${t('screen.cada_salida_de_zora_gasta')}</li>
      <li>${t('screen.las_compras_se_piden_en')}</li>
      <li>${t('screen.elegi_a_o_b_cada')}</li>
      <li>${t('screen.las_opciones_cuidadosas_se_hacen')}</li>
      <li>${t('screen.dudas_preguntale_a_kita_el')}</li>
    </ol>
    <div class="row" style="margin-top:14px"><button class="btn go" data-action="toMap" autofocus>${t('screen.empezar_el_dia_1')}</button></div>
  </div>`;
}

// ── Reto ──
export function missionHTML(v, { hint, factor = 1 } = {}) {
  const m = v.mission;
  const place = placeOf(m);
  const c = CATEGORY[m.category] || { label: m.category, icon: '❔', color: 'var(--moon)' };
  const reasons = m.modifiers?.reasons || [];
  return `<div class="sheet card wide enter">${close()}
    <div class="row tags">
      <span class="sys" style="background:${c.color}">${c.icon} ${esc(c.label)}</span>
      <span class="sys lvl">${t('taskNo', { n: m.id })}</span>
    </div>
    <h2>${esc(m.name)}</h2>
    ${place ? `<p class="muted small">📍 ${esc(tr(place.label))} · ${esc(tr(SCENES[place.scene].name))}</p>` : ''}
    <p class="say">${withTerms(m.intro)}</p>
    <p class="muted">${withTerms(m.cause)}</p>
    <details class="science"><summary>🔬 ${t('screen.lo_que_dice_la_ciencia')}</summary><p>${withTerms(m.science)}</p></details>
    ${reasons.length ? `<p class="note">⏱ ${esc(reasons.join(' · '))}</p>` : ''}
    ${factor < 1 ? `<p class="note">🧑‍🚀 ${t('screen.el_tanque_del_traje_quedo')}</p>` : ''}
    <div class="opts">
      ${m.options.map((o) => {
        const game = hasMinigame(o);
        return `<button class="opt" data-action="choose" data-id="${o.id}">
          <span class="optid">${o.id}</span>
          <span class="label">${esc(o.label)}</span>
          <span class="cons">${esc(o.consequence)}</span>
          ${chips(o.delta)}
          <span class="mode ${game ? 'game' : ''}">${game ? `🎮 ${t('minigameS', { s: minigameSeconds(m.modifiers, factor) })}` : `⚡ ${t('screen.decision_rapida')}`}</span>
        </button>`;
      }).join('')}
    </div>
    <p class="muted small">${t('screen.en_un_minijuego_si_te')}</p>
    ${hint ? `<div class="bubble"><b>${kitaIcon({ size: 26 })} Kita:</b> ${esc(hint)}</div>` : ''}
    <div class="row">
      <button class="btn small calm" data-action="hint">${kitaIcon({ size: 30 })} ${t('screen.pedir_una_pista_a_kita')}</button>
      <button class="btn small" data-action="skip">${t('screen.omitir_reto')}</button>
    </div>
  </div>`;
}

export function skipConfirmHTML(v) {
  const penalty = { life: { oxygen: -8 }, radiation: { shield: -7 }, energy: { energy: -8 }, food: { food: -7 }, comms: { comms: -8 } }[v.mission.category];
  return `<div class="sheet enter">
    <h2>${t('screen.omitir_este_reto')}</h2>
    <p>${t('screen.si_lo_omitis_no_ganas')}</p>
    ${chips(penalty)}
    <p class="muted">${t('screen.ademas_queda_un_problema_pendiente')}</p>
    <div class="row"><button class="btn danger" data-action="skipYes">${t('screen.si_omitir')}</button><button class="btn" data-action="back">${t('screen.volver_al_reto')}</button></div>
  </div>`;
}

// ── Resultado de un reto ──
export function resultHTML(res, before, v) {
  const r = res.result || {};
  const L = RESULT_LABEL[r.status] || { text: t('screen.decision_tomada'), icon: '✅', cls: 'up' };
  const decision = r.assessmentMode === 'decision_only';
  const title = decision ? t('screen.decision_tomada') : L.text;
  const after = r.metricsAfter || v.metrics;
  const diff = {};
  for (const m of METRICS) { const d = Math.round((after[m.key] ?? 0) - (before.metrics[m.key] ?? 0)); if (d) diff[m.key] = d; }
  const opt = before.mission?.options?.find((o) => o.id === r.choiceId);
  return `<div class="sheet enter">
    <h2>${decision ? '🧭' : L.icon} ${esc(title)}</h2>
    <p class="muted">${t('taskNo', { n: r.missionId })} · ${esc(r.name || '')}${opt ? ` · ${t('youChose', { l: esc(opt.label) })}` : ''}</p>
    ${r.consequence ? `<p class="say small">${r.status === 'partial' || r.status === 'failed' ? t('screen.si_salia_bien') : ''}${withTerms(r.consequence)}</p>` : ''}
    ${r.qualityScore !== null && r.qualityScore !== undefined ? `<p>🎮 ${t('screen.puntaje_del_minijuego')}: <b>${r.qualityScore}/100</b>${r.status === 'partial' ? t('screen.lo_bueno_rindio_la_mitad') : r.status === 'failed' ? t('screen.lo_bueno_no_llego_y') : ''}</p>` : ''}
    <h3>${t('screen.como_cambio_la_base')}</h3>
    ${Object.keys(diff).length ? chips(diff) : `<p class="muted">${t('screen.sin_cambios_en_los_indicadores')}</p>`}
    ${(r.addedStatuses?.length || r.removedStatuses?.length) ? `<div class="fx">${statusChips(r.addedStatuses || [], 'warn')}${statusChips(r.removedStatuses || [], 'ok')}</div>` : ''}
    <p class="wallet">🪙 ${r.coinsAwarded ? t('plusCoins', { n: r.coinsAwarded }) : t('screen.sin_monedas_esta_vez')}</p>
    <div class="row sticky"><button class="btn go" data-action="afterResult" autofocus>${t('next')}</button></div>
  </div>`;
}

// ── Fin del día + tienda ──
export function dayHTML(v, summary) {
  const done = v.daysCompleted;
  return `<div class="sheet wide enter">
    <h2>🌙 Día ${done} terminado</h2>
    <p>Por la noche la base consume oxígeno, agua y comida, y los paneles recargan algo de energía.
       Los problemas pendientes también cobran su parte.</p>
    <div class="summary">${METRICS.map((m) => meterRow(m, v.metrics[m.key])).join('')}</div>
    ${v.statuses.length ? `<h3>⚠️ Problemas pendientes</h3><div class="fx">${statusChips(v.statuses, 'warn')}</div>` : '<p>✅ Sin problemas pendientes.</p>'}
    ${messagesArrived(v, summary)}
    <h3>🛒 Tienda de la base</h3>
    <p class="muted">¿Algo que comprar? La plataforma de entregas está afuera de Zora, abajo a la izquierda.</p>
    <div class="row sticky"><button class="btn go" data-action="toMap">Empezar el día ${v.day}</button></div>
  </div>`;
}

function messagesArrived(v, summary) {
  const acks = (summary?.acks || []);
  if (!acks.length) return '';
  return `<p class="note">📡 La Tierra confirmó: ${acks.map((m) => esc(MESSAGE_TYPES.find((t) => t.id === m.type)?.label || m.type)).join(', ')}.</p>`;
}

function meterRow(m, val) {
  const v = Math.round(val ?? 0);
  return `<div class="bar ${m.key !== 'research' && v < 30 ? 'low' : ''}"><span class="ic">${m.icon}</span><span class="name">${esc(m.label)}</span><span class="track"><span class="fill" style="width:${v}%;background:${m.color}"></span></span><b>${v}</b></div>`;
}

export function shopGrid(v) {
  return `<div class="shop-top"><p class="shop-lead">${t('shopLead')}</p><span class="wallet-pill" aria-label="${v.coins} ${t('coins')}"><span aria-hidden="true">🪙</span> <b>${v.coins}</b></span></div>
  <div class="shop kids">${v.shop.map((it) => {
    const [icon, ...rest] = it.name.split(' ');
    const isEmoji = /\p{Extended_Pictographic}/u.test(icon);
    const name = isEmoji ? rest.join(' ') : it.name;
    const pic = isEmoji ? icon : '🛒';
    const key = Object.keys(it.delta || {})[0];
    const color = METRIC?.[key]?.color || 'var(--brand)';
    const need = Math.max(0, it.price - v.coins);
    const cta = it.remaining <= 0 ? t('soldOut') : !it.affordable ? `🪙 ${it.price}` : `${t('order')} · 🪙 ${it.price}`;
    const dots = Array.from({ length: it.limit }, (_, i) => `<i class="${i < it.remaining ? 'on' : ''}"></i>`).join('');
    return `<div class="item card-k ${it.available ? '' : 'off'}" style="--tone:${color}" title="${esc(it.desc)}">
      <span class="ic big" aria-hidden="true">${pic}</span><b>${esc(name)}</b>
      ${chips(it.delta)}
      ${it.remove?.length ? `<small>Quita: ${esc(it.remove.map(statusName).join(', '))}</small>` : ''}
      <small>Quedan ${it.remaining} de ${it.limit}</small>
      <button class="btn small ${it.available ? 'go' : ''}" data-action="order" data-id="${esc(it.id)}" ${it.available ? '' : 'disabled'}>${esc(why)}</button></div>`;
  }).join('')}</div>`;
}

const ORDER_ICON = { confirmed: '📦', ready: '🚀', collected: '✅' };
export function ordersHTML(v) {
  const open = (v.orders || []).filter((o) => o.status !== 'collected');
  if (!open.length) return '';
  return `<h3 class="sub">${t('yourOrders')}</h3><ul class="orders">${open.map((o) => `<li><span aria-hidden="true">${ORDER_ICON[o.status]}</span><b>${esc(o.name)}</b><small>${t(o.status === 'ready' ? 'ordReady' : 'ordConfirmed')}</small></li>`).join('')}</ul>`;
}
export function shopHTML(v) {
  return `<div class="sheet wide enter shop-sheet">${close()}<h2>${t('shopTitle')}</h2>${shopGrid(v)}<p class="shop-tip">${t('shopTip')}</p>${ordersHTML(v)}</div>`;
}

// ── Bolsa (objetos ya recogidos) ──
export function bagHTML(v) {
  const entries = Object.entries(v.bag || {});
  const total = entries.reduce((a, [, n]) => a + n, 0);
  const byId = Object.fromEntries(v.shop.map((i) => [i.id, i]));
  return `<div class="sheet wide enter">${close}<h2>🎒 Bolsa <small class="muted">${total} de 12</small></h2>
    ${entries.length ? `<div class="shop">${entries.map(([id, n]) => { const it = byId[id]; if (!it) return ''; const [icon, ...rest] = it.name.split(' ');
      return `<div class="item"><span class="ic">${icon}</span><b>${esc(rest.join(' '))} ×${n}</b><small>${esc(it.desc)}</small>${chips(it.delta)}
        <button class="btn small go" data-action="use" data-id="${esc(id)}">Usar uno</button></div>`; }).join('')}</div>`
      : '<p class="muted">Tu bolsa está vacía. Pide artículos en la plataforma de entregas (abajo a la izquierda, afuera de Zora).</p>'}
    ${ordersHTML(v)}
  </div>`;
}

// ── Diario de tareas: estado de cada una de las 50 (sin mostrar dificultad) ──
export function diaryHTML(v, game) {
  const rows = catalog.challenges.map((c) => ({ c, st: taskState(game, c.id) }));
  const done = rows.filter((r) => r.st === 'completada').length;
  const symbol = { activa: '▶', disponible: '•', completada: '✅', fallida: '✖', bloqueada: '🔒' };
  return `<div class="sheet wide enter">${close}<h2>📒 Diario de tareas <small class="muted">${done} de 50 hechas</small></h2>
    <div class="diary">${rows.map(({ c, st }) => { const pl = placeOf(c); const known = st !== 'bloqueada';
      return `<div class="drow ${st}"><span class="dsym" aria-hidden="true">${symbol[st]}</span>
        <b>${known ? esc(c.name) : 'Tarea por descubrir'}</b>
        <small>${known && pl ? esc(pl.label + ' · ' + SCENES[pl.scene].name) : esc(CATEGORY[c.category]?.label || '')}</small>
        <em>${STATE_LABEL[st]}</em></div>`; }).join('')}</div></div>`;
}

// ── Creador de astronautas ──
export function createHTML({ draft, cat, editing }) {
  const active = CATEGORIES.find((c) => c.key === cat) || CATEGORIES[0];
  const opt = (key, i) => key === 'accessory' ? active.list[i][0] : key === 'expression' ? active.list[i][0] : i;
  const preview = (key, value) => avatarUri({ ...draft, [key]: value }, false);
  const optionsHTML = active.list.map((item, i) => {
    const value = opt(active.key, i), on = draft[active.key] === value;
    const label = item[0] === 'none' ? 'Sin detalle' : (active.key === 'accessory' || active.key === 'expression') ? item[1] : item[0];
    const img = active.key === 'emblem' ? `<img src="${import.meta.env.BASE_URL}assets/simbolos/${EMBLEM_FILES[i]}.svg" alt="" width="44" height="44">`
      : `<img class="px" src="${preview(active.key, value)}" alt="" width="48" height="69">`;
    return `<button class="chip-opt" data-action="pick" data-k="${active.key}" data-v="${value}" aria-pressed="${on}" aria-label="${esc(active.label)}: ${esc(label)}">${img}<span>${esc(label)}</span></button>`;
  }).join('');
  return `<div class="sheet creator enter" aria-labelledby="ctitle">
    <h2 id="ctitle">🧑‍🚀 Crea tu astronauta</h2>
    <div class="cr-grid">
      <div class="cr-view" aria-live="polite">
        <div class="cr-stage"><img class="px big" src="${avatarUri(draft, false)}" alt="Tu astronauta, sin casco" width="120" height="172">
          <img class="px big" src="${avatarUri(draft, true)}" alt="Tu astronauta, con casco" width="120" height="172"></div>
        <p class="muted small">Adentro de Zora y afuera con casco.</p>
        <div class="cr-patch"><img src="${import.meta.env.BASE_URL}assets/simbolos/${EMBLEM_FILES[draft.emblem]}.svg" alt="" width="34" height="34"> Parche: ${esc(EMBLEMS[draft.emblem])}</div>
        <label class="cr-name">Nombre <input data-field="name" maxlength="16" value="${esc(draft.name)}" autocomplete="off"></label>
      </div>
      <div class="cr-pick">
        <div class="cr-tabs" role="tablist" aria-label="Categorías">${CATEGORIES.map((c) => `<button role="tab" data-action="tab" data-k="${c.key}" aria-selected="${c.key === active.key}">${esc(c.label)}</button>`).join('')}</div>
        <div class="cr-opts" role="group" aria-label="${esc(active.label)}">${optionsHTML}</div>
      </div>
    </div>
    <div class="row">
      <button class="btn" data-action="randomAvatar">🎲 Al azar</button>
      <button class="btn go" data-action="saveAvatar">${editing ? 'Guardar cambios' : 'Listo, empezar'}</button>
      ${editing ? '<button class="btn" data-action="back">Cancelar</button>' : '<button class="btn" data-action="menu">Volver</button>'}
    </div>
  </div>`;
}

// ── Aire del traje agotado ──
export function evaHTML() {
  return `<div class="sheet enter" style="text-align:center"><h2>🧑‍🚀 ¡Se acabó el aire del traje!</h2>
    <p>Volviste a Zora con la reserva de emergencia. Perdiste un poco de salud y oxígeno.</p>
    <p class="muted">Antes de salir otra vez, llena el tanque en los depósitos de soporte vital. Si lo llenas bien, tendrás más tiempo afuera.</p>
    <div class="row"><button class="btn go" data-action="afterEva" autofocus>Entendido</button></div></div>`;
}
export function tankHTML(fill, evaMax) {
  const ok = fill >= 60;
  return `<div class="sheet enter" style="text-align:center"><h2>Tanque del traje</h2>
    <div class="facts-grid"><div class="stat"><span>Llenado</span><b>${fill}%</b></div><div class="stat"><span>Aire para afuera</span><b>${evaMax} s</b></div><div class="stat"><span>Costo en la base</span><b>−3 oxígeno</b></div></div>
    <p class="${ok ? '' : 'note'}">${ok ? 'El tanque quedó listo: ya puedes salir por la esclusa.' : 'El llenado quedó incompleto: tendrás menos aire y menos tiempo en los retos de paneles y cráter. Puedes volver a llenarlo (cuesta otros 3 de oxígeno).'}</p>
    <div class="row" style="justify-content:center"><button class="btn go" data-action="back" autofocus>Seguir</button></div></div>`;
}

// ── Clima espacial (día 5) ──
export function weatherHTML(v) {
  const w = v.weather || {};
  const e = w.event;
  const url = safeUrl(e?.sourceUrl);
  return `<div class="sheet wide enter alertsheet">
    <h2>🌞 Alerta de clima espacial</h2>
    <p class="say small">${withTerms('Entrenamiento de refugio: el Sol tuvo actividad fuerte. ¿Qué hace tu tripulación con la caminata EVA de hoy?')}</p>
    ${e ? `<div class="src">
      <b>Registro real de NASA: ${esc(e.type)} · ${esc(fmtDate(e.observedAt))}</b>
      <span>${withTerms(e.summary || e.title || '')}</span><br>
      <small>${esc(e.source || 'NASA DONKI')}${url ? ` · <a href="${esc(url)}" target="_blank" rel="noopener">Ver registro</a>` : ''}</small>
      ${e.note ? `<p class="muted small">${esc(e.note)}</p>` : ''}
    </div>` : `<p class="muted">No hay un registro DONKI cargado: este es un ejercicio sin dato real.</p>`}
    <p class="muted small">${esc(w.note || 'La fecha es histórica: no es un pronóstico para la Luna. Los efectos del juego son inventados.')}</p>
    <div class="opts">
      <button class="opt" data-action="weather" data-choice="shelter"><span class="optid">🛡️</span><span class="label">Ir al refugio</span>
        <span class="cons">Todos adentro hasta que pase. Se pausa la investigación.</span>${chips({ energy: -8, shield: 11, research: -5 })}</button>
      <button class="opt" data-action="weather" data-choice="continue_eva"><span class="optid">🧑‍🚀</span><span class="label">Seguir la caminata</span>
        <span class="cons">Más ciencia, pero el traje y la salud se exponen.</span>${chips({ research: 9, oxygen: -5, shield: -12, health: -7 })}</button>
    </div>
  </div>`;
}

export function weatherResultHTML(res) {
  const shelter = res.result?.choice === 'shelter';
  return `<div class="sheet enter">
    <h2>${shelter ? '🛡️ Todos a salvo en el refugio' : '🧑‍🚀 La caminata siguió'}</h2>
    <p>${shelter ? 'La tripulación esperó adentro. Perdieron tiempo de investigación, pero se protegieron.' : 'Consiguieron más datos científicos, pero el traje quedó expuesto. Eso puede traer problemas.'}</p>
    ${chips(res.result?.delta || {})}
    <p class="muted small">${esc(res.result?.note || '')}</p>
    <div class="row sticky"><button class="btn go" data-action="afterResult" autofocus>Seguir</button></div>
  </div>`;
}

// ── Final ──
export function endingHTML(v) {
  const rep = v.ending;
  if (!rep) return `<div class="sheet enter"><h2>Misión terminada</h2><div class="row"><button class="btn go" data-action="new">Nueva misión</button></div></div>`;
  const id = rep.endingId;
  const tragic = id === 9 || id === 10;
  const icon = { 1: '🌕', 2: '🌿', 3: '🔬', 4: '📡', 5: '🤝', 6: '🛰️', 7: '🌑', 8: '🚨', 9: '🕯️', 10: '🌘' }[id] || '🌙';
  const p = rep.performance || {};
  const low = METRICS.filter((m) => m.key !== 'research' && (rep.metrics?.[m.key] ?? 100) < 30);
  return `<div class="sheet wide final enter">
    <p class="muted">Final ${id} de 10</p>
    <h2>${icon} ${esc(rep.ending?.title || 'Fin de la misión')}</h2>
    <p class="say small">${esc(rep.ending?.description || '')}</p>
    ${tragic ? `<p class="note">Este final es triste. Podés repetir un día y probar otras decisiones: así se aprende en un entrenamiento.</p>` : ''}
    <h3>Por qué llegaste a este final</h3>
    <ul>${(rep.why?.criteria || []).map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    ${low.length ? `<p>Indicadores muy bajos: ${low.map((m) => `${m.icon} ${esc(m.label)} (${rep.metrics[m.key]})`).join(', ')}.</p>` : ''}
    ${rep.statuses?.length ? `<div class="fx">${statusChips(rep.statuses, 'warn')}</div>` : ''}
    <div class="facts-grid">
      <div class="stat"><span>Retos superados</span><b>✅ ${p.completed ?? 0}</b></div>
      <div class="stat"><span>A medias / fallidos</span><b>🟡 ${p.partial ?? 0} · ❌ ${p.failed ?? 0}</b></div>
      <div class="stat"><span>Omitidos</span><b>⏭️ ${p.skipped ?? 0}</b></div>
      <div class="stat"><span>Monedas ganadas</span><b>🪙 ${rep.earned ?? 0}</b></div>
    </div>
    <p class="muted small">${esc(rep.why?.priorityNote || '')}</p>
    <p class="muted">Código de misión: <b>${esc(v.seed)}</b></p>
    <div class="row"><button class="btn go" data-action="repeatMenu">↺ Repetir un día</button><button class="btn" data-action="new">🚀 Nueva misión</button><button class="btn" data-action="album">📒 Álbum</button><button class="btn" data-action="menu">Menú principal</button></div>
  </div>`;
}

export function repeatHTML(v) {
  const days = Array.from({ length: v.day }, (_, i) => i + 1);
  return `<div class="sheet enter">${close}
    <h2>↺ Repetir un día</h2>
    <p>Volvés al inicio de ese día con los recursos, compras y suerte de ese momento. Lo que pasó después se borra.</p>
    <div class="row days">${days.map((d) => `<button class="btn ${d === v.day ? 'go' : ''}" data-action="repeat" data-day="${d}">Día ${d}</button>`).join('')}</div>
  </div>`;
}

// ── Comunicaciones ──
export function commsHTML(v) {
  const fact = catalog.facts.find((f) => f.id === 'comms');
  const url = safeUrl(fact?.sourceUrl);
  const lowEnergy = v.metrics.energy < 5;
  return `<div class="sheet wide enter">${close}
    <h2>Mensajes a la Tierra</h2>
    <p>Mandar un mensaje gasta <b>⚡ 5</b> de energía. La respuesta llega después de 1 reto, o de 3 si la antena anda mal.</p>
    <div class="opts three">${MESSAGE_TYPES.map((t) => `<button class="opt" data-action="send" data-type="${t.id}" ${lowEnergy || v.phase !== 'active' ? 'disabled' : ''}>
      <span class="optid">${t.icon}</span><span class="label">${esc(t.label)}</span><span class="cons">${esc(t.hint)}</span></button>`).join('')}</div>
    <h3>Mensajes enviados</h3>
    ${v.messages.length ? `<div class="list">${v.messages.slice().reverse().map((m) => {
      const t = MESSAGE_TYPES.find((x) => x.id === m.type);
      const ok = m.status === 'acknowledged';
      return `<div class="src"><b>${t?.icon || '✉️'} ${esc(t?.label || m.type)}</b>
        <span>${ok ? '✅ La Tierra confirmó' : `⏳ En camino · llega después del reto ${m.arrivalTurn}`}${m.delayCount ? ` · se atrasó ${m.delayCount} vez/veces` : ''}</span></div>`;
    }).join('')}</div>` : '<p class="muted">Todavía no mandaste mensajes.</p>'}
    ${fact ? `<div class="bubble"><b>📏 Dato real:</b> ${withTerms(fact.answer)}<br><small>${esc(fact.source)}${url ? ` · <a href="${esc(url)}" target="_blank" rel="noopener">Fuente</a>` : ''}</small></div>` : ''}
  </div>`;
}

export function statusesHTML(v) {
  return `<div class="sheet enter">${close}
    <h2>⚠️ Alertas de la base</h2>
    ${v.statuses.length ? `<p>Estos problemas siguen activos. Algunos retos y compras los resuelven.</p><div class="fx">${statusChips(v.statuses, 'warn')}</div>` : '<p>✅ No hay alertas. ¡Buen trabajo!</p>'}
    <h3>Indicadores</h3>
    <div class="summary">${METRICS.map((m) => meterRow(m, v.metrics[m.key])).join('')}</div>
    <p class="muted small">Las escalas de 0 a 100 son inventadas para el juego, no son mediciones de la NASA.</p>
  </div>`;
}

// ── Álbum ──
export function albumHTML(album) {
  const got = new Set(album.endings || []);
  return `<div class="sheet wide enter">${close}
    <h2>📒 Álbum de finales</h2>
    <p>Hay 10 finales posibles. Llegaste a <b>${got.size}</b>.</p>
    <div class="list">${Object.entries(catalog.endings).map(([id, e]) => got.has(Number(id))
      ? `<div class="fact"><span class="ic">✅</span><p>${esc(e.title)}</p><small>${esc(e.description)}</small></div>`
      : `<div class="fact locked"><span class="ic">❔</span><p>Final ${id}</p><small>Todavía no llegaste a este final.</small></div>`).join('')}</div>
    <p class="muted">Misiones terminadas en este dispositivo: ${album.missions || 0}</p>
  </div>`;
}

// ── Fuentes ──
export function sourcesHTML() {
  const facts = catalog.facts;
  const ev = catalog.events.slice().sort((a, b) => String(b.observedAt).localeCompare(String(a.observedAt)));
  const byType = ev.reduce((acc, e) => ((acc[e.type] = (acc[e.type] || 0) + 1), acc), {});
  return `<div class="sheet wide enter">${close}
    <h2>📚 Datos y fuentes</h2>
    <p>Los indicadores de la base son inventados para el juego. Los datos de abajo son reales y vienen de la NASA y la Agencia Espacial Canadiense.</p>
    <h3>Fichas científicas de LUNI</h3>
    <div class="list">${facts.map((f) => {
      const url = safeUrl(f.sourceUrl);
      return `<div class="src"><b>${esc(f.source)}</b><span>${withTerms(f.answer)}</span><br>
      <small>${f.verified?.retrievedAt ? `Verificado el ${esc(fmtDate(f.verified.retrievedAt))} · ` : ''}${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(url.replace(/^https:\/\//, '').slice(0, 48))}</a>` : ''}</small></div>`;
    }).join('')}</div>
    <h3>Registros de clima espacial (NASA DONKI)</h3>
    <p>${ev.length} registros guardados: ${Object.entries(byType).map(([k, n]) => `${n} ${esc(k)}`).join(', ')}. Se usan en la alerta del día 5 y en las respuestas de LUNI.</p>
    <div class="list">${ev.map((e) => {
      const url = safeUrl(e.sourceUrl);
      return `<div class="src"><b>${esc(e.type)} · ${esc(fmtDate(e.observedAt))}</b><span>${esc(e.summary || e.title)}</span><br>
      <small>${esc(e.source || '')}${url ? ` · <a href="${esc(url)}" target="_blank" rel="noopener">Ver registro</a>` : ''}</small></div>`;
    }).join('')}</div>
    <p class="muted small">Los registros son de archivo: no son una consulta en vivo ni miden la radiación en Luna-7.</p>
  </div>`;
}

export function glossaryHTML() {
  return `<div class="sheet enter">${close}
    <h2>🔎 Glosario</h2>
    <p class="muted">Tocá una palabra subrayada con puntos en cualquier parte del juego para ver qué significa.</p>
    <dl class="glossary">${GLOSSARY.map((g) => `<dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd>`).join('')}</dl>
  </div>`;
}

export function teachersHTML(v) {
  const plant = catalog.facts.find((f) => f.id === 'plant');
  const url = safeUrl(plant?.sourceUrl);
  return `<div class="sheet enter">${close}
    <h2>🍎 Para docentes</h2>
    <p>Vita Lunae es un juego gratis para el navegador, para estudiantes de 7 a 12 años. No necesita cuenta ni descarga.</p>
    <h3>Qué practican</h3>
    <ul>
      <li>Decisiones con costo: cada opción gasta oxígeno, agua, energía, comida o seguridad.</li>
      <li>Pensamiento sistémico: lo que se decide hoy cambia los retos de mañana.</li>
      <li>Clima espacial con registros reales de NASA DONKI.</li>
      <li>Aprender del error: se puede repetir cualquier día ya jugado.</li>
    </ul>
    <h3>Código de misión</h3>
    <p>Con un mismo código (por ejemplo <b>AULA-1</b>), toda la clase juega la misma misión. Después pueden comparar decisiones.</p>
    ${v?.seed ? `<div class="stat code"><span>Código de la misión actual</span><b>${esc(v.seed)}</b></div>` : ''}
    <h3>Privacidad</h3>
    <p>La partida se guarda solo en este dispositivo y no vence: queda hasta tocar "Borrar mi progreso". No se envía ningún dato del estudiante. LUNI responde con fichas preparadas: no es una inteligencia artificial generativa.</p>
    ${url ? `<p><a href="${esc(url)}" target="_blank" rel="noopener">Recursos de producción de alimentos de la Agencia Espacial Canadiense</a></p>` : ''}
  </div>`;
}

export function settingsHTML(settings, storageOk, confirming) {
  const seg = (k, val) => `<span class="seg" role="group">${[[true, 'Sí'], [false, 'No']].map(([x, l]) => `<button data-action="set" data-k="${k}" data-v="${x}" aria-pressed="${val === x}">${l}</button>`).join('')}</span>`;
  return `<div class="sheet enter">${close}
    <h2>⚙️ Ajustes</h2>
    ${storageOk ? '' : `<p class="note">Este navegador no deja guardar la partida. Igual podés jugar.</p>`}
    <div class="list">
      <div class="setting"><span>🔊 Sonido</span>${seg('sound', settings.sound)}</div>
      <div class="setting"><span>🐢 Menos movimiento</span>${seg('reducedMotion', settings.reducedMotion)}</div>
      <div class="setting"><span>🧭 Flecha de guía</span>${seg('guide', settings.guide)}</div>
    </div>
    <p class="muted">La partida queda guardada en este dispositivo hasta que la borres.</p>
    ${confirming
      ? `<p><b>¿Borrar la partida y el álbum de este dispositivo?</b></p><div class="row"><button class="btn danger" data-action="eraseYes">Sí, borrar</button><button class="btn" data-action="eraseNo">Cancelar</button></div>`
      : `<div class="row"><button class="btn danger" data-action="erase">🗑️ Borrar mi progreso</button></div>`}
  </div>`;
}

export function pauseHTML(v) {
  return `<div class="sheet enter" style="text-align:center">
    <h2>⏸ En pausa</h2>
    <div class="list" style="margin-top:14px">
      <button class="btn go" data-action="back">▶ Seguir</button>
      ${v?.phase === 'active' ? '<button class="btn" data-action="repeatMenu">↺ Repetir un día</button>' : ''}
      <button class="btn" data-action="glossary">🔎 Glosario</button>
      <button class="btn" data-action="sources">📚 Datos y fuentes</button>
      <button class="btn" data-action="settings">⚙️ Ajustes</button>
      <button class="btn" data-action="menu">Menú principal</button>
    </div>
    ${langPicker(v)}
    <p class="muted small" style="margin-top:12px">${t('pauseHelp')}</p></div>`;
}

export { METRIC };

// ── Ficha científica: cada equipo del mundo explica el dato real que lo respalda ──
const KIND = { dato_verificado: ['Dato verificado de la NASA', 'ok'], hecho_cientifico: ['Hecho científico documentado', 'ok'], explicacion_educativa: ['Explicación educativa', 'calm'], metodologia: ['Cómo separamos datos y juego', 'calm'] };
export function fichaHTML(fact, point, v) {
  const url = safeUrl(fact.sourceUrl);
  const [kind, tone] = KIND[fact.kind] || ['Ficha', 'calm'];
  const m = v.mission, pl = m ? placeOf(m) : null;
  return `<div class="sheet enter ficha">${close}
    <p class="badge-k ${tone}">${esc(kind)}</p>
    <h2>${esc(point.label)}</h2>
    <p class="say">${withTerms(fact.answer)}</p>
    <p class="muted small">Fuente: ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(fact.source)}</a>` : esc(fact.source)}</p>
    ${m && pl ? `<div class="note">Tu reto actual, <b>${esc(m.name)}</b>, está en ${esc(pl.label)} (${esc(SCENES[pl.scene].name)}).</div>` : ''}
    <div class="row">${m && pl ? '<button class="btn go" data-action="guideClose">Guíame al reto</button>' : ''}<button class="btn" data-action="back" autofocus>Seguir explorando</button></div>
  </div>`;
}

// ── Mapa (Tab): la escena actual con tu posición y la lista de lugares ──
const MAP_IMG = { exterior: 'exterior', zora: 'zora', invernadero: 'invernadero', paneles: 'paneles', crater: 'crater' };
export function mapHTML(world) {
  const id = SCENES[world?.scene] ? world.scene : 'exterior';
  const sc = SCENES[id];
  const px = Math.max(0, Math.min(100, ((world?.x ?? sc.spawn.x) / sc.w) * 100));
  const py = Math.max(0, Math.min(100, ((world?.y ?? sc.spawn.y) / sc.h) * 100));
  const places = Object.keys(SCENES).map((k) => `<li class="${k === id ? 'here' : ''}"${k === id ? ' aria-current="location"' : ''}><span aria-hidden="true">${k === id ? '📍' : '▫️'}</span><b>${esc(tr(SCENES[k].name))}</b>${k === id ? `<em>${t('map.here')}</em>` : ''}</li>`).join('');
  return `<div class="sheet wide enter mapsheet">${close()}<h2>${pix('map', { size: 26 })} ${t('map.title')}</h2>
    <p class="here-line">📍 ${t('map.here')}: <b>${esc(tr(sc.name))}</b></p>
    <div class="mapview"><div class="mapimg" style="aspect-ratio:${sc.w} / ${sc.h};background-image:url(${import.meta.env.BASE_URL}assets/mapas/${MAP_IMG[id]}.png)" role="img" aria-label="${esc(tr(sc.name))}">
      <span class="you" style="left:${px.toFixed(1)}%;top:${py.toFixed(1)}%"><i></i><b>${t('map.you')}</b></span></div></div>
    <h3 class="sub">${t('map.places')}</h3><ul class="mapplaces">${places}</ul>
    <p class="muted small">${t('map.hint')}</p></div>`;
}
