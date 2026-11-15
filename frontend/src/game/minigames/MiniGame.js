// Base de los minijuegos: panel encima del mapa, tiempo límite y resultado para el motor.
// Cada minijuego llama this.win() o deja que se acabe el tiempo; el resultado se arma con
// makePerformance() y se entrega con data.onDone(performance) → bridge.finishMinigame().
import Phaser from 'phaser';
import { C } from '../../theme.js';
import { FONT, FONT_PIX } from '../WorldScene.js';
import { session } from '../../bus.js';
import { makePerformance } from '../../rules.js';
import { sfx } from '../sfx.js';
import { t } from '../../i18n/index.js';

export class MiniGame extends Phaser.Scene {
  init(data) {
    this.data_ = data;
    this.finished = false;
    this._closed = false;
    this.mistakes = 0;
    this.progress = 0;
  }

  get tired() { return !!this.data_.tired; }
  get rm() { return session.settings.reducedMotion; }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const top = (session.insets?.top || 0) + 8;
    const pw = Math.min(620, W - 20);
    const ph = Math.min(600, H - top - 12);
    const px = (W - pw) / 2, py = top + Math.max(0, (H - top - 12 - ph) / 2);
    this.panel = { x: px, y: py, w: pw, h: ph };
    this.seconds = this.data_.seconds || 25;
    this.startedAt = performance.now();
    // Si la pestaña queda oculta, el tiempo del puzzle se detiene: no hay penalización por una pestaña inactiva.
    this.hiddenAt = 0;
    this.onVis = () => {
      if (document.hidden) this.hiddenAt = performance.now();
      else if (this.hiddenAt) { this.startedAt += performance.now() - this.hiddenAt; this.hiddenAt = 0; }
    };
    document.addEventListener('visibilitychange', this.onVis);
    this.events.once('shutdown', () => document.removeEventListener('visibilitychange', this.onVis));

    this.add.rectangle(W / 2, H / 2, W, H, C.outline, 0.6).setInteractive();
    const g = this.add.graphics();
    g.fillStyle(C.outline, 1).fillRoundedRect(px + 6, py + 6, pw, ph, 6);
    g.fillStyle(C.cream, 1).fillRoundedRect(px, py, pw, ph, 6);
    g.lineStyle(3, C.outline, 1).strokeRoundedRect(px, py, pw, ph, 6);
    // franja de título como la tarjeta de misión
    g.fillStyle(C.sky, 1).fillRect(px + 2, py + 2, pw - 4, 52).lineStyle(3, C.outline, 1).lineBetween(px + 2, py + 54, px + pw - 2, py + 54);

    const fs = (n) => Math.round(Math.max(15, Math.min(n, pw / 22))) + 'px';
    // Título en una sola línea: si no cabe (celular), se achica hasta 18 px y, si aún no cabe, se corta con «…».
    const narrow = pw < 520;
    const titleRoom = pw - (narrow ? 150 : 200);
    let title = (this.data_.title || '').replace(/^[^\p{L}\p{N}¿¡]+/u, '');
    const tt = this.add.text(px + 16, py + 27, title, { fontFamily: FONT_PIX, fontSize: '36px', color: '#FFF3DC', stroke: '#27234C', strokeThickness: 4 }).setOrigin(0, 0.5);
    for (let size = 36; tt.width > titleRoom && size > 18; size -= 2) tt.setFontSize(size);
    this.hint = this.add.text(px + 22, py + 64, this.instructions(), { fontFamily: FONT, fontSize: fs(19), fontStyle: '700', color: '#27234C', wordWrap: { width: pw - 44 } });
    if (this.tired) this.add.text(px + 22, py + 96, t('game.cansancio_este_trabajo_pide_un'), { fontFamily: FONT, fontSize: fs(15), color: '#8D6FC1', fontStyle: '700' });

    // Rendirse: cuenta como reto no terminado.
    const bx = px + pw - 78, by = py + 28;
    const btn = this.add.container(bx, by);
    const bg = this.add.graphics();
    bg.fillStyle(C.white, 1).fillRoundedRect(-62, -20, 124, 40, 6).lineStyle(3, C.outline, 1).strokeRoundedRect(-62, -20, 124, 40, 6);
    btn.add([bg, this.add.text(0, 0, t('game.rendirme'), { fontFamily: FONT, fontSize: '17px', fontStyle: '700', color: '#27234C' }).setOrigin(0.5)]);
    btn.on('pointerover', () => btn.setScale(1.04)).on('pointerout', () => btn.setScale(1));
    btn.setSize(124, 40).setInteractive({ useHandCursor: true }).on('pointerdown', () => { sfx.tap(); this.end(false); });

    this.timerBar = this.add.graphics();
    this.timeText = this.add.text(px + pw - 22, py + ph - 56, '', { fontFamily: FONT_PIX, fontSize: '28px', color: '#27234C' }).setOrigin(1, 0.5);
    const areaTop = py + 126;
    this.area = { x: px + 22, y: areaTop, w: pw - 44, h: ph - (areaTop - py) - 70 };
    this.build();
  }

  timeLeft() { return Math.max(0, this.seconds - (performance.now() - this.startedAt) / 1000); }

  update(time, delta) {
    if (this.finished) return;
    const left = this.timeLeft();
    const p = left / this.seconds;
    const { x, y, w, h } = this.panel;
    this.timerBar.clear();
    const bx0 = x + 22, bw = w - 44, by0 = y + h - 36, segs = 20, gap = 3, sw = (bw - gap * (segs - 1)) / segs, lit = Math.ceil(p * segs);
    this.timerBar.fillStyle(C.moon, 1).fillRect(bx0 - 3, by0 - 3, bw + 6, 24);
    for (let k = 0; k < segs; k++) this.timerBar.fillStyle(k < lit ? (p < 0.3 ? C.alert : C.brand) : C.mid, 1).fillRect(bx0 + k * (sw + gap), by0, sw, 18);
    this.timerBar.lineStyle(3, C.outline, 1).strokeRect(bx0 - 3, by0 - 3, bw + 6, 24);
    this.timeText.setText(`${Math.ceil(left)} s`);
    if (left <= 0) { this.end(false); return; }
    this.tick?.(time, delta);
  }

  win() { this.progress = 1; this.end(true); }

  end(done) {
    if (this.finished) return;
    this.finished = true;
    const perf = makePerformance({
      done,
      progress: this.progress,
      timeLeftFrac: this.timeLeft() / this.seconds,
      mistakes: this.mistakes,
      hintsUsed: this.data_.hintsUsed || 0
    });
    done ? sfx.good() : sfx.bad();
    const { x, y, w, h } = this.panel;
    const txt = this.add.text(x + w / 2, y + h / 2, done ? t('game.listo') : t('game.se_termino_el_tiempo'), {
      fontFamily: FONT_PIX, fontSize: '60px', color: '#27234C', backgroundColor: done ? '#7ED65B' : '#FF746A', padding: { x: 24, y: 8 }
    }).setOrigin(0.5).setDepth(100);
    if (!this.rm) this.tweens.add({ targets: txt, scale: { from: 0.6, to: 1 }, duration: 260, ease: 'Back.Out' });
    setTimeout(() => this.close(perf), 900);
  }

  miss() {
    this.mistakes++;
    sfx.bad();
    if (!this.rm) this.cameras.main.shake(150, 0.006);
  }

  close(perf) {
    if (this._closed) return;
    this._closed = true;
    this.scene.stop();
    this.data_.onDone?.(perf);
  }

  text(x, y, s, size = 24, color = '#27234C') {
    return this.add.text(x, y, s, size >= 22 ? { fontFamily: FONT_PIX, fontSize: Math.round(size * 1.25) + 'px', color } : { fontFamily: FONT, fontSize: size + 'px', fontStyle: '800', color }).setOrigin(0.5);
  }
}
