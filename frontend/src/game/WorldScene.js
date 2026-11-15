// Mundo navegable de Vita Lunae: un solo Scene de Phaser que arma cada escenario (exterior, Zora, invernadero,
// paneles y cráter) a partir de src/world/scenes.js. Aquí solo se dibuja y se mueve; las reglas viven en el motor.
//
// Capas (profundidad): fondo → decoración → avatar y objetos (ordenados por la posición de los pies)
// → primer plano (paneles delanteros) → marcadores → HUD (HTML, fuera de Phaser).
import Phaser from 'phaser';
import { bus, session, canWalk } from '../bus.js';
import { SCENES, U, OUTSIDE, step, safeSpot, doorAt, zoneState, dist, nextHop, doorTarget, placeOf } from '../world/scenes.js';
import { findPath } from '../world/path.js';
import { avatarUri, avatarKey, defaultAvatar, normalizeAvatar } from '../world/avatar.js';
import { renderSheet, PXM } from '../world/lunar.js';
import { buildWalkSheet, WALK_FRAMES, WALK_FPS, WALK_W, WALK_H, WALK_OX, WALK_OY, WALK_V, STAND_FRAME, choosePose } from '../world/walk.js';
import { cliffCanvas, mapSampler, CLIFF_COLORS } from '../world/cliff.js';
import { irisClose, irisOpen } from '../ui/iris.js';
import { sfx } from './sfx.js';
import { C } from '../theme.js';

export const FONT = '"Atkinson Hyperlegible", ui-rounded, system-ui, sans-serif';
export const FONT_PIX = '"Jersey 10", "Atkinson Hyperlegible", system-ui, sans-serif';
const BASE = import.meta.env.BASE_URL;
const MAPS = { 'mapa-exterior': 'exterior', 'mapa-zora': 'zora', 'mapa-invernadero': 'invernadero', 'mapa-paneles': 'paneles', 'mapa-crater': 'crater' };

const ENERGY_BAD = ['red_sobrecargada', 'energia_comprometida', 'fallo_red', 'apagones'];
const COMMS_BAD = ['sin_respuesta', 'aislamiento', 'enlace_saturado', 'rescate_retrasado'];
const CROP_STATES = [
  ['contaminacion', 0x8d6fc1, '☣'], ['malestar_digestivo', 0x8d6fc1, '☣'], ['riego_excesivo', 0x4d62b9, '💧'],
  ['cultivo_retrasado', 0xe68a37, '⏳'], ['consumo_excesivo', 0x7c90df, '🥀']
];
const RADIATION_BAD = ['exposicion_sin_control', 'traje_comprometido', 'eva_riesgosa', 'eva_sin_rescate'];

// Nave de carga: pixel art propio (la del diseño original viene incrustada en la plataforma y no existe suelta).
const SHIP = [
  '....oooooo....', '...occccccco..', '..occwwwwcco..', '..ocwwttwwco..', '.occcwwwwcccco', '.oyyyyyyyyyyo.', '.oyyyddddyyyo.', '.oyyyddddyyyo.', '.ooyyyyyyyyoo.', '..ocoocccooco.', '.oo.o....o.oo.', '.o..oo..oo..o.'
];
const SHIP_COLORS = { o: 0x27234c, c: 0xfff3dc, w: 0xc5d2ff, t: 0x44d9e6, y: 0xffc145, d: 0xe68a37 };

const LUN_CACHE = new Map(); // hojas de cuadros ya generadas (avatar + casco + animación)
const SPECIAL = new Set(['salto', 'caida', 'muestra']); // animaciones de una vez: bloquean el movimiento


export class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }

  init(data) {
    this.sid = data?.id || 'exterior';
    this.startAt = data?.x != null ? { x: data.x, y: data.y } : null;
    this.arrive = !!data?.arrive;
    this.gen = (this.gen || 0) + 1; // cada reinicio de escena invalida las cargas pendientes de la anterior
    this.nudge = 0;
    this.cfg = SCENES[this.sid];
    this.ready = false;
    this.surroundBox = null;
  }

  preload() {
    for (const [key, name] of Object.entries(MAPS)) if (!this.textures.exists(key)) this.load.image(key, `${BASE}assets/mapas/${name}.png`);
    if (!this.textures.exists('mapa-paneles-frente')) this.load.image('mapa-paneles-frente', `${BASE}assets/mapas/paneles-frente.png`);
  }

  create() {
    this.cleanups = [];
    this.alive = true;
    this.events.once('shutdown', () => this.dispose());
    this.view = session.view;
    this.avatar = normalizeAvatar(this.view?.world?.avatar) || defaultAvatar();
    this.lockUntil = 0;
    this.hopT = 0; this.moving = false; this.facing = 1;
    this.route = []; this.insideZones = {}; this.prompt = null; this.evaClock = 0; this.saveClock = 0; this.cur = null;
    // La instancia de la escena se reutiliza al reiniciar: se limpian las referencias a objetos ya destruidos.
    this.ship = null; this.hover = null; this.commsLamp = null; this.trayFx = null; this.target = null; this.shipSeen = undefined; this.shipAnim = false;
    this.sheets = {}; this.cur = null; this.special = false; this.running = false; this.pose = 'side';
    this.makeShipTexture();
    this.loadAvatar(this.avatar).then(() => { if (this.alive) this.build(); });
  }

  // ── Texturas ────────────────────────────────────────────────────────────────
  makeShipTexture() {
    if (this.textures.exists('nave-carga')) return;
    const k = 2, w = SHIP[0].length * k, h = SHIP.length * k, cv = this.textures.createCanvas('nave-carga', w, h), ctx = cv.getContext();
    SHIP.forEach((row, y) => [...row].forEach((ch, x) => { if (SHIP_COLORS[ch]) { ctx.fillStyle = '#' + SHIP_COLORS[ch].toString(16).padStart(6, '0'); ctx.fillRect(x * k, y * k, k, k); } }));
    cv.refresh();
  }

  loadAvatar(a) {
    const jobs = [false, true].flatMap((helmet) => ['front', 'back'].map((view) => new Promise((res) => {
      const key = avatarKey(a, helmet) + (view === 'back' ? ':b' : '');
      if (this.textures.exists(key)) return res();
      const img = new Image();
      img.onload = () => { if (!this.textures.exists(key)) this.textures.addImage(key, img); res(); };
      img.onerror = res;
      img.src = avatarUri(a, helmet, view);
    })));
    return Promise.all(jobs);
  }

  // ── Borde del exterior: la meseta termina en un barranco (en lugar del fondo negro) ──
  buildSurround(W, H) {
    if (!this.textures.exists('barranco')) {
      const s = this.cfg, src = this.textures.get(s.map).getSourceImage();
      const c = cliffCanvas(document, s.w, s.h, { ground: mapSampler(document, src, s.w, s.h) });
      this.textures.addCanvas('barranco', c.canvas);
      this.textures.get('barranco').customData.offset = [c.ox, c.oy];
    }
    const [ox, oy] = this.textures.get('barranco').customData.offset;
    const img = this.add.image(-ox, -oy, 'barranco').setOrigin(0).setDepth(0.5); // encima del mapa, debajo de todo lo demás
    // La cámara puede asomarse al barranco, pero no más allá del dibujo.
    this.surroundBox = { x: -ox, y: -oy, w: img.width, h: img.height };
    void W; void H;
  }

  // ── Construcción del escenario ───────────────────────────────────────────────
  build() {
    const s = this.cfg, W = s.w * U, H = s.h * U;
    this.bg = this.add.image(0, 0, s.map).setOrigin(0, 0).setDepth(0);
    if (s.surround) this.buildSurround(W, H);
    if (s.front) this.add.image(0, s.front.y * U, s.front.tex).setOrigin(0, 0).setDepth(1e6);
    this.statusLayer = this.add.graphics().setDepth(5);
    this.decor = [];
    this.buildDecor();

    const pos = this.startAt || { ...s.spawn };
    const sp = safeSpot(this.sid, pos.x, pos.y);
    this.pos = { x: sp.x, y: sp.y };
    const helmet = OUTSIDE.has(this.sid);
    this.helmet = helmet;
    this.shadow = this.add.ellipse(0, 0, 16 * U * s.avatarScale, 5 * U * s.avatarScale, 0x27234c, 0.35).setDepth(1);
    this.ensureAnim('quieto'); this.ensureAnim('trote');
    this.hero = this.add.image(0, 0, this.sheets.quieto.key, 0).setOrigin(0.5, 1).setScale(s.avatarScale * U);
    this.play('quieto', { loop: true });
    this.markers = this.add.container(0, 0).setDepth(2e6);
    this.arrow = this.add.graphics().setDepth(2e6);
    this.nameTag = this.add.text(0, 0, this.avatar.name, { fontFamily: FONT, fontSize: '15px', fontStyle: '800', color: '#FFF3DC', stroke: '#27234C', strokeThickness: 4 }).setOrigin(0.5, 1).setDepth(2e6).setVisible(false);
    this.placeHero();
    // Si empiezas dentro de una zona (al continuar o al reaparecer), no se abre sola: hay que entrar de nuevo.
    for (const [id, z] of Object.entries(s.zones || {})) this.insideZones[id] = zoneState(z, this.pos.x, this.pos.y, false);

    this.cameras.main.setBackgroundColor(s.surround ? CLIFF_COLORS.abyssDeep : '#171426');
    this.cameras.main.startFollow(this.hero, true, 0.14, 0.14);
    const calm = !!session.settings.reducedMotion;
    this.cameras.main.fadeIn(calm ? 1 : 200, 23, 20, 38);
    { const [hx, hy] = this.heroScreen(); if (calm) irisOpen(hx, hy, 1); else this.time.delayedCall(60, () => { const [ax, ay] = this.heroScreen(); sfx.door(); irisOpen(ax, ay - 30, 520); }); }
    // Entrada: el personaje aparece por la puerta con un pequeño paso hacia adentro.
    if (this.arrive && !calm) {
      const sx = this.hero.scaleX, sy = this.hero.scaleY;
      this.nudge = 6;
      this.hero.setAlpha(0).setScale(sx * 0.82, sy * 0.82);
      this.shadow.setAlpha(0);
      this.tweens.add({ targets: this.hero, alpha: 1, scaleX: sx, scaleY: sy, duration: 320, delay: 120, ease: 'Back.easeOut' });
      this.tweens.addCounter({ from: 6, to: 0, duration: 320, delay: 120, ease: 'Sine.easeOut', onUpdate: (tw) => { this.nudge = tw.getValue(); } });
      this.tweens.add({ targets: this.shadow, alpha: 0.35, duration: 320, delay: 120 });
      this.arrivingUntil = this.time.now + 460;
    }

    this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,E,SPACE,ENTER,SHIFT');
    this.input.keyboard.removeCapture('SPACE'); // el espacio sigue sirviendo en botones HTML
    this.onPointer = (p) => {
      if (!canWalk() || this.time.now < this.lockUntil) return;
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      this.walkTo({ x: w.x / U, y: w.y / U });
    };
    this.input.on('pointerdown', this.onPointer);

    this.cleanups.push(
      bus.on('view', (v) => { this.view = v; this.refreshStatus(); this.refreshShip(); this.refreshMarkers(); }),
      bus.on('insets', () => this.fitCamera()),
      bus.on('walkToTarget', () => this.guideToMission()),
      bus.on('act', () => this.interact()),
      bus.on('teleport', (d) => this.goTo(d.scene, d.x, d.y, true)),
      bus.on('poseChanged', () => this.refreshAvatar()),
      bus.on('playAnim', (d) => this.playSpecial(d))
    );
    this.scale.on('resize', this.fitCamera, this);
    this.cleanups.push(() => this.scale.off('resize', this.fitCamera, this));

    this.ready = true;
    this.fitCamera(); // antes de 'ready' no hacía nada: zoom y límites no se aplicaban al entrar
    session.world = { scene: this.sid, x: this.pos.x, y: this.pos.y };
    session.worldScene = this;
    if (session.nextAnim) { const a = session.nextAnim; session.nextAnim = null; this.playSpecial({ name: a }); }
    this.refreshStatus(); this.refreshShip(); this.refreshMarkers();
    bus.emit('sceneReady', { scene: this.sid, name: s.name });
  }

  // Luces y vida ambiental: no cambian recursos, solo acompañan (se apagan con "menos movimiento").
  buildDecor() {
    const lights = {
      zora: [[69, 60, 0x44d9e6], [128, 60, 0xffc145], [196, 54, 0x7ed65b], [246, 64, 0x44d9e6], [360, 50, 0x44d9e6], [385, 50, 0xffc145], [196, 205, 0x44d9e6], [258, 205, 0x7ed65b], [379, 190, 0xff746a], [455, 182, 0x7ed65b]],
      invernadero: [[122, 66, 0x44d9e6], [198, 66, 0x44d9e6], [122, 114, 0x7ed65b], [198, 114, 0x7ed65b], [262, 66, 0x44d9e6], [58, 76, 0xff746a]],
      exterior: [[290, 108, 0xff746a], [337, 108, 0x44d9e6], [117, 252, 0xff746a], [101, 252, 0xff746a]],
      paneles: [[56, 126, 0x44d9e6], [198, 126, 0x44d9e6], [294, 150, 0xffc145]],
      crater: [[79, 76, 0x44d9e6], [172, 120, 0x44d9e6]]
    }[this.sid] || [];
    for (const [x, y, col] of lights) {
      const l = this.add.rectangle(x * U, y * U, 2 * U, 2 * U, col, 0.9).setDepth(y * U - 1);
      this.decor.push(l);
      if (!session.settings.reducedMotion) this.tweens.add({ targets: l, alpha: 0.25, duration: 700 + ((x * 7 + y * 3) % 600), yoyo: true, repeat: -1, delay: (x * 13) % 700 });
    }
    // antena de comunicaciones de Zora (cambia con el estado de la comunicación)
    if (this.sid === 'zora') { this.commsLamp = this.add.circle(200 * U, 39 * U, 3 * U, 0x7ed65b, 1).setDepth(2000); }
    if (this.sid === 'invernadero') {
      this.trayFx = this.cfg.trays.map(([x0, y0, x1, y1]) => ({
        box: this.add.rectangle((x0 + x1) / 2 * U, (y0 + y1) / 2 * U, (x1 - x0) * U, (y1 - y0) * U, 0, 0).setDepth(6),
        icon: this.add.text((x0 + x1) / 2 * U, y0 * U + 4, '', { fontFamily: FONT, fontSize: '26px' }).setOrigin(0.5, 0).setDepth(7)
      }));
    }
  }

  // Estado de la partida → apariencia visible del escenario.
  refreshStatus() {
    if (!this.ready) return;
    const st = this.view?.statuses || [], has = (list) => st.some((x) => list.includes(x));
    const g = this.statusLayer.clear(), s = this.cfg;
    if (this.sid === 'paneles' && has(ENERGY_BAD)) {
      g.fillStyle(0x27234c, 0.3).fillRect(0, 0, s.w * U, 208 * U);
      g.fillStyle(0x27234c, 0.22).fillTriangle(0, 0, 150 * U, 0, 0, 150 * U);
    }
    if (this.sid === 'crater' && has(RADIATION_BAD)) g.fillStyle(0xff746a, 0.12).fillRect(0, 0, s.w * U, s.h * U);
    if (this.sid === 'zora' && has(['apagones', 'fallo_red']) && !session.settings.reducedMotion) g.fillStyle(0x27234c, 0.18).fillRect(0, 0, s.w * U, s.h * U);
    if (this.commsLamp) this.commsLamp.setFillStyle(has(COMMS_BAD) ? 0xff746a : 0x7ed65b);
    if (this.trayFx) {
      this.trayFx.forEach((t, i) => {
        const hit = CROP_STATES.find(([k]) => st.includes(k));
        const own = hit && (i === 0 || hit[0] === 'contaminacion' || i % 2 === 0 || st.length > 3);
        t.box.setFillStyle(hit && own ? hit[1] : 0, hit && own ? 0.3 : 0);
        t.icon.setText(hit && own ? hit[2] : '');
      });
    }
    // cosecha lista: cuando no hay problemas de cultivo la bandeja se ve sana (sin filtro)
  }

  // La nave de carga existe solo mientras hay un pedido listo para recoger.
  refreshShip() {
    if (!this.ready || this.sid !== 'exterior') return;
    const ready = (this.view?.orders || []).some((o) => o.status === 'ready');
    const cfg = this.cfg.ship;
    if (ready && !this.ship) {
      const first = this.shipSeen === false;
      this.ship = this.add.image(cfg.x * U, cfg.y * U, 'nave-carga').setOrigin(0.5, 1).setScale(cfg.scale * U * 1.15).setDepth(cfg.y * U);
      this.ship.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      if (this.shipAnim && !session.settings.reducedMotion) {
        this.ship.y -= 120;
        this.tweens.add({ targets: this.ship, y: cfg.y * U, duration: 700, ease: 'Bounce.Out' });
        sfx.good();
      }
      if (!session.settings.reducedMotion) this.hover = this.tweens.add({ targets: this.ship, scaleY: this.ship.scaleY * 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      void first;
    } else if (!ready && this.ship) {
      const ship = this.ship;
      this.ship = null;
      this.hover?.stop();
      if (session.settings.reducedMotion) ship.destroy();
      else this.tweens.add({ targets: ship, y: ship.y - 160, alpha: 0, duration: 600, ease: 'Cubic.In', onComplete: () => ship.destroy() });
    }
    this.shipSeen = ready;
    this.shipAnim = true;
  }

  // Marcador "!" sobre el equipo del reto actual (o sobre la puerta que lleva hasta él).
  refreshMarkers() {
    if (!this.ready) return;
    this.markers.removeAll(true);
    this.target = this.currentTarget();
    if (!this.target) return;
    const t = this.target;
    const mk = this.add.text(t.x * U, (t.y - 14) * U / 1, '!', { fontFamily: FONT, fontSize: '40px', fontStyle: '900', color: '#FFC145', stroke: '#27234C', strokeThickness: 7 }).setOrigin(0.5, 1);
    this.markers.add(mk);
    if (!session.settings.reducedMotion) this.tweens.add({ targets: mk, y: mk.y - 9, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  currentTarget() {
    const v = this.view;
    if (!v?.mission || v.phase !== 'active' || v.scene !== 'mission') return null;
    const place = placeOf(v.mission);
    if (!place) return null;
    if (place.scene === this.sid) return { x: place.x, y: place.y, kind: 'point', place };
    const hop = nextHop(this.sid, place.scene);
    return hop ? { x: hop.anchor[0], y: hop.anchor[1], kind: 'door', door: hop, place } : null;
  }

  // ── Cámara ──────────────────────────────────────────────────────────────────
  fitCamera() {
    if (!this.ready) return;
    const ins = session.insets || { top: 0, bottom: 0 };
    const left = ins.left || 0;
    const W = Math.max(200, this.scale.width - left), H = Math.max(120, this.scale.height - ins.top - ins.bottom);
    const cam = this.cameras.main, s = this.cfg;
    cam.setViewport(left, ins.top, W, H);
    const portrait = W < H * 0.9;
    const across = portrait ? s.view * 0.62 : s.view;
    const zoom = Math.max(0.2, Math.min(W / (across * U), H / (Math.min(s.h, across * 0.75) * U)));
    cam.setZoom(Math.min(zoom, Math.max(W / (s.w * U), H / (s.h * U)) * 4));
    const b = this.surroundBox;
    if (b) cam.setBounds(b.x, b.y, b.w, b.h, true);
    else cam.setBounds(0, 0, s.w * U, s.h * U, true);
  }

  // ── Movimiento ──────────────────────────────────────────────────────────────
  inputVector() {
    if (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return [0, 0];
    const k = this.keys;
    let x = (k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0);
    let y = (k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0);
    if (session.joy) { x += session.joy.x; y += session.joy.y; }
    const len = Math.hypot(x, y);
    return len > 1 ? [x / len, y / len] : [x, y]; // la diagonal no es más rápida
  }

  // Afuera la gravedad es 1/6 de la terrestre y el traje pesa: se avanza despacio y con saltitos largos. Dentro de Zora se camina normal.
  mps(running) { return OUTSIDE.has(this.sid) ? (running ? 1.9 : 1.2) : (running ? 3.4 : 2.2); }
  speed() { return this.mps(false) * PXM * this.cfg.avatarScale; }

  walkTo(pt) { this.route = findPath(this.sid, this.pos, pt); }

  update(time, delta) {
    if (!this.ready) return;
    const dt = Math.min(delta, 50) / 1000; // el movimiento no depende de los fotogramas por segundo ni de pestañas dormidas
    const free = canWalk() && time >= this.lockUntil && !this.special;
    this.running = !!(free && ((this.keys.SHIFT && this.keys.SHIFT.isDown) || this.route.length > 6));
    let [vx, vy] = free ? this.inputVector() : [0, 0];
    this.keyDir = [vx, vy];
    if (free && (vx || vy)) this.route = [];
    if (free && !vx && !vy && this.route.length) {
      const n = this.route[0], d = dist(this.pos, n);
      if (d < 1.5) this.route.shift();
      else { vx = (n.x - this.pos.x) / d; vy = (n.y - this.pos.y) / d; }
    }
    this.moving = free && (vx !== 0 || vy !== 0);
    if (this.moving) {
      // Hacia dónde mira: con teclas, la dirección pulsada; siguiendo una ruta, un punto un poco más adelante
      // (la ruta va en zigzag por la grilla y mirar solo al próximo nodo hacía girar al personaje de espaldas).
      let dx = vx, dy = vy;
      if (this.route.length && !(this.keyDir && (this.keyDir[0] || this.keyDir[1]))) {
        const la = this.route[Math.min(3, this.route.length - 1)];
        dx = la.x - this.pos.x; dy = la.y - this.pos.y;
      }
      const sp = (this.effSpeed || this.speed()) * dt;
      const p = step(this.sid, this.pos.x, this.pos.y, vx * sp, vy * sp);
      this.moving = Math.abs(p.x - this.pos.x) + Math.abs(p.y - this.pos.y) > 0.001;
      this.pos = p;
      this.pose = choosePose(this.pose, dx, dy);
      if (this.pose === 'side' && Math.abs(dx) > 0.05) this.facing = dx > 0 ? 1 : -1;
      if (!this.moving) this.route = [];
    }
    this.animate(dt);
    this.placeHero();
    if (free) this.checkSpots(dt);
    this.drawArrow();
    session.world = { scene: this.sid, x: this.pos.x, y: this.pos.y };
  }

  // ── Animación del astronauta: las animaciones lunares de vita-lunae-animaciones, generadas para ESTE avatar ──
  ensureAnim(name) {
    if (this.sheets[name]) return this.sheets[name];
    const m = /^(walk|stand)-(front|back)$/.exec(name);
    if (m) {
      // de frente / de espaldas: se arma desde el sprite del kit (pasos visibles al subir y bajar)
      const imgKey = avatarKey(this.avatar, this.helmet) + (m[2] === 'back' ? ':b' : '');
      const key = `walk:${imgKey}`;
      if (!this.textures.exists(key)) {
        const tex = this.textures.addCanvas(key, buildWalkSheet(this.textures.get(imgKey).getSourceImage()));
        for (let i = 0; i <= WALK_FRAMES; i++) tex.add(i, 0, i * WALK_W, 0, WALK_W, WALK_H);
      }
      const walking = m[1] === 'walk';
      return (this.sheets[name] = { key, frames: walking ? WALK_FRAMES : 1, base: walking ? 0 : STAND_FRAME, fw: WALK_W, fh: WALK_H, ox: WALK_OX, oy: WALK_OY, T: WALK_FRAMES / WALK_FPS, v: walking ? WALK_V : 0, id: name });
    }
    const key = `lun:${avatarKey(this.avatar, false)}:${this.helmet ? 'x' : 'i'}:${name}`;
    let meta = LUN_CACHE.get(key);
    if (!meta) { meta = renderSheet(name, this.avatar, { bare: !this.helmet, fps: name === 'quieto' ? 6 : 12 }); LUN_CACHE.set(key, meta); }
    if (!this.textures.exists(key)) {
      const tex = this.textures.addCanvas(key, meta.canvas);
      for (let i = 0; i < meta.frames; i++) tex.add(i, 0, i * meta.fw, 0, meta.fw, meta.fh);
    }
    return (this.sheets[name] = { key, ...meta });
  }

  play(name, { loop = false, rate = 1, onDone = null } = {}) {
    this.cur = { name, t: 0, loop, rate, onDone };
    this.special = SPECIAL.has(name) && !loop;
    this.applyFrame();
  }

  // Animación de una vez (salto al lograr una tarea, caída sin aire, tomar una muestra). Bloquea el movimiento mientras dura.
  playSpecial({ name, rate = 1, onDone = null }) {
    if (!this.ready || !name) { onDone?.(); return; }
    this.ensureAnim(name);
    this.route = [];
    this.play(name, { loop: false, rate, onDone: () => { this.special = false; onDone?.(); } });
  }

  applyFrame() {
    const c = this.cur, sh = this.sheets[c.name];
    if (!sh || !this.hero || !this.hero.scene) return; // el sprite puede estar destruido si la escena se reinició
    const idx = Math.min(sh.frames - 1, Math.floor((c.t / sh.T) * sh.frames));
    this.hero.setTexture(sh.key, (sh.base || 0) + idx).setOrigin(sh.ox / sh.fw, sh.oy / sh.fh);
  }

  animate(dt) {
    if (this.avatarLoading || !this.cur) return;
    const sc = this.cfg.avatarScale;
    if (!this.special) {
      let want;
      // De costado se usa el perfil lunar (con casco afuera y con su peinado adentro de Zora); de frente y de espaldas, el sprite del kit.
      if (this.moving) want = this.pose === 'side' ? (this.running ? 'esqui' : 'trote') : 'walk-' + this.pose;
      else want = this.pose === 'side' ? 'quieto' : 'stand-' + this.pose;
      if (this.cur.name !== want || !this.sheets[want]) { this.ensureAnim(want); this.play(want, { loop: true }); }
      if (this.moving) {
        // Física de verdad: la velocidad sale de m/s reales (afuera ≈ 1,2 al trote y 1,9 al esquí: lunar y con traje; dentro 2,2 y 3,4) y de la escala del
        // sprite (1 m = 22 px lógicos); el ritmo de los pasos = velocidad / velocidad de la animación, así los pies no patinan.
        const sh = this.sheets[want], mps = this.mps(this.running);
        this.cur.rate = Math.max(0.4, Math.min(2.4, mps / sh.v));
        this.effSpeed = this.cur.rate * sh.v * PXM * sc;
      }
    }
    const c = this.cur, sh = this.sheets[c.name] || this.ensureAnim(c.name);
    c.t += dt * c.rate;
    if (c.loop) c.t %= sh.T;
    else if (c.t >= sh.T) { c.t = sh.T - 1e-6; const d = c.onDone; c.onDone = null; this.applyFrame(); d?.(); }
    this.applyFrame();
    const s = sc * U;
    this.hero.setScale(s * (this.pose === 'side' ? this.facing : 1), s);
  }

  placeHero() {
    const x = this.pos.x * U, y = this.pos.y * U;
    const q = this.cfg.avatarScale * U; // un píxel del sprite en píxeles de mundo
    this.hero.setPosition(Math.round(x / q) * q, Math.round(y / q) * q + (this.nudge || 0)).setDepth(y);
    this.shadow.setPosition(x, y - 1).setDepth(y - 1);
    this.nameTag.setPosition(x, y - 52 * this.cfg.avatarScale * U - 6);
  }

  // ── Interacción ─────────────────────────────────────────────────────────────
  candidates() {
    const out = [], s = this.cfg, p = this.pos;
    for (const pt of s.points || []) { if (pt.hidden) continue; const d = dist(p, pt); if (d <= pt.r) out.push({ type: 'point', ref: pt, d }); }
    for (const dr of s.doors || []) {
      const near = dr.mode === 'point' ? doorAt(this.sid, p.x, p.y, 0) : doorAt(this.sid, p.x, p.y, 6);
      if (near) out.push({ type: 'door', ref: dr, d: dist(p, { x: dr.anchor[0], y: dr.anchor[1] }) * 0.8 });
    }
    if (this.ship && dist(p, { x: this.cfg.ship.x, y: this.cfg.ship.y }) <= 26) out.push({ type: 'ship', ref: { id: 'nave', label: 'Nave de carga' }, d: 0 });
    return out.sort((a, b) => a.d - b.d);
  }

  checkSpots() {
    const near = this.candidates()[0] || null;
    const key = near ? near.type + ':' + near.ref.id : '';
    if (key !== (this.prompt?.key || '')) {
      this.prompt = near ? { key, ...near } : null;
      bus.emit('prompt', near ? this.describe(near) : null);
    }
    // plataforma: abre la tienda al entrar y no se vuelve a abrir hasta salir de la zona exterior
    for (const [id, z] of Object.entries(this.cfg.zones || {})) {
      const was = !!this.insideZones[id], now = zoneState(z, this.pos.x, this.pos.y, was);
      this.insideZones[id] = now;
      if (now && !was) bus.emit('zone', { id, label: z.label });
    }
    if (this.keys && [this.keys.E, this.keys.SPACE, this.keys.ENTER].some((k) => Phaser.Input.Keyboard.JustDown(k))) this.interact();
    this.evaClock += 0; // el aire del traje se descuenta en tickEva (1 vez por segundo)
  }

  describe(c) {
    if (c.type === 'door') return { key: 'door:' + c.ref.id, label: c.ref.label, kind: 'door' };
    if (c.type === 'ship') return { key: 'ship', label: 'Recoger el pedido', kind: 'pickup' };
    return { key: 'point:' + c.ref.id, label: c.ref.label, kind: c.ref.kind, point: c.ref };
  }

  interact() {
    if (!canWalk() || !this.prompt || this.time.now < this.lockUntil) return;
    const c = this.prompt;
    if (c.type === 'door') { this.useDoor(c.ref); return; }
    if (c.type === 'ship') { bus.emit('interact', { kind: 'pickup' }); return; }
    sfx.tap();
    bus.emit('interact', { kind: c.ref.kind, point: c.ref, scene: this.sid });
  }

  // ── Cambios de escenario ────────────────────────────────────────────────────
  useDoor(d) {
    if (d.needsTank) { bus.emit('exitRequest', d); return; } // la esclusa pide un tanque lleno: lo decide el motor
    this.goTo(d.to.scene, d.to.x, d.to.y);
  }

  // Posición del personaje en la pantalla (para centrar la cortina circular).
  heroScreen() {
    const cam = this.cameras.main, v = cam.worldView;
    return [(this.hero.x - v.x) * cam.zoom, (this.hero.y - v.y) * cam.zoom];
  }

  goTo(sceneId, x, y, instant = false) {
    if (!SCENES[sceneId] || this.time.now < this.lockUntil) return;
    this.lockUntil = this.time.now + 700; // bloqueo breve contra entradas repetidas
    this.route = [];
    const done = () => {
      bus.emit('prompt', null);
      session.world = { scene: sceneId, x, y };
      bus.emit('sceneChange', { from: this.sid, to: sceneId, x, y });
      this.scene.restart({ id: sceneId, x, y, arrive: !instant });
    };
    sfx.tap();
    if (instant || session.settings.reducedMotion) { done(); return; }
    // Salida: el personaje cruza la puerta (se achica y se desvanece) mientras la cámara se oscurece.
    sfx.door();
    this.tweens.add({ targets: [this.hero, this.shadow], alpha: 0, scaleX: '*=0.7', scaleY: '*=0.7', duration: 300, delay: 120, ease: 'Sine.easeIn' });
    const [hx, hy] = this.heroScreen();
    irisClose(hx, hy - 30, 460).then(done);
  }

  // ── Guía ────────────────────────────────────────────────────────────────────
  guideToMission() {
    const t = this.currentTarget();
    if (!t) return;
    const goal = t.kind === 'door' ? { x: t.door.anchor[0], y: t.door.anchor[1] } : { x: t.x, y: t.y };
    this.walkTo(goal);
  }

  drawArrow() {
    const g = this.arrow.clear();
    const t = this.target;
    if (!t || !session.settings.guide || !canWalk()) return;
    const d = dist(this.pos, t);
    if (d < (t.place?.r || 20) + 14) return;
    const a = Math.atan2(t.y - this.pos.y, t.x - this.pos.x), r = 22 * U * this.cfg.avatarScale + 14;
    const cx = this.pos.x * U + Math.cos(a) * r, cy = this.pos.y * U - 16 * U * this.cfg.avatarScale + Math.sin(a) * r;
    g.fillStyle(C.brand, 1).lineStyle(3, C.outline, 1);
    const p = (da, rad) => [cx + Math.cos(a + da) * rad, cy + Math.sin(a + da) * rad];
    g.fillTriangle(...p(0, 13), ...p(2.5, 9), ...p(-2.5, 9)).strokeTriangle(...p(0, 13), ...p(2.5, 9), ...p(-2.5, 9));
  }

  refreshAvatar() {
    const a = normalizeAvatar(session.view?.world?.avatar);
    if (!a) return;
    this.avatar = a;
    this.sheets = {};
    this.avatarLoading = true; // mientras cargan las texturas del avatar nuevo no se arman animaciones
    const gen = this.gen;
    this.loadAvatar(a).then(() => { this.avatarLoading = false; if (gen !== this.gen || !this.alive || !this.hero || !this.hero.scene) return; this.ensureAnim('quieto'); this.ensureAnim('trote'); this.play('quieto', { loop: true }); });
  }

  dispose() {
    this.ready = false;
    this.alive = false;
    this.cleanups?.forEach((fn) => fn && fn());
    this.input?.off('pointerdown', this.onPointer);
    this.tweens?.killAll();
    if (session.worldScene === this) session.worldScene = null;
    bus.emit('prompt', null);
  }
}
