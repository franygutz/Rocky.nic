// Cortina circular al cambiar de lugar: se cierra sobre el personaje al salir y se abre sobre él al entrar.
let el = null, closed = false;
const get = () => {
  if (!el) { el = document.createElement('div'); el.id = 'iris'; el.setAttribute('aria-hidden', 'true'); document.body.append(el); }
  return el;
};
const big = () => Math.hypot(window.innerWidth, window.innerHeight) + 40;

function run(x, y, from, to, ms) {
  const n = get();
  n.style.setProperty('--x', Math.round(x) + 'px');
  n.style.setProperty('--y', Math.round(y) + 'px');
  n.style.transition = 'none';
  n.style.setProperty('--r', from + 'px');
  n.style.opacity = '1';
  void n.offsetWidth;
  return new Promise((resolve) => {
    n.style.transition = `--r ${ms}ms cubic-bezier(.5,0,.3,1)`;
    n.style.setProperty('--r', to + 'px');
    setTimeout(resolve, ms + 20);
  });
}

export function irisClose(x, y, ms = 420) { closed = true; return run(x, y, big(), 0, ms); }
export function irisOpen(x, y, ms = 480) {
  if (!closed) return Promise.resolve();
  closed = false;
  return run(x, y, 0, big(), ms).then(() => { if (!closed && el) el.style.opacity = '0'; });
}
export const irisIsClosed = () => closed;
