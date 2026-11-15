// Animación de cierre de la misión (final del día 7): cielo estrellado, la marca de Vita Lunae, Kita con su trofeo y confeti.
// Dura unos 5 s; se salta tocando o con Enter/Esc/Espacio. Con "reducir movimiento" queda quieta y corta.
import { session } from '../bus.js';
import { sfx } from '../game/sfx.js';
import { t } from '../i18n/index.js';

const BASE = import.meta.env.BASE_URL;
const COLORS = ['#FFC93C', '#7C90DF', '#FF8FA3', '#6BD6A5', '#FFF3DC'];

export function playFinale(v) {
  return new Promise((resolve) => {
    const reduced = !!session.settings?.reducedMotion;
    const root = document.createElement('div');
    root.id = 'finale';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', t('finaleTitle'));
    if (reduced) root.classList.add('still');
    const stars = Array.from({ length: 46 }, (_, i) => `<i style="left:${(i * 37) % 100}%;top:${(i * 53) % 78}%;animation-delay:${(i % 9) * 0.3}s"></i>`).join('');
    const confetti = reduced ? '' : Array.from({ length: 34 }, (_, i) => `<b style="left:${(i * 29) % 100}%;background:${COLORS[i % COLORS.length]};animation-delay:${1.2 + (i % 12) * 0.18}s;animation-duration:${2.6 + (i % 5) * 0.4}s"></b>`).join('');
    root.innerHTML = `<div class="f-sky" aria-hidden="true">${stars}</div><div class="f-confetti" aria-hidden="true">${confetti}</div>
      <div class="f-moon" aria-hidden="true"></div>
      <div class="f-stage">
        <img class="f-mark" src="${BASE}assets/marca/vita-lunae-moon-pop-mark.svg" alt="" width="150" height="150">
        <h1 class="f-title">${t('finaleTitle')}</h1>
        <p class="f-sub">${t('finaleSub', { d: v?.maxDays || 7 })}</p>
        <div class="f-kita" role="img" aria-label="Kita" style="background-image:url(${BASE}assets/kita/gana_trofeo_spritesheet.png)"></div>
        <button type="button" class="btn go f-go">${t('finaleGo')}</button>
      </div>`;
    document.body.append(root);
    sfx.win();
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey, true);
      root.classList.add('out');
      setTimeout(() => { root.remove(); resolve(); }, reduced ? 0 : 320);
    };
    const onKey = (e) => { if (['Enter', 'Escape', ' '].includes(e.key)) { e.preventDefault(); e.stopPropagation(); end(); } };
    document.addEventListener('keydown', onKey, true);
    root.addEventListener('click', end);
    root.querySelector('.f-go').focus({ preventScroll: true });
    const timer = setTimeout(end, reduced ? 2200 : 5200);
  });
}
