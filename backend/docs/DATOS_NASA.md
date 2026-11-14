# Trazabilidad científica (para el jurado)

## Registros reales precargados

1. NASA CCMC DONKI, notificación **20240511-AL-013**, evento SEP observado por **STEREO A** desde **2024-05-11T04:07Z**. Fuente: https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1 .
2. NASA CCMC DONKI, notificación **20240510-AL-016**, tormenta geomagnética terrestre **Kp 8.67** durante 18–21 UTC del 10 de mayo de 2024. Fuente: https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/30703/1 .

Estos registros fueron seleccionados a partir de publicaciones verificables de NASA; no son respuestas de la API descargadas en esta sesión. En el código aparecen como **`registro_historico_verificado`**, sin fecha ficticia de descarga.

## Datos descargados desde NASA Open API

Al ejecutar `node --env-file=.env scripts/sync-donki.js`, los resultados se normalizan y se marcan como **`registro_nasa_descargado`**, con `observedAt`, `retrievedAt`, `sourceUrl`, `type` e identificador NASA. Se guardan en SQLite y el archivo JSON para el modo sin conexión. Si la API devuelve un error, no se sobreescriben con eventos inventados.

## Transformación educativa

- OBSERVACIÓN: fecha, tipo, identificador, ubicación e índice (si existe) están documentados por NASA.
- HIPÓTESIS DIDÁCTICA: el juego propone una alerta, gasto de energía de refugio y decisión de salida. **Las unidades de recursos no derivan cuantitativamente de la observación.**
- ADVERTENCIA: una tormenta geomagnética/Kp cerca de la Tierra no indica una dosis en la superficie lunar. El ejemplo SEP tampoco mide directamente la dosis en el hábitat lunar.

Datos de investigación adicionales de OSDR, RadLab y CSA pueden integrarse en `data/science-facts.json` o mediante nuevos servicios; **no se ha implementado importación automática de OSDR ni RadLab** en esta versión.

## Referencias

- https://api.nasa.gov/
- https://ccmc.gsfc.nasa.gov/tools/DONKI/
- https://ccmc.gsfc.nasa.gov/storms/may2024/
- https://science.nasa.gov/biological-physical/data/osdr/
- https://visualization.osdr.nasa.gov/radlab/gui/data-api/
- https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/
