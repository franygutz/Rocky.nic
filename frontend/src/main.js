// Arranque: interfaz HTML + Phaser (mundo y minijuegos), conectados al motor de backend/.
import Phaser from 'phaser';
import './ui/app.css';
import './ui/vl.css';
import { WorldScene } from './game/WorldScene.js';
import { LeakGame, DustGame, WaterGame, DoseGame, AntennaGame } from './game/minigames/games.js';
import { boot } from './ui/app.js';
import { bus } from './bus.js';
import { MINIGAME_OF } from './rules.js';

// Las fuentes del juego se cargan antes de crear los textos de Phaser.
// (con tope de 1,5 s: si el navegador tarda con las fuentes, el juego arranca igual)
const fontsReady = Promise.race([new Promise((r) => setTimeout(r, 1500)), Promise.all(['36px "Jersey 10"', '700 18px "Atkinson Hyperlegible"'].map((f) => document.fonts.load(f).catch(() => null)))]);

// Si algo falla al arrancar, se ve en pantalla (no una pantalla vacía).
function showFatal(e) {
  const d = document.createElement('pre');
  d.style.cssText = 'position:fixed;left:8px;bottom:8px;right:8px;z-index:99;background:#27234C;color:#FFF3DC;padding:10px;border:3px solid #FF746A;font:13px monospace;white-space:pre-wrap;max-height:40vh;overflow:auto';
  d.textContent = 'Error al iniciar: ' + (e?.stack || e?.message || e);
  document.body.appendChild(d);
}
window.addEventListener('error', (ev) => showFatal(ev.error || ev.message));
window.addEventListener('unhandledrejection', (ev) => showFatal(ev.reason));

boot(); // primero el motor y el guardado: el mundo nace donde quedó la partida

const phaser = await fontsReady.then(() => new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'stage',
  backgroundColor: '#171426',
  pixelArt: true, // sin suavizado: el pixel art se mantiene nítido
  roundPixels: true,
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  scene: [WorldScene, LeakGame, DustGame, WaterGame, DoseGame, AntennaGame],
  input: { activePointers: 3 },
  fps: { smoothStep: false },
  banner: false
}));

// Los puzzles se abren encima del mundo; el mundo queda quieto porque la interfaz captura la entrada.
bus.on('playMinigame', (data) => phaser.scene.start(MINIGAME_OF[data.category], data));

if (/[?&]debug\b/.test(location.search)) window.__phaser = phaser;
