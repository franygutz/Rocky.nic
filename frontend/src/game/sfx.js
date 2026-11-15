// Sonidos sintetizados con Web Audio: sin archivos ni licencias que declarar.
import { session } from '../bus.js';

let ctx = null;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur = 0.12, type = 'sine', vol = 0.15, when = 0, slide = 0) {
  if (!session.settings.sound) return;
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  unlock() { audio(); },
  tap() { tone(660, 0.06, 'triangle', 0.08); },
  step() { tone(140, 0.05, 'sine', 0.04); },
  good() { tone(523, 0.1, 'triangle'); tone(784, 0.16, 'triangle', 0.15, 0.09); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.14, i * 0.1)); },
  bad() { tone(220, 0.2, 'sawtooth', 0.06, 0, -80); },
  alert() { tone(880, 0.12, 'square', 0.05); tone(880, 0.12, 'square', 0.05, 0.2); },
  door() { tone(320, 0.2, 'triangle', 0.07, 0, 180); tone(520, 0.22, 'triangle', 0.05, 0.14, -160); },
  rub() { tone(300 + Math.random() * 200, 0.04, 'triangle', 0.03); },
  light(i) { tone([392, 494, 587, 698][i % 4], 0.22, 'sine', 0.14); },
  charge(p) { tone(200 + p * 600, 0.05, 'sine', 0.05); },
  coin() { tone(988, 0.07, 'square', 0.05); tone(1319, 0.12, 'square', 0.05, 0.07); },
  message() { tone(1200, 0.08, 'sine', 0.08); tone(900, 0.08, 'sine', 0.08, 0.1); tone(1200, 0.12, 'sine', 0.08, 0.2); }
};
