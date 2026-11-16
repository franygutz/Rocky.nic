#!/usr/bin/env python3
"""Arma docs/ASSETS_MANIFIESTO.json con cada recurso de public/assets: ruta, formato, tamaño, uso y notas.
Uso:  python3 tools/gen-assets-manifest.py"""
import json, re, subprocess, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
assets = root / 'public' / 'assets'

def png_size(p):
    out = subprocess.run(['identify', '-format', '%w %h', str(p)], capture_output=True, text=True).stdout.split()
    return int(out[0]), int(out[1])

def svg_size(p):
    head = p.read_text(encoding='utf-8', errors='ignore')[:600]
    vb = re.search(r'viewBox="([\d.\s-]+)"', head)
    w, h = (vb.group(1).split()[2:4] if vb else (None, None))
    return (float(w), float(h)) if w else (None, None)

USE = {
    'mapas/exterior.png': ('Escenario exterior navegable (Zora, invernadero, antena, paneles, plataforma, cráter)', 'Original: Moon_Survival_Exterior_Plataforma_Izquierda.svg (568×336 u). Rasterizado a 3 px por unidad.'),
    'mapas/zora.png': ('Interior de la nave Zora (9 salas y pasillos)', 'Original: Moon_Survival_Nave_Completa.svg (480×320 u), 3 px por unidad.'),
    'mapas/invernadero.png': ('Interior del invernadero', 'Original: Invernadero_Moon_Survival.svg (320×240 u), 3 px por unidad.'),
    'mapas/paneles.png': ('Fondo de los paneles solares, SIN personaje', 'Original: Moon_Survival_Paneles_Solares.svg, grupo #escenario (se quitó el grupo #personaje con el avatar incrustado).'),
    'mapas/paneles-frente.png': ('Primer plano de los paneles (y ≥ 208 u): oculta parcialmente al avatar', 'Recorte del mismo SVG a partir de la línea de oclusión (clipPath #occlusion, y = 208).'),
    'mapas/crater.png': ('Interior del cráter de exploración', 'Original: Vita_Lunae_Mapa_Crater_PixelArt.svg (256×192 u), 3 px por unidad.'),
    'zora/navecita-full.png': ('Referencia: plataforma con la nave de carga integrada', 'No se usa en el juego: la nave viene dentro de la plataforma y no existe suelta. La nave del juego se dibuja en WorldScene.js con la paleta Moon Pop.'),
    'zora/navecita.png': ('Recorte de la nave de carga original (referencia)', 'Recorte con fondo parcialmente transparente; no se usa en el juego.'),
}

rows = []
for p in sorted(assets.rglob('*')):
    if not p.is_file():
        continue
    rel = p.relative_to(assets).as_posix()
    ext = p.suffix.lower().lstrip('.')
    row = {'ruta': f'public/assets/{rel}', 'formato': ext, 'bytes': p.stat().st_size}
    if ext == 'png':
        w, h = png_size(p); row.update({'ancho': w, 'alto': h})
    elif ext == 'svg':
        w, h = svg_size(p); row.update({'viewBox': [w, h]})
    if rel.startswith('kita/'):
        nm = p.stem.replace('_spritesheet', '')
        row.update({'uso': f'Kita: animación «{nm}»', 'cuadros': 6, 'cuadro': [344, 280], 'fps': 6.67, 'repite': True, 'transparencia': True,
                    'notas': 'Sprite sheet horizontal de 6 cuadros (344×280 px = 86×70 px lógicos ×4). Se anima con CSS steps(6); con «menos movimiento» queda el primer cuadro.'})
    elif rel.startswith('iconos/'):
        row.update({'uso': 'Icono del HUD y de los artículos', 'notas': 'Pixel art SVG con fondo transparente. Oxígeno, agua, energía, cultivos, salud, radio (comunicación), protección, moneda, llave, muestra (investigación), estrella (moral), trofeo.'})
    elif rel.startswith('simbolos/'):
        row.update({'uso': 'Parche de misión del astronauta (y símbolos de pares para puzzles sin depender del color)', 'notas': '16 símbolos SVG transparentes (64×64).'})
    elif rel.startswith('marca/'):
        row.update({'uso': 'Identidad de marca Vita Lunae (logo, insignia, marca, palabra)'})
    elif rel in USE:
        row.update({'uso': USE[rel][0], 'notas': USE[rel][1], 'transparencia': rel not in ('mapas/exterior.png',)})
    rows.append(row)

(root / 'docs').mkdir(exist_ok=True)
(root / 'docs' / 'ASSETS_MANIFIESTO.json').write_text(json.dumps({
    'descripcion': 'Recursos del frontend de Vita Lunae. Los SVG de avatar (capas de piel, cabello, ojos, traje y accesorios) no son archivos: se componen en src/world/avatar.js con las formas del Kit Visual (32×46 px lógicos).',
    'paleta': 'Moon Pop (12 colores) en src/theme.js',
    'recursos': rows,
}, ensure_ascii=False, indent=2), encoding='utf-8')
print(len(rows), 'recursos')
