# Trazabilidad científica (para el jurado) · v0.4.1

## 1. Registros DONKI incluidos (`data/nasa-events.json`)

**27 registros** de la tormenta solar de mayo de 2024 (observados del 9 al 12 de mayo): **16 CME, 8 SEP y 3 GST**.

- **26 descargados** de la API de NASA (`https://api.nasa.gov/DONKI/{CME,SEP,GST}`) el 14-11-2026 con `scripts/sync-donki.js`. Están marcados como **`registro_nasa_descargado`**, con `observedAt`, `retrievedAt`, `sourceUrl` (página del evento en DONKI), `type` e identificador NASA.
- **1 registro histórico verificado a mano:** notificación DONKI **20240510-AL-016**, tormenta geomagnética terrestre **Kp 8.67** entre las 18:00 y las 21:00 UTC del 10 de mayo de 2024. Fuente: https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/30703/1 . Está marcado como **`registro_historico_verificado`**, sin fecha de descarga inventada.

Si la API devuelve un error, el importador no sobreescribe con eventos inventados.

## 2. Datos verificados de la Luna (`data/science-facts.json`)

Descargados el **14-11-2026**. Cada ficha guarda la consulta exacta en el campo `verified`, para que se pueda repetir.

| Dato | Valor | Fuente y consulta |
|---|---|---|
| Distancia y retraso de la señal Tierra–Luna | 405 616 km y **1,35 s** de ida el 14-11-2026; entre el 1-11 y el 31-12-2026, de **1,19 s** (24-12, 356 660 km) a **1,36 s** (11-12, 406 435 km) | NASA/JPL Horizons, objetivo 301 (Luna) desde 500@399 (centro de la Tierra), cantidades 20 (distancia) y 21 (tiempo-luz): `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='301'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@399'&START_TIME='2026-11-01'&STOP_TIME='2026-12-31'&STEP_SIZE='6h'&QUANTITIES='20,21'` |
| Radiación en un día normal cerca de la Luna | **13,22 μGy/h** (48 lecturas, 1 y 2 de enero de 2020) | NASA OSDR RadLab, trayectoria `Lunar orbit`, instrumento **CRaTER** del Lunar Reconnaissance Orbiter |
| Radiación en la tormenta del 11-09-2017 | **19 481,6 μGy/h** de promedio ese día, contra **11,25 μGy/h** del 1 al 3 de septiembre: unas **1732 veces** | NASA OSDR RadLab, trayectoria `Lunar orbit`, del 1 al 24 de septiembre de 2017 |

**Advertencias:**
- CRaTER mide **en órbita lunar**, no en la superficie ni dentro de un hábitat. RadLab no tiene un dosímetro en la superficie de la Luna.
- La ventana "normal" de 2017 termina el 3 de septiembre porque las partículas empiezan a subir el día 4.
- Estos datos son **información para LUNI**; el juego no los convierte en dosis ni en reglas de supervivencia.

## 3. Transformación educativa

- **Observación:** fecha, tipo, identificador, ubicación e índice (si existe) están documentados por NASA.
- **Hipótesis didáctica:** el juego propone una alerta, gasto de energía en el refugio y una decisión de salida. **Las unidades de recursos no derivan cuantitativamente de la observación.**
- **Advertencia:** una tormenta geomagnética o un índice Kp cerca de la Tierra no indica una dosis en la superficie lunar. Una SEP tampoco mide directamente la dosis dentro del hábitat.

No hay importación automática de OSDR ni de RadLab: los datos de la sección 2 se descargaron una vez y quedaron con su consulta para repetirlos.

## 4. Referencias

- https://api.nasa.gov/
- https://ccmc.gsfc.nasa.gov/tools/DONKI/
- https://ccmc.gsfc.nasa.gov/storms/may2024/
- https://visualization.osdr.nasa.gov/radlab/gui/data-api/
- https://ssd.jpl.nasa.gov/horizons/
- https://science.nasa.gov/biological-physical/data/osdr/
- https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/
