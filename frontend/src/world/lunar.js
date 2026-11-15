// Movimiento lunar del astronauta: las 14 animaciones de vita-lunae-animaciones, generadas en código para CUALQUIER avatar.
// Perfil derecho, esqueleto con cinemática inversa (los pies no patinan) y física real (g = 1,62 m/s² en la Luna).
// Fuentes: Apollo Lunar Surface Journal «Lunar Gaits», Carr y McGee 2009, Ackermann y van den Bogert 2012, Moon Fact Sheet (ver docs).
import { PALETTE as T } from '../theme.js';
import { SKINS, HAIRS, EYES, SUITS } from './avatar.js';

const P = { ink: T.outline, sky: T.sky, mid: T.mid, light: T.moon, paper: T.cream, white: T.white, main: T.brand, shade: T.warm, aqua: T.tech, green: T.life, pink: T.alert, shadow: T.cool };
const SUIT_KEY = { brand: 'main', sky: 'sky', cool: 'shadow', alert: 'pink', life: 'green', cream: 'paper' };
const matchMedia_ = () => false; void matchMedia_;
/* ===== Física ===== */
const G={moon:1.62,earth:9.81};      // m/s² (NASA Moon Fact Sheet)
const PXM=22;                        // 22 px = 1 m: con traje y mochila el astronauta mide ~1,9 m
const FPS=12;

/* ===== Colores ===== */
const _rgb=new Map(),_mix=new Map();
function rgb(h){let v=_rgb.get(h);if(!v){const n=parseInt(h.slice(1),16);v=[(n>>16)&255,(n>>8)&255,n&255];_rgb.set(h,v)}return v}
function mix(a,b,t){const k=a+b+t;let v=_mix.get(k);if(!v){const A=rgb(a),B=rgb(b);v='#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join('');_mix.set(k,v)}return v}
const dk=c=>mix(c,P.ink,.3);
function lookOf(a){const acc=P[SUIT_KEY[SUITS[a.suit][1]]];return{acc,accSh:acc===P.main?P.shade:mix(acc,P.ink,.28),skin:SKINS[a.skin][1],skinSh:SKINS[a.skin][2],hair:HAIRS[a.hair][1],hairHi:HAIRS[a.hair][2],style:a.style|0,eye:EYES[a.eyes][1],accessory:a.accessory,bare:!!a.bare,top:[10,12].includes(a.style)?-2.4:[11,3,13].includes(a.style)?-.2:-.9,back:[1,2,3,5,7,4].includes(a.style)?2.6:[10,12].includes(a.style)?.4:1.4,longH:[1,2,3,5,7].includes(a.style)}}

/* ===== Lienzo de píxeles y formas con contorno ===== */
class Buf{constructor(w,h){this.w=w;this.h=h;this.d=new Uint8ClampedArray(w*h*4);this.m=new Int32Array(w*h);this.stamp=0}
 clear(){this.d.fill(0)}
 put(x,y,c){x|=0;y|=0;if(x<0||y<0||x>=this.w||y>=this.h)return;const i=(y*this.w+x)*4,v=rgb(c);this.d[i]=v[0];this.d[i+1]=v[1];this.d[i+2]=v[2];this.d[i+3]=255}
 putRGB(x,y,r,g,b){x|=0;y|=0;if(x<0||y<0||x>=this.w||y>=this.h)return;const i=(y*this.w+x)*4;this.d[i]=r;this.d[i+1]=g;this.d[i+2]=b;this.d[i+3]=255}
 row(y,c){for(let x=0;x<this.w;x++)this.put(x,y,c)}}
class Shape{constructor(B){this.B=B;this.id=++B.stamp;this.x0=1e9;this.y0=1e9;this.x1=-1e9;this.y1=-1e9}
 add(x,y){const B=this.B;if(x<0||y<0||x>=B.w||y>=B.h)return;B.m[y*B.w+x]=this.id;if(x<this.x0)this.x0=x;if(x>this.x1)this.x1=x;if(y<this.y0)this.y0=y;if(y>this.y1)this.y1=y}
 has(x,y){const B=this.B;return x>=0&&y>=0&&x<B.w&&y<B.h&&B.m[y*B.w+x]===this.id}
 cap(ax,ay,bx,by,r){const x0=Math.floor(Math.min(ax,bx)-r),x1=Math.ceil(Math.max(ax,bx)+r),y0=Math.floor(Math.min(ay,by)-r),y1=Math.ceil(Math.max(ay,by)+r),dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const px=x+.5-ax,py=y+.5-ay;let t=L?(px*dx+py*dy)/L:0;t=t<0?0:t>1?1:t;const qx=px-t*dx,qy=py-t*dy;if(qx*qx+qy*qy<=r*r)this.add(x,y)}return this}
 circ(cx,cy,r){return this.cap(cx,cy,cx,cy,r)}
 poly(pts){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const[x,y]of pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
  for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++){const px=x+.5,py=y+.5;let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)ins=!ins}if(ins)this.add(x,y)}return this}
 paint(fill,o={}){const B=this.B,ink=o.ink===undefined?P.ink:o.ink;if(this.x1<this.x0)return this;
  if(ink)for(let y=this.y0-1;y<=this.y1+1;y++)for(let x=this.x0-1;x<=this.x1+1;x++)if(!this.has(x,y)&&(this.has(x-1,y)||this.has(x+1,y)||this.has(x,y-1)||this.has(x,y+1)))B.put(x,y,ink);
  for(let y=this.y0;y<=this.y1;y++)for(let x=this.x0;x<=this.x1;x++){if(!this.has(x,y))continue;let c=fill;if(o.shade&&!this.has(x-1,y+1))c=o.shade;else if(o.hi&&!this.has(x+1,y-1))c=o.hi;if(o.fn){const r=o.fn(x,y,c);if(r)c=r}B.put(x,y,c)}return this}}

/* ===== Esqueleto de perfil (mira a la derecha) ===== */
const SK={thigh:5.5,shin:5.5,torso:9,upper:4.6,fore:4.4,headUp:7.5,headR:10.5,hipH:9.8,ankleY:-3};
const BASE=SK.ankleY-SK.hipH;
// IK de 2 huesos: bend=1 dobla hacia adelante (rodilla), -1 hacia atrás (codo)
function ik(ax,ay,bx,by,l1,l2,bend){let dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy);const mx=l1+l2-.001;if(d>mx){dx*=mx/d;dy*=mx/d;d=mx}if(d<.001)d=.001;
 const a=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d)))),ux=dx/d,uy=dy/d,th=-a*bend,c=Math.cos(th),s=Math.sin(th);return[ax+l1*(ux*c-uy*s),ay+l1*(ux*s+uy*c),ax+dx,ay+dy]}
function drawLeg(B,H,Lg,L,back){const suit=back?dk(P.paper):P.paper,low=back?dk(P.light):P.light;
 new Shape(B).cap(H[0],H[1],Lg.K[0],Lg.K[1],2.6).cap(Lg.K[0],Lg.K[1],Lg.A[0],Lg.A[1],2.4).paint(suit,{shade:low,fn:(x,y)=>{const dx=x+.5-Lg.A[0],dy=y+.5-Lg.A[1];return dx*dx+dy*dy<6.5?low:null}});
 const c=Math.cos(-Lg.p),s=Math.sin(-Lg.p),pts=[[-2.3,-1.4],[3,-1.4],[4.9,.8],[4.9,2.7],[-2.5,2.7]].map(([u,v])=>[Lg.A[0]+u*c-v*s,Lg.A[1]+u*s+v*c]);
 const b=new Shape(B).poly(pts),sole=back?dk(L.acc):L.acc;b.paint(back?dk(P.light):P.light,{fn:(x,y)=>b.has(x,y+1)?null:sole})}
function drawArm(B,A,L,back){const suit=back?dk(P.paper):P.paper,sh=back?dk(P.light):P.light,acc=back?dk(L.acc):L.acc;
 new Shape(B).cap(A.S[0],A.S[1],A.E[0],A.E[1],2.2).cap(A.E[0],A.E[1],A.W[0],A.W[1],2).paint(suit,{shade:sh,fn:(x,y)=>{const dx=x+.5-A.S[0],dy=y+.5-A.S[1];return dx*dx+dy*dy<7?acc:null}});
 new Shape(B).circ(A.W[0],A.W[1],2.2).paint(acc,{shade:back?dk(L.accSh):L.accSh})}
function drawPack(B,H,dir,fw,L){const c=[H[0]+dir[0]*5.8-fw[0]*6.6,H[1]+dir[1]*5.8-fw[1]*6.6],q=(a,b)=>[c[0]+fw[0]*a+dir[0]*b,c[1]+fw[1]*a+dir[1]*b];
 new Shape(B).poly([q(-3.1,-6.4),q(3.2,-6.4),q(3.2,6.6),q(-3.1,6.6)]).paint(P.paper,{shade:P.light,fn:(x,y)=>((x+.5-c[0])*dir[0]+(y+.5-c[1])*dir[1])>4.6?L.acc:null})}
function drawTorso(B,H,N,dir,fw,L){new Shape(B).cap(H[0],H[1],N[0],N[1],5.4).paint(P.paper,{shade:P.light,hi:P.white,fn:(x,y)=>{const t=(x+.5-H[0])*dir[0]+(y+.5-H[1])*dir[1];return t>-.6&&t<1.3?P.shadow:t>4.4&&t<5.9?L.acc:null}});
 const c=[H[0]+dir[0]*3.4+fw[0]*5.3,H[1]+dir[1]*3.4+fw[1]*5.3],q=(a,b)=>[c[0]+fw[0]*a+dir[0]*b,c[1]+fw[1]*a+dir[1]*b];
 new Shape(B).poly([q(-1.5,-2.2),q(1.6,-2.2),q(1.6,2.2),q(-1.5,2.2)]).paint(L.acc);const cx=Math.floor(c[0]),cy=Math.floor(c[1]);B.put(cx,cy-1,P.green);B.put(cx,cy,P.ink);B.put(cx,cy+1,P.pink)}
function drawHelmet(B,C,hd,hf,L){const V=[C[0]+hf[0]*3.4+hd[0]*.3,C[1]+hf[1]*3.4+hd[1]*.3],VR=7,IR=SK.headR-1.7;
 const inV=(x,y)=>{const ax=x+.5-V[0],ay=y+.5-V[1],bx=x+.5-C[0],by=y+.5-C[1];return ax*ax+ay*ay<=VR*VR&&bx*bx+by*by<=IR*IR};
 new Shape(B).circ(C[0],C[1],SK.headR).paint(L.acc,{shade:L.accSh,hi:P.white,fn:(x,y)=>{if(!inV(x,y))return null;if(!inV(x-1,y)||!inV(x+1,y)||!inV(x,y-1)||!inV(x,y+1))return P.ink;
  const dx=x+.5-C[0],dy=y+.5-C[1],lf=dx*hf[0]+dy*hf[1],ld=-(dx*hd[0]+dy*hd[1]);
  if(lf>5.6&&ld<-2.6)return P.white;
  if(lf>-1.5&&lf<5.6&&ld>-4.6&&ld<4.4){if(ld<L.top||lf<L.back||(L.longH&&lf<3&&ld>0))return L.hair;if(L.accessory==='glasses'&&ld>-.9&&ld<.3&&lf>.8&&lf<4.8)return P.ink;if(lf>2.2&&lf<3.6&&ld>-1.1&&ld<1.4)return P.ink;if(L.accessory==='beard'&&ld>2.4)return L.hair;if(L.accessory==='freckles'&&lf>3.6&&lf<4.6&&ld>1.6&&ld<2.6)return L.skinSh;return ld>2.9?L.skinSh:L.skin}
  return P.light}})}
function drawAstro(B,p,L,ox,oy,A,ctx){const lean=p.lean||0,dir=[Math.sin(lean),-Math.cos(lean)],fw=[Math.cos(lean),Math.sin(lean)],H=[ox+p.hx,oy+p.hy];
 const at=(d,f)=>[H[0]+dir[0]*d+fw[0]*f,H[1]+dir[1]*d+fw[1]*f],N=at(SK.torso,0),S=at(7.2,-.4),Sb=at(7.2,-1.4);
 const hl=lean+(p.tilt||0),hd=[Math.sin(hl),-Math.cos(hl)],hf=[Math.cos(hl),Math.sin(hl)],C=[N[0]+hd[0]*SK.headUp+hf[0]*1.2,N[1]+hd[1]*SK.headUp+hf[1]*1.2];
 const leg=f=>{const r=ik(H[0],H[1],ox+f.x,oy+f.y,SK.thigh,SK.shin,1);return{K:[r[0],r[1]],A:[r[2],r[3]],p:f.p||0}};
 const arm=(a,Sh)=>{if(a.x!==undefined){const r=ik(Sh[0],Sh[1],ox+a.x,oy+a.y,SK.upper,SK.fore,-1);return{S:Sh,E:[r[0],r[1]],W:[r[2],r[3]]}}const E=[Sh[0]+Math.sin(a.s)*SK.upper,Sh[1]+Math.cos(a.s)*SK.upper],t=a.s+(a.e||0);return{S:Sh,E,W:[E[0]+Math.sin(t)*SK.fore,E[1]+Math.cos(t)*SK.fore]}};
 const J={H,N,C,LF:leg(p.fF),LB:leg(p.fB),AF:arm(p.aF,S),AB:arm(p.aB,Sb),dir,fw,ox,oy,p};
 A.pre&&A.pre(B,J,ctx,L);drawArm(B,J.AB,L,true);drawLeg(B,H,J.LB,L,true);drawPack(B,H,dir,fw,L);drawTorso(B,H,N,dir,fw,L);drawLeg(B,H,J.LF,L,false);
 A.mid&&A.mid(B,J,ctx,L);(L.bare?drawBare:drawHelmet)(B,C,hd,hf,L);drawArm(B,J.AF,L,false);A.post&&A.post(B,J,ctx,L);return J}

/* ===== Utilidades de animación ===== */
const ease=t=>t<=0?0:t>=1?1:t*t*(3-2*t),lerp=(a,b,t)=>a+(b-a)*t;
function mixObj(a,b,k){if(typeof a==='number')return lerp(a,b===undefined?a:b,k);if(a&&typeof a==='object'){const o={};for(const key in a)o[key]=mixObj(a[key],b?b[key]:undefined,k);return o}return a}
function tween(keys,t){if(t<=keys[0].t)return keys[0].p;for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(t<b.t)return mixObj(a.p,b.p,ease((t-a.t)/(b.t-a.t)))}return keys[keys.length-1].p}
const foot=(x,y=SK.ankleY,p=0)=>({x,y,p});
const stand=()=>({hx:0,hy:BASE,lean:.05,tilt:0,fF:foot(1.4),fB:foot(-1.4),aF:{s:.25,e:.5},aB:{s:.18,e:.5}});
const fmt=(n,d=2)=>n.toFixed(d).replace('.',',');
const both=(f,unit,d=2)=>`<i>Luna ${fmt(f(G.moon),d)} ${unit}</i> · Tierra ${fmt(f(G.earth),d)} ${unit}`;
const air=v0=>g=>2*v0/g, hcm=v0=>g=>v0*v0/(2*g)*100;

// Paso cíclico: fases de apoyo ('s', pies F/B, duración d) y de vuelo ('f', impulso v0 en m/s: el tiempo en el aire sale de la gravedad)
function gait(o){const dur=(ph,g)=>ph.k==='s'?ph.d:2*ph.v0/g;
 return{moving:true,v:o.v,T(g){return o.phases.reduce((s,ph)=>s+dur(ph,g),0)},
 pose(tau,g){const v=o.v*PXM,T=this.T(g),c=Math.floor(tau/T),list=[];
  for(let k=-1;k<=1;k++){let s=(c+k)*T;for(const ph of o.phases){const d=dur(ph,g);list.push({ph,t0:s,t1:s+d});s+=d}}
  let cur=list[0];for(const it of list)if(tau>=it.t0&&tau<it.t1){cur=it;break}
  const u=(tau-cur.t0)/(cur.t1-cur.t0);let hy=BASE;
  if(cur.ph.k==='s')hy+=(cur.ph.dip||0)*Math.sin(Math.PI*u);else{const tt=tau-cur.t0;hy-=(cur.ph.v0*tt-.5*g*tt*tt)*PXM}
  const cam=v*tau;
  const ft=id=>{const iv=[];for(const it of list)if(it.ph.k==='s'&&it.ph.f.includes(id)){const l=iv[iv.length-1];if(l&&Math.abs(l.t1-it.t0)<1e-9)l.t1=it.t1;else iv.push({t0:it.t0,t1:it.t1})}
   const fx=I=>v*(I.t0+I.t1)/2+((o.off&&o.off[id])||0);
   for(const I of iv)if(tau>=I.t0&&tau<I.t1)return{x:fx(I)-cam,y:SK.ankleY,p:0,on:true};
   let pv=null,nx=null;for(const I of iv){if(I.t1<=tau)pv=I;else if(!nx&&I.t0>tau)nx=I}
   if(!pv||!nx)return{x:0,y:SK.ankleY,p:0,on:false};
   const s=(tau-pv.t1)/(nx.t0-pv.t1);
   return{x:lerp(fx(pv),fx(nx),ease(s))-cam,y:SK.ankleY-(o.lift??2)*Math.sin(Math.PI*s),p:o.flat?0:-.45*Math.sin(Math.PI*Math.min(1,s*1.5))*(1-s),on:false}};
  const fF=ft('F'),fB=ft('B'),ctx={k:cur.ph.k,u,fF,fB};
  const ab=o.arms?o.arms(ctx):{aF:{s:(o.armBase??.25)+(o.armK??.06)*fB.x,e:o.elbow??.55},aB:{s:(o.armBase??.25)+(o.armK??.06)*fF.x,e:o.elbow??.55}};
  return{hx:0,hy,lean:o.lean||0,tilt:o.tilt||0,fF,fB,...ab,contacts:[{id:'F',on:fF.on,x:fF.x},{id:'B',on:fB.on,x:fB.x}]}}}}

/* ===== Escenas especiales ===== */
const fallCache=new Map();
function fallCurve(g){if(fallCache.has(g))return fallCache.get(g);const dt=1/600,pts=[];let th=.05,w=.32,t=0;pts.push(th);
 while(th<1.2){w+=(g/1.0)*Math.sin(th)*dt;th+=w*dt;t+=dt;pts.push(th)} // péndulo invertido: centro de masa a 1 m
 const r={T:t,th:tt=>pts[Math.min(pts.length-1,Math.max(0,Math.floor(tt/dt)))]};fallCache.set(g,r);return r}
const RUNG=i=>-23-7*i, ON_RUNG=i=>RUNG(i)-3.6, PAD=-6.2, DROP=(PAD-ON_RUNG(0))/PXM;

function wheel(B,cx,cy,r,ang,fill){new Shape(B).circ(cx,cy,r).paint(fill,{shade:mix(fill,P.ink,.3),fn:(x,y)=>{const dx=x+.5-cx,dy=y+.5-cy,d=Math.hypot(dx,dy);if(d<1.7)return P.paper;if(d>r-1.6){const a=Math.atan2(dy,dx)-ang,m=((a%(Math.PI/4))+Math.PI/4)%(Math.PI/4);return m<.32?P.light:null}const a=Math.atan2(dy,dx)-ang,m=((a%(Math.PI/2))+Math.PI/2)%(Math.PI/2);return m<.2?P.ink:null}})}

const frontCache=new Map();
function front(a){let rec=frontCache.get(a.id);if(rec)return rec;rec={ready:false,px:null};rec.promise=new Promise(res=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=32;c.height=46;const x=c.getContext('2d');x.drawImage(img,0,0);rec.px=x.getImageData(0,0,32,46).data;rec.ready=true;res(rec)};img.onerror=()=>res(rec);img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(avHelmetSprite(a))});frontCache.set(a.id,rec);return rec}
function blit(B,px,sx,sy,w,h,dx,dy){for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=((sy+j)*32+sx+i)*4;if(px[k+3]>127)B.putRGB(dx+i,dy+j,px[k],px[k+1],px[k+2])}}

/* ===== Los 14 movimientos ===== */
const BOX=[-24,-48,24,4];
const ANIMS=[
{id:'quieto',name:'Quieto',tag:'Pose base',text:'La pose de descanso del juego: respira, mira para arriba y vuelve.',why:'El traje va inflado: las rodillas quedan un poco dobladas y los brazos separados del cuerpo.',src:'https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.gaits.html',box:BOX,
 T:()=>4,pose(t){const b=Math.sin(t*Math.PI/2),p=stand();p.hy+=.35*b;p.tilt=-.2*Math.max(0,Math.sin((t-2.4)*Math.PI/1.2))*(t>2.4&&t<3.6);p.aF.s+=.04*b;p.aB.s+=.04*b;p.contacts=[{id:'F',on:true,x:1.4},{id:'B',on:true,x:-1.4}];return p},num:()=>'Sin vuelo: es la base de todas las demás'},
{id:'caminar',name:'Caminar con pie plano',tag:'Apolo 11 · 1969',text:'Así caminaron Armstrong y Aldrin buena parte del paseo: un pie delante del otro, sin impulsarse.',why:'<b>¿Por qué?</b> Aldrin dijo que caminar normal era mejor que el salto de canguro.',src:'https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.gaits.html',box:BOX,
 ...gait({v:.45,flat:true,lift:1.2,lean:.06,armK:.05,armBase:.2,phases:[{k:'s',f:'F',d:.45,dip:-.4},{k:'s',f:'FB',d:.16,dip:.4},{k:'s',f:'B',d:.45,dip:-.4},{k:'s',f:'FB',d:.16,dip:.4}]}),num:()=>'<i>0,45 m/s</i> · más lento que el cambio a trote (≈ 0,7 m/s)'},
{id:'trote',name:'Correr a saltitos (trote)',tag:'Apolo 12 a 17',phys:true,text:'El paso más usado: se cambia de pie, se impulsa y “flota” hacia adelante antes de apoyar el otro pie.',why:'<b>¿Por qué?</b> Con 1/6 de la gravedad cada impulso te deja más tiempo en el aire. Aldrin: “es un trote, es muy difícil solo caminar”.',src:'https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.gaits.html',box:BOX,
 ...gait({v:1.05,lift:3,lean:.14,armK:.07,armBase:.3,elbow:.7,phases:[{k:'s',f:'F',d:.24,dip:1.2},{k:'f',v0:.6},{k:'s',f:'B',d:.24,dip:1.2},{k:'f',v0:.6}]}),num:()=>'En el aire por paso: '+both(air(.6),'s')},
{id:'galope',name:'Galope',tag:'Apolo 14 y 17',phys:true,text:'Un pie siempre adelante. Cae primero el de atrás, enseguida el de adelante, y vuelve a impulsarse. Lo preferían Ed Mitchell y Gene Cernan.',why:'<b>¿Por qué?</b> Una simulación de 2012 encontró que con poca gravedad galopar cansa menos que caminar o correr.',src:'https://pmc.ncbi.nlm.nih.gov/articles/PMC3327825/',box:BOX,
 ...gait({v:1.15,lift:2.5,lean:.12,armK:.03,armBase:.38,off:{F:2.5,B:-2},phases:[{k:'s',f:'B',d:.1,dip:.6},{k:'s',f:'FB',d:.08,dip:1.2},{k:'s',f:'F',d:.16,dip:.8},{k:'f',v0:.7}]}),num:()=>'En el aire: '+both(air(.7),'s')},
{id:'canguro',name:'Salto de canguro',tag:'Apolo 17 · 1972',phys:true,text:'Los dos pies juntos. En terreno plano solo lo usaban para jugar; Cernan y Schmitt lo usaron para bajar una cuesta empinada.',why:'<b>¿Por qué?</b> Cansa más que el trote, pero en bajada ayuda a no tropezar.',src:'https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.gaits.html',box:[-24,-52,24,4],
 ...gait({v:1,lift:4,lean:.18,off:{F:1,B:-1},phases:[{k:'s',f:'FB',d:.3,dip:2.6},{k:'f',v0:.9}],arms:({k,u})=>{const s=k==='s'?-.3+.25*Math.sin(Math.PI*u):.9-.6*u;return{aF:{s,e:.45},aB:{s:s-.12,e:.45}}}}),num:()=>'Altura: '+both(hcm(.9),'cm',0)},
{id:'esqui',name:'Esquí lunar',tag:'Apolo 17 · Schmitt',phys:true,text:'Se empuja con la punta del pie y se desliza, como en el esquí de fondo. Harrison Schmitt decía que así iba más rápido que sus compañeros con los saltitos de “conejo”.',why:'<b>¿Por qué?</b> La gravedad baja hace casi todo el trabajo: un empujón y planeás cerca del suelo.',src:'https://www.theregister.com/2007/02/19/ski_the_moon/',box:BOX,
 ...gait({v:1.6,lift:1,lean:.3,armK:.14,armBase:.2,elbow:.25,phases:[{k:'s',f:'B',d:.2,dip:1.4},{k:'f',v0:.42},{k:'s',f:'F',d:.2,dip:1.4},{k:'f',v0:.42}]}),num:()=>'<i>1,6 m/s</i> · planeo de '+both(air(.42),'s')},
{id:'salto',name:'Salto con saludo',tag:'Apolo 16 · John Young',phys:true,text:'Young saltó junto a la bandera mientras saludaba. Estuvo en el aire unos 1,45 s y subió unos 42 cm.',why:'<b>¿Por qué?</b> Mismo empujón, 6 veces menos gravedad: subís 6 veces más alto y tardás 6 veces más en bajar.',src:'https://moon.nasa.gov/resources/103/jumping-salute/',box:[-24,-56,24,4],
 T:()=>1+2*1.17/G.moon+1.3,pose(t,g){const v0=1.17,Tf=2*v0/g,p=stand();let fy=SK.ankleY,on=true;
  if(t<.6)p.hy+=.3*Math.sin(t*6);
  else if(t<1){const u=ease((t-.6)/.4);p.hy+=3.2*u;p.lean+=.22*u;p.aF={s:.25-.75*u,e:.5};p.aB={s:.18-.75*u,e:.5}}
  else if(t<1+Tf){const tt=t-1,u=tt/Tf,h=(v0*tt-.5*g*tt*tt)*PXM,ext=Math.min(1,tt/.1);fy=SK.ankleY-h;on=false;p.hy=fy-SK.hipH+3.2*(1-ext)+.8*Math.sin(Math.PI*u);p.lean=.27-.2*ext;
   const up=ease(u/.35),dn=ease((u-.75)/.25);p.aF={s:lerp(-.5,2.6,up)-2.3*dn,e:2*up*(1-dn)+.5*dn};p.aB={s:lerp(-.5,.6,up)-.4*dn,e:.5}}
  else if(t<1.4+Tf){const u=(t-1-Tf)/.4;p.hy+=3*Math.sin(Math.PI*u);p.lean+=.15*Math.sin(Math.PI*u)}
  p.fF=foot(1.6,fy);p.fB=foot(-1.4,fy);p.contacts=[{id:'F',on,x:1.6},{id:'B',on,x:-1.4}];return p},
 num:()=>'En el aire: '+both(air(1.17),'s')+'<br>Sube: '+both(hcm(1.17),'cm',0)},
{id:'caida',name:'Caerse y levantarse',tag:'Apolo 16 y 17',phys:true,text:'Schmitt se cayó varias veces y Charlie Duke cayó de espaldas sobre la mochila. En la Luna te caés en cámara lenta y levantarse cuesta poco.',why:'<b>¿Por qué?</b> Con traje pesaban como algo de 30 kg en la Tierra: lo difícil era no perder el equilibrio otra vez.',src:'https://www.universetoday.com/articles/hilarious-supercut-of-astronauts-falling-on-the-moon',box:[-14,-48,38,4],
 T:g=>.7+fallCurve(g).T+2.5,pose(t,g){const F=fallCurve(g);let p=stand(),hand=false;
  if(t>=.7&&t<.7+F.T){const th=F.th(t-.7),k=th/1.2;p.hx=Math.sin(th)*SK.hipH;p.hy=SK.ankleY-Math.cos(th)*SK.hipH;p.lean=th;p.tilt=-.3*k;const s=.3+.9*Math.sin(Math.PI*k)-.3*k;p.aF={s,e:.3};p.aB={s:s-.15,e:.3};p.fF=foot(1.2);p.fB=foot(-1.2)}
  else if(t>=.7+F.T){const u=t-.7-F.T;hand=u<1.35;
   p=tween([{t:0,p:{hx:9.13,hy:-6.55,lean:1.2,tilt:-.3,fF:foot(1.2),fB:foot(-1.2),aF:{s:0,e:.3},aB:{s:-.15,e:.3}}},{t:.25,p:{hx:8.2,hy:-7.2,lean:1.15,tilt:-.35,fF:foot(.5,-2.6,-.8),fB:foot(-1.5,-2.6,-.8),aF:{s:0,e:.3},aB:{s:-.15,e:.3}}},{t:.9,p:{hx:8.2,hy:-7.2,lean:1.15,tilt:-.55,fF:foot(.5,-2.6,-.8),fB:foot(-1.5,-2.6,-.8),aF:{s:0,e:.3},aB:{s:-.15,e:.3}}},{t:1.35,p:{hx:3,hy:-9.5,lean:.55,tilt:-.2,fF:foot(1.2),fB:foot(-1.2),aF:{s:.4,e:.4},aB:{s:.3,e:.4}}},{t:1.9,p:stand()}],u)}
  const hx=p.hx+7.2*Math.sin(p.lean);p.contacts=[{id:'H',on:hand,x:hx},{id:'F',on:true,x:1.2}];return p},
 num:g=>'Caída hasta las manos: '+both(gg=>fallCurve(gg).T,'s')},
{id:'muestra',name:'Arrodillarse y tomar una muestra',tag:'Artemis',text:'Se arrodilla, agarra una roca, la mira de cerca y la guarda en la bolsa. Con los trajes Apolo casi no se podía: usaban pinzas y palas largas.',why:'<b>¿Por qué?</b> El traje nuevo de Artemis (AxEMU) se diseñó para arrodillarse, trotar y levantarse solo.',src:'https://www.scientificamerican.com/article/nasas-next-space-suit-for-artemis-has-out-of-this-world-mobility/',box:[-20,-48,24,4],
 T:()=>6.4,pose(t){const S={hx:0,hy:BASE,lean:.05,tilt:0,fF:foot(1.5),fB:foot(-1.5),aF:{x:4,y:-12.3},aB:{x:3.2,y:-12.5}},K={hx:-1,hy:-7.2,lean:.35,tilt:.1,fF:foot(5.5),fB:foot(-7.5,-2,-.6),aF:{x:6,y:-8.5},aB:{x:-.5,y:-8}};
  const p=tween([{t:0,p:S},{t:.6,p:S},{t:1.5,p:K},{t:2.3,p:{...K,lean:.75,hx:-.5,tilt:.25,aF:{x:11,y:-2.2}}},{t:2.6,p:{...K,lean:.75,hx:-.5,tilt:.25,aF:{x:11,y:-2.2}}},{t:3.4,p:{...K,lean:.2,hy:-7.6,tilt:.2,aF:{x:8,y:-20}}},{t:4,p:{...K,lean:.2,hy:-7.6,tilt:.2,aF:{x:8,y:-20}}},{t:4.9,p:{...S,aF:{x:4.5,y:-15}}},{t:5.5,p:{...S,aF:{x:3.5,y:-11.5}}},{t:6.1,p:S}],t);
  p.rock=t<2.5?'suelo':t<5.5?'mano':'bolsa';p.shine=t>3.4&&t<4;p.contacts=[{id:'K',on:t>1.3&&t<4.6,x:-2.5}];return p},
 mid(B,J,c){if(J.p.rock==='bolsa'||J.p.rock==='mano'||true){const x=J.H[0]+1,y=J.H[1]+1;new Shape(B).poly([[x,y],[x+3.5,y],[x+3.5,y+4],[x,y+4]]).paint(J.p.rock==='bolsa'?P.green:P.shadow)}},
 post(B,J,c){const p=J.p;let x,y;if(p.rock==='suelo'){x=J.ox+11;y=J.oy-1.6}else if(p.rock==='mano'){x=J.AF.W[0]+.5;y=J.AF.W[1]-1.4}else return;new Shape(B).circ(x,y,1.7).paint(P.shadow,{shade:mix(P.shadow,P.ink,.3),hi:P.light});
  if(p.shine&&Math.floor(c.t*8)%2){for(const[a,b]of[[0,-4],[0,4],[-4,0],[4,0]])B.put(Math.round(x+a),Math.round(y+b),P.white)}},
 num:()=>'Sin vuelo: lo que manda es cuánto dobla el traje'},
{id:'escalera',name:'Bajar la escalera',tag:'Apolo 11 · Armstrong',phys:true,text:'El último peldaño quedaba lejos del plato de la pata. Armstrong se dejó caer y avisó: “es como de 3 pies” (casi un metro).',why:'<b>¿Por qué?</b> En la Luna esa caída es lenta y suave; antes de soltarse probó que podía volver a subir.',src:'https://www.astronomy.com/space-exploration/how-one-small-step-became-a-giant-leap/',box:[-18,-90,34,4],camY:p=>Math.min(0,p.hy+24),
 T:g=>4.25+Math.sqrt(2*DROP/g)+.45+.2+1.2+1.2,pose(t,g){const tf=Math.sqrt(2*DROP/g),lean=.12;let fF,fB,hy,hx=-.5,hands=true,on=false;
  const rail=hy=>({aF:{x:9.5,y:hy-8},aB:{x:9.5,y:hy-4.5}});
  if(t<3.6){const i=Math.min(2,Math.floor(Math.max(0,t-.3)/1.1)),u=Math.max(0,t-.3-1.1*i),a=3-i,b=2-i,ub=ease(Math.min(1,u/.55)),uf=ease(Math.max(0,(u-.55)/.55));
   const yb=t<.3?ON_RUNG(3):lerp(ON_RUNG(a),ON_RUNG(b),ub),yf=t<.3?ON_RUNG(3):lerp(ON_RUNG(a),ON_RUNG(b),uf);
   fB=foot(6-1.5*Math.sin(Math.PI*ub),yb);fF=foot(6.5-1.5*Math.sin(Math.PI*uf),yf);hy=Math.max(yb,yf)-9.4+(t<.3?0:-0)}
  else if(t<4.25){fB=foot(6,ON_RUNG(0));fF=foot(6.5,ON_RUNG(0));hy=ON_RUNG(0)-9.4;if(t>4)hands=false}
  else if(t<4.25+tf){const tt=t-4.25,dy=.5*g*tt*tt*PXM,u=tt/tf;fB=foot(lerp(6,2,u),ON_RUNG(0)+dy);fF=foot(lerp(6.5,4,u),ON_RUNG(0)+dy);hy=ON_RUNG(0)+dy-9.6;hx=lerp(-.5,-1.5,u);hands=false}
  else{const u=t-4.25-tf;hands=false;on=true;fB=foot(2,PAD);fF=foot(4,PAD);hy=PAD-9.6+2.5*Math.sin(Math.PI*Math.min(1,u/.45));hx=-1.5;
   if(u>.65){const a=ease((u-.65)/.6),b=ease((u-1.25)/.6),gy=SK.ankleY;fB=foot(lerp(2,-8,a),lerp(PAD,gy,a)-2*Math.sin(Math.PI*a));fF=foot(lerp(4,-5,b),lerp(PAD,gy,b)-2*Math.sin(Math.PI*b));hx=lerp(-1.5,-7,(a+b)/2);hy=lerp(PAD-9.6,BASE,(a+b)/2)}}
  const p={hx,hy,lean,tilt:-.1,fF,fB,...(hands?rail(hy):{aF:{s:.6,e:.6},aB:{s:.4,e:.6}})};
  const gF=fF.y>=SK.ankleY-.01,gB=fB.y>=SK.ankleY-.01;p.contacts=[{id:'F',on:gF,x:fF.x},{id:'B',on:gB,x:fB.x},{id:'P',on,x:3,y:-3.5}];return p},
 pre(B,J){const ox=J.ox,oy=J.oy,X=x=>ox+x,Y=y=>oy+y;
  new Shape(B).poly([[X(22),Y(-130)],[X(70),Y(-130)],[X(70),Y(-74)],[X(22),Y(-74)]]).paint(P.main,{shade:P.shade,fn:(x,y)=>(x+y)%9===0?P.shade:null});
  new Shape(B).cap(X(10),Y(-4),X(30),Y(-80),1.8).paint(P.main,{shade:P.shade});
  new Shape(B).poly([[X(-4),Y(-3.5)],[X(16),Y(-3.5)],[X(14),Y(0)],[X(-2),Y(0)]]).paint(P.main,{shade:P.shade});
  new Shape(B).cap(X(11.5),Y(RUNG(0)),X(11.5),Y(-120),1.1).paint(P.light);
  for(let i=0;i<14;i++)new Shape(B).cap(X(6),Y(RUNG(i)),X(11.5),Y(RUNG(i)),.8).paint(P.light)},
 num:()=>'Caída de '+fmt(DROP,2)+' m: '+both(gg=>Math.sqrt(2*DROP/gg),'s')},
{id:'carrito',name:'Jalar el carrito (MET)',tag:'Apolo 14 · Shepard y Mitchell',text:'Un carrito de dos ruedas para herramientas y muestras, jalado a mano rumbo al cráter Cone. Mitchell: “dejame jalar a mí”.',why:'<b>¿Por qué?</b> Era más fácil arrastrar la carga que llevarla: las ruedas dejaban dos huellas brillantes.',src:'https://www.nasa.gov/history/alsj/',box:[-44,-48,22,4],
 ...gait({v:.65,flat:true,lift:1.4,lean:.16,phases:[{k:'s',f:'F',d:.38,dip:-.3},{k:'s',f:'FB',d:.12,dip:.4},{k:'s',f:'B',d:.38,dip:-.3},{k:'s',f:'FB',d:.12,dip:.4}],arms:({fB})=>({aF:{s:.3+.06*fB.x,e:.6},aB:{x:-7.5,y:-13.6}})}),
 pre(B,J,c){const ox=J.ox,oy=J.oy,wx=-27,ang=(c.cam.x+wx)/5.5;
  new Shape(B).cap(ox-19,oy-12.5,J.AB.W[0],J.AB.W[1],.8).paint(P.mid);
  new Shape(B).cap(ox-36,oy-11,ox-37,oy-1,.8).paint(P.mid);
  for(const[x,h,col]of[[-34,9,P.main],[-31,7,P.pink],[-28,10,P.aqua]])new Shape(B).cap(ox+x,oy-14,ox+x,oy-14-h,.9).paint(col);
  new Shape(B).poly([[ox-38,oy-15.5],[ox-18,oy-15.5],[ox-20,oy-9.5],[ox-36,oy-9.5]]).paint(P.light,{shade:P.mid});
  wheel(B,ox+wx,oy-5.5,5.5,ang,P.mid)},
 num:()=>'<i>0,65 m/s</i> con la carga atrás'},
{id:'rover',name:'Manejar el rover',tag:'Apolo 16 · el “Gran Premio”',phys:true,text:'El rover rebota en cada lomita y las ruedas quedan en el aire. El polvo sale en arcos limpios y cae de golpe.',why:'<b>¿Por qué?</b> Sin aire, nada frena el polvo ni lo deja flotando: cada grano sigue una parábola perfecta.',src:'https://science.nasa.gov/image-article/apod-2021-may-29-lunar-dust-and-duct-tape/',box:[-34,-50,36,4],
 moving:true,v:2.5,T:()=>2.6,ground:wx=>{const v=2.5*PXM,c0=v*.8+19+5,L=v*2.6,k=Math.round((wx-c0)/L),d=Math.abs(wx-c0-k*L);return d<6?-2.5*(1-d/6):0},
 pose(tau,g){const t=((tau%2.6)+2.6)%2.6,v0=.8,tf=2*v0/g;let hop=0;if(t>=.8&&t<.8+tf){const tt=t-.8;hop=(v0*tt-.5*g*tt*tt)*PXM}const y=-hop,on=hop<.01;
  return{hx:-3,hy:-19+y,lean:-.12,tilt:.05,fF:foot(5.5,-12.8+y,.3),fB:foot(4.8,-12.6+y,.3),aF:{x:6.5,y:-22+y},aB:{s:.5,e:.9},ry:y,contacts:[{id:'W1',on,x:-21},{id:'W2',on,x:19}],emit:on?[{x:-25,y:-1,rate:55,vx:[-15,30],vy:[-55,-28]}]:[]}},
 pre(B,J){const ox=J.ox,oy=J.oy+J.p.ry;new Shape(B).cap(ox+21,oy-15,ox+21,oy-37,.7).paint(P.light);new Shape(B).poly([[ox+15,oy-38],[ox+27,oy-38],[ox+24,oy-43],[ox+18,oy-43]]).paint(P.paper,{shade:P.light});new Shape(B).poly([[ox-10,oy-30],[ox-7.5,oy-30],[ox-6,oy-16],[ox-9,oy-16]]).paint(P.mid)},
 post(B,J,c){const ox=J.ox,oy=J.oy+J.p.ry;new Shape(B).cap(ox+6,oy-15,ox+6,oy-21,.9).paint(P.mid);new Shape(B).poly([[ox+23,oy-24],[ox+27,oy-24],[ox+27,oy-20],[ox+23,oy-20]]).paint(P.paper);
  new Shape(B).poly([[ox-29,oy-16],[ox+28,oy-16],[ox+29,oy-12],[ox-29,oy-11]]).paint(P.light,{shade:P.mid});
  for(const x of[-21,19]){new Shape(B).poly([[ox+x-8,oy-12],[ox+x+8,oy-12],[ox+x+7,oy-15.5],[ox+x-7,oy-15.5]]).paint(P.shade,{shade:mix(P.shade,P.ink,.3)});wheel(B,ox+x,oy-6.5,6.5,(c.cam.x+x)/6.5,mix(P.mid,P.light,.3))}},
 num:()=>'Ruedas en el aire: '+both(air(.8),'s')},
{id:'flotar',name:'Flotar (solo en el viaje)',tag:'Viaje a la Luna',no:true,text:'En la Luna nadie flota: todo cae, solo que más lento. Se flota adentro de la nave durante el viaje, porque la nave y vos caen juntos.',why:'<b>Dato:</b> flotando, el cuerpo toma solo la “postura neutra”: brazos al frente y rodillas dobladas.',src:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html',box:[-28,-56,28,0],bg:'cabin',
 T:()=>9,pose(t){const ph=t/9*2*Math.PI,rot=ph,cy=-22+2.2*Math.sin(ph*2),w=Math.sin(ph*3)*.12,pc=[0,-6],co=Math.cos(rot),si=Math.sin(rot);
  const Rt=(x,y)=>{const dx=x-pc[0],dy=y-pc[1];return[pc[0]+dx*co-dy*si,pc[1]+dx*si+dy*co+cy]},h=Rt(0,0),a=Rt(3.5,7.6),b=Rt(2,8.2);
  return{hx:h[0],hy:h[1],lean:.3+rot,tilt:-.25,fF:foot(a[0],a[1],-.4-rot),fB:foot(b[0],b[1],-.5-rot),aF:{s:1.55+w-rot,e:.9},aB:{s:1.35-w-rot,e:.8},contacts:[]}},
 num:()=>'Gravedad que se siente: <i>casi 0</i> · en la Luna: 1,62 m/s²'}
];


// Adentro de Zora no hay casco: cabeza al descubierto con el mismo peinado, ojos y detalle del avatar.
// Cabello de perfil (sin casco), uno por cada peinado del Kit: así el avatar conserva su peinado en todas las animaciones.
// vol: volumen sobre la cabeza · cap: hasta dónde cubre la coronilla · back/down: nuca · fringe: flequillo · extra: forma propia.
const HAIR_PROFILE=[
 {vol:1.4,cap:3.2,back:-1.2,down:6.5,len:-6.5,w:3.6},            // 0 Bob
 {vol:1.2,cap:3.2,back:-1.2,down:7,len:-13,w:3.4},                // 1 Largo liso
 {vol:.8,cap:3.4,back:-1.6,down:2,extra:'pony'},                  // 2 Coleta
 {vol:2.4,cap:3,back:-.8,down:7,len:-12,w:4.4,curl:true},         // 3 Rizos largos
 {vol:.6,cap:3.6,back:-1.8,down:1.6,extra:'bun'},                 // 4 Moño
 {vol:.8,cap:3.4,back:-1.4,down:3,extra:'braid'},                 // 5 Trenzas
 {vol:1,cap:2.8,back:-1.6,down:1.6,fringe:2.2},                   // 6 Pixie
 {vol:1.8,cap:3,back:-1,down:6,len:-9,w:3.8,curl:true},           // 7 Ondulado
 {vol:1,cap:3.4,back:-1.8,down:1.4},                              // 8 Corto clásico
 {vol:1.2,cap:3,back:-1.6,down:1.6,fringe:1.6},                   // 9 Flequillo
 {vol:.3,cap:4.6,back:-3.2,down:-.5},                             // 10 Rapado
 {vol:4,cap:2.6,back:-.6,down:4.5,curl:true,extra:'afro'},        // 11 Afro
 {vol:1.2,cap:3.6,back:-2.6,down:0},                              // 12 Degradado
 {vol:.8,cap:3.4,back:-1.8,down:1.2,extra:'spike'},               // 13 Puntiagudo
 {vol:2,cap:3,back:-1.4,down:2.4,curl:true},                      // 14 Rizos cortos
 {vol:1.2,cap:3.2,back:-1.6,down:1.6,fringe:2.8}                  // 15 Raya lateral
];
function drawBare(B,C,hd,hf,L){const r=7.6,H=HAIR_PROFILE[L.style]||HAIR_PROFILE[8];
 const W=(f,u)=>[C[0]+hf[0]*f+hd[0]*u,C[1]+hf[1]*f+hd[1]*u];
 // 1) Volumen y largo, por detrás de la cara
 const back=new Shape(B);
 if(H.extra==='afro'){const c=W(-2.4,1.8);back.circ(c[0],c[1],r+H.vol-.8)}
 else{const c=W(-2.2,1.4);back.circ(c[0],c[1],r+H.vol-.5)}
 if(H.curl){for(let k=0;k<6;k++){const a=Math.PI*(.08+k*.12),c=W(-1.4+Math.cos(a)*-(r+H.vol-1.2),1.4+Math.sin(a)*(r+H.vol-1.2));back.circ(c[0],c[1],1.9)}}
 if(H.len){const a=W(-3.6,0),b=W(-4.4,H.len);back.cap(a[0],a[1],b[0],b[1],H.w);if(H.curl){const c=W(-5.6,H.len+1.5);back.circ(c[0],c[1],H.w*.8)}}
 if(H.extra==='pony'){const a=W(-7.6,3.6),b=W(-10,-4.5);back.cap(a[0],a[1],b[0],b[1],2.3)}
 if(H.extra==='bun'){const c=W(-3.4,8.6);back.circ(c[0],c[1],3.3)}
 if(H.extra==='braid'){const a=W(-5.4,-1),b=W(-5.8,-13);back.cap(a[0],a[1],b[0],b[1],1.8)}
 if(H.extra==='spike')for(const k of[-4.5,-1.5,1.5]){back.poly([W(k-1.8,r-1),W(k+1.8,r-1),W(k+.4,r+4.6)])}
 const bands=H.extra==='braid'?(x,y)=>{const dx=x+.5-C[0],dy=y+.5-C[1],u=dx*hd[0]+dy*hd[1];return u<-1&&Math.round(u)%3===0?mix(L.hair,P.ink,.35):null}:null;
 back.paint(L.hair,{shade:mix(L.hair,P.ink,.25),hi:L.hairHi,fn:bands});
 if(H.extra==='pony'){const t=W(-7.4,3.2);new Shape(B).circ(t[0],t[1],1.3).paint(L.acc,{ink:null})}
 // 2) Cara de perfil con la coronilla, la nuca y el flequillo de ese peinado
 new Shape(B).circ(C[0],C[1],r).paint(L.skin,{shade:L.skinSh,fn:(x,y)=>{const dx=x+.5-C[0],dy=y+.5-C[1],lf=dx*hf[0]+dy*hf[1],u=dx*hd[0]+dy*hd[1];
  if(u>H.cap||(lf<H.back&&u>-H.down)||(H.fringe&&lf>0&&u>H.fringe))return u>r-1.6&&lf>-2?L.hairHi:L.hair;
  if(lf>3&&lf<4.6&&u>-.8&&u<1.4)return P.ink;
  if(L.accessory==='glasses'&&u>.2&&u<1.8&&lf>1.2&&lf<6.4)return P.ink;
  if(L.accessory==='beard'&&u<-3&&lf>-.5)return L.hair;
  if(L.accessory==='freckles'&&lf>4&&lf<5.2&&u<-1.4&&u>-2.4)return L.skinSh;
  if(lf>-1.4&&lf<.6&&u>-1.2&&u<1.2)return L.skinSh; // oreja
  return null}})}
function frameBuf(A,t,g,look,preset){const[x0,y0,x1,y1]=A.box,B=new Buf(x1-x0,y1-y0),ox=-x0,oy=-y0;
 const p=A.pose(t,g),cam={x:A.moving?A.v*PXM*t:0,y:0};drawAstro(B,p,look,ox,oy,A,{t,g,cam,tau:t});return B}

export { ANIMS, G, PXM, FPS };

// Genera la hoja de cuadros de una animación para un avatar. Devuelve el canvas y los datos para reproducirla.
export function renderSheet(animId, avatar, { bare = false, gravity = 'moon', fps = FPS } = {}) {
  const A = ANIMS.find((x) => x.id === animId);
  if (!A) throw new Error('ANIM_NOT_FOUND:' + animId);
  const look = lookOf({ ...avatar, bare });
  const g = G[gravity], Tn = A.T(g), N = Math.max(1, Math.round(Tn * fps));
  const [x0, y0, x1, y1] = A.box, fw = x1 - x0, fh = y1 - y0;
  const cv = document.createElement('canvas'); cv.width = N * fw; cv.height = fh;
  const cx = cv.getContext('2d');
  for (let i = 0; i < N; i++) {
    const B = frameBuf(A, (i * Tn) / N, g, look, avatar);
    cx.putImageData(new ImageData(B.d, fw, fh), i * fw, 0);
  }
  return { canvas: cv, frames: N, fw, fh, ox: -x0, oy: -y0, T: Tn, fps, v: A.moving ? A.v : 0, id: animId };
}
