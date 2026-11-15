// Los 5 minijuegos, uno por categoría de reto. Todos se pueden jugar con mouse, dedo o teclado.
// Cada uno cuenta su avance (this.progress, 0–1) y sus errores (this.mistakes) y entrega { completed, accuracy, mistakes, hintsUsed }.
// Estilo: pixel art Moon Pop, contorno grueso y sombra dura. Nada depende solo del color: cada pieza tiene forma, número o letra.
import Phaser from 'phaser';
import { C } from '../../theme.js';
import { MiniGame } from './MiniGame.js';
import { FONT, FONT_PIX } from '../WorldScene.js';
import { sfx } from '../sfx.js';

const INK = '#27234C';

// Caja con contorno de 3 px y sombra dura (el mismo lenguaje que las tarjetas de la interfaz).
function box(g, x, y, w, h, fill, { shadow = 4, line = 3 } = {}) {
  if (shadow) g.fillStyle(C.outline, 1).fillRect(x + shadow, y + shadow, w, h);
  g.fillStyle(fill, 1).fillRect(x, y, w, h);
  g.lineStyle(line, C.outline, 1).strokeRect(x, y, w, h);
}

function scatter(area, n, r, avoid = []) {
  const pts = [];
  let tries = 0;
  while (pts.length < n && tries++ < 1200) {
    const x = area.x + r + Math.random() * (area.w - 2 * r);
    const y = area.y + r + Math.random() * (area.h - 2 * r);
    if (pts.every((p) => Math.hypot(p.x - x, p.y - y) > r * 2.3) && avoid.every((f) => f(x, y))) pts.push({ x, y });
  }
  return pts;
}

// Chispa cuadrada (partícula pixel) que sube o cae y se apaga.
function spark(scene, x, y, color, { dx = 0, dy = -30, size = 5, ms = 600 } = {}) {
  if (scene.rm) return;
  const p = scene.add.rectangle(x, y, size, size, color, 1).setDepth(50);
  scene.tweens.add({ targets: p, x: x + dx, y: y + dy, alpha: 0, duration: ms, onComplete: () => p.destroy() });
}

// ── Soporte vital: tapar las fugas del tubo en orden 1, 2, 3… ──
export class LeakGame extends MiniGame {
  constructor() { super('Leak'); }
  instructions() { return 'Tapa las fugas en orden: 1, 2, 3… (o pulsa las teclas con su número).'; }
  build() {
    const a = this.area, g = this.add.graphics();
    box(g, a.x, a.y, a.w, a.h, C.mid, { shadow: 0 });
    // tres tuberías del sistema de aire, con bridas y remaches
    const rows = [0.22, 0.5, 0.78].map((f) => a.y + a.h * f);
    for (const y of rows) {
      g.fillStyle(C.outline, 1).fillRect(a.x + 6, y - 19, a.w - 12, 38);
      g.fillStyle(C.sky, 1).fillRect(a.x + 9, y - 16, a.w - 18, 32);
      g.fillStyle(C.moon, 1).fillRect(a.x + 9, y - 12, a.w - 18, 5);
      g.fillStyle(C.cool, 1).fillRect(a.x + 9, y + 9, a.w - 18, 7);
      for (let x = a.x + 70; x < a.x + a.w - 40; x += 110) { g.fillStyle(C.cream, 1).fillRect(x, y - 21, 12, 42).lineStyle(3, C.outline, 1).strokeRect(x, y - 21, 12, 42); }
    }
    const n = this.tired ? 6 : 4, r = 25;
    const onPipe = (x, y) => rows.some((ry) => Math.abs(y - ry) < 6);
    const spots = [];
    for (let i = 0; i < n; i++) {
      for (let t = 0; t < 200; t++) {
        const y = rows[Math.floor(Math.random() * rows.length)], x = a.x + 50 + Math.random() * (a.w - 100);
        if (spots.every((p) => Math.hypot(p.x - x, p.y - y) > r * 2.6) && onPipe(x, y)) { spots.push({ x, y }); break; }
      }
    }
    this.next = 1;
    this.holes = spots.map((p, i) => {
      const c = this.add.container(p.x, p.y);
      const ring = this.add.graphics();
      ring.fillStyle(C.outline, 1).fillRect(-r, -r, r * 2, r * 2);
      ring.fillStyle(C.alert, 1).fillRect(-r + 4, -r + 4, r * 2 - 8, r * 2 - 8);
      ring.fillStyle(C.outline, 1).fillRect(-r + 9, -r + 9, r * 2 - 18, r * 2 - 18);
      const num = this.add.text(0, 1, String(i + 1), { fontFamily: FONT_PIX, fontSize: '34px', color: '#FFF3DC' }).setOrigin(0.5);
      c.add([ring, num]);
      c.n = i + 1; c.num = num; c.ring = ring; c.done = false;
      c.setSize(r * 2.4, r * 2.4).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.hit(c));
      c.steam = this.time.addEvent({ delay: 170, loop: true, callback: () => !c.done && spark(this, p.x + Phaser.Math.Between(-8, 8), p.y - r, C.white, { dx: Phaser.Math.Between(-16, 16), dy: -34, ms: 520 }) });
      return c;
    });
    this.cursor = this.add.graphics().setDepth(5);
    this.status = this.add.text(a.x + 10, a.y + a.h - 28, '', { fontFamily: FONT_PIX, fontSize: '26px', color: INK, backgroundColor: '#FFF3DC', padding: { x: 8, y: 0 } });
    for (let k = 1; k <= 9; k++) this.input.keyboard.on('keydown-' + (['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'][k]), () => { const c = this.holes.find((h) => h.n === k); if (c) this.hit(c); });
    this.refresh();
  }
  refresh() {
    this.status.setText(`Siguiente: fuga ${Math.min(this.next, this.holes.length)}   Tapadas: ${this.next - 1}/${this.holes.length}`);
  }
  tick(time) {
    const c = this.holes.find((h) => h.n === this.next);
    this.cursor.clear();
    if (!c) return;
    const k = 4 + Math.round(Math.sin(time / 160) * 2);
    this.cursor.lineStyle(4, C.brand, 1).strokeRect(c.x - 34 - k, c.y - 34 - k, 68 + k * 2, 68 + k * 2);
  }
  hit(c) {
    if (this.finished || c.done) return;
    if (c.n !== this.next) { this.miss(); spark(this, c.x, c.y, C.alert, { dy: -24 }); this.status.setText(`Esa es la fuga ${c.n}: ahora toca la ${this.next}`); this.time.delayedCall(900, () => this.refresh()); return; }
    c.done = true; c.steam.remove();
    sfx.tap();
    c.ring.clear();
    c.ring.fillStyle(C.outline, 1).fillRect(-27, -27, 54, 54);
    c.ring.fillStyle(C.cream, 1).fillRect(-23, -23, 46, 46);
    c.ring.fillStyle(C.life, 1).fillRect(-15, -4, 8, 8).fillRect(-7, 4, 8, 8).fillRect(1, -4, 8, 8).fillRect(9, -12, 8, 8);   // marca de visto
    c.num.setVisible(false);
    for (let i = 0; i < 6; i++) spark(this, c.x, c.y, C.life, { dx: Phaser.Math.Between(-30, 30), dy: Phaser.Math.Between(-30, 10), ms: 450 });
    this.next++;
    this.progress = (this.next - 1) / this.holes.length;
    this.refresh();
    if (this.next > this.holes.length) this.win();
  }
}

// ── Energía: limpiar el polvo lunar de los paneles con el cepillo ──
export class DustGame extends MiniGame {
  constructor() { super('Dust'); }
  instructions() { return 'Frota el polvo con el cepillo: arrastra, o usa las flechas y mantén Espacio.'; }
  build() {
    const a = this.area, g = this.add.graphics();
    const cols = 4, rows = 3, gap = 8;
    const cw = (a.w - gap * (cols - 1)) / cols, ch = (a.h - gap * (rows - 1)) / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = a.x + i * (cw + gap), y = a.y + j * (ch + gap);
      box(g, x, y, cw, ch, C.sky, { shadow: 3 });
      g.lineStyle(2, C.mid, 1);
      for (let k = 1; k < 4; k++) g.lineBetween(x + (cw * k) / 4, y + 3, x + (cw * k) / 4, y + ch - 3);
      for (let k = 1; k < 3; k++) g.lineBetween(x + 3, y + (ch * k) / 3, x + cw - 3, y + (ch * k) / 3);
      g.fillStyle(C.white, 0.35).fillRect(x + 6, y + 6, 16, 5).fillRect(x + 6, y + 6, 5, 16);   // brillo de cada panel
    }
    const n = this.tired ? 10 : 7, r = Math.max(24, Math.min(40, a.w / 12));
    this.blobs = scatter(a, n, r).map((p) => {
      const c = this.add.container(p.x, p.y), d = this.add.graphics(), cell = Math.round(r / 3.2);
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
        if (Math.hypot(i, j) > 3.1 || Math.random() < 0.18) continue;
        d.fillStyle(Math.random() < 0.3 ? C.cool : C.moon, 1).fillRect(i * cell, j * cell, cell, cell);
      }
      d.lineStyle(2, C.outline, 0.7).strokeCircle(0, 0, r);
      c.add(d); c.hp = 1; c.r = r * 1.25;
      return c;
    });
    this.total = this.blobs.length;
    this.brush = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
    this.brushGfx = this.add.graphics().setDepth(20);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.space = this.input.keyboard.addKey('SPACE');
    this.pct = this.add.text(a.x + 8, a.y + a.h - 30, '', { fontFamily: FONT_PIX, fontSize: '26px', color: INK, backgroundColor: '#FFF3DC', padding: { x: 8, y: 0 } }).setDepth(25);
    this.input.on('pointermove', (p) => { this.brush = { x: p.x, y: p.y }; if (p.isDown) this.rub(); });
    this.input.on('pointerdown', (p) => { this.brush = { x: p.x, y: p.y }; this.rub(); });
    this.drawBrush(); this.setPct();
  }
  setPct() { this.pct.setText(`Panel limpio: ${Math.round(this.progress * 100)} %`); }
  drawBrush() {
    const { x, y } = this.brush, g = this.brushGfx;
    g.clear();
    g.fillStyle(C.outline, 1).fillRect(x - 17, y - 13, 34, 26);
    g.fillStyle(C.brand, 1).fillRect(x - 14, y - 10, 28, 12);
    g.fillStyle(C.cream, 1).fillRect(x - 14, y + 2, 28, 8);    // cerdas
  }
  tick(time, delta) {
    const dt = Math.min(0.05, delta / 1000), sp = 330 * dt;
    const a = this.area;
    let moved = false;
    if (this.cursors.left.isDown) { this.brush.x -= sp; moved = true; }
    if (this.cursors.right.isDown) { this.brush.x += sp; moved = true; }
    if (this.cursors.up.isDown) { this.brush.y -= sp; moved = true; }
    if (this.cursors.down.isDown) { this.brush.y += sp; moved = true; }
    this.brush.x = Phaser.Math.Clamp(this.brush.x, a.x, a.x + a.w);
    this.brush.y = Phaser.Math.Clamp(this.brush.y, a.y, a.y + a.h);
    if (this.space.isDown) this.rub();
    if (moved || this.space.isDown || this.input.activePointer.isDown) this.drawBrush(); else this.drawBrush();
  }
  rub() {
    if (this.finished) return;
    const p = this.brush;
    for (const b of this.blobs) {
      if (b.hp <= 0 || Math.hypot(p.x - b.x, p.y - b.y) >= b.r) continue;
      b.hp -= this.tired ? 0.06 : 0.09;
      b.setAlpha(Math.max(0, b.hp)).setScale(0.6 + 0.4 * Math.max(0, b.hp));
      if (Math.random() < 0.35) { sfx.rub(); spark(this, p.x, p.y, C.cream, { dx: Phaser.Math.Between(-24, 24), dy: Phaser.Math.Between(-24, 4), size: 4, ms: 380 }); }
      if (b.hp <= 0) { b.setVisible(false); for (let i = 0; i < 5; i++) spark(this, b.x, b.y, C.brand, { dx: Phaser.Math.Between(-26, 26), dy: Phaser.Math.Between(-26, 6), ms: 500 }); }
    }
    const left = this.blobs.reduce((s, b) => s + Math.max(0, b.hp), 0);
    this.progress = 1 - left / this.total;
    this.setPct();
    if (this.blobs.every((b) => b.hp <= 0)) this.win();
  }
}

// ── Alimentos: repetir la secuencia de las válvulas de riego ──
const VALVES = [
  { name: 'Círculo', color: C.brand },
  { name: 'Cuadrado', color: C.life },
  { name: 'Triángulo', color: C.tech },
  { name: 'Rombo', color: C.alert }
];
function glyph(g, i, cx, cy, s, fill) {
  g.fillStyle(fill, 1).lineStyle(4, C.outline, 1);
  if (i === 0) { g.fillCircle(cx, cy, s).strokeCircle(cx, cy, s); }
  else if (i === 1) { g.fillRect(cx - s, cy - s, s * 2, s * 2).strokeRect(cx - s, cy - s, s * 2, s * 2); }
  else if (i === 2) { g.fillTriangle(cx, cy - s, cx + s, cy + s, cx - s, cy + s).strokeTriangle(cx, cy - s, cx + s, cy + s, cx - s, cy + s); }
  else { g.fillPoints([{ x: cx, y: cy - s * 1.15 }, { x: cx + s * 1.15, y: cy }, { x: cx, y: cy + s * 1.15 }, { x: cx - s * 1.15, y: cy }], true).strokePoints([{ x: cx, y: cy - s * 1.15 }, { x: cx + s * 1.15, y: cy }, { x: cx, y: cy + s * 1.15 }, { x: cx - s * 1.15, y: cy }], true); }
}
export class WaterGame extends MiniGame {
  constructor() { super('Water'); }
  instructions() { return 'Mira el orden de las válvulas. Después repítelo (clic, toque o teclas 1 a 4).'; }
  build() {
    const a = this.area, bg = this.add.graphics();
    box(bg, a.x, a.y, a.w, a.h, C.moon, { shadow: 0 });
    const top = 54, gap = 14;
    const cw = (a.w - gap * 3) / 2, ch = (a.h - top - gap * 2 - 4) / 2;
    this.pads = VALVES.map((v, i) => {
      const x = a.x + gap + (i % 2) * (cw + gap) - 2, y = a.y + top + Math.floor(i / 2) * (ch + gap);
      const gfx = this.add.graphics();
      const zone = this.add.zone(x, y, cw, ch).setOrigin(0).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.press(i));
      const num = this.add.text(x + 10, y + 4, String(i + 1), { fontFamily: FONT_PIX, fontSize: '34px', color: INK });
      this.add.text(x + cw - 10, y + ch - 8, v.name, { fontFamily: FONT, fontSize: '15px', fontStyle: '700', color: INK }).setOrigin(1, 1);
      const p = { gfx, x, y, cw, ch, i, zone, num };
      this.paint(p, false);
      return p;
    });
    this.dots = this.add.graphics();
    this.state = this.add.text(a.x + 12, a.y + 10, '', { fontFamily: FONT_PIX, fontSize: '30px', color: INK });
    const len = this.tired ? 5 : 4;
    this.seq = Array.from({ length: len }, () => Phaser.Math.Between(0, 3));
    ['ONE', 'TWO', 'THREE', 'FOUR'].forEach((k, i) => this.input.keyboard.on('keydown-' + k, () => this.press(i)));
    this.drawDots();
    this.time.delayedCall(500, () => this.play());
  }
  paint(p, lit) {
    const g = p.gfx, v = VALVES[p.i];
    g.clear();
    box(g, p.x, p.y, p.cw, p.ch, lit ? v.color : C.cream, { shadow: lit ? 1 : 5 });
    glyph(g, p.i, p.x + p.cw / 2, p.y + p.ch / 2 + 2, Math.min(p.cw, p.ch) * 0.24, lit ? C.white : v.color);
    if (lit) g.lineStyle(6, C.outline, 1).strokeRect(p.x + 6, p.y + 6, p.cw - 12, p.ch - 12);
  }
  drawDots() {
    const g = this.dots, a = this.area;
    g.clear();
    const n = this.seq.length;
    for (let k = 0; k < n; k++) {
      const x = a.x + a.w - 24 - (n - 1 - k) * 22, y = a.y + 26, on = k < (this.pos || 0);
      g.fillStyle(on ? C.life : C.mid, 1).fillRect(x - 8, y - 8, 16, 16).lineStyle(3, C.outline, 1).strokeRect(x - 8, y - 8, 16, 16);
    }
  }
  flash(i, ms = 380) {
    const p = this.pads[i];
    this.paint(p, true); sfx.light(i);
    this.time.delayedCall(ms, () => p.gfx.active && this.paint(p, false));
  }
  play() {
    if (this.finished) return;
    this.listening = false; this.pos = 0; this.drawDots();
    this.state.setText('Mira…');
    this.seq.forEach((i, k) => this.time.delayedCall(k * 640, () => !this.finished && this.flash(i)));
    this.time.delayedCall(this.seq.length * 640, () => { if (!this.finished) { this.listening = true; this.state.setText('Tu turno'); } });
  }
  press(i) {
    if (!this.listening || this.finished) return;
    this.flash(i, 220);
    if (this.seq[this.pos] !== i) {
      this.miss();
      this.state.setText('Ups: otra vez');
      this.listening = false;
      this.time.delayedCall(900, () => !this.finished && this.play());
      return;
    }
    this.pos++;
    this.drawDots();
    this.progress = Math.max(this.progress, this.pos / this.seq.length);
    if (this.pos >= this.seq.length) this.win();
  }
}

// ── Radiación: leer el dosímetro cuando la aguja está en la zona de lectura ──
// La escala es del juego (0 a 30). La lectura normal de referencia en órbita lunar es ≈ 13 μGy/h (NASA RadLab, instrumento CRaTER del LRO).
export class DoseGame extends MiniGame {
  constructor() { super('Dose'); }
  instructions() { return 'Pulsa «Leer» (o Espacio) cuando la aguja esté sobre la zona verde. Tres lecturas.'; }
  build() {
    const a = this.area;
    this.cx = a.x + a.w / 2;
    this.cy = a.y + a.h * 0.74;
    this.r = Math.min(a.w / 2 - 22, a.h * 0.58);
    this.need = 3; this.hits = 0;
    this.zoneHalf = this.tired ? 0.13 : 0.18;
    this.newZone();
    this.bg = this.add.graphics();
    box(this.bg, a.x, a.y, a.w, a.h, C.cream, { shadow: 0 });
    this.dial = this.add.graphics();
    this.needle = this.add.graphics();
    this.counter = this.add.graphics();
    this.read = this.add.text(this.cx, this.cy + 10, '', { fontFamily: FONT_PIX, fontSize: '40px', color: INK }).setOrigin(0.5, 0);
    this.add.text(this.cx, this.cy + 56, 'μGy/h (escala del juego)', { fontFamily: FONT, fontSize: '14px', fontStyle: '700', color: '#4b4380' }).setOrigin(0.5, 0);
    this.add.text(a.x + 10, a.y + a.h - 22, 'Referencia real: ≈ 13 μGy/h en órbita lunar (NASA RadLab · CRaTER)', { fontFamily: FONT, fontSize: '13px', color: '#4b4380' });
    const tap = () => this.tap();
    const bw = 170, bh = 44, bx = this.cx - bw / 2, by = a.y + 8;
    this.btn = this.add.graphics(); box(this.btn, bx, by, bw, bh, C.brand, { shadow: 4 });
    this.add.text(this.cx, by + bh / 2, 'Leer  [Espacio]', { fontFamily: FONT_PIX, fontSize: '28px', color: INK }).setOrigin(0.5);
    this.add.zone(a.x, a.y, a.w, a.h).setOrigin(0).setInteractive({ useHandCursor: true }).on('pointerdown', tap);
    this.input.keyboard.on('keydown-SPACE', tap);
    this.t0 = performance.now();
    this.speed = this.tired ? 2.3 : 1.8;
    this.drawDial();
  }
  newZone() { this.zone = Math.PI * (0.2 + Math.random() * 0.6); }
  angle() { const t = (performance.now() - this.t0) / 1000; return Math.PI * (0.5 - 0.5 * Math.cos(t * this.speed)); }
  valueOf(ang) { return (ang / Math.PI) * 30; }
  drawDial() {
    const { cx, cy, r } = this, g = this.dial;
    g.clear();
    g.fillStyle(C.white, 1).slice(cx, cy, r, Math.PI, 0, false).fillPath();
    g.lineStyle(5, C.outline, 1).beginPath().arc(cx, cy, r, Math.PI, 0, false).strokePath();
    // marcas de la escala cada 5 unidades
    for (let v = 0; v <= 30; v += 5) {
      const ang = Math.PI + (v / 30) * Math.PI, c1 = Math.cos(ang), s1 = Math.sin(ang);
      g.lineStyle(v % 10 === 0 ? 4 : 2, C.outline, 1).lineBetween(cx + c1 * r * 0.84, cy + s1 * r * 0.84, cx + c1 * r * 0.97, cy + s1 * r * 0.97);
    }
    g.lineStyle(r * 0.16, C.life, 1).beginPath().arc(cx, cy, r * 0.7, Math.PI + this.zone - this.zoneHalf, Math.PI + this.zone + this.zoneHalf, false).strokePath();
    g.lineStyle(3, C.outline, 1).strokeCircle(cx, cy, r * 0.7 - r * 0.08).beginPath().arc(cx, cy, r * 0.62, Math.PI, 0).strokePath();
    g.lineStyle(4, C.outline, 1).lineBetween(cx - r, cy, cx + r, cy);
    const c = this.counter, a = this.area;
    c.clear();
    for (let k = 0; k < this.need; k++) { const x = a.x + 14 + k * 28, y = a.y + 14; c.fillStyle(k < this.hits ? C.life : C.mid, 1).fillRect(x, y, 22, 22).lineStyle(3, C.outline, 1).strokeRect(x, y, 22, 22); }
  }
  tick() {
    const ang = this.angle(), { cx, cy, r } = this;
    this.needle.clear();
    this.needle.lineStyle(7, C.alert, 1).lineBetween(cx, cy, cx - Math.cos(ang) * r * 0.9, cy - Math.sin(ang) * r * 0.9);
    this.needle.fillStyle(C.outline, 1).fillRect(cx - 12, cy - 12, 24, 24);
    this.read.setText(this.valueOf(ang).toFixed(1).replace('.', ','));
    const inZone = Math.abs(ang - this.zone) <= this.zoneHalf;
    this.read.setColor(inZone ? '#2f8f3f' : INK);
  }
  tap() {
    if (this.finished) return;
    const ang = this.angle();
    if (Math.abs(ang - this.zone) <= this.zoneHalf) {
      this.hits++; sfx.good();
      this.progress = this.hits / this.need;
      for (let i = 0; i < 6; i++) spark(this, this.cx, this.cy - this.r * 0.5, C.life, { dx: Phaser.Math.Between(-40, 40), dy: Phaser.Math.Between(-40, 0), ms: 500 });
      if (this.hits >= this.need) { this.drawDial(); this.win(); return; }
      this.newZone(); this.drawDial();
    } else this.miss();
  }
}

// ── Comunicaciones: orientar la antena hacia la Tierra y mantenerla alineada ──
export class AntennaGame extends MiniGame {
  constructor() { super('Antenna'); }
  instructions() { return 'Gira la antena hacia la Tierra (arrastra, o usa ← → / A D) y mantenla alineada.'; }
  build() {
    const a = this.area;
    this.cx = a.x + a.w / 2;
    this.cy = a.y + a.h / 2 + 8;
    this.r = Math.min(a.w, a.h) / 2 - 34;
    this.need = 3; this.done = 0; this.hold = 0;
    this.ang = -Math.PI / 2;
    this.tol = this.tired ? 0.16 : 0.22;
    this.bg = this.add.graphics(); box(this.bg, a.x, a.y, a.w, a.h, C.outline, { shadow: 0 });
    for (let i = 0; i < 40; i++) this.bg.fillStyle(C.moon, Math.random() * 0.8 + 0.2).fillRect(a.x + 6 + Math.random() * (a.w - 12), a.y + 6 + Math.random() * (a.h - 12), 3, 3);   // cielo con estrellas
    this.ring = this.add.graphics();
    this.dish = this.add.graphics();
    this.earth = this.add.graphics();
    this.counter = this.add.graphics();
    this.sig = this.add.text(a.x + a.w - 12, a.y + 8, '', { fontFamily: FONT_PIX, fontSize: '28px', color: '#FFF3DC' }).setOrigin(1, 0);
    this.add.text(a.x + 12, a.y + a.h - 22, 'Señal Tierra–Luna: 1,35 s (NASA/JPL Horizons)', { fontFamily: FONT, fontSize: '13px', color: '#C5D2FF' });
    this.newTarget();
    const zone = this.add.zone(a.x, a.y, a.w, a.h).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', (p) => { this.ang = Math.atan2(p.y - this.cy, p.x - this.cx); });
    this.input.on('pointermove', (p) => { if (p.isDown) this.ang = Math.atan2(p.y - this.cy, p.x - this.cx); });
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,A,D');
  }
  newTarget() {
    let t;
    do { t = -Math.PI + Math.random() * Math.PI * 2; } while (Math.abs(Phaser.Math.Angle.Wrap(t - this.ang)) < 1);
    this.target = t;
    const g = this.earth, x = this.cx + Math.cos(t) * (this.r + 18), y = this.cy + Math.sin(t) * (this.r + 18);
    g.clear();
    g.fillStyle(C.outline, 1).fillCircle(x, y, 19).fillStyle(C.sky, 1).fillCircle(x, y, 16);
    g.fillStyle(C.life, 1).fillRect(x - 9, y - 8, 9, 6).fillRect(x + 1, y + 1, 8, 8).fillRect(x - 6, y + 4, 5, 5);
    const c = this.counter, a = this.area;
    c.clear();
    for (let k = 0; k < this.need; k++) { const px = a.x + 14 + k * 28, py = a.y + 14; c.fillStyle(k < this.done ? C.life : C.mid, 1).fillRect(px, py, 22, 22).lineStyle(3, C.outline, 1).strokeRect(px, py, 22, 22); }
  }
  tick(time, delta) {
    const dt = Math.min(0.1, delta / 1000);
    if (this.keys.LEFT.isDown || this.keys.A.isDown) this.ang -= 2.2 * dt;
    if (this.keys.RIGHT.isDown || this.keys.D.isDown) this.ang += 2.2 * dt;
    const diff = Math.abs(Phaser.Math.Angle.Wrap(this.ang - this.target)), on = diff <= this.tol;
    this.hold = on ? this.hold + dt : 0;
    const { cx, cy, r } = this;
    this.ring.clear();
    this.ring.lineStyle(12, C.mid, 1).strokeCircle(cx, cy, r);
    this.ring.lineStyle(12, C.life, 1).beginPath().arc(cx, cy, r, this.target - this.tol, this.target + this.tol).strokePath();
    this.ring.lineStyle(3, C.cream, 1).strokeCircle(cx, cy, r + 8).strokeCircle(cx, cy, r - 8);
    if (on) this.ring.lineStyle(9, C.brand, 1).beginPath().arc(cx, cy, r - 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, this.hold / 0.6)).strokePath();
    const strength = Math.max(0, 1 - diff / 1.2);
    this.sig.setText(`Señal ${Math.round(strength * 5)} de 5`);
    const g = this.dish; g.clear();
    const ex = cx + Math.cos(this.ang) * r * 0.66, ey = cy + Math.sin(this.ang) * r * 0.66;
    g.lineStyle(9, C.cream, 1).lineBetween(cx, cy, ex, ey);
    g.fillStyle(C.outline, 1).fillCircle(ex, ey, 27).fillStyle(on ? C.life : C.sky, 1).fillCircle(ex, ey, 22);
    g.fillStyle(C.white, 1).fillRect(ex - 9, ey - 9, 7, 7);                                   // reflejo del plato
    g.fillStyle(C.outline, 1).fillRect(cx - 22, cy - 22, 44, 44).fillStyle(C.cream, 1).fillRect(cx - 18, cy - 18, 36, 36);
    if (this.hold >= 0.6) {
      this.done++; this.hold = 0; sfx.good();
      this.progress = this.done / this.need;
      if (this.done >= this.need) { this.newTarget(); this.win(); return; }
      this.newTarget();
    }
  }
}
