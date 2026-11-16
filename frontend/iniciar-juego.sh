#!/usr/bin/env bash
# Compila (si hace falta), sirve el juego y lo abre. Uso: ./iniciar-juego.sh [navegador]   (por defecto: brave, si no el del sistema)
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
[ -f dist/index.html ] || npm run build
PORT=4173
(python3 -m http.server $PORT --directory dist >/dev/null 2>&1 &)
sleep 1
URL="http://localhost:$PORT/"
B="${1:-brave}"
if command -v "$B" >/dev/null; then setsid -f "$B" --new-window "$URL" >/dev/null 2>&1; else xdg-open "$URL"; fi
echo "Juego en $URL (Ctrl+C no hace falta: el servidor queda en segundo plano; para cerrarlo: kill \$(ss -ltnp | grep $PORT | grep -o 'pid=[0-9]*' | cut -d= -f2))"
