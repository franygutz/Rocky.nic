// Panel de Kita: chat por reglas del backend (askLuni). Se arma con textContent:
// nunca se inserta la respuesta como HTML. Los enlaces solo si son http(s).
import { session } from '../bus.js';
import { safeUrl } from './text.js';
import { sfx } from '../game/sfx.js';
import { t } from '../i18n/index.js';
import { kitaIcon } from './pix.js';

const $ = (s) => document.querySelector(s);
const log = []; // { q, r }
const START = () => [t('s1'), t('s2'), t('s3')];

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

export function openLuni() {
  const d = $('#drawer');
  d.hidden = false;
  render();
  setTimeout(() => d.querySelector('input')?.focus({ preventScroll: true }), 50);
}
export function closeLuni() { $('#drawer').hidden = true; }
export const luniOpen = () => !$('#drawer').hidden;

export function ask(question, opts = {}) {
  const q = String(question || '').trim().slice(0, 350);
  if (q.length < 2 || !session.bridge?.getView()?.gameId) return null;
  let r;
  try { r = session.bridge.askLuni(q, opts); } catch { r = { answer: t('kitaFail'), sources: [], suggestions: START() }; }
  log.push({ q, r });
  sfx.message();
  if (luniOpen()) render();
  return r;
}

export function clearLuni() { log.length = 0; }

function render() {
  const d = $('#drawer');
  d.innerHTML = '';
  const head = el('div', 'dhead');
  const title = el('h2', 'kita-title');
  title.innerHTML = `${kitaIcon({ size: 44 })} <span>Kita</span>`;
  const x = el('button', 'btn small', '✕');
  x.setAttribute('aria-label', t('close'));
  x.dataset.action = 'closeLuni';
  head.append(title, x);
  const intro = el('p', 'muted small', t('kitaIntro'));
  const list = el('div', 'chat');
  list.setAttribute('aria-live', 'polite');
  if (!log.length) list.append(bubble('luni', t('kitaHello')));
  for (const { q, r } of log) {
    list.append(bubble('me', q));
    const b = bubble('luni', r.answer);
    if (r.hint) b.append(el('p', 'hint', '💡 ' + r.hint));
    if (r.observation) {
      const o = r.observation;
      b.append(el('p', 'small', `📅 ${t('recordLbl', { t: o.type, d: String(o.observedAt || '').slice(0, 10), x: o.disclaimer || '' })}`));
    }
    const srcs = (r.sources || []).filter((s) => safeUrl(s.url));
    if (srcs.length) {
      const p = el('p', 'small srcs', t('sourcesLbl'));
      srcs.forEach((s, i) => {
        const a = el('a', '', s.title || t('ui.fuente'));
        a.href = safeUrl(s.url); a.target = '_blank'; a.rel = 'noopener';
        if (i) p.append(' · ');
        p.append(a);
      });
      b.append(p);
    }
    list.append(b);
  }
  const lastR = log[log.length - 1]?.r;
  const sug = el('div', 'sugs');
  for (const s of (lastR?.suggestions?.length ? lastR.suggestions : START())) {
    const b = el('button', 'btn small calm', s);
    b.dataset.action = 'luniAsk';
    b.dataset.q = s;
    sug.append(b);
  }
  const form = el('form', 'ask');
  form.dataset.form = 'luni';
  const input = el('input');
  input.name = 'q'; input.maxLength = 350; input.placeholder = t('askPh'); input.setAttribute('aria-label', t('askLabel')); input.autocomplete = 'off';
  const send = el('button', 'btn small go', t('askBtn'));
  send.type = 'submit';
  form.append(input, send);
  d.append(head, intro, list, sug, form);
  list.scrollTop = list.scrollHeight;
}

function bubble(who, text) {
  const b = el('div', 'msg ' + who);
  for (const part of String(text).split(/\n{2,}/)) b.append(el('p', '', part));
  return b;
}
