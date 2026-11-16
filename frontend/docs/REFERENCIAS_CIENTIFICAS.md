# Referencias científicas

La trazabilidad completa (consulta exacta, fecha de descarga y advertencias) está en [`../../backend/docs/DATOS_NASA.md`](../../backend/docs/DATOS_NASA.md). Resumen de lo que usa el frontend y para qué:

| Dato en el juego | Fuente verificable | Cómo aparece |
| --- | --- | --- |
| Eventos de clima espacial (CME, SEP, GST) y la alerta del día 5 | NASA CCMC **DONKI** — https://ccmc.gsfc.nasa.gov/tools/DONKI/ · API https://api.nasa.gov/ · tormenta de mayo de 2024: https://ccmc.gsfc.nasa.gov/storms/may2024/ | Alerta del día 5 (registro de archivo, con fecha y enlace) y respuestas de LUNI. |
| Retraso de la señal Tierra–Luna (≈ 1,35 s) | NASA/JPL **Horizons** — https://ssd.jpl.nasa.gov/horizons/ | Ficha de LUNI y pantalla «Datos y fuentes». Los turnos de comunicación del juego son **protocolo**, no el tiempo-luz. |
| Radiación cerca de la Luna (13,22 μGy/h) y tormenta de 2017 (≈ 1732 ×) | NASA **OSDR RadLab**, instrumento CRaTER del LRO — https://visualization.osdr.nasa.gov/radlab/gui/data-api/ | Ficha de LUNI. CRaTER mide **en órbita lunar**, no en la superficie. |
| Gravedad lunar 1,62 m/s², salto de Young, formas de caminar del Apolo | NASA Moon Fact Sheet; Apollo Lunar Surface Journal; Carr y McGee 2009 (PLoS ONE) | Solo guían el ritmo del movimiento del avatar (salto lento y con peso); no cambian reglas. |

**Sobre «DUNKIN».** El material de investigación menciona «DUNKIN» en relación con radiación y astronautas. No se encontró ninguna base de datos de la NASA con ese nombre. La referencia más cercana y verificable es **DONKI** (*Database Of Notifications, Knowledge, Information*, NASA CCMC), que es la que usa el backend. Si el equipo se refería a otra fuente, hay que indicar el enlace exacto: no se inventó su contenido.

**Datos científicos frente a balance de juego.** Los tiempos de oxígeno, los 180 s de aire del traje, el 60 % de llenado mínimo, los costos y las probabilidades de los finales son **parámetros de balance** de un juego educativo. **No** son resultados médicos ni mediciones. No se inventaron umbrales de radiación ni efectos de salud. «Consecuencias numéricas ficticias» queda dicho en la alerta solar.
