# Matriz de cobertura de las 50 tareas

Generada con `npm run docs` a partir de `backend/data/challenges.json`. La dificultad interna (1–10) **no se muestra al jugador**: aquí solo sirve para auditar el balance.

| # | Tarea | Categoría | Escenario | Equipo (punto de interacción) | Puzzle | Dif. interna | Costo opción A | Costo opción B | Recompensa | Consecuencias | Desbloquea |
| ---: | --- | --- | --- | --- | --- | :---: | --- | --- | --- | --- | --- |
| 1 | Chequeo del aire | Soporte vital | Nave Zora | Monitor de aire (`zora-taller-2`) | Tapar fugas en orden | 1 | energy -7 | oxygen -10, health -5 | 14–27 monedas | aire_sin_revisar | 6, 9, 11, 16, 41 |
| 2 | Un dosímetro parpadea | Radiación | Cráter de exploración | Roca de muestra (`cra-roca`) | Leer el dosímetro en la zona verde | 1 | energy -4 | shield -9, health -5 | 14–27 monedas | exposicion_sin_control | 7, 12, 17, 27 |
| 3 | Polvo sobre los paneles | Energía | Paneles solares | Panel solar A (`pan-a`) | Limpiar el polvo de los paneles | 1 | oxygen -2 | shield -4, health -2 | 14–27 monedas | red_sobrecargada | 8, 13, 18, 23 |
| 4 | Primeras semillas | Alimentos | Invernadero | Bandeja de cultivo 3 (`inv-bandeja-3`) | Repetir la secuencia de riego | 1 | water -8, energy -3 | food -5, morale -2 | 14–27 monedas | cultivo_retrasado | 9, 14, 19, 24 |
| 5 | Primer mensaje desde Tierra | Comunicaciones | Nave Zora | Radio con la Tierra (`zora-com-radio`) | Orientar la antena hacia la Tierra | 2 | energy -6 | comms -12, morale -3 | 18–34 monedas | reporte_pendiente | 10, 15, 20, 25, 45 |
| 6 | Filtro saturado | Soporte vital | Nave Zora | Depósitos de soporte vital (`zora-tanques`) | Tapar fugas en orden | 2 | energy -9 | oxygen -13, health -7 | 18–34 monedas | tos | 16, 21, 11, 26 |
| 7 | Salida bajo observación | Radiación | Cráter de exploración | Roca de muestra (`cra-roca`) | Leer el dosímetro en la zona verde | 2 | research -3, morale -2 | oxygen -8, shield -10, health -5 | 18–34 monedas | eva_riesgosa | 12, 22, 17, 32 |
| 8 | Batería de reserva | Energía | Paneles solares | Panel solar B (`pan-b`) | Limpiar el polvo de los paneles | 2 | energy -8, research -2 | energy -12, water -4 | 18–34 monedas | energia_comprometida | 13, 28, 18, 23, 43 |
| 9 | Brotes desiguales | Alimentos | Invernadero | Bandeja de cultivo 2 (`inv-bandeja-2`) | Repetir la secuencia de riego | 3 | energy -7, water -3 | water -14, energy -2 | 22–41 monedas | riego_excesivo | 14, 24, 19, 29 |
| 10 | La respuesta tarda | Comunicaciones | Nave Zora | Radio con la Tierra (`zora-com-radio`) | Orientar la antena hacia la Tierra | 3 | energy -4 | comms -9, energy -11, morale -3 | 22–41 monedas | enlace_saturado | 15, 30, 20, 25 |
| 11 | Dolor de cabeza | Soporte vital | Nave Zora | Atención médica (`zora-medica`) | Tapar fugas en orden | 3 | energy -6 | health -16, morale -8 | 22–41 monedas | fatiga, mareos | 21, 31, 26, 36, 46 |
| 12 | Traje con protección dañada | Radiación | Nave Zora | Soporte del traje (`zora-traje`) | Leer el dosímetro en la zona verde | 3 | energy -8 | shield -15, health -9 | 22–41 monedas | traje_comprometido | 22, 27, 32, 37, 47 |
| 13 | Pico de consumo | Energía | Nave Zora | Baterías de energía (`zora-energia-bat`) | Limpiar el polvo de los paneles | 4 | water -3, food -3, research -2 | energy -20 | 26–48 monedas | energia_comprometida | 18, 28, 23, 33, 48 |
| 14 | ¿Agua para quién? | Alimentos | Invernadero | Depósito y riego (`inv-riego`) | Repetir la secuencia de riego | 4 | water -11 | food -12 | 26–48 monedas | cultivo_retrasado | 24, 34, 19, 29, 44 |
| 15 | Antena desalineada | Comunicaciones | Nave Zora | Consola de la antena (`zora-com-antena`) | Orientar la antena hacia la Tierra | 4 | energy -10 | comms -13, morale -5 | 26–48 monedas | sin_respuesta | 25, 30, 20, 35 |
| 16 | Microfuga de presión | Soporte vital | Nave Zora | Depósitos de soporte vital (`zora-tanques`) | Tapar fugas en orden | 4 | energy -13 | oxygen -12, water -7, energy -5 | 26–48 monedas | fuga_activa | 21, 36, 26, 31 |
| 17 | Alerta solar histórica | Radiación | Cráter de exploración | Equipo de análisis (`cra-analisis`) | Leer el dosímetro en la zona verde | 5 | energy -13 | oxygen -10, shield -18, health -12 | 30–55 monedas | exposicion_sin_control | 22, 37, 27, 32 |
| 18 | La sombra del cráter | Energía | Paneles solares | Panel solar B (`pan-b`) | Limpiar el polvo de los paneles | 5 | oxygen -5 | energy -19 | 30–55 monedas | energia_comprometida | 28, 33, 23, 38 |
| 19 | Contaminación del cultivo | Alimentos | Invernadero | Unidad de aislamiento (`inv-aislamiento`) | Repetir la secuencia de riego | 5 | food -8, water -4 | food -15, health -10, morale -6 | 30–55 monedas | contaminacion | 24, 29, 34, 39, 49 |
| 20 | Órdenes contradictorias | Comunicaciones | Nave Zora | Consola de la antena (`zora-com-antena`) | Orientar la antena hacia la Tierra | 5 | energy -4 | energy -11, oxygen -7, comms -5 | 30–55 monedas | orden_erronea | 30, 35, 25, 40, 45 |
| 21 | Reciclador de agua | Soporte vital | Nave Zora | Reciclador de agua (`zora-agua`) | Tapar fugas en orden | 6 | energy -12 | water -10, food -9, health -10 | 34–62 monedas | deshidratacion | 26, 36, 31 |
| 22 | Diseñar un refugio | Radiación | Cráter de exploración | Roca de muestra (`cra-roca`) | Leer el dosímetro en la zona verde | 6 | energy -12, morale -3 | shield -13, energy -6 | 34–62 monedas | refugio_incompleto | 27, 37, 32 |
| 23 | Apagón parcial | Energía | Nave Zora | Consola de energía (`zora-energia-consola`) | Limpiar el polvo de los paneles | 6 | food -9, research -3 | energy -17, oxygen -12, comms -9 | 34–62 monedas | fallo_red | 28, 38, 33 |
| 24 | Plantas marchitas | Alimentos | Invernadero | Bandeja de cultivo 3 (`inv-bandeja-3`) | Repetir la secuencia de riego | 6 | water -5, energy -6 | water -16, energy -15 | 34–62 monedas | consumo_excesivo | 29, 34, 39 |
| 25 | Enlace inestable | Comunicaciones | Nave Zora | Consola de la antena (`zora-com-antena`) | Orientar la antena hacia la Tierra | 7 | energy -3 | comms -12, morale -11, energy -6 | 38–69 monedas | aislamiento | 30, 40, 35, 50 |
| 26 | Respiración dificultosa | Soporte vital | Nave Zora | Atención médica (`zora-medica`) | Tapar fugas en orden | 7 | energy -12 | health -22, oxygen -15, morale -8 | 38–69 monedas | mareos, fatiga | 31, 36, 40, 46 |
| 27 | Exposición acumulada | Radiación | Cráter de exploración | Roca de muestra (`cra-roca`) | Leer el dosímetro en la zona verde | 7 | research -8 | shield -20, health -15 | 38–69 monedas | exposicion_sin_control, fatiga | 32, 37, 36, 47 |
| 28 | Distribución de energía | Energía | Paneles solares | Almacenamiento de energía (`pan-alm`) | Limpiar el polvo de los paneles | 7 | research -5 | energy -22, oxygen -7 | 38–69 monedas | red_sobrecargada | 33, 38, 36 |
| 29 | Biofilm en los conductos | Alimentos | Invernadero | Unidad de aislamiento (`inv-aislamiento`) | Repetir la secuencia de riego | 8 | food -10, water -8 | health -18, water -6 | 42–76 monedas | contaminacion, malestar_digestivo | 34, 39, 36 |
| 30 | Transmisión crítica | Comunicaciones | Nave Zora | Radio con la Tierra (`zora-com-radio`) | Orientar la antena hacia la Tierra | 8 | energy -12 | comms -16 | 42–76 monedas | plan_rescate, rescate_sin_datos | 35, 40 |
| 31 | Fatiga de la tripulación | Soporte vital | Nave Zora | Depósitos de soporte vital (`zora-tanques`) | Tapar fugas en orden | 8 | research -8, food -3 | health -17, morale -20 | 42–76 monedas | fatiga, aislamiento | 36, 40, 35 |
| 32 | EVA durante alerta | Radiación | Cráter de exploración | Roca de muestra (`cra-roca`) | Leer el dosímetro en la zona verde | 8 | oxygen -10, research -6 | shield -21, oxygen -15, health -14 | 42–76 monedas | exposicion_sin_control, fatiga | 37, 36, 40 |
| 33 | Falla de la red central | Energía | Nave Zora | Consola de energía (`zora-energia-consola`) | Limpiar el polvo de los paneles | 9 | research -12 | energy -19, oxygen -13, water -10, comms -12 | 46–83 monedas | fallo_red, apagones | 38, 36, 40, 48 |
| 34 | La última cosecha | Alimentos | Invernadero | Depósito y riego (`inv-riego`) | Repetir la secuencia de riego | 9 | water -4 | health -15, morale -3 | 46–83 monedas | malestar_digestivo | 39, 40, 36 |
| 35 | ¿Pedir evacuación? | Comunicaciones | Nave Zora | Consola de la antena (`zora-com-antena`) | Orientar la antena hacia la Tierra | 9 | energy -10 | comms -11, morale -12 | 46–83 monedas | evacuacion_solicitada, rescate_retrasado | 40, 36, 50 |
| 36 | Crisis de soporte vital | Soporte vital | Nave Zora | Depósitos de soporte vital (`zora-tanques`) | Tapar fugas en orden | 9 | energy -20, research -13 | oxygen -22, water -18, health -18 | 46–83 monedas | protocolo_emergencia, crisis_sin_resolver | 40, 35, 46 |
| 37 | Evento solar severo | Radiación | Cráter de exploración | Baliza de medición (`cra-baliza`) | Leer el dosímetro en la zona verde | 10 | energy -17, research -8 | shield -24, health -20, oxygen -9 | 50–90 monedas | refugio_exitoso, exposicion_sin_control | 40, 36, 47 |
| 38 | Racionamiento extremo | Energía | Paneles solares | Almacenamiento de energía (`pan-alm`) | Limpiar el polvo de los paneles | 10 | energy -10, food -8, research -10 | energy -21, oxygen -13, water -10, comms -12 | 50–90 monedas | prioridad_vital, apagones | 40, 36 |
| 39 | Semillas o comida | Alimentos | Invernadero | Bandeja de cultivo 3 (`inv-bandeja-3`) | Repetir la secuencia de riego | 10 | food -10 | research -12, morale -5 | 50–90 monedas | semillas_conservadas, sin_semillas | 40, 36, 49 |
| 40 | La última ventana de contacto | Comunicaciones | Nave Zora | Consola de la antena (`zora-com-antena`) | Orientar la antena hacia la Tierra | 10 | energy -12 | comms -16, morale -5 | 50–90 monedas | informe_final, informe_incompleto | — |
| 41 | Agua para generar oxígeno | Soporte vital | Nave Zora | Reciclador de agua (`zora-agua`) | Tapar fugas en orden | 4 | water -9, energy -7 | water -23, energy -14 | 26–48 monedas | deshidratacion | 21, 46 |
| 42 | Informe del dosímetro extraviado | Radiación | Cráter de exploración | Baliza de medición (`cra-baliza`) | Leer el dosímetro en la zona verde | 5 | comms -3 | shield -15, health -8 | 30–55 monedas | eva_riesgosa, exposicion_sin_control | 27, 47, 32 |
| 43 | El dilema de los módulos | Energía | Paneles solares | Panel solar B (`pan-b`) | Limpiar el polvo de los paneles | 6 | food -12, energy -7 | energy -18, water -7, comms -8 | 34–62 monedas | cultivo_retrasado, energia_comprometida | 44, 45, 48, 33 |
| 44 | Falta de nutrientes | Alimentos | Invernadero | Bandeja de cultivo 2 (`inv-bandeja-2`) | Repetir la secuencia de riego | 6 | water -8, energy -5 | food -18, health -5, water -6 | 34–62 monedas | contaminacion | 34, 49, 29 |
| 45 | Mensaje duplicado: ¿orden real? | Comunicaciones | Nave Zora | Radio con la Tierra (`zora-com-radio`) | Orientar la antena hacia la Tierra | 7 | energy -4 | energy -14, comms -13, morale -8 | 38–69 monedas | orden_erronea, enlace_saturado | 40, 50, 33 |
| 46 | Descompresión del módulo médico | Soporte vital | Nave Zora | Atención médica (`zora-medica`) | Tapar fugas en orden | 7 | energy -15 | oxygen -34, health -25, energy -7, morale -10 | 38–69 monedas | fuga_activa, crisis_sin_resolver, hipoxia_grave | 36, 41 |
| 47 | Regreso desde el cráter | Radiación | Nave Zora | Soporte del traje (`zora-traje`) | Leer el dosímetro en la zona verde | 8 | oxygen -8, energy -9 | shield -29, oxygen -18, health -22 | 42–76 monedas | traje_comprometido, eva_sin_rescate | 37, 46, 32 |
| 48 | Apagón en cascada | Energía | Paneles solares | Panel solar B (`pan-b`) | Limpiar el polvo de los paneles | 8 | research -7 | energy -29, oxygen -17, water -15, health -9 | 42–76 monedas | apagones, crisis_sin_resolver | 46, 50, 36 |
| 49 | Ración sospechosa | Alimentos | Invernadero | Unidad de aislamiento (`inv-aislamiento`) | Repetir la secuencia de riego | 9 | food -17, water -8 | health -27, water -11, morale -14 | 46–83 monedas | malestar_digestivo, deshidratacion, contaminacion | 34, 46, 31, 36 |
| 50 | La última orden sin respuesta | Comunicaciones | Nave Zora | Consola de la antena (`zora-com-antena`) | Orientar la antena hacia la Tierra | 10 | energy -13 | comms -22, energy -14, health -20, oxygen -13, morale -12 | 50–90 monedas | rescate_retrasado, crisis_sin_resolver | — |

## Reparto por escenario

- Nave Zora: 25 tareas
- Cráter de exploración: 8 tareas
- Paneles solares: 7 tareas
- Invernadero: 10 tareas

## Cómo se comprobó la cobertura

- **Implementadas y enlazadas:** `tests/world.test.js` exige que las 50 tareas tengan escenario, equipo existente, puzzle y recompensa, que cada equipo se pueda alcanzar caminando desde la aparición y que cada escenario se llegue desde el exterior por sus puertas.
- **Alcanzables bajo sus condiciones:** el motor elige la siguiente tarea según el desempeño. Se jugaron **7 000 partidas simuladas** con el motor real (estrategias de opción A/B, éxito o fallo del puzzle y fallos dirigidos de comunicaciones o soporte vital) y se alcanzaron **las 50 tareas y los 10 finales** (`node tools/simular-alcance.mjs 7000`; resultado en `docs/EVIDENCIA.md`). Una sola partida dura 14 turnos, así que nadie las ve todas en una misma partida: el Diario de tareas muestra cuáles ya apareció.
- **Éxito, fallo, tiempo agotado y reintento:** éxito y fallo los resuelve el motor con el desempeño del puzzle (`completed`, `accuracy`, `mistakes`); «Rendirme» y el tiempo agotado entregan `completed:false`; «Omitir reto» cuenta como no hecha y sin recompensa; el reintento es **Repetir un día** desde la pausa.
