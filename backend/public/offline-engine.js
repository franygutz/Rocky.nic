/* Vita Lunae v0.5.0 — Luna, 50 retos, 10 finales; motor offline + contrato frontend */
(function(){'use strict';const CATALOG={"challenges":[{"id":1,"difficulty":1,"category":"life","categoryLabel":"Soporte vital","name":"Chequeo del aire","intro":"El sistema de ventilación registra una lectura irregular. ¿Conviene revisar antes de salir a explorar?","cause":"Inicio de la misión: primera inspección del hábitat.","science":"La calidad del aire depende de varios sistemas; una lectura no basta para diagnosticar la causa.","choices":[{"label":"Calibrar sensores y filtros","consequence":"El aire se estabiliza, pero se usa energía de mantenimiento.","delta":{"oxygen":10,"energy":-7,"health":3,"research":2},"next":[6,9],"add":[],"remove":[],"risk":0},{"label":"Confiar en el indicador","consequence":"Ahorrás energía hoy; mañana puede aparecer acumulación de CO₂ y dolor de cabeza.","delta":{"oxygen":-10,"energy":5,"health":-5},"next":[11,16,41],"add":["aire_sin_revisar"],"remove":[],"risk":2}],"rewardMin":14,"rewardMax":27},{"id":2,"difficulty":1,"category":"radiation","categoryLabel":"Radiación","name":"Un dosímetro parpadea","intro":"El medidor de una astronauta marca una anomalía antes de una salida al exterior.","cause":"Al acercarse al área de trajes.","science":"Los dosímetros registran exposición; un dato extraño debe contrastarse con el contexto y el instrumento.","choices":[{"label":"Verificar el instrumento","consequence":"Se pospone la salida y se aprende a comprobar la medición.","delta":{"energy":-4,"shield":5,"health":2,"research":4},"next":[7,12],"add":[],"remove":[],"risk":0},{"label":"Salir sin confirmar","consequence":"La misión gana tiempo, pero crece la incertidumbre sobre la exposición.","delta":{"research":2,"shield":-9,"health":-5},"next":[17,27],"add":["exposicion_sin_control"],"remove":[],"risk":2}],"rewardMin":14,"rewardMax":27},{"id":3,"difficulty":1,"category":"energy","categoryLabel":"Energía","name":"Polvo sobre los paneles","intro":"Parte de los paneles solares entrega menos energía de lo esperado.","cause":"Al revisar los sistemas exteriores.","science":"La iluminación, orientación y degradación afectan la generación solar; el polvo es un problema de mantenimiento.","choices":[{"label":"Limpiar con el robot","consequence":"Se recupera producción a cambio de gastar una pequeña reserva de batería.","delta":{"energy":11,"oxygen":-2,"research":2},"next":[8,13],"add":[],"remove":[],"risk":0},{"label":"Sobrecargar el sistema","consequence":"Aumenta la energía momentánea, pero un equipo queda exigido.","delta":{"energy":17,"shield":-4,"health":-2},"next":[18,23],"add":["red_sobrecargada"],"remove":[],"risk":2}],"rewardMin":14,"rewardMax":27},{"id":4,"difficulty":1,"category":"food","categoryLabel":"Alimentos","name":"Primeras semillas","intro":"El invernadero dispone de agua limitada y bandejas preparadas para iniciar un experimento.","cause":"Al entrar por primera vez al invernadero.","science":"La producción real de alimentos lleva tiempo: el indicador 'alimentos' incluye reservas y capacidad de producción.","choices":[{"label":"Sembrar con riego controlado","consequence":"La experiencia agrícola progresa, pero el agua se reduce.","delta":{"water":-8,"energy":-3,"food":4,"research":4,"morale":3},"next":[9,14],"add":[],"remove":[],"risk":0},{"label":"Guardar toda el agua","consequence":"Se preservan reservas, aunque se retrasa la investigación de cultivos.","delta":{"water":9,"food":-5,"morale":-2},"next":[19,24],"add":["cultivo_retrasado"],"remove":[],"risk":1}],"rewardMin":14,"rewardMax":27},{"id":5,"difficulty":2,"category":"comms","categoryLabel":"Comunicaciones","name":"Primer mensaje desde Tierra","intro":"La tripulación recibe instrucciones y fotografías; la batería de la antena compite con otras necesidades.","cause":"Después de instalarse en Luna-7.","science":"La demora normal de la señal Tierra–Luna es de aproximadamente 1,3 segundos en un solo sentido; las interrupciones mayores necesitan otra causa.","choices":[{"label":"Programar una transmisión breve","consequence":"Tierra conoce el estado de la base, a costa de energía.","delta":{"comms":11,"energy":-6,"morale":4},"next":[10,15],"add":[],"remove":[],"risk":0},{"label":"Posponer la transmisión","consequence":"Se reserva electricidad, pero se acumulan reportes pendientes.","delta":{"energy":7,"comms":-12,"morale":-3},"next":[20,25,45],"add":["reporte_pendiente"],"remove":[],"risk":1}],"rewardMin":18,"rewardMax":34},{"id":6,"difficulty":2,"category":"life","categoryLabel":"Soporte vital","name":"Filtro saturado","intro":"El módulo de soporte vital avisa que el filtro necesita atención.","cause":"Tras detectar lecturas variables de aire.","science":"La ventilación y eliminación de CO₂ forman parte del soporte vital, no solo el suministro de O₂.","choices":[{"label":"Cambiar el cartucho","consequence":"El aire mejora y se reduce el riesgo de síntomas.","delta":{"oxygen":13,"energy":-9,"health":5},"next":[16,21],"add":[],"remove":["aire_sin_revisar","tos"],"risk":0},{"label":"Reducir la ventilación","consequence":"Se ahorra energía, pero pueden aparecer molestias respiratorias.","delta":{"energy":11,"oxygen":-13,"health":-7},"next":[11,26],"add":["tos"],"remove":[],"risk":2}],"rewardMin":18,"rewardMax":34},{"id":7,"difficulty":2,"category":"radiation","categoryLabel":"Radiación","name":"Salida bajo observación","intro":"Los investigadores reportan un aumento de actividad solar; una excursión está por comenzar.","cause":"Cuando se dispone a salir del hábitat.","science":"El riesgo depende del evento solar, la ubicación y el blindaje; el juego simplifica estas variables.","choices":[{"label":"Reprogramar la salida","consequence":"La tripulación permanece protegida, pero se pierde una ventana de trabajo.","delta":{"shield":10,"health":4,"research":-3,"morale":-2},"next":[12,22],"add":[],"remove":[],"risk":0},{"label":"Hacer la excursión corta","consequence":"Se obtiene una muestra, pero aumentan los riesgos de exposición.","delta":{"research":10,"oxygen":-8,"shield":-10,"health":-5},"next":[17,32],"add":["eva_riesgosa"],"remove":[],"risk":2}],"rewardMin":18,"rewardMax":34},{"id":8,"difficulty":2,"category":"energy","categoryLabel":"Energía","name":"Batería de reserva","intro":"Una batería recién revisada puede alimentar el reciclador de agua o el laboratorio.","cause":"Al asignar la primera reserva eléctrica.","science":"Una batería almacena energía; no la crea.","choices":[{"label":"Dar prioridad al reciclador","consequence":"Se recupera agua; la investigación se retrasa.","delta":{"water":14,"energy":-8,"research":-2},"next":[13,28],"add":[],"remove":[],"risk":0},{"label":"Activar el laboratorio","consequence":"Se obtiene información científica, pero hay menos margen eléctrico.","delta":{"research":13,"energy":-12,"water":-4},"next":[18,23,43],"add":["energia_comprometida"],"remove":[],"risk":1}],"rewardMin":18,"rewardMax":34},{"id":9,"difficulty":3,"category":"food","categoryLabel":"Alimentos","name":"Brotes desiguales","intro":"Unas plántulas crecen peor que otras en el invernadero.","cause":"Después de comenzar el cultivo.","science":"El crecimiento vegetal depende conjuntamente de luz, agua, nutrientes y condiciones del ambiente.","choices":[{"label":"Revisar luz y nutrientes","consequence":"Se corrige la configuración, aunque requiere tiempo y energía.","delta":{"food":9,"energy":-7,"water":-3,"research":5},"next":[14,24],"add":[],"remove":["cultivo_retrasado"],"risk":0},{"label":"Aumentar el riego sin medir","consequence":"Algunas plantas mejoran, pero el agua se desperdicia y puede aparecer contaminación.","delta":{"food":3,"water":-14,"energy":-2},"next":[19,29],"add":["riego_excesivo"],"remove":[],"risk":2}],"rewardMin":22,"rewardMax":41},{"id":10,"difficulty":3,"category":"comms","categoryLabel":"Comunicaciones","name":"La respuesta tarda","intro":"No llega la confirmación de Tierra. ¿Es el retardo normal o una falla del enlace?","cause":"Cuando falla una confirmación.","science":"La demora de ~1,3 s por trayecto no explica una pérdida de comunicación de minutos u horas.","choices":[{"label":"Revisar el registro de señal","consequence":"Se descubre que una antena requiere ajuste y se evitan decisiones precipitadas.","delta":{"comms":8,"energy":-4,"research":4},"next":[15,30],"add":[],"remove":["reporte_pendiente"],"risk":0},{"label":"Repetir mensajes continuamente","consequence":"Aumenta la congestión y se consume más energía sin resolver la avería.","delta":{"comms":-9,"energy":-11,"morale":-3},"next":[20,25],"add":["enlace_saturado"],"remove":[],"risk":2}],"rewardMin":22,"rewardMax":41},{"id":11,"difficulty":3,"category":"life","categoryLabel":"Soporte vital","name":"Dolor de cabeza","intro":"Una astronauta presenta dolor de cabeza y fatiga; la tripulación sospecha un problema de aire o descanso.","cause":"Si se descuida el aire o la carga de trabajo.","science":"Los síntomas son inespecíficos; en el juego se investiga la causa en vez de asumir un diagnóstico.","choices":[{"label":"Comprobar aire y descansar","consequence":"Mejora el bienestar, con costo de energía y tiempo.","delta":{"health":13,"oxygen":9,"energy":-6,"morale":4},"next":[21,31],"add":[],"remove":["tos","aire_sin_revisar","fatiga"],"risk":0},{"label":"Pedirle que continúe","consequence":"Se mantiene la productividad momentánea, pero puede aparecer una crisis.","delta":{"research":6,"health":-16,"morale":-8},"next":[26,36,46],"add":["fatiga","mareos"],"remove":[],"risk":2}],"rewardMin":22,"rewardMax":41},{"id":12,"difficulty":3,"category":"radiation","categoryLabel":"Radiación","name":"Traje con protección dañada","intro":"Un aviso indica que la protección del traje de exploración podría estar comprometida.","cause":"Durante la preparación de un EVA.","science":"Un traje espacial protege ante varios peligros; la radiación es solo uno de ellos.","choices":[{"label":"Inspeccionar y cambiar piezas","consequence":"Se mejora la seguridad, consumiendo materiales y energía.","delta":{"shield":13,"energy":-8,"health":5},"next":[22,27],"add":[],"remove":["eva_riesgosa"],"risk":0},{"label":"Usarlo para una última misión","consequence":"Se obtiene una muestra, pero aumenta el riesgo para la persona que sale.","delta":{"research":11,"shield":-15,"health":-9},"next":[32,37,47],"add":["traje_comprometido"],"remove":[],"risk":2}],"rewardMin":22,"rewardMax":41},{"id":13,"difficulty":4,"category":"energy","categoryLabel":"Energía","name":"Pico de consumo","intro":"El reciclador, el invernadero y los ventiladores piden electricidad al mismo tiempo.","cause":"Cuando tres sistemas operan a la vez.","science":"El diseño de una microred requiere balancear generación, almacenamiento y demanda.","choices":[{"label":"Programar turnos de uso","consequence":"Baja la carga simultánea y se conserva energía, aunque avanza menos la investigación.","delta":{"energy":12,"water":-3,"food":-3,"research":-2},"next":[18,28],"add":[],"remove":["red_sobrecargada"],"risk":0},{"label":"Mantener todo encendido","consequence":"La producción continúa, pero se deteriora el margen eléctrico.","delta":{"food":7,"water":6,"energy":-20},"next":[23,33,48],"add":["energia_comprometida"],"remove":[],"risk":2}],"rewardMin":26,"rewardMax":48},{"id":14,"difficulty":4,"category":"food","categoryLabel":"Alimentos","name":"¿Agua para quién?","intro":"El laboratorio pide agua de riego mientras el soporte vital necesita reservas para operar.","cause":"Al repartir el agua almacenada.","science":"En una base lunar, el agua debe contabilizarse para consumo, higiene, reciclaje y procesos técnicos.","choices":[{"label":"Asignar riego medido","consequence":"Se protege el cultivo, con una disminución moderada de agua.","delta":{"food":10,"water":-11,"morale":3},"next":[24,34],"add":[],"remove":[],"risk":1},{"label":"Reservar agua para la tripulación","consequence":"Disminuye el riesgo inmediato, pero el cultivo queda comprometido.","delta":{"water":12,"health":4,"food":-12},"next":[19,29,44],"add":["cultivo_retrasado"],"remove":[],"risk":0}],"rewardMin":26,"rewardMax":48},{"id":15,"difficulty":4,"category":"comms","categoryLabel":"Comunicaciones","name":"Antena desalineada","intro":"El movimiento del módulo o una avería de orientación disminuye la calidad del enlace.","cause":"Tras perder calidad de señal.","science":"La geometría y orientación del enlace afectan las comunicaciones; no todo retraso es latencia normal.","choices":[{"label":"Recalibrar desde el interior","consequence":"Se recupera comunicación y se documenta el fallo.","delta":{"comms":18,"energy":-10,"research":4},"next":[25,30],"add":[],"remove":["enlace_saturado"],"risk":0},{"label":"Esperar otra ventana","consequence":"Se ahorra electricidad, pero una orden crítica puede llegar tarde.","delta":{"energy":8,"comms":-13,"morale":-5},"next":[20,35],"add":["sin_respuesta"],"remove":[],"risk":2}],"rewardMin":26,"rewardMax":48},{"id":16,"difficulty":4,"category":"life","categoryLabel":"Soporte vital","name":"Microfuga de presión","intro":"Un sensor detecta una pérdida lenta en un compartimento del hábitat.","cause":"Después de alertas de presión.","science":"En un hábitat presurizado, una fuga debe localizarse: producir más oxígeno no repara la causa.","choices":[{"label":"Aislar y reparar la sección","consequence":"Se preserva el aire; el equipo sacrifica energía y tiempo.","delta":{"oxygen":18,"energy":-13,"health":6},"next":[21,36],"add":[],"remove":["aire_sin_revisar"],"risk":0},{"label":"Compensar con más suministro","consequence":"La situación queda abierta y consume reservas cada turno.","delta":{"oxygen":-12,"water":-7,"energy":-5},"next":[26,31],"add":["fuga_activa"],"remove":[],"risk":2}],"rewardMin":26,"rewardMax":48},{"id":17,"difficulty":5,"category":"radiation","categoryLabel":"Radiación","name":"Alerta solar histórica","intro":"El observatorio presenta un evento solar documentado por NASA DONKI como escenario de entrenamiento.","cause":"Cuando llega el aviso del observatorio.","science":"DONKI informa eventos solares históricos; no convierte por sí solo un evento en una dosis exacta sobre la Luna.","choices":[{"label":"Activar protocolo de refugio","consequence":"Se reduce el riesgo y se gasta energía del sistema de protección.","delta":{"shield":16,"energy":-13,"health":6,"research":3},"next":[22,37],"add":[],"remove":["eva_riesgosa"],"risk":0},{"label":"Continuar tareas exteriores","consequence":"Se gana ciencia de campo, pero se asume una exposición simulada mayor.","delta":{"research":16,"oxygen":-10,"shield":-18,"health":-12},"next":[27,32],"add":["exposicion_sin_control"],"remove":[],"risk":2}],"rewardMin":30,"rewardMax":55},{"id":18,"difficulty":5,"category":"energy","categoryLabel":"Energía","name":"La sombra del cráter","intro":"La posición del Sol deja un conjunto de paneles en sombra durante una ventana de trabajo.","cause":"Al acercarse a una zona poco iluminada.","science":"En la Luna, las sombras y los ciclos de iluminación afectan directamente la generación solar.","choices":[{"label":"Mover robots y redistribuir carga","consequence":"Se reequilibra la energía, aunque se gasta oxígeno/electricidad en operaciones.","delta":{"energy":12,"oxygen":-5,"research":3},"next":[28,33],"add":[],"remove":[],"risk":0},{"label":"Conservar todos los consumos","consequence":"La batería se agota más rápido y aumenta el riesgo de apagón.","delta":{"energy":-19,"food":5},"next":[23,38],"add":["energia_comprometida"],"remove":[],"risk":2}],"rewardMin":30,"rewardMax":55},{"id":19,"difficulty":5,"category":"food","categoryLabel":"Alimentos","name":"Contaminación del cultivo","intro":"Se observan señales compatibles con contaminación en una bandeja hidropónica.","cause":"Si el control sanitario es insuficiente.","science":"La higiene alimentaria y el monitoreo de sistemas cerrados son cruciales en ambientes espaciales.","choices":[{"label":"Aislar las bandejas sospechosas","consequence":"Se pierde parte del cultivo, pero se protege el resto y la salud.","delta":{"food":-8,"water":-4,"health":7,"research":5},"next":[24,29],"add":[],"remove":["riego_excesivo"],"risk":0},{"label":"Mezclar toda la cosecha","consequence":"Se evita la pérdida inmediata, pero podría comprometer el alimento almacenado.","delta":{"food":-15,"health":-10,"morale":-6},"next":[34,39,49],"add":["contaminacion"],"remove":[],"risk":2}],"rewardMin":30,"rewardMax":55},{"id":20,"difficulty":5,"category":"comms","categoryLabel":"Comunicaciones","name":"Órdenes contradictorias","intro":"Dos mensajes llegan desordenados y proponen prioridades diferentes.","cause":"Al reanudar el enlace.","science":"La comunicación espacial requiere mensajes verificables y procedimientos autónomos ante fallas.","choices":[{"label":"Verificar marcas de tiempo","consequence":"La tripulación aclara la secuencia y coordina mejor.","delta":{"comms":8,"energy":-4,"morale":7,"research":2},"next":[30,35],"add":[],"remove":["reporte_pendiente"],"risk":0},{"label":"Ejecutar el mensaje más reciente en pantalla","consequence":"Se evita demora, pero un equipo puede apagar un sistema necesario.","delta":{"energy":-11,"oxygen":-7,"comms":-5},"next":[25,40,45],"add":["orden_erronea"],"remove":[],"risk":2}],"rewardMin":30,"rewardMax":55},{"id":21,"difficulty":6,"category":"life","categoryLabel":"Soporte vital","name":"Reciclador de agua","intro":"El sistema recupera menos agua de la prevista y los depósitos descienden.","cause":"Cuando la reserva de agua cae o aparece una avería.","science":"El reciclaje conserva recursos, pero necesita mantenimiento y energía.","choices":[{"label":"Cambiar el circuito de recuperación","consequence":"Se recupera agua y mejora la seguridad, consumiendo electricidad.","delta":{"water":19,"energy":-12,"health":4},"next":[26,36],"add":[],"remove":["deshidratacion"],"risk":0},{"label":"Racionar sin reparar","consequence":"Se conserva energía, pero aumenta la fatiga y cae la producción.","delta":{"water":-10,"energy":8,"food":-9,"health":-10},"next":[31,36],"add":["deshidratacion"],"remove":[],"risk":2}],"rewardMin":34,"rewardMax":62},{"id":22,"difficulty":6,"category":"radiation","categoryLabel":"Radiación","name":"Diseñar un refugio","intro":"La base necesita elegir qué compartimento utilizará como refugio ante un evento solar.","cause":"Al preparar el protocolo de radiación.","science":"La cantidad y distribución de material de blindaje influyen en la protección; el simulador usa una escala abstracta.","choices":[{"label":"Proteger un espacio pequeño","consequence":"Mejora la protección de la tripulación, pero limita las actividades.","delta":{"shield":20,"energy":-12,"morale":-3},"next":[27,37],"add":[],"remove":[],"risk":0},{"label":"Distribuir materiales por toda la base","consequence":"Se mantiene la movilidad, aunque la protección efectiva resulta insuficiente.","delta":{"shield":-13,"energy":-6,"morale":2},"next":[32,37],"add":["refugio_incompleto"],"remove":[],"risk":2}],"rewardMin":34,"rewardMax":62},{"id":23,"difficulty":6,"category":"energy","categoryLabel":"Energía","name":"Apagón parcial","intro":"Un circuito se desconecta y deja sin electricidad a una zona del invernadero y a un ventilador.","cause":"Tras una sobrecarga o bajo nivel de baterías.","science":"La recuperación escalonada ayuda a controlar cargas críticas.","choices":[{"label":"Reiniciar por sectores","consequence":"El soporte vital se estabiliza, con un costo de alimento y productividad.","delta":{"energy":10,"oxygen":8,"food":-9,"research":-3},"next":[28,38],"add":[],"remove":["energia_comprometida"],"risk":0},{"label":"Forzar el reinicio general","consequence":"Es más rápido, pero puede propagar la avería a otros sistemas.","delta":{"energy":-17,"oxygen":-12,"comms":-9},"next":[33,38],"add":["fallo_red"],"remove":[],"risk":2}],"rewardMin":34,"rewardMax":62},{"id":24,"difficulty":6,"category":"food","categoryLabel":"Alimentos","name":"Plantas marchitas","intro":"El agua, la luz o la temperatura del invernadero no están bien equilibradas.","cause":"Cuando disminuye la producción proyectada.","science":"Los síntomas visibles en plantas tienen múltiples causas: observar antes de actuar evita desperdicios.","choices":[{"label":"Diagnosticar la causa","consequence":"Se corrigen condiciones antes de utilizar más recursos.","delta":{"food":11,"water":-5,"energy":-6,"research":7},"next":[29,34],"add":[],"remove":["cultivo_retrasado"],"risk":0},{"label":"Aumentar todos los suministros","consequence":"El cultivo mejora a corto plazo, pero se acelera el agotamiento de reservas.","delta":{"food":15,"water":-16,"energy":-15},"next":[34,39],"add":["consumo_excesivo"],"remove":[],"risk":2}],"rewardMin":34,"rewardMax":62},{"id":25,"difficulty":7,"category":"comms","categoryLabel":"Comunicaciones","name":"Enlace inestable","intro":"La base pierde contacto durante intervalos y una actividad exterior depende de una orden.","cause":"Cuando el vínculo con Tierra falla intermitentemente.","science":"La autonomía operativa es importante porque no siempre se puede depender de control terrestre inmediato.","choices":[{"label":"Activar protocolo autónomo","consequence":"La tripulación puede continuar con reglas de seguridad y gastar menos mensajes.","delta":{"comms":5,"morale":11,"energy":-3,"research":3},"next":[30,40],"add":[],"remove":["sin_respuesta"],"risk":0},{"label":"Esperar sin plan alternativo","consequence":"El equipo pierde tiempo, aumenta el estrés y se retrasa una reparación.","delta":{"comms":-12,"morale":-11,"energy":-6},"next":[35,40,50],"add":["aislamiento"],"remove":[],"risk":2}],"rewardMin":38,"rewardMax":69},{"id":26,"difficulty":7,"category":"life","categoryLabel":"Soporte vital","name":"Respiración dificultosa","intro":"Dos tripulantes presentan mareo y molestia respiratoria durante una tarea.","cause":"Si la calidad del aire empeora o no se atienden síntomas.","science":"Los signos de malestar requieren revisar soporte vital y seguridad, no diagnosticar automáticamente una enfermedad concreta.","choices":[{"label":"Detener trabajo y revisar la atmósfera","consequence":"Se detecta un problema del ambiente y se recupera seguridad.","delta":{"health":19,"oxygen":14,"energy":-12,"morale":5},"next":[31,36],"add":[],"remove":["mareos","tos","aire_sin_revisar"],"risk":0},{"label":"Continuar hasta terminar","consequence":"Se gana tiempo, pero el estado físico del equipo empeora.","delta":{"research":9,"health":-22,"oxygen":-15,"morale":-8},"next":[36,40,46],"add":["mareos","fatiga"],"remove":[],"risk":2}],"rewardMin":38,"rewardMax":69},{"id":27,"difficulty":7,"category":"radiation","categoryLabel":"Radiación","name":"Exposición acumulada","intro":"Un resumen del dosímetro indica que la planificación de salidas debe revisarse.","cause":"Después de varias salidas o un evento solar.","science":"La exposición acumulada debe compararse con límites y condiciones; en el juego no se calculan dosis clínicas.","choices":[{"label":"Reducir EVA y revisar protección","consequence":"El equipo protege su salud, aunque se pierde una misión científica.","delta":{"shield":15,"health":9,"research":-8},"next":[32,37],"add":[],"remove":["exposicion_sin_control"],"risk":0},{"label":"Priorizar los hallazgos","consequence":"Aumentan los datos recolectados, con un costo en la seguridad.","delta":{"research":17,"shield":-20,"health":-15},"next":[37,36,47],"add":["exposicion_sin_control","fatiga"],"remove":[],"risk":2}],"rewardMin":38,"rewardMax":69},{"id":28,"difficulty":7,"category":"energy","categoryLabel":"Energía","name":"Distribución de energía","intro":"Los científicos piden encender un nuevo instrumento justo cuando bajan las baterías.","cause":"Cuando varias tareas compiten por el mismo suministro.","science":"El manejo energético es un problema de optimización con restricciones y objetivos contrapuestos.","choices":[{"label":"Asignar cuotas por sistema","consequence":"Se priorizan agua y aire sin cancelar completamente la ciencia.","delta":{"energy":14,"research":-5,"oxygen":3,"water":3},"next":[33,38],"add":[],"remove":["red_sobrecargada"],"risk":0},{"label":"Dar prioridad total al instrumento","consequence":"La investigación avanza, pero las reservas eléctricas quedan muy exigidas.","delta":{"research":19,"energy":-22,"oxygen":-7},"next":[38,36],"add":["red_sobrecargada"],"remove":[],"risk":2}],"rewardMin":38,"rewardMax":69},{"id":29,"difficulty":8,"category":"food","categoryLabel":"Alimentos","name":"Biofilm en los conductos","intro":"Se sospecha una biopelícula en parte de la línea de riego y hay que proteger el sistema alimentario.","cause":"Si hay fallos de higiene o riego.","science":"Los sistemas de agua y alimentos en ambientes cerrados necesitan vigilancia microbiológica.","choices":[{"label":"Aislar y desinfectar el circuito","consequence":"Se pierde producción, pero se protege la salud y se aprende del incidente.","delta":{"food":-10,"water":-8,"health":10,"research":7},"next":[34,39],"add":[],"remove":["contaminacion"],"risk":0},{"label":"Usar el circuito hasta el final","consequence":"Se preserva producción temporal, pero aumenta el riesgo sanitario.","delta":{"food":7,"health":-18,"water":-6},"next":[39,36],"add":["contaminacion","malestar_digestivo"],"remove":[],"risk":2}],"rewardMin":42,"rewardMax":76},{"id":30,"difficulty":8,"category":"comms","categoryLabel":"Comunicaciones","name":"Transmisión crítica","intro":"Tierra solicita un informe para organizar una eventual ayuda. El enlace requiere prioridad eléctrica.","cause":"Cuando debe enviarse un balance de emergencia.","science":"Transmitir información confiable es tan importante como transmitir rápido.","choices":[{"label":"Enviar informe comprimido","consequence":"La situación de la base queda clara y aumenta la posibilidad de coordinación.","delta":{"comms":20,"energy":-12,"morale":6,"research":2},"next":[35,40],"add":["plan_rescate"],"remove":["enlace_saturado"],"risk":0},{"label":"Reservar batería para soporte vital","consequence":"Se protege el aire, pero Tierra queda con información incompleta.","delta":{"energy":12,"oxygen":7,"comms":-16},"next":[40,35],"add":["rescate_sin_datos"],"remove":[],"risk":1}],"rewardMin":42,"rewardMax":76},{"id":31,"difficulty":8,"category":"life","categoryLabel":"Soporte vital","name":"Fatiga de la tripulación","intro":"Una astronauta está agotada y comete errores de procedimiento.","cause":"Tras varios días con sobrecarga de tareas.","science":"El descanso, el trabajo en equipo y la salud conductual son parte de la planificación espacial.","choices":[{"label":"Reducir turnos y cuidar al equipo","consequence":"Mejora la salud y baja la probabilidad de errores, pero la producción se retrasa.","delta":{"health":19,"morale":15,"research":-8,"food":-3},"next":[36,40],"add":[],"remove":["fatiga","mareos","deshidratacion"],"risk":0},{"label":"Extender los turnos","consequence":"Aumenta la productividad momentánea, pero crece la fatiga y baja la moral.","delta":{"research":14,"health":-17,"morale":-20},"next":[36,35],"add":["fatiga","aislamiento"],"remove":[],"risk":2}],"rewardMin":42,"rewardMax":76},{"id":32,"difficulty":8,"category":"radiation","categoryLabel":"Radiación","name":"EVA durante alerta","intro":"Un equipo está afuera cuando llega un aviso que requiere una respuesta coordinada.","cause":"Durante salidas exteriores con riesgo aumentado.","science":"Ante una alerta de clima espacial, la protección y el procedimiento de retorno son claves.","choices":[{"label":"Retorno inmediato y refugio","consequence":"Se deja la tarea incompleta, pero mejora la seguridad.","delta":{"shield":13,"health":13,"oxygen":-10,"research":-6},"next":[37,36],"add":[],"remove":["eva_riesgosa"],"risk":0},{"label":"Terminar primero la tarea","consequence":"Se obtiene información, pero la tripulación afronta un peligro mayor.","delta":{"research":19,"shield":-21,"oxygen":-15,"health":-14},"next":[37,40],"add":["exposicion_sin_control","fatiga"],"remove":[],"risk":2}],"rewardMin":42,"rewardMax":76},{"id":33,"difficulty":9,"category":"energy","categoryLabel":"Energía","name":"Falla de la red central","intro":"Una avería de distribución amenaza con desconectar agua, comunicaciones y ventilación.","cause":"Si una sobrecarga no se resuelve a tiempo.","science":"La redundancia evita que una única falla detenga toda la misión.","choices":[{"label":"Crear una microred de emergencia","consequence":"Se mantienen los sistemas críticos, aunque la investigación se pausa.","delta":{"energy":18,"oxygen":9,"water":5,"research":-12},"next":[38,36],"add":[],"remove":["fallo_red"],"risk":0},{"label":"Continuar con un único circuito","consequence":"El reinicio parece rápido, pero si vuelve a fallar afecta múltiples sistemas.","delta":{"energy":-19,"oxygen":-13,"water":-10,"comms":-12},"next":[38,40,48],"add":["fallo_red","apagones"],"remove":[],"risk":2}],"rewardMin":46,"rewardMax":83},{"id":34,"difficulty":9,"category":"food","categoryLabel":"Alimentos","name":"La última cosecha","intro":"Las bandejas cultivadas antes del inicio de la misión pueden aportar alimento, pero deben inspeccionarse.","cause":"Cuando se agotan reservas y hay cultivos ya maduros.","science":"Una cosecha en siete días solo es plausible para plantas que ya estaban creciendo; el cultivo iniciado en el día 1 no madura de golpe.","choices":[{"label":"Cosechar solo lo seguro","consequence":"Se gana una reserva modesta y se protege la salud.","delta":{"food":19,"health":8,"water":-4,"research":3},"next":[39,40],"add":[],"remove":["contaminacion"],"risk":0},{"label":"Cosechar todo sin inspección","consequence":"La reserva aumenta, pero existe riesgo de malestar por alimento comprometido.","delta":{"food":26,"health":-15,"morale":-3},"next":[39,36],"add":["malestar_digestivo"],"remove":[],"risk":2}],"rewardMin":46,"rewardMax":83},{"id":35,"difficulty":9,"category":"comms","categoryLabel":"Comunicaciones","name":"¿Pedir evacuación?","intro":"El equipo debe decidir si solicita un retorno anticipado o continúa esperando suministros.","cause":"Ante incertidumbre sobre las reservas y la conexión.","science":"La decisión de terminar una misión debe considerar seguridad, logística y comunicaciones verificables.","choices":[{"label":"Solicitar ayuda con datos completos","consequence":"Tierra puede planear una respuesta; se consume la reserva de comunicaciones.","delta":{"comms":12,"energy":-10,"morale":8},"next":[40,36],"add":["evacuacion_solicitada"],"remove":[],"risk":0},{"label":"Mantener la misión sin informar","consequence":"Se conserva energía y autonomía, pero se retrasa una posible ayuda.","delta":{"energy":10,"comms":-11,"morale":-12},"next":[40,36,50],"add":["rescate_retrasado"],"remove":[],"risk":2}],"rewardMin":46,"rewardMax":83},{"id":36,"difficulty":9,"category":"life","categoryLabel":"Soporte vital","name":"Crisis de soporte vital","intro":"Dos sistemas esenciales presentan fallos al mismo tiempo y el margen operativo es mínimo.","cause":"Si se acumulan problemas de aire y agua.","science":"En operaciones de emergencia, la prioridad es mantener sistemas críticos, no maximizar investigación.","choices":[{"label":"Aplicar protocolo de emergencia","consequence":"Se prioriza el aire y el agua, sacrificando energía y experimentos.","delta":{"oxygen":23,"water":14,"energy":-20,"research":-13,"health":9},"next":[40,35],"add":["protocolo_emergencia"],"remove":["fuga_activa","mareos"],"risk":0},{"label":"Improvisar para salvar los experimentos","consequence":"Se conservan datos científicos, pero se compromete la seguridad de la base.","delta":{"research":19,"oxygen":-22,"water":-18,"health":-18},"next":[40,35,46],"add":["crisis_sin_resolver"],"remove":[],"risk":2}],"rewardMin":46,"rewardMax":83},{"id":37,"difficulty":10,"category":"radiation","categoryLabel":"Radiación","name":"Evento solar severo","intro":"El equipo aplica un escenario extremo inspirado en registros científicos de clima espacial.","cause":"Durante una alerta grave en un tramo avanzado.","science":"Los escenarios de radiación son educativos: no sustituyen cálculos específicos de dosis lunar.","choices":[{"label":"Permanecer en refugio protegido","consequence":"La tripulación reduce el riesgo, aunque cae la generación y se pierden actividades.","delta":{"shield":21,"health":13,"energy":-17,"research":-8},"next":[40,36],"add":["refugio_exitoso"],"remove":["exposicion_sin_control"],"risk":0},{"label":"Salir a reparar en ese momento","consequence":"Se recupera parte de la energía, a costa de mayor exposición simulada.","delta":{"energy":17,"shield":-24,"health":-20,"oxygen":-9},"next":[40,36,47],"add":["exposicion_sin_control"],"remove":[],"risk":2}],"rewardMin":50,"rewardMax":90},{"id":38,"difficulty":10,"category":"energy","categoryLabel":"Energía","name":"Racionamiento extremo","intro":"Quedan pocas reservas eléctricas y tres sistemas importantes requieren energía.","cause":"Cuando la producción solar ya no cubre la demanda.","science":"En una red de recursos limitados se deben definir cargas críticas y cargas aplazables.","choices":[{"label":"Mantener primero aire y agua","consequence":"Se salva el soporte vital y se suspenden tareas secundarias.","delta":{"oxygen":14,"water":11,"energy":-10,"food":-8,"research":-10},"next":[40,36],"add":["prioridad_vital"],"remove":[],"risk":0},{"label":"Alimentar todas las tareas por igual","consequence":"Ningún sistema recibe lo suficiente y aumenta el riesgo de apagón total.","delta":{"energy":-21,"oxygen":-13,"water":-10,"comms":-12},"next":[40,36],"add":["apagones"],"remove":[],"risk":2}],"rewardMin":50,"rewardMax":90},{"id":39,"difficulty":10,"category":"food","categoryLabel":"Alimentos","name":"Semillas o comida","intro":"Quedan reservas limitadas: la tripulación debe decidir qué conservar para el futuro de la base.","cause":"Cuando hay que escoger entre corto y largo plazo.","science":"La seguridad alimentaria integra disponibilidad inmediata y resiliencia del sistema de producción.","choices":[{"label":"Preservar semillas y racionar","consequence":"Se protege la sostenibilidad a largo plazo, pero cae la comida inmediata.","delta":{"food":-10,"water":5,"research":13,"morale":5},"next":[40,36],"add":["semillas_conservadas"],"remove":[],"risk":1},{"label":"Consumir todas las reservas disponibles","consequence":"Se mejora la comida inmediata, aunque se sacrifica la capacidad de continuar cultivando.","delta":{"food":20,"health":6,"research":-12,"morale":-5},"next":[40,36,49],"add":["sin_semillas"],"remove":[],"risk":1}],"rewardMin":50,"rewardMax":90},{"id":40,"difficulty":10,"category":"comms","categoryLabel":"Comunicaciones","name":"La última ventana de contacto","intro":"Al completar la misión, Tierra necesita un informe final para organizar el siguiente paso.","cause":"Al acercarse el final de la campaña.","science":"La calidad de una misión también depende del registro y comunicación del conocimiento adquirido.","choices":[{"label":"Transmitir telemetría y decisiones","consequence":"Se documenta lo aprendido y mejora la coordinación, a costa de electricidad.","delta":{"comms":19,"energy":-12,"research":12,"morale":8},"next":[],"add":["informe_final"],"remove":[],"risk":0},{"label":"Guardar la energía restante","consequence":"Se protege la última reserva energética, pero Tierra recibe menos información.","delta":{"energy":13,"comms":-16,"morale":-5},"next":[],"add":["informe_incompleto"],"remove":[],"risk":1}],"rewardMin":50,"rewardMax":90},{"id":41,"difficulty":4,"category":"life","categoryLabel":"Soporte vital","name":"Agua para generar oxígeno","intro":"El generador de oxígeno por electrólisis necesita agua mientras los depósitos de consumo disminuyen.","cause":"El depósito de oxígeno entra en modo de demanda alta.","science":"La electrólisis requiere agua y electricidad; la simulación simplifica los flujos reales.","choices":[{"label":"Ajustar producción y recuperar agua","consequence":"El sistema mantiene el aire con un uso controlado de depósitos.","delta":{"oxygen":10,"water":-9,"energy":-7,"health":3},"next":[21,46],"add":[],"remove":[],"risk":0},{"label":"Exigir producción máxima","consequence":"Sube el oxígeno, pero se agotan las reservas hídricas y se abre una crisis.","delta":{"oxygen":17,"water":-23,"energy":-14},"next":[21,46],"add":["deshidratacion"],"remove":[],"risk":2}],"rewardMin":26,"rewardMax":48},{"id":42,"difficulty":5,"category":"radiation","categoryLabel":"Radiación","name":"Informe del dosímetro extraviado","intro":"Una científica perdió el historial de dosis antes de planificar una nueva salida.","cause":"Una alerta de radiación coincide con la planificación de EVA.","science":"Las lecturas de dosis permiten tomar decisiones informadas; no predicen por sí solas un desenlace.","choices":[{"label":"Reconstruir lecturas y detener EVA","consequence":"Se protege al equipo y el reporte queda documentado.","delta":{"shield":10,"research":7,"comms":-3,"morale":1},"next":[27,47],"add":[],"remove":["exposicion_sin_control"],"risk":0},{"label":"Autorizar sin historial","consequence":"Se adelanta la expedición, pero el riesgo sin evaluar permanece.","delta":{"research":8,"shield":-15,"health":-8},"next":[32,47],"add":["eva_riesgosa","exposicion_sin_control"],"remove":[],"risk":2}],"rewardMin":30,"rewardMax":55},{"id":43,"difficulty":6,"category":"energy","categoryLabel":"Energía","name":"El dilema de los módulos","intro":"Solo queda potencia suficiente para mantener activados dos de tres módulos: reciclador, cultivo y antena.","cause":"El consumo supera la potencia disponible.","science":"La gestión eléctrica debe priorizar cargas críticas, no solo la comodidad.","choices":[{"label":"Priorizar reciclador y antena","consequence":"La tripulación conserva agua y contacto; los cultivos se retrasan.","delta":{"water":12,"comms":9,"food":-12,"energy":-7},"next":[44,45],"add":["cultivo_retrasado"],"remove":[],"risk":0},{"label":"Priorizar cultivo y laboratorio","consequence":"Avanza la ciencia y crecen las reservas de comida, pero falla la distribución.","delta":{"food":11,"research":7,"energy":-18,"water":-7,"comms":-8},"next":[48,33],"add":["energia_comprometida"],"remove":[],"risk":2}],"rewardMin":34,"rewardMax":62},{"id":44,"difficulty":6,"category":"food","categoryLabel":"Alimentos","name":"Falta de nutrientes","intro":"Las plantas están vivas, pero el sistema hidropónico tiene una mezcla incorrecta de nutrientes.","cause":"El rendimiento del invernadero disminuye.","science":"La hidroponía depende de agua, nutrientes y control microbiológico.","choices":[{"label":"Analizar solución y corregir dosis","consequence":"Se estabiliza el cultivo, gastando energía y materiales.","delta":{"food":14,"water":-8,"energy":-5,"research":6},"next":[34,49],"add":[],"remove":["cultivo_retrasado"],"risk":0},{"label":"Usar una mezcla sin revisar","consequence":"Parece ahorrar tiempo, pero compromete las bandejas y aumenta la incertidumbre.","delta":{"food":-18,"health":-5,"water":-6},"next":[29,49],"add":["contaminacion"],"remove":[],"risk":2}],"rewardMin":34,"rewardMax":62},{"id":45,"difficulty":7,"category":"comms","categoryLabel":"Comunicaciones","name":"Mensaje duplicado: ¿orden real?","intro":"Llega una instrucción repetida y el equipo no sabe si corresponde a la situación actual.","cause":"Dos paquetes de comunicaciones parecen contradictorios.","science":"La latencia física Tierra–Luna no es lo mismo que una falla o mensaje duplicado.","choices":[{"label":"Validar sello temporal y versión","consequence":"Evitan ejecutar dos veces una orden y dejan respaldo.","delta":{"comms":11,"research":6,"energy":-4},"next":[40,50],"add":[],"remove":["orden_erronea"],"risk":0},{"label":"Ejecutar sin verificar","consequence":"Se alteran prioridades y la red se congestiona aún más.","delta":{"energy":-14,"comms":-13,"morale":-8},"next":[33,50],"add":["orden_erronea","enlace_saturado"],"remove":[],"risk":2}],"rewardMin":38,"rewardMax":69},{"id":46,"difficulty":7,"category":"life","categoryLabel":"Soporte vital","name":"Descompresión del módulo médico","intro":"Una junta falla. La presión cae y un astronauta necesita asistencia inmediata.","cause":"Tras ignorar una fuga o detectarse un sello comprometido.","science":"Una despresurización puede comprometer rápidamente el soporte vital; sus números están simplificados.","choices":[{"label":"Sellar, aislar y asistir","consequence":"Se contienen pérdidas; la salud requiere vigilancia.","delta":{"oxygen":12,"energy":-15,"health":10,"morale":4},"next":[36,41],"add":[],"remove":["fuga_activa","mareos"],"risk":0},{"label":"Retrasar el aislamiento","consequence":"La fuga se agrava, aparece confusión y peligra la tripulación.","delta":{"oxygen":-34,"health":-25,"energy":-7,"morale":-10},"next":[36,41],"add":["fuga_activa","crisis_sin_resolver","hipoxia_grave"],"remove":[],"risk":2}],"rewardMin":38,"rewardMax":69},{"id":47,"difficulty":8,"category":"radiation","categoryLabel":"Radiación","name":"Regreso desde el cráter","intro":"Una astronauta está lejos de la base cuando recibe un aviso de peligro y se detecta un problema de sellado en el traje.","cause":"Se acumulan avisos de radiación y fallas de traje.","science":"Un traje mal sellado implica riesgos inmediatos de presión y oxígeno; el evento solar contextualiza la decisión, pero no se infiere una dosis letal.","choices":[{"label":"Regresar con asistencia del rover","consequence":"La astronauta vuelve a un área segura; la expedición se interrumpe.","delta":{"shield":12,"oxygen":-8,"health":5,"energy":-9},"next":[37,46],"add":[],"remove":["traje_comprometido","eva_riesgosa","eva_sin_rescate"],"risk":0},{"label":"Terminar la recolección","consequence":"La EVA se prolonga con un traje comprometido y el riesgo se vuelve extremo.","delta":{"shield":-29,"oxygen":-18,"health":-22,"research":9},"next":[32,37],"add":["traje_comprometido","eva_sin_rescate"],"remove":[],"risk":2}],"rewardMin":42,"rewardMax":76},{"id":48,"difficulty":8,"category":"energy","categoryLabel":"Energía","name":"Apagón en cascada","intro":"La red está sobrecargada. El ventilador, el reciclador y las comunicaciones están a punto de detenerse.","cause":"El mal balance de cargas y las fallas previas se combinan.","science":"Sin distribución eléctrica estable, los equipos de soporte vital pueden verse afectados.","choices":[{"label":"Aislar circuitos y reiniciar","consequence":"Se recuperan funciones básicas y queda limitada la investigación.","delta":{"energy":10,"oxygen":10,"water":8,"research":-7},"next":[46,50],"add":[],"remove":["fallo_red","apagones"],"risk":0},{"label":"Reiniciar todo a la vez","consequence":"La sobrecarga afecta tres sistemas y se aceleran los efectos sobre la tripulación.","delta":{"energy":-29,"oxygen":-17,"water":-15,"health":-9},"next":[36,46],"add":["apagones","crisis_sin_resolver"],"remove":[],"risk":2}],"rewardMin":42,"rewardMax":76},{"id":49,"difficulty":9,"category":"food","categoryLabel":"Alimentos","name":"Ración sospechosa","intro":"Dos tripulantes tienen malestar digestivo después de compartir un alimento posiblemente contaminado.","cause":"El invernadero sufrió problemas de limpieza y almacenamiento.","science":"Ante sospecha de contaminación alimentaria se identifica y aísla el producto, no se diagnostica solo por síntomas.","choices":[{"label":"Aislar alimento y dar asistencia","consequence":"Se evita más exposición, aunque se pierde parte de la comida.","delta":{"health":13,"food":-17,"water":-8,"morale":6},"next":[34,46],"add":[],"remove":["contaminacion","malestar_digestivo"],"risk":0},{"label":"Seguir repartiendo raciones","consequence":"Aparecen más síntomas y se reduce la capacidad de trabajo.","delta":{"food":8,"health":-27,"water":-11,"morale":-14},"next":[31,36],"add":["malestar_digestivo","deshidratacion","contaminacion"],"remove":[],"risk":2}],"rewardMin":46,"rewardMax":83},{"id":50,"difficulty":10,"category":"comms","categoryLabel":"Comunicaciones","name":"La última orden sin respuesta","intro":"La base requiere coordinar una evacuación; el enlace es intermitente y una nueva instrucción podría no llegar a tiempo.","cause":"El equipo acumuló demoras o problemas eléctricos y de antena.","science":"La autonomía de la tripulación es esencial porque la comunicación puede perderse.","choices":[{"label":"Aplicar plan local y enviar señal","consequence":"Se mantiene autonomía operativa y se envía el mejor informe disponible.","delta":{"comms":14,"energy":-13,"morale":10,"health":5},"next":[],"add":[],"remove":["sin_respuesta"],"risk":0},{"label":"Esperar sin actuar","consequence":"Se agotan reservas críticas y el rescate se retrasa.","delta":{"comms":-22,"energy":-14,"health":-20,"oxygen":-13,"morale":-12},"next":[],"add":["rescate_retrasado","crisis_sin_resolver"],"remove":[],"risk":2}],"rewardMin":50,"rewardMax":90}],"items":[{"id":"agua","name":"💧 Reserva de agua","price":35,"desc":"+18 agua; ayuda a recuperar un depósito.","delta":{"water":18},"remove":["deshidratacion"],"limit":3},{"id":"bateria","name":"🔋 Batería portátil","price":42,"desc":"+20 energía para sistemas esenciales.","delta":{"energy":20},"remove":["energia_comprometida"],"limit":3},{"id":"oxigeno","name":"🫁 Cartucho de oxígeno","price":49,"desc":"+20 oxígeno; ayuda ante niveles bajos.","delta":{"oxygen":20},"remove":["aire_sin_revisar"],"limit":3},{"id":"botiquin","name":"🧰 Botiquín médico","price":58,"desc":"+18 salud; alivia fatiga y mareos.","delta":{"health":18},"remove":["fatiga","mareos"],"limit":2},{"id":"escudo","name":"🛡️ Kit de refugio","price":72,"desc":"+22 protección; repara fallas preventivas.","delta":{"shield":22},"remove":["refugio_incompleto"],"limit":2},{"id":"comms","name":"📡 Módulo de antena","price":55,"desc":"+20 comunicaciones; resuelve saturación.","delta":{"comms":20},"remove":["enlace_saturado"],"limit":2},{"id":"huerto","name":"🌿 Kit hidropónico","price":46,"desc":"+17 alimentos y +3 investigación.","delta":{"food":17,"research":3},"remove":["cultivo_retrasado"],"limit":2}],"endings":{"1":{"title":"Aurora de Luna-7","description":"La tripulación concluye estable y con importantes resultados científicos."},"2":{"title":"Jardín de estrellas","description":"El invernadero y las reservas quedan preparados para el siguiente equipo."},"3":{"title":"Conocimiento para la Tierra","description":"La misión aporta valiosa investigación a pesar de las dificultades."},"4":{"title":"El puente restaurado","description":"La comunicación permite coordinar la siguiente fase de la misión."},"5":{"title":"Una tripulación unida","description":"La cooperación y el cuidado de las personas sostuvieron la base."},"6":{"title":"Rescate imperfecto","description":"La misión llega al cierre con dificultades y un plan de apoyo."},"7":{"title":"Silencio controlado","description":"El equipo conserva la seguridad, pero el enlace con Tierra sigue comprometido."},"8":{"title":"Retirada de emergencia","description":"La tripulación interrumpe la misión científica y activa procedimientos de emergencia."},"9":{"title":"Silencio en el hábitat","description":"Una crisis grave de soporte vital termina con el fallecimiento de un astronauta y el cierre de la misión."},"10":{"title":"La última caminata","description":"Una exploración con el traje comprometido termina con el fallecimiento de una astronauta."}},"facts":[{"id":"donki","topic":"storm","keywords":["tormenta","solar","radiacion","donki","particulas","sol"],"answer":"DONKI registra observaciones y análisis de eventos solares, como partículas energéticas solares (SEP) y eyecciones de masa coronal (CME). Una alerta es motivo para revisar el plan de refugio y las tareas exteriores; el riesgo lunar exacto requiere cálculos adicionales.","source":"NASA CCMC DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/tools/DONKI/","kind":"hecho_cientifico"},{"id":"oxygen","topic":"life","keywords":["oxigeno","aire","respirar","co2","fuga","tanque"],"answer":"El soporte vital no solo aporta oxígeno: también controla la atmósfera y ayuda a retirar dióxido de carbono. Si aparece una fuga, añadir oxígeno no sustituye reparar la fuente de la pérdida.","source":"NASA Open Science / material educativo del reto","sourceUrl":"https://science.nasa.gov/biological-physical/data/osdr/","kind":"explicacion_educativa"},{"id":"plant","topic":"food","keywords":["planta","semilla","riego","comida","alimento","cultivo","agua"],"answer":"Un cultivo necesita combinar agua, luz, nutrientes y control de su ambiente. Usar más agua no garantiza mejor crecimiento. Los alimentos de la base incluyen reservas, porque una planta recién sembrada no se cosecha al instante.","source":"Canadian Space Agency · Food production","sourceUrl":"https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/","kind":"explicacion_educativa"},{"id":"comms","topic":"comms","keywords":["comunicacion","mensaje","antena","latencia","tierra","retraso","señal"],"answer":"Un mensaje de radio tarda poco más de un segundo entre la Tierra y la Luna: 1,35 s el 14 de noviembre de 2026, con la Luna a 405 616 km (NASA/JPL Horizons). Entre noviembre y diciembre de 2026 va de 1,19 a 1,36 s. Por eso, una pérdida de contacto de minutos u horas indica otra causa: antenas, orientación, energía o procedimientos. En el juego, los retrasos por turnos son una simplificación.","source":"NASA/JPL Horizons · distancia y tiempo-luz Tierra–Luna","sourceUrl":"https://ssd.jpl.nasa.gov/horizons/","kind":"dato_verificado","verified":{"retrievedAt":"2026-11-14","query":"https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='301'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@399'&START_TIME='2026-11-01'&STOP_TIME='2026-12-31'&STEP_SIZE='6h'&QUANTITIES='20,21'"}},{"id":"power","topic":"energy","keywords":["energia","bateria","panel","electricidad","apagón","circuito"],"answer":"Una batería almacena energía; no la fabrica. Si varios sistemas consumen a la vez, hay que decidir qué carga tiene prioridad. Para proteger la tripulación suelen priorizarse las funciones de soporte vital.","source":"NASA · desafíos de energía de una base lunar","sourceUrl":"https://www.nasa.gov/","kind":"explicacion_educativa"},{"id":"radiation","topic":"radiation","keywords":["radiacion","dosis","dosimetro","crater","lro"],"answer":"El instrumento CRaTER, a bordo del orbitador LRO que gira alrededor de la Luna, mide radiación. En un día normal (enero de 2020) marcó 13,22 microgray por hora. En la tormenta solar del 11 de septiembre de 2017 llegó a 19 481,6 microgray por hora: unas 1732 veces lo normal, porque la Luna no tiene atmósfera ni un campo magnético global que la proteja. Son mediciones en órbita lunar, no dentro de un hábitat; por eso una base necesita un refugio.","source":"NASA OSDR RadLab · LRO CRaTER (órbita lunar)","sourceUrl":"https://visualization.osdr.nasa.gov/radlab/gui/data-api/","kind":"dato_verificado","verified":{"retrievedAt":"2026-11-14","baseline":"https://visualization.osdr.nasa.gov/radlab/api/?trajectory=Lunar%20orbit&spacecraft&instrument&timestamp%3E=2020-01-01T00%3A00&timestamp%3C2020-01-03T00%3A00&absorbed_dose_rate&format=csv","storm":"https://visualization.osdr.nasa.gov/radlab/api/?trajectory=Lunar%20orbit&spacecraft&instrument&timestamp%3E=2017-09-01T00%3A00&timestamp%3C2017-09-25T00%3A00&absorbed_dose_rate&format=csv"}},{"id":"sources","topic":"sources","keywords":["fuente","dato real","nasa","registro","medicion","investigacion"],"answer":"En Vita Lunae se distingue entre registros históricos NASA, explicaciones científicas y números inventados para el juego. Un evento solar de DONKI no es una dosis medida directamente dentro de un hábitat lunar.","source":"NASA Open APIs · DONKI","sourceUrl":"https://api.nasa.gov/","kind":"metodologia"}],"events":[{"id":"2024-05-12T21:00:00-GST-001","type":"GST","observedAt":"2024-05-12T21:00Z","title":"GST · 2024-05-12T21:00:00-GST-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/GST/30798/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.681Z","location":"Magnetosfera terrestre","summary":"Registro GST de DONKI. Índices Kp observados: 6.33, 5.67, 6.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-12T13:00:00-CME-001","type":"CME","observedAt":"2024-05-12T13:00Z","title":"CME · 2024-05-12T13:00:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30830/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.130Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-12T03:48:00-CME-001","type":"CME","observedAt":"2024-05-12T03:48Z","title":"CME · 2024-05-12T03:48:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30755/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.124Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-12T02:00:00-CME-001","type":"CME","observedAt":"2024-05-12T02:00Z","title":"CME · 2024-05-12T02:00:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30779/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.116Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-11T18:00:00-CME-001","type":"CME","observedAt":"2024-05-11T18:00Z","title":"CME · 2024-05-11T18:00:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30765/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.108Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-11T16:24:00-CME-001","type":"CME","observedAt":"2024-05-11T16:24Z","title":"CME · 2024-05-11T16:24:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30742/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.100Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-11T04:07:00-SEP-001","type":"SEP","observedAt":"2024-05-11T04:07Z","title":"SEP · 2024-05-11T04:07:00-SEP-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30717/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:55:30.726Z","location":"Observación solar","summary":"Registro SEP de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-11T03:12:00-CME-002","type":"CME","observedAt":"2024-05-11T03:12Z","title":"CME · 2024-05-11T03:12:00-CME-002","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30793/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.093Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-11T02:36:00-CME-001","type":"CME","observedAt":"2024-05-11T02:36Z","title":"CME · 2024-05-11T02:36:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30744/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.085Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-11T02:10:00-SEP-001","type":"SEP","observedAt":"2024-05-11T02:10Z","title":"SEP · 2024-05-11T02:10:00-SEP-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30714/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:55:30.718Z","location":"Observación solar","summary":"Registro SEP de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-11T01:36:00-CME-001","type":"CME","observedAt":"2024-05-11T01:36Z","title":"CME · 2024-05-11T01:36:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30719/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.078Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-10T23:13:00-CME-001","type":"CME","observedAt":"2024-05-10T23:13Z","title":"CME · 2024-05-10T23:13:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30784/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.071Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-10T21:28:00-CME-001","type":"CME","observedAt":"2024-05-10T21:28Z","title":"CME · 2024-05-10T21:28:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30753/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.065Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-10T21:17:00-CME-001","type":"CME","observedAt":"2024-05-10T21:17Z","title":"CME · 2024-05-10T21:17:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30751/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.060Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"20240510-AL-016","type":"GST","title":"Tormenta geomagnética de mayo de 2024 (Kp 8.67)","observedAt":"2024-05-10T21:00:00Z","source":"NASA CCMC DONKI · notificación 20240510-AL-016","sourceUrl":"https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/30703/1","datasetType":"registro_historico_verificado","retrievedAt":null,"summary":"DONKI registró Kp 8.67 en la magnetosfera terrestre durante el intervalo 18:00–21:00 UTC del 10 de mayo de 2024.","location":"Magnetosfera terrestre","note":"Kp describe actividad geomagnética cerca de la Tierra. No mide directamente la radiación de una base lunar."},{"id":"2024-05-10T16:36:00-CME-001","type":"CME","observedAt":"2024-05-10T16:36Z","title":"CME · 2024-05-10T16:36:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30786/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.053Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-10T15:00:00-GST-001","type":"GST","observedAt":"2024-05-10T15:00Z","title":"GST · 2024-05-10T15:00:00-GST-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/GST/30693/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.668Z","location":"Magnetosfera terrestre","summary":"Registro GST de DONKI. Índices Kp observados: 7.67, 8.67, 9, 9, 8.33, 8.67, 9, 8.67, 8.33, 7.33, 7.33, 6.67, 7.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-10T14:50:00-SEP-001","type":"SEP","observedAt":"2024-05-10T14:50Z","title":"SEP · 2024-05-10T14:50:00-SEP-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30684/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:55:30.712Z","location":"Observación solar","summary":"Registro SEP de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-10T13:35:00-SEP-001","type":"SEP","observedAt":"2024-05-10T13:35Z","title":"SEP · 2024-05-10T13:35:00-SEP-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30677/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:55:30.707Z","location":"Observación solar","summary":"Registro SEP de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-10T13:02:00-SEP-001","type":"SEP","observedAt":"2024-05-10T13:02Z","title":"SEP · 2024-05-10T13:02:00-SEP-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30676/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:55:30.700Z","location":"Observación solar","summary":"Registro SEP de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-10T12:59:00-SEP-001","type":"SEP","observedAt":"2024-05-10T12:59Z","title":"SEP · 2024-05-10T12:59:00-SEP-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30675/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:55:30.694Z","location":"Observación solar","summary":"Registro SEP de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-10T07:12:00-CME-001","type":"CME","observedAt":"2024-05-10T07:12Z","title":"CME · 2024-05-10T07:12:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30670/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.046Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-10T02:12:00-CME-001","type":"CME","observedAt":"2024-05-10T02:12Z","title":"CME · 2024-05-10T02:12:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30788/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.040Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-09T18:23:00-CME-001","type":"CME","observedAt":"2024-05-09T18:23Z","title":"CME · 2024-05-09T18:23:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30655/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.033Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-09T14:25:00-SEP-001","type":"SEP","observedAt":"2024-05-09T14:25Z","title":"SEP · 2024-05-09T14:25:00-SEP-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30610/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:55:30.688Z","location":"Observación solar","summary":"Registro SEP de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-09T13:59:00-SEP-001","type":"SEP","observedAt":"2024-05-09T13:59Z","title":"SEP · 2024-05-09T13:59:00-SEP-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30609/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:55:30.678Z","location":"Observación solar","summary":"Registro SEP de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."},{"id":"2024-05-09T09:24:00-CME-001","type":"CME","observedAt":"2024-05-09T09:24Z","title":"CME · 2024-05-09T09:24:00-CME-001","source":"NASA Open API / DONKI","sourceUrl":"https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30619/-1","datasetType":"registro_nasa_descargado","retrievedAt":"2026-11-14T20:51:19.024Z","location":"Observación solar","summary":"Registro CME de DONKI.","note":"La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados."}],"statusNames":{"aire_sin_revisar":"Aire sin revisar","exposicion_sin_control":"Exposición no evaluada","red_sobrecargada":"Red sobrecargada","cultivo_retrasado":"Cultivo retrasado","reporte_pendiente":"Reporte pendiente","tos":"Molestia respiratoria","eva_riesgosa":"Salida riesgosa","energia_comprometida":"Energía comprometida","riego_excesivo":"Riego excesivo","enlace_saturado":"Enlace saturado","fatiga":"Fatiga","mareos":"Mareos","traje_comprometido":"Traje comprometido","sin_respuesta":"Sin respuesta de Tierra","fuga_activa":"Fuga activa","contaminacion":"Posible contaminación","orden_erronea":"Orden incorrecta","refugio_incompleto":"Refugio insuficiente","fallo_red":"Falla de red","consumo_excesivo":"Consumo excesivo","deshidratacion":"Señales de deshidratación","aislamiento":"Aislamiento","malestar_digestivo":"Malestar digestivo","apagones":"Apagones recurrentes","crisis_sin_resolver":"Crisis sin resolver","rescate_retrasado":"Ayuda retrasada","sin_semillas":"Sin semillas de respaldo","hipoxia_grave":"Hipoxia grave","eva_sin_rescate":"EVA sin rescate inmediato","tanque_incompleto":"Tanque incompleto","oxigeno_agotado":"Oxígeno del traje agotado","plan_rescate":"Plan de rescate","rescate_sin_datos":"Rescate sin datos","evacuacion_solicitada":"Evacuación solicitada","protocolo_emergencia":"Protocolo de emergencia","refugio_exitoso":"Refugio exitoso","prioridad_vital":"Prioridad vital","semillas_conservadas":"Semillas conservadas","informe_final":"Informe final","informe_incompleto":"Informe incompleto"},"i18n":{"en":{"shop":{"agua":{"name":"💧 Water reserve","desc":"+18 water; helps refill a tank."},"bateria":{"name":"🔋 Portable battery","desc":"+20 energy for essential systems."},"oxigeno":{"name":"🫁 Oxygen cartridge","desc":"+20 oxygen; helps when levels are low."},"botiquin":{"name":"🧰 Medical kit","desc":"+18 health; eases tiredness and dizziness."},"escudo":{"name":"🛡️ Shelter kit","desc":"+22 protection; fixes preventive faults."},"comms":{"name":"📡 Antenna module","desc":"+20 communications; clears signal overload."},"huerto":{"name":"🌿 Hydroponic kit","desc":"+17 food and +3 research."}},"status":{"aire_sin_revisar":"Air not checked","exposicion_sin_control":"Exposure not assessed","red_sobrecargada":"Overloaded grid","cultivo_retrasado":"Delayed crop","reporte_pendiente":"Pending report","tos":"Breathing discomfort","eva_riesgosa":"Risky spacewalk","energia_comprometida":"Power at risk","riego_excesivo":"Too much watering","enlace_saturado":"Link overloaded","fatiga":"Fatigue","mareos":"Dizziness","traje_comprometido":"Suit compromised","sin_respuesta":"No answer from Earth","fuga_activa":"Active leak","contaminacion":"Possible contamination","orden_erronea":"Wrong order","refugio_incompleto":"Shelter not enough","fallo_red":"Grid failure","consumo_excesivo":"Too much use","deshidratacion":"Signs of dehydration","aislamiento":"Isolation","malestar_digestivo":"Stomach upset","apagones":"Repeated blackouts","crisis_sin_resolver":"Unresolved crisis","rescate_retrasado":"Help delayed","sin_semillas":"No backup seeds","hipoxia_grave":"Severe hypoxia","eva_sin_rescate":"Spacewalk with no quick rescue","tanque_incompleto":"Incomplete tank","oxigeno_agotado":"Suit oxygen used up","plan_rescate":"Rescue plan","rescate_sin_datos":"Rescue without data","evacuacion_solicitada":"Evacuation requested","protocolo_emergencia":"Emergency protocol","refugio_exitoso":"Shelter success","prioridad_vital":"Life first","semillas_conservadas":"Seeds saved","informe_final":"Final report","informe_incompleto":"Incomplete report"},"endings":{"1":{"title":"Aurora of Luna-7","description":"The crew ends safe and with important science results."},"2":{"title":"Star garden","description":"The greenhouse and supplies are ready for the next crew."},"3":{"title":"Knowledge for Earth","description":"The mission brings valuable research despite the difficulties."},"4":{"title":"The bridge restored","description":"Communication lets the team plan the next phase of the mission."},"5":{"title":"A united crew","description":"Teamwork and care for each other held the base together."},"6":{"title":"Imperfect rescue","description":"The mission ends with difficulties and a support plan."},"7":{"title":"Controlled silence","description":"The team stays safe, but the link with Earth is still at risk."},"8":{"title":"Emergency retreat","description":"The crew stops the science mission and starts emergency procedures."},"9":{"title":"Silence in the habitat","description":"A serious life-support crisis ends with the loss of an astronaut and the end of the mission."},"10":{"title":"The last walk","description":"A spacewalk with a compromised suit ends with the loss of an astronaut."}},"facts":{"donki":{"keywords":["storm","solar","radiation","donki","particles","sun"],"answer":"DONKI keeps records and analysis of solar events, such as solar energetic particles (SEP) and coronal mass ejections (CME). An alert is a reason to check the shelter plan and outdoor tasks. The exact Moon risk needs more calculations."},"oxygen":{"keywords":["oxygen","air","breathe","co2","leak","tank"],"answer":"Life support does more than add oxygen. It also controls the air and helps remove carbon dioxide. If there is a leak, adding oxygen does not replace fixing the source of the loss.","source":"NASA Open Science / educational material for the task"},"plant":{"keywords":["plant","seed","watering","water","food","crop","harvest"],"answer":"A crop needs water, light, nutrients and a controlled environment. Using more water does not guarantee better growth. Base food includes reserves, because a newly planted seed is not harvested right away."},"comms":{"keywords":["communication","message","antenna","latency","earth","delay","signal"],"answer":"A radio message takes a little over one second to travel between Earth and the Moon: 1.35 s on November 14, 2026, with the Moon at 405,616 km (NASA/JPL Horizons). Between November and December 2026 it goes from 1.19 to 1.36 s. So if contact is lost for minutes or hours, the cause is something else: antennas, pointing, power or procedures. In the game, turn delays are a simplification.","source":"NASA/JPL Horizons · Earth–Moon distance and light time"},"power":{"keywords":["energy","battery","solar panel","electricity","blackout","circuit"],"answer":"A battery stores energy; it does not make it. If several systems use power at the same time, you must decide which load comes first. To protect the crew, life-support functions usually come first.","source":"NASA · power challenges of a Moon base"},"radiation":{"keywords":["radiation","dose","dosimeter","crater","lro"],"answer":"The CRaTER instrument, on board the LRO orbiter that circles the Moon, measures radiation. On a normal day (January 2020) it read 13.22 microgray per hour. During the solar storm of September 11, 2017 it reached 19,481.6 microgray per hour: about 1,732 times normal, because the Moon has no atmosphere and no global magnetic field to protect it. These are measurements in lunar orbit, not inside a habitat; that is why a base needs a shelter.","source":"NASA OSDR RadLab · LRO CRaTER (lunar orbit)"},"sources":{"keywords":["source","real data","nasa","record","measurement","research"],"answer":"In Vita Lunae, we tell apart NASA historical records, science explanations and numbers made up for the game. A DONKI solar event is not a dose measured directly inside a lunar habitat."}},"challenges":{"1":{"name":"Air check","categoryLabel":"Life support","intro":"The ventilation system shows an odd reading. Should you check before going outside to explore?","cause":"Start of the mission: first check of the habitat.","science":"Air quality depends on several systems. One reading is not enough to find the cause.","choices":[{"label":"Calibrate sensors and filters","consequence":"Air becomes stable, but maintenance uses energy."},{"label":"Trust the indicator","consequence":"You save energy today, but CO₂ can build up tomorrow and cause headaches."}]},"2":{"name":"A dosimeter blinks","categoryLabel":"Radiation","intro":"One astronaut's meter shows an odd reading before a spacewalk.","cause":"As she gets close to the suit area.","science":"Dosimeters record exposure. An odd value must be checked against context and the instrument.","choices":[{"label":"Check the instrument","consequence":"The spacewalk is delayed, and the team learns how to check a measurement."},{"label":"Go out without checking","consequence":"The mission saves time, but uncertainty about exposure grows."}]},"3":{"name":"Dust on the panels","categoryLabel":"Energy","intro":"Some solar panels give less energy than expected.","cause":"While checking outside systems.","science":"Light, angle and wear all affect solar power. Dust is a maintenance problem.","choices":[{"label":"Clean with the robot","consequence":"Production recovers, at the cost of a small battery reserve."},{"label":"Overload the system","consequence":"Energy rises for a moment, but one piece of equipment is strained."}]},"4":{"name":"First seeds","categoryLabel":"Food","intro":"The greenhouse has limited water and trays ready for a first experiment.","cause":"On your first visit to the greenhouse.","science":"Real food production takes time: the 'food' meter includes reserves and production capacity.","choices":[{"label":"Plant with controlled watering","consequence":"The farming experiment moves ahead, but the water goes down."},{"label":"Save all the water","consequence":"Reserves are kept, but crop research is delayed."}]},"5":{"name":"First message from Earth","categoryLabel":"Communications","intro":"The crew receives instructions and photos; the antenna battery is needed for other things too.","cause":"After settling into Luna-7.","science":"The normal Earth–Moon signal delay is about 1.3 seconds one way. Longer interruptions need another cause.","choices":[{"label":"Send a short transmission","consequence":"Earth learns the base status, at a cost in energy."},{"label":"Postpone the transmission","consequence":"Power is saved, but pending reports pile up."}]},"6":{"name":"Clogged filter","categoryLabel":"Life support","intro":"The life-support module warns that the filter needs attention.","cause":"After variable air readings.","science":"Ventilation and CO₂ removal are part of life support, not just the oxygen supply.","choices":[{"label":"Replace the cartridge","consequence":"The air improves and the risk of symptoms drops."},{"label":"Reduce ventilation","consequence":"Energy is saved, but breathing discomfort can appear."}]},"7":{"name":"Outing under watch","categoryLabel":"Radiation","intro":"Researchers report more solar activity. A trip outside is about to start.","cause":"As she gets ready to leave the habitat.","science":"The risk depends on the solar event, the location and the shielding. The game simplifies these variables.","choices":[{"label":"Reschedule the trip","consequence":"The crew stays protected, but a work window is lost."},{"label":"Make the trip short","consequence":"A sample is collected, but exposure risks go up."}]},"8":{"name":"Backup battery","categoryLabel":"Energy","intro":"A freshly checked battery can power the water recycler or the lab.","cause":"When the first electrical reserve is assigned.","science":"A battery stores energy; it does not create it.","choices":[{"label":"Prioritize the recycler","consequence":"Water is recovered; research is delayed."},{"label":"Turn on the lab","consequence":"Science data is gathered, but there is less electrical margin."}]},"9":{"name":"Uneven sprouts","categoryLabel":"Food","intro":"Some seedlings grow worse than others in the greenhouse.","cause":"After the crop has started.","science":"Plant growth depends together on light, water, nutrients and the environment.","choices":[{"label":"Check light and nutrients","consequence":"The setup is fixed, though it takes time and energy."},{"label":"Increase watering without measuring","consequence":"Some plants improve, but water is wasted and contamination may appear."}]},"10":{"name":"The reply is late","categoryLabel":"Communications","intro":"Earth's confirmation has not arrived. Is it normal delay or a link failure?","cause":"When a confirmation fails.","science":"A delay of about 1.3 s each way does not explain a loss of communication lasting minutes or hours.","choices":[{"label":"Check the signal log","consequence":"An antenna needs adjusting, and rushed decisions are avoided."},{"label":"Repeat messages nonstop","consequence":"Congestion grows and energy is used up without fixing the fault."}]},"11":{"name":"Headache","categoryLabel":"Life support","intro":"An astronaut has a headache and tiredness. The crew suspects an air or rest problem.","cause":"If air quality or workload is ignored.","science":"Symptoms are not specific. In the game, the team looks for the cause instead of making a diagnosis.","choices":[{"label":"Check the air and rest","consequence":"Well-being improves, at a cost in energy and time."},{"label":"Ask her to keep going","consequence":"Productivity holds for now, but a crisis may appear."}]},"12":{"name":"Suit with damaged protection","categoryLabel":"Radiation","intro":"A warning says the exploration suit's protection may be compromised.","cause":"While preparing for a spacewalk.","science":"A spacesuit protects against several dangers; radiation is only one of them.","choices":[{"label":"Inspect and replace parts","consequence":"Safety improves, using materials and energy."},{"label":"Use it for one last mission","consequence":"A sample is collected, but the risk to the person going out rises."}]},"13":{"name":"Power spike","categoryLabel":"Energy","intro":"The recycler, greenhouse and fans all need electricity at the same time.","cause":"When three systems run at once.","science":"A microgrid design must balance generation, storage and demand.","choices":[{"label":"Schedule use in turns","consequence":"Total load drops and energy is saved, though research moves more slowly."},{"label":"Keep everything on","consequence":"Production continues, but the electrical margin gets worse."}]},"14":{"name":"Water for whom?","categoryLabel":"Food","intro":"The lab asks for watering water while life support needs reserves to run.","cause":"When the stored water is shared out.","science":"On a lunar base, water must be counted for drinking, hygiene, recycling and technical processes.","choices":[{"label":"Assign measured watering","consequence":"The crop is protected, with a moderate drop in water."},{"label":"Save water for the crew","consequence":"The immediate risk drops, but the crop is at risk."}]},"15":{"name":"Misaligned antenna","categoryLabel":"Communications","intro":"Module movement or a pointing fault reduces link quality.","cause":"After losing signal quality.","science":"Link geometry and pointing affect communications. Not every delay is normal latency.","choices":[{"label":"Recalibrate from inside","consequence":"Communication returns and the fault is recorded."},{"label":"Wait for another window","consequence":"Electricity is saved, but a critical order may arrive late."}]},"16":{"name":"Pressure microleak","categoryLabel":"Life support","intro":"A sensor detects a slow loss in one compartment of the habitat.","cause":"After pressure alerts.","science":"In a pressurized habitat, a leak must be found: making more oxygen does not fix the cause.","choices":[{"label":"Isolate and repair the section","consequence":"The air is kept; the team gives up energy and time."},{"label":"Make up the loss with more supply","consequence":"The problem stays open and uses up reserves every shift."}]},"17":{"name":"Historic solar alert","categoryLabel":"Radiation","intro":"The observatory reports a solar event recorded by NASA DONKI as a training scenario.","cause":"When the observatory alert arrives.","science":"DONKI reports historic solar events. It does not turn an event into an exact dose on the Moon by itself.","choices":[{"label":"Activate shelter protocol","consequence":"Risk drops, and the protection system uses energy."},{"label":"Continue outdoor tasks","consequence":"Field science is gained, but a higher simulated exposure is accepted."}]},"18":{"name":"The crater's shadow","categoryLabel":"Energy","intro":"The Sun's position leaves a set of panels in shadow during a work window.","cause":"As the base nears a poorly lit area.","science":"On the Moon, shadows and light cycles directly affect solar power.","choices":[{"label":"Move robots and share out the load","consequence":"Power is rebalanced, though oxygen and electricity are used in operations."},{"label":"Keep every load on","consequence":"The battery runs down faster and the blackout risk rises."}]},"19":{"name":"Crop contamination","categoryLabel":"Food","intro":"Signs that may mean contamination are seen in a hydroponic tray.","cause":"If sanitary control is not enough.","science":"Food hygiene and monitoring of closed systems are crucial in space environments.","choices":[{"label":"Isolate the suspect trays","consequence":"Part of the crop is lost, but the rest and health are protected."},{"label":"Mix the whole harvest","consequence":"The immediate loss is avoided, but the stored food could be at risk."}]},"20":{"name":"Contradictory orders","categoryLabel":"Communications","intro":"Two messages arrive out of order and suggest different priorities.","cause":"When the link is restored.","science":"Space communication needs checkable messages and autonomous procedures for failures.","choices":[{"label":"Check the time stamps","consequence":"The crew clears up the order of events and coordinates better."},{"label":"Run the newest message on screen","consequence":"Delay is avoided, but a team may shut down a needed system."}]},"21":{"name":"Water recycler","categoryLabel":"Life support","intro":"The system recovers less water than planned and the tanks are going down.","cause":"When the water reserve falls or a fault appears.","science":"Recycling saves resources, but it needs maintenance and energy.","choices":[{"label":"Change the recovery circuit","consequence":"Water is recovered and safety improves, using electricity."},{"label":"Ration without repairing","consequence":"Energy is saved, but fatigue rises and output falls."}]},"22":{"name":"Design a shelter","categoryLabel":"Radiation","intro":"The base must choose which compartment to use as a shelter during a solar event.","cause":"When preparing the radiation protocol.","science":"How much shielding material there is, and where it sits, affects protection. The simulator uses an abstract scale.","choices":[{"label":"Protect a small space","consequence":"Crew protection improves, but activities are limited."},{"label":"Spread materials across the whole base","consequence":"Mobility is kept, but effective protection is not enough."}]},"23":{"name":"Partial blackout","categoryLabel":"Energy","intro":"One circuit shuts off, leaving part of the greenhouse and one fan without power.","cause":"After an overload or low battery levels.","science":"Restoring in stages helps keep critical loads under control.","choices":[{"label":"Restart by sectors","consequence":"Life support is stabilized, at a cost in food and productivity."},{"label":"Force a full restart","consequence":"It is faster, but the fault can spread to other systems."}]},"24":{"name":"Wilting plants","categoryLabel":"Food","intro":"Water, light or temperature in the greenhouse are not well balanced.","cause":"When projected output drops.","science":"Visible plant symptoms have many causes: observing before acting avoids waste.","choices":[{"label":"Diagnose the cause","consequence":"Conditions are fixed before using more resources."},{"label":"Increase all supplies","consequence":"The crop improves in the short term, but reserves run out faster."}]},"25":{"name":"Unstable link","categoryLabel":"Communications","intro":"The base loses contact at times, and an outdoor activity depends on an order.","cause":"When the link with Earth fails on and off.","science":"Operational independence matters because immediate control from Earth is not always possible.","choices":[{"label":"Activate autonomous protocol","consequence":"The crew can keep going with safety rules and send fewer messages."},{"label":"Wait with no backup plan","consequence":"The team loses time, stress rises and a repair is delayed."}]},"26":{"name":"Hard breathing","categoryLabel":"Life support","intro":"Two crew members feel dizzy and have breathing discomfort during a task.","cause":"If air quality gets worse or symptoms are not treated.","science":"Signs of discomfort call for checking life support and safety, not an automatic diagnosis of a specific illness.","choices":[{"label":"Stop work and check the air","consequence":"An air problem is found and safety is restored."},{"label":"Keep going until done","consequence":"Time is saved, but the team's physical state gets worse."}]},"27":{"name":"Built-up exposure","categoryLabel":"Radiation","intro":"A dosimeter summary shows that spacewalk planning must be reviewed.","cause":"After several spacewalks or a solar event.","science":"Accumulated exposure must be compared with limits and conditions. The game does not calculate clinical doses.","choices":[{"label":"Cut spacewalks and check protection","consequence":"The team protects its health, though a science mission is lost."},{"label":"Prioritize the findings","consequence":"More data is collected, at a cost to safety."}]},"28":{"name":"Power sharing","categoryLabel":"Energy","intro":"Scientists want to turn on a new instrument just as the batteries are running low.","cause":"When several tasks compete for the same supply.","science":"Energy management is an optimization problem with limits and goals that pull in different directions.","choices":[{"label":"Assign quotas per system","consequence":"Water and air get priority without fully canceling the science."},{"label":"Give the instrument full priority","consequence":"Research moves ahead, but electrical reserves are stretched thin."}]},"29":{"name":"Biofilm in the pipes","categoryLabel":"Food","intro":"A biofilm may be in part of the watering line, and the food system must be protected.","cause":"If there are hygiene or watering failures.","science":"Water and food systems in closed environments need microbiological monitoring.","choices":[{"label":"Isolate and disinfect the circuit","consequence":"Production is lost, but health is protected and the team learns from the incident."},{"label":"Use the circuit to the end","consequence":"Temporary production is kept, but the health risk goes up."}]},"30":{"name":"Critical transmission","categoryLabel":"Communications","intro":"Earth asks for a report to plan possible help. The link needs power priority.","cause":"When an emergency balance must be sent.","science":"Sending reliable information matters as much as sending it fast.","choices":[{"label":"Send a compressed report","consequence":"The base's situation becomes clear and coordination becomes more likely."},{"label":"Save battery for life support","consequence":"Air is protected, but Earth gets incomplete information."}]},"31":{"name":"Crew fatigue","categoryLabel":"Life support","intro":"One astronaut is exhausted and makes procedure mistakes.","cause":"After several days of too many tasks.","science":"Rest, teamwork and behavioral health are part of space planning.","choices":[{"label":"Cut shifts and look after the team","consequence":"Health improves and mistakes become less likely, but output is delayed."},{"label":"Extend the shifts","consequence":"Short-term productivity rises, but fatigue grows and morale drops."}]},"32":{"name":"Spacewalk during alert","categoryLabel":"Radiation","intro":"A team is outside when a warning arrives that needs a coordinated response.","cause":"During outdoor trips with higher risk.","science":"During a space weather alert, protection and the return procedure are key.","choices":[{"label":"Return now and shelter","consequence":"The task is left unfinished, but safety improves."},{"label":"Finish the task first","consequence":"Information is gathered, but the crew faces a bigger danger."}]},"33":{"name":"Central grid failure","categoryLabel":"Energy","intro":"A distribution fault threatens to cut off water, communications and ventilation.","cause":"If an overload is not fixed in time.","science":"Redundancy stops a single failure from halting the whole mission.","choices":[{"label":"Build an emergency microgrid","consequence":"Critical systems stay on, though research is paused."},{"label":"Keep running on a single circuit","consequence":"The restart seems fast, but if it fails again, several systems are hit."}]},"34":{"name":"The last harvest","categoryLabel":"Food","intro":"Trays grown before the mission began can add food, but they must be inspected.","cause":"When reserves run out and some crops are already ripe.","science":"A harvest in seven days is only plausible for plants that were already growing; a crop started on day 1 does not ripen all at once.","choices":[{"label":"Harvest only what is safe","consequence":"A modest reserve is gained and health is protected."},{"label":"Harvest everything without inspection","consequence":"The reserve grows, but there is a risk of stomach upset from compromised food."}]},"35":{"name":"Ask for evacuation?","categoryLabel":"Communications","intro":"The team must decide whether to ask for an early return or keep waiting for supplies.","cause":"Under uncertainty about reserves and the connection.","science":"The decision to end a mission must consider safety, logistics and checkable communications.","choices":[{"label":"Ask for help with full data","consequence":"Earth can plan a response; the communications reserve is used up."},{"label":"Keep the mission without reporting","consequence":"Energy and autonomy are kept, but possible help is delayed."}]},"36":{"name":"Life-support crisis","categoryLabel":"Life support","intro":"Two essential systems fail at the same time and the operating margin is minimal.","cause":"If air and water problems pile up.","science":"In emergency operations, the priority is keeping critical systems running, not maximizing research.","choices":[{"label":"Apply the emergency protocol","consequence":"Air and water come first, at the cost of energy and experiments."},{"label":"Improvise to save the experiments","consequence":"Scientific data is kept, but the base's safety is compromised."}]},"37":{"name":"Severe solar event","categoryLabel":"Radiation","intro":"The team faces an extreme scenario based on space weather science records.","cause":"During a serious alert in an advanced stage.","science":"Radiation scenarios are educational: they do not replace specific lunar dose calculations.","choices":[{"label":"Stay in the protected shelter","consequence":"The crew lowers the risk, though power output drops and activities are lost."},{"label":"Go out and repair right now","consequence":"Part of the energy is recovered, at the cost of greater simulated exposure."}]},"38":{"name":"Extreme rationing","categoryLabel":"Energy","intro":"Few electrical reserves are left and three important systems need power.","cause":"When solar output no longer covers demand.","science":"With limited resources, you must decide which loads are critical and which can wait.","choices":[{"label":"Keep air and water first","consequence":"Life support is saved and secondary tasks are suspended."},{"label":"Feed all tasks equally","consequence":"No system gets enough and the risk of total blackout rises."}]},"39":{"name":"Seeds or food","categoryLabel":"Food","intro":"Reserves are limited: the crew must decide what to keep for the base's future.","cause":"When you must choose between short and long term.","science":"Food security combines immediate availability and the resilience of the production system.","choices":[{"label":"Save seeds and ration","consequence":"Long-term sustainability is protected, but immediate food drops."},{"label":"Eat all available reserves","consequence":"Immediate food improves, but the ability to keep growing is sacrificed."}]},"40":{"name":"The last contact window","categoryLabel":"Communications","intro":"At the end of the mission, Earth needs a final report to plan the next step.","cause":"As the campaign nears its end.","science":"The quality of a mission also depends on recording and communicating what was learned.","choices":[{"label":"Send telemetry and decisions","consequence":"Learning is documented and coordination improves, at a cost in electricity."},{"label":"Save the remaining energy","consequence":"The last energy reserve is protected, but Earth gets less information."}]},"41":{"name":"Water to make oxygen","categoryLabel":"Life support","intro":"The electrolysis oxygen generator needs water while the consumption tanks go down.","cause":"The oxygen tank enters high-demand mode.","science":"Electrolysis needs water and electricity. The simulation simplifies the real flows.","choices":[{"label":"Adjust output and recover water","consequence":"The system keeps the air with controlled use of the tanks."},{"label":"Demand maximum output","consequence":"Oxygen rises, but water reserves run out and a crisis begins."}]},"42":{"name":"Lost dosimeter report","categoryLabel":"Radiation","intro":"A scientist lost the dose history before planning a new trip outside.","cause":"A radiation alert coincides with spacewalk planning.","science":"Dose readings let teams make informed decisions; by themselves they do not predict an outcome.","choices":[{"label":"Rebuild the readings and stop the spacewalk","consequence":"The team is protected and the report is documented."},{"label":"Approve it without history","consequence":"The expedition moves up, but the unassessed risk remains."}]},"43":{"name":"The module dilemma","categoryLabel":"Energy","intro":"Only enough power is left to keep two of three modules on: recycler, crop and antenna.","cause":"Demand is higher than the power available.","science":"Electrical management must put critical loads first, not just comfort.","choices":[{"label":"Prioritize recycler and antenna","consequence":"The crew keeps water and contact; the crops are delayed."},{"label":"Prioritize crop and lab","consequence":"Science moves ahead and food reserves grow, but distribution fails."}]},"44":{"name":"Missing nutrients","categoryLabel":"Food","intro":"The plants are alive, but the hydroponic system has the wrong nutrient mix.","cause":"Greenhouse output goes down.","science":"Hydroponics depends on water, nutrients and microbial control.","choices":[{"label":"Analyze the solution and correct the doses","consequence":"The crop is stabilized, using energy and materials."},{"label":"Use an unchecked mix","consequence":"It seems to save time, but it puts the trays at risk and adds uncertainty."}]},"45":{"name":"Duplicate message: a real order?","categoryLabel":"Communications","intro":"A repeated instruction arrives and the team does not know if it fits the current situation.","cause":"Two communication packets seem to contradict each other.","science":"The physical Earth–Moon delay is not the same as a fault or a duplicate message.","choices":[{"label":"Check the time stamp and version","consequence":"They avoid running an order twice and keep a backup."},{"label":"Run it without checking","consequence":"Priorities get mixed up and the network gets even more congested."}]},"46":{"name":"Medical module decompression","categoryLabel":"Life support","intro":"A seal fails. The pressure drops and an astronaut needs immediate help.","cause":"After a leak is ignored or a compromised seal is detected.","science":"Depressurization can quickly harm life support; its numbers are simplified.","choices":[{"label":"Seal, isolate and assist","consequence":"The losses are contained; health needs watching."},{"label":"Delay the isolation","consequence":"The leak gets worse, confusion appears and the crew is at risk."}]},"47":{"name":"Return from the crater","categoryLabel":"Radiation","intro":"An astronaut is far from the base when a danger warning arrives and a seal problem is found in her suit.","cause":"Radiation warnings and suit faults pile up.","science":"A badly sealed suit brings immediate risks of pressure and oxygen loss. The solar event gives context to the decision, but no lethal dose is inferred.","choices":[{"label":"Return with rover help","consequence":"The astronaut gets back to a safe area; the expedition is cut short."},{"label":"Finish collecting","consequence":"The spacewalk drags on with a compromised suit and the risk becomes extreme."}]},"48":{"name":"Cascading blackout","categoryLabel":"Energy","intro":"The grid is overloaded. The fan, recycler and communications are about to stop.","cause":"Poor load balance and earlier faults combine.","science":"Without stable power distribution, life-support equipment can be affected.","choices":[{"label":"Isolate circuits and restart","consequence":"Basic functions come back, and research is limited."},{"label":"Restart everything at once","consequence":"The overload hits three systems and the effects on the crew speed up."}]},"49":{"name":"Suspicious ration","categoryLabel":"Food","intro":"Two crew members have stomach upset after sharing food that may be contaminated.","cause":"The greenhouse had cleaning and storage problems.","science":"When food contamination is suspected, the product is identified and isolated; you do not diagnose from symptoms alone.","choices":[{"label":"Isolate the food and give help","consequence":"More exposure is avoided, though some food is lost."},{"label":"Keep handing out rations","consequence":"More symptoms appear and work capacity drops."}]},"50":{"name":"The last order with no reply","categoryLabel":"Communications","intro":"The base must coordinate an evacuation; the link is intermittent and a new instruction may not arrive in time.","cause":"The team built up delays or electrical and antenna problems.","science":"Crew independence is essential because communication can be lost.","choices":[{"label":"Apply the local plan and send a signal","consequence":"Operational independence is kept and the best available report is sent."},{"label":"Wait without acting","consequence":"Critical reserves run out and rescue is delayed."}]}}}}};
// Motor puro, sin Node, HTTP, base de datos ni conexión. Reutilizable en navegador.
function createEngine(catalog) {
  // Idiomas: el catálogo base está en español; catalog.i18n = { en: { shop, status, endings, facts, challenges } }.
  // Lo que falta en un idioma cae al español (nunca queda un texto vacío).
  const LANGUAGES = [{code:'es',name:'Español',native:'Español'},{code:'en',name:'English',native:'English'}];
  const baseCatalog = catalog;
  const merge = (a,b) => (b && typeof b==='object' && !Array.isArray(b)) ? Object.assign({},a,Object.fromEntries(Object.entries(b).filter(([,v])=>v!==undefined&&v!==null&&v!==''))) : a;
  function localize(lang='es') {
    const ov = lang==='es' ? null : baseCatalog.i18n?.[lang];
    if (!ov) return {challenges:baseCatalog.challenges,items:baseCatalog.items,endings:baseCatalog.endings,facts:baseCatalog.facts||[],statusNames:baseCatalog.statusNames||{},lang:'es'};
    return {lang,
      challenges:baseCatalog.challenges.map(c=>{const t=ov.challenges?.[c.id];if(!t)return c;
        const {choices:tc,...rest}=t;return {...merge(c,rest),choices:c.choices.map((ch,i)=>merge(ch,tc?.[i]))}}),
      items:baseCatalog.items.map(i=>merge(i,ov.shop?.[i.id])),
      endings:Object.fromEntries(Object.entries(baseCatalog.endings).map(([k,v])=>[k,merge(v,ov.endings?.[k])])),
      facts:(baseCatalog.facts||[]).map(f=>merge(f,ov.facts?.[f.id])),
      statusNames:{...(baseCatalog.statusNames||{}),...(ov.status||{})}};
  }
  let lang = 'es';
  // Textos de los registros DONKI (vienen en español en nasa-events.json): se traducen por patrón.
  const MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'],MONTHS_ES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const NOTE_EN={'La actividad registrada NO representa una dosis de radiación lunar. Los efectos del videojuego son simulados.':'The recorded activity does NOT show a Moon radiation dose. The game effects are simulated.','Kp describe actividad geomagnética cerca de la Tierra. No mide directamente la radiación de una base lunar.':'Kp describes geomagnetic activity near Earth. It does not directly measure radiation at a Moon base.','Escenario ficticio de entrenamiento inspirado en observaciones. No es pronóstico de riesgo lunar.':'Made-up training scenario inspired by real observations. It is not a Moon risk forecast.','No mide la dosis lunar.':'It does not measure the Moon dose.','Magnetosfera terrestre':'Earth magnetosphere','Observación solar':'Solar observation','Evento histórico como referencia, riesgo y efectos son hipotéticos; no se calculan dosis lunares.':'Historical event as a reference; the risk and effects are made up, and no Moon doses are calculated.','Consecuencias numéricas ficticias, no cálculo de dosis NASA.':'Made-up numeric effects, not a NASA dose calculation.'};
  const evText=(x)=>{
    if(lang!=='en'||typeof x!=='string')return x;
    if(NOTE_EN[x])return NOTE_EN[x];
    let m;
    if((m=/^Registro (\w+) de DONKI\.(?: Índices Kp observados: (.*))?$/.exec(x)))return `DONKI ${m[1]} record.${m[2]?` Observed Kp values: ${m[2]}`:''}`;
    if((m=/^DONKI registró Kp ([\d.]+) en la magnetosfera terrestre durante el intervalo (.+?) UTC del (\d+) de (\w+) de (\d+)\.$/.exec(x))){const mo=MONTHS_EN[MONTHS_ES.indexOf(m[4])]||m[4];return `DONKI recorded Kp ${m[1]} in Earth's magnetosphere between ${m[2]} UTC on ${mo} ${m[3]}, ${m[5]}.`}
    return x;
  };
  const evLocal=(e)=>e&&lang==='en'?{...e,summary:evText(e.summary),note:evText(e.note),location:evText(e.location)}:e;
  let challenges, items, endings, facts, statusNames, challengeMap, itemMap;
  function setLanguage(code) {
    if (!LANGUAGES.some(l=>l.code===code)) throw new Error('INVALID_LANGUAGE');
    const L = localize(code);
    challenges=L.challenges; items=L.items; endings=L.endings; facts=L.facts; statusNames=L.statusNames; lang=L.lang===code?code:'es';
    challengeMap=new Map(challenges.map(c=>[c.id,c])); itemMap=new Map(items.map(i=>[i.id,i]));
    return lang;
  }
  setLanguage('es');
  const clamp = (n, min=0, max=100) => Math.max(min, Math.min(max, n));
  const has = (g, key) => g.statuses.includes(key);
  const add = (g,key) => {if (!has(g,key)) g.statuses.push(key)};
  const remove = (g,key) => {g.statuses=g.statuses.filter(s=>s!==key)};
  const clone = obj => structuredClone(obj);
  const seedNum = seed => {
    if (typeof seed==='number' && Number.isSafeInteger(seed)) return seed>>>0 || 1;
    const str=String(seed ?? 'Luna7');let h=2166136261;
    for(const c of str){h^=c.codePointAt(0);h=Math.imul(h,16777619)}
    return h>>>0 || 1;
  };
  const nextRoll = g => {g.rngState=(Math.imul(g.rngState,1664525)+1013904223)>>>0;return g.rngState/4294967296};
  const randInt = (g,lo,hi) => lo+Math.floor(nextRoll(g)*(hi-lo+1));
  const queue = (g,id,reason,urgent=false)=>{
    if(!challengeMap.has(id)||g.visited.includes(id)||g.currentMissionId===id||g.queue.some(x=>x.id===id))return;
    g.queue.push({id,reason,urgent,at:g.turn});
  };
  function snapshot(g) {
    const s=clone(g);delete s.snapshots;delete s.receipts;return s;
  }
  function saveCheckpoint(g){g.snapshots[String(g.day)]=snapshot(g)}
  function createGame({id,seed=1,scienceEvents=[]}={}) {
    const normalized = seedNum(seed);
    const g={id:id||`offline-${Date.now()}-${Math.floor(Math.random()*1e7)}`, schemaVersion:3,
      phase:'active',turn:0,day:1,maxTurns:14,maxDays:7,seed, rngState:normalized,skill:2,
      metrics:{oxygen:78,water:76,energy:78,food:71,shield:74,comms:75,health:90,morale:80,research:0},
      statuses:[],visited:[],queue:[],currentMissionId:1,consecutiveRisk:0,
      coins:25,earned:0,spent:0,inventory:{},missionResults:{},history:[],
      purchases:[],performance:{completed:0,partial:0,failed:0,skipped:0,hints:0,safeChoices:0,riskyChoices:0,scores:[],mastery:50},
      daySummaries:[],science:{sourceMode:scienceEvents.length?'archivo_real_nasa':'sin_datos',registeredEvent:null},
      events:[],messages:[],communicationSequence:0,npcHelpCount:0,endingId:null,
      createdAt:new Date().toISOString(),snapshots:{},receipts:{},criticalAlert:null,weather:null,
      orders:[],bag:{},world:{avatar:null,scene:'exterior',pos:null,clock:0,suit:{fill:0,eva:0,evaMax:180,loaded:false,outside:false}}};
    g.scienceEventPool=scienceEvents.filter(x=>x&&typeof x.id==='string'&&['SEP','CME','GST'].includes(x.type)).map(e=>({id:e.id,type:e.type,observedAt:e.observedAt,title:e.title,source:e.source,sourceUrl:e.sourceUrl,summary:e.summary,datasetType:e.datasetType,location:e.location,note:e.note}));
    saveCheckpoint(g);
    return g;
  }
  function assertGame(g,allowFinished=false){
    if(g.schemaVersion!==3)throw new Error('OLD_SAVE_VERSION: se requiere partida v0.3');
    if(!allowFinished && g.phase!=='active')throw new Error('GAME_FINISHED: no se puede modificar una partida terminada');
  }
  const currentMission = g=>g.phase==='active'?challengeMap.get(g.currentMissionId)||null:null;
  function missionModifiers(g,c){
    let time=1,cost=1;const reasons=[];
    if((c.category==='radiation'||c.category==='life')&&has(g,'fuga_activa')){time*=0.8;reasons.push('Fuga activa: menos margen operativo')}
    if(c.category==='radiation'&&has(g,'traje_comprometido')){time*=0.75;reasons.push('Traje comprometido: EVA requiere protocolo extra')}
    if(c.category==='comms'&&(has(g,'reporte_pendiente')||has(g,'enlace_saturado'))){time*=0.85;reasons.push('Retraso previo en comunicaciones')}
    if(c.category==='food'&&has(g,'cultivo_retrasado')){cost*=1.15;reasons.push('Cultivo retrasado: tareas consumen más recursos')}
    if(c.category==='energy'&&has(g,'energia_comprometida')){cost*=1.15;reasons.push('Red inestable: más gasto de recursos')}
    if(has(g,`reparacion_pendiente_${c.category}`)){time*=0.9;reasons.push('Reparación anterior incompleta')}
    const EN_R={'Fuga activa: menos margen operativo':'Active leak: less room to work','Traje comprometido: EVA requiere protocolo extra':'Suit damaged: the spacewalk needs extra steps','Retraso previo en comunicaciones':'Earlier delay in communications','Cultivo retrasado: tareas consumen más recursos':'Crop behind schedule: tasks use more resources','Red inestable: más gasto de recursos':'Unstable power grid: resources run out faster','Reparación anterior incompleta':'An earlier repair was not finished'};
    return {timeMultiplier:Math.round(time*100)/100,resourceCostMultiplier:Math.round(cost*100)/100,reasons:lang==='en'?reasons.map(r=>EN_R[r]||r):reasons,note:lang==='en'?'Simplified game rules, not NASA physics values.':'Reglas simplificadas de jugabilidad, no parámetros físicos NASA.'};
  }
  function nextMission(g){const c=currentMission(g);return c?{next:{...c,status:'available',day:g.day,turn:g.turn+1,modifiers:missionModifiers(g,c),options:c.choices.map((o,i)=>({id:i?'B':'A',label:o.label,consequence:o.consequence}))},pendingCount:1}:{next:null,pendingCount:0}}
  function crisisTriggers(g) {
    const m=g.metrics;
    if(m.oxygen<38)queue(g,26,'Nivel bajo de aire',true);
    if(m.oxygen<52&&has(g,'fuga_activa'))queue(g,46,'Despresurización',true);
    if(m.water<38)queue(g,21,'Falta de agua',true);
    if(m.energy<38)queue(g,23,'Escasez de energía',true);
    if(m.energy<35&&has(g,'apagones'))queue(g,48,'Apagón en cascada',true);
    if(m.food<34||has(g,'contaminacion'))queue(g,29,'Higiene alimentaria',true);
    if(m.shield<34)queue(g,27,'Protección insuficiente',true);
    if(m.shield<50&&has(g,'traje_comprometido'))queue(g,47,'Traje comprometido',true);
    if(m.comms<34)queue(g,25,'Enlace débil',true);
    if(m.comms<33)queue(g,50,'Sin respuesta',true);
    if(m.health<43)queue(g,31,'Fatiga',true);
    if(m.morale<30)queue(g,35,'Baja moral',false);
    if(has(g,'fuga_activa'))queue(g,36,'Fuga pendiente',true);
    if(has(g,'red_sobrecargada'))queue(g,23,'Red sobrecargada',false);
  }
  function selectNext(g) {
    crisisTriggers(g);
    // Dosificamos retos: empezamos fácil y los niveles 9-10 son posibles con buen dominio.
    const completed=g.performance.completed;
    const gradualCap=Math.min(10,g.skill+1,2+Math.floor(completed*0.68));
    const critical=has(g,'fuga_activa')||has(g,'hipoxia_grave')||has(g,'eva_sin_rescate')||g.metrics.oxygen<20||g.metrics.health<20;
    const emergencyCap=critical?Math.max(7,gradualCap):gradualCap;
    const candidates=g.queue.filter(q=>!g.visited.includes(q.id));
    const easiest=(a,b)=>challengeMap.get(a.id).difficulty-challengeMap.get(b.id).difficulty||a.at-b.at||a.id-b.id;
    const target=Math.min(gradualCap,g.skill);
    const nearest=(a,b)=>Math.abs(challengeMap.get(a.id).difficulty-target)-Math.abs(challengeMap.get(b.id).difficulty-target)||a.at-b.at||a.id-b.id;
    let choice=candidates.filter(q=>q.urgent&&challengeMap.get(q.id).difficulty<=emergencyCap).sort(easiest)[0];
    if(!choice)choice=candidates.filter(q=>challengeMap.get(q.id).difficulty<=gradualCap).sort(nearest)[0];
    if(choice){g.queue=g.queue.filter(q=>q!==choice);return choice.id}
    const maxWanted=Math.min(10,Math.max(1,g.skill));
    const pool=challenges.filter(c=>!g.visited.includes(c.id)&&c.difficulty<=gradualCap);
    if(!pool.length)return challenges.find(c=>!g.visited.includes(c.id))?.id||null;
    pool.sort((a,b)=>Math.abs(a.difficulty-maxWanted)-Math.abs(b.difficulty-maxWanted)||a.difficulty-b.difficulty||a.id-b.id);
    const preferred=pool.filter(c=>Math.abs(c.difficulty-maxWanted)===Math.abs(pool[0].difficulty-maxWanted)).slice(0,5);
    return preferred[Math.floor(nextRoll(g)*preferred.length)].id;
  }
  const failureStatus={life:'fuga_activa',radiation:'traje_comprometido',energy:'energia_comprometida',food:'cultivo_retrasado',comms:'reporte_pendiente'};
  function assess(performance) {
    if(performance===undefined||performance===null)return {status:'completed',score:null,mode:'decision_only',hintsUsed:0};
    if(typeof performance!=='object'||Array.isArray(performance))throw Error('INVALID_PERFORMANCE');
    const {completed,accuracy,mistakes=0,hintsUsed=0}=performance;
    if(typeof completed!=='boolean'||typeof accuracy!=='number'||!Number.isFinite(accuracy)||accuracy<0||accuracy>100||!Number.isInteger(mistakes)||mistakes<0||mistakes>100||!Number.isInteger(hintsUsed)||hintsUsed<0||hintsUsed>20)throw Error('INVALID_PERFORMANCE');
    const score=clamp(Math.round(accuracy*0.75+(completed?25:0)-mistakes*5-hintsUsed*3));
    return {status:completed&&score>=75?'completed':score>=45?'partial':'failed',score,mode:'minigame',hintsUsed};
  }
  function upkeep(g) {
    const daily={oxygen:-4,water:-4,energy:5,food:-3,morale:-1};
    for(const[k,v]of Object.entries(daily))g.metrics[k]=clamp(g.metrics[k]+v);
    if(has(g,'fuga_activa'))g.metrics.oxygen=clamp(g.metrics.oxygen-7);
    if(has(g,'contaminacion')){g.metrics.food=clamp(g.metrics.food-5);g.metrics.health=clamp(g.metrics.health-3)}
    if(has(g,'fatiga'))g.metrics.health=clamp(g.metrics.health-3);
    if(has(g,'deshidratacion'))g.metrics.health=clamp(g.metrics.health-4);
    if(has(g,'apagones'))g.metrics.energy=clamp(g.metrics.energy-9);
    if(has(g,'red_sobrecargada'))g.metrics.energy=clamp(g.metrics.energy-5);
    if(has(g,'fallo_red'))g.metrics.energy=clamp(g.metrics.energy-6);
    if(g.metrics.oxygen<28||g.metrics.water<25)g.metrics.health=clamp(g.metrics.health-6);
    if(g.metrics.health<25)g.metrics.morale=clamp(g.metrics.morale-6);
    const result={day:g.day,metrics:clone(g.metrics),statuses:[...g.statuses],coins:g.coins,skill:g.skill};
    g.daySummaries.push(result);return result;
  }
  function messageTick(g) {
    for(const m of g.messages){
      if(m.status==='pending'&&m.arrivalTurn<=g.turn){
        if(g.metrics.comms<25||has(g,'sin_respuesta')){
          m.arrivalTurn+=1;m.delayCount++;
          g.events.push({type:'COMMS_DELAY',turn:g.turn,messageId:m.id,reason:'averia_de_enlace'});
        }else{
          m.status='acknowledged';m.receivedTurn=g.turn;
          g.events.push({type:'COMMS_ACK',turn:g.turn,messageId:m.id});
          if(m.type==='rescue_request')add(g,'plan_rescate');
          if(m.type==='status_report')remove(g,'reporte_pendiente');
        }
      }
    }
  }
  function scriptedWeather(g) {
    if(g.day!==5||g.events.some(e=>e.type==='WEATHER_TRAINING'))return;
    const eligible=g.scienceEventPool.filter(e=>e.type==='SEP'||e.type==='CME');
    const nasaEvent=eligible.length?eligible[Math.floor(nextRoll(g)*eligible.length)]:null;
    g.science={sourceMode:nasaEvent?'registro_historico_nasa':'escenario_didactico_sin_registro',registeredEvent:nasaEvent};
    g.weather={pending:true,day:g.day,event:nasaEvent,mode:g.science.sourceMode,choices:['shelter','continue_eva'],note:'Escenario ficticio de entrenamiento inspirado en observaciones. No es pronóstico de riesgo lunar.'};
    g.events.push({type:'WEATHER_TRAINING',day:g.day,turn:g.turn,scenario:'ensayo_de_protocolo_de_refugio',sourceMode:g.science.sourceMode,nasaEventId:nasaEvent?.id||null,explanation:'Evento histórico como referencia, riesgo y efectos son hipotéticos; no se calculan dosis lunares.'});
    queue(g,17,'Entrenamiento con datos DONKI',false);
  }
  function deathType(g){const m=g.metrics;
    if(m.shield<=15&&m.oxygen<=55&&has(g,'eva_sin_rescate'))return 10;
    if(m.oxygen<=14&&m.health<=45&&(has(g,'fuga_activa')||has(g,'hipoxia_grave')||has(g,'crisis_sin_resolver')))return 9;
    return 0;
  }
  function isCritical(g){return Boolean(deathType(g))||g.metrics.oxygen<=7||g.metrics.water<=7||g.metrics.health<=7}
  function endingFor(g) {
    const death=deathType(g);if(death)return death;
    const m=g.metrics;if(isCritical(g)||m.health<25)return 8;
    if(m.comms<25&&m.health>=35)return 7;
    if(m.health>=70&&['oxygen','water','energy','food','shield','comms'].filter(k=>m[k]>=45).length>=5&&m.research>=30)return 1;
    if(m.food>=67&&m.water>=48&&m.energy>=15&&m.health>=45)return 2;
    if(m.research>=55&&m.health>=42&&m.oxygen>=35&&m.comms>=40)return 3;
    if(m.comms>=75&&m.health>=45&&m.energy>=15)return 4;
    if(m.health>=45&&m.morale>=62&&m.oxygen>=30&&m.water>=30)return 5;
    return 6;
  }
  function explanationFor(g,endingId) {
    const T=(es,en)=>lang==='en'?en:es;const sn=k=>statusNames[k]||k;
    const m=g.metrics;const notes=[];
    const low=Object.entries(m).filter(([,n])=>n<30).map(([k,v])=>`${k} (${v}/100)`);
    if(low.length)notes.push(T(`Recursos o indicadores comprometidos: ${low.join(', ')}.`,`Resources or meters in trouble: ${low.join(', ')}.`));
    if(g.statuses.length)notes.push(T(`Estados pendientes: ${g.statuses.map(sn).join(', ')}.`,`Pending alerts: ${g.statuses.map(sn).join(', ')}.`));
    if(g.performance.failed||g.performance.skipped)notes.push(T(`Hubo ${g.performance.failed} retos fallidos y ${g.performance.skipped} omitidos.`,`${g.performance.failed} tasks failed and ${g.performance.skipped} were skipped.`));
    if(g.messages.some(x=>x.type==='rescue_request'&&x.status==='acknowledged'))notes.push(T('La solicitud de ayuda obtuvo confirmación de Tierra.','Earth confirmed your call for help.'));
    if(g.messages.some(x=>x.status==='pending'))notes.push(T('Quedan mensajes pendientes de confirmación.','Some messages are still waiting for confirmation.'));
    if(!notes.length)notes.push(T('La tripulación terminó sin alertas persistentes y conservó el equilibrio de recursos.','The crew finished with no lasting alerts and kept resources balanced.'));
    const reasonsEn={
      1:['Health ≥ 70','Five of six basic systems ≥ 45','Research ≥ 30'],
      2:['Food ≥ 67','Water ≥ 48','Energy ≥ 15','Health ≥ 45'],
      3:['Research ≥ 55','Health ≥ 42','Oxygen ≥ 35','Communication ≥ 40'],
      4:['Communication ≥ 75','Energy ≥ 15','Health ≥ 45'],
      5:['Health ≥ 45','Morale ≥ 62','Oxygen and water ≥ 30'],
      6:['No other ending was reached','Enough health to finish without a critical retreat'],
      7:['Communication < 25','Health ≥ 35'],
      8:['Life support or health fell to a critical level; or health < 25 at the end'],
      9:['Oxygen ≤ 14','Health ≤ 45','Leak, severe hypoxia or an unsolved crisis'],
      10:['Protection ≤ 15','Oxygen ≤ 55','Spacewalk without quick rescue']
    };
    const reasonsEs={
      1:['Salud ≥ 70','Cinco de seis sistemas básicos ≥ 45','Investigación ≥ 30'],
      2:['Alimentos ≥ 67','Agua ≥ 48','Energía ≥ 15','Salud ≥ 45'],
      3:['Investigación ≥ 55','Salud ≥ 42','Oxígeno ≥ 35','Comunicaciones ≥ 40'],
      4:['Comunicaciones ≥ 75','Energía ≥ 15','Salud ≥ 45'],
      5:['Salud ≥ 45','Moral ≥ 62','Oxígeno y agua ≥ 30'],
      6:['No se alcanzaron otros criterios','Salud suficiente para finalizar sin retirada crítica'],
      7:['Comunicaciones < 25','Salud ≥ 35'],
      8:['Soporte vital o salud cayó a umbral crítico; o salud < 25 al cierre'],
      9:['Oxígeno ≤ 14','Salud ≤ 45','Fuga, hipoxia grave o crisis pendiente'],
      10:['Protección ≤ 15','Oxígeno ≤ 55','EVA sin rescate inmediato']
    };
    const reasons=lang==='en'?reasonsEn:reasonsEs;
    return {criteria:reasons[endingId]||[],evidence:notes,endingId,priorityNote:T('Se evalúan primero las crisis graves y luego los criterios de final. Los umbrales son ficticios del videojuego.','Serious crises are checked first, then the ending rules. The thresholds are made up for the game.')};
  }
  function endTurn(g) {
    g.turn++;
    let daySummary=null;
    if(g.turn%2===0){daySummary=upkeep(g)}
    messageTick(g);
    if(isCritical(g)||g.turn>=g.maxTurns){g.phase='completed';g.endingId=endingFor(g);g.currentMissionId=null;g.day=Math.min(7,Math.ceil(g.turn/2));}
    else{
      g.day=Math.floor(g.turn/2)+1;
      scriptedWeather(g);
      g.currentMissionId=selectNext(g);
      if(!g.currentMissionId){g.phase='completed';g.endingId=endingFor(g)}
      if(g.turn%2===0&&g.phase==='active')saveCheckpoint(g);
    }
    return daySummary;
  }
  function recordResult(g,c,result) {
    g.visited.push(c.id);g.missionResults[c.id]=result;g.history.push(result);
    if(result.status==='completed')g.performance.completed++;
    if(result.status==='partial')g.performance.partial++;
    if(result.status==='failed')g.performance.failed++;
    if(result.status==='missed')g.performance.skipped++;
  }
  function resolveMission(original,missionId,choiceId,{performance,hintUsed=false}={}) {
    assertGame(original);
    if(original.weather?.pending)throw Error('WEATHER_RESPONSE_REQUIRED');
    const c=challengeMap.get(Number(missionId));
    if(!c)throw Error('MISSION_NOT_FOUND');
    if(c.id!==original.currentMissionId)throw Error('NOT_CURRENT_MISSION');
    const idx=choiceId==='A'||choiceId===0?0:choiceId==='B'||choiceId===1?1:-1;
    if(idx<0)throw Error('INVALID_CHOICE');
    if(typeof hintUsed!=='boolean')throw Error('INVALID_HINT');
    const assessment=assess(performance),o=c.choices[idx],g=clone(original),before=clone(g.metrics);
    const factor=assessment.status==='completed'?1:assessment.status==='partial'?0.5:0;
    const modifiers=missionModifiers(g,c);
    for(const[k,d]of Object.entries(o.delta))g.metrics[k]=clamp(g.metrics[k]+Math.round(d>0?d*factor:d*modifiers.resourceCostMultiplier));
    for(const st of o.add)add(g,st);
    if(assessment.status==='completed'){for(const st of o.remove)remove(g,st);remove(g,`reparacion_pendiente_${c.category}`)}
    if(assessment.status==='failed')add(g,failureStatus[c.category]);
    if(assessment.status==='partial')add(g,`reparacion_pendiente_${c.category}`);
    for(const id of o.next)queue(g,id,`Consecuencia del reto ${c.id}`,false);
    const lowCount=m=>['oxygen','water','energy','food','shield','comms','health'].filter(k=>m[k]<30).length;
    g.consecutiveRisk=o.risk===2?g.consecutiveRisk+1:0;
    const quality=assessment.score;
    if(assessment.status==='failed'||lowCount(g.metrics)>lowCount(before)||g.consecutiveRisk>=2)g.skill=Math.max(1,g.skill-1);
    else if(assessment.status==='completed' && ((quality===null&&o.risk===0)||(quality!==null&&quality>=82)))g.skill=Math.min(10,g.skill+1);
    else if(assessment.status==='partial')g.skill=Math.max(1,g.skill-1);
    if(quality!==null){g.performance.scores.push(quality);g.performance.scores=g.performance.scores.slice(-10);g.performance.mastery=Math.round(g.performance.scores.reduce((a,b)=>a+b,0)/g.performance.scores.length)}
    if(o.risk===2)g.performance.riskyChoices++;if(o.risk===0)g.performance.safeChoices++;
    const totalHints=assessment.hintsUsed+(hintUsed?1:0);
    g.performance.hints+=totalHints;
    const baseReward=randInt(g,c.rewardMin,c.rewardMax);
    const reward=assessment.status==='completed'?baseReward:assessment.status==='partial'?Math.floor(baseReward/2):0;
    g.coins+=reward;g.earned+=reward;
    const result={missionId:c.id,name:c.name,day:g.day,turn:g.turn+1,difficulty:c.difficulty,category:c.category,status:assessment.status,
      assessmentMode:assessment.mode,qualityScore:quality,choiceId:idx?'B':'A',risk:o.risk,consequence:o.consequence,
      attemptedDelta:clone(o.delta),modifiersApplied:modifiers,metricsBefore:before,metricsAfter:clone(g.metrics),addedStatuses:[...o.add],removedStatuses:assessment.status==='completed'?[...o.remove]:[],
      nextCandidates:[...o.next],coinsAwarded:reward,hintsUsed:totalHints,skillAfter:g.skill};
    if(c.id===17)result.scienceReference=clone(g.science);
    recordResult(g,c,result);
    const daySummary=endTurn(g);
    return {state:g,result,daySummary};
  }
  function skipMission(original){
    assertGame(original);
    if(original.weather?.pending)throw Error('WEATHER_RESPONSE_REQUIRED');
    const c=currentMission(original);if(!c)throw Error('NO_CURRENT_MISSION');
    const g=clone(original);g.skill=Math.max(1,g.skill-1);g.consecutiveRisk=0;
    add(g,failureStatus[c.category]);
    const penalty={life:{oxygen:-8},radiation:{shield:-7},energy:{energy:-8},food:{food:-7},comms:{comms:-8}}[c.category];
    for(const[k,v]of Object.entries(penalty))g.metrics[k]=clamp(g.metrics[k]+v);
    for(const id of c.choices[1].next)queue(g,id,`Omisión de ${c.id}`,false);
    const result={missionId:c.id,name:c.name,day:g.day,turn:g.turn+1,difficulty:c.difficulty,category:c.category,status:'missed',choiceId:null,qualityScore:null,
      coinsAwarded:0,reason:'reto_omitido',penalty,addedStatuses:[failureStatus[c.category]],metricsAfter:clone(g.metrics),skillAfter:g.skill};
    recordResult(g,c,result);const daySummary=endTurn(g);
    return {state:g,result,daySummary};
  }
  function purchase(original,itemId) {
    assertGame(original);const item=itemMap.get(itemId);if(!item)throw Error('ITEM_NOT_FOUND');
    const used=original.inventory[item.id]||0;if(used>=item.limit)throw Error('OUT_OF_STOCK');
    if(original.coins<item.price)throw Error('INSUFFICIENT_COINS');
    const g=clone(original);g.coins-=item.price;g.spent+=item.price;g.inventory[item.id]=used+1;
    for(const[k,v]of Object.entries(item.delta))g.metrics[k]=clamp(g.metrics[k]+v);
    for(const st of item.remove)remove(g,st);
    const result={itemId:item.id,name:item.name,price:item.price,day:g.day,turn:g.turn,delta:clone(item.delta),removedStatuses:clone(item.remove),coinsAfter:g.coins};
    g.purchases.push(result);return {state:g,result};
  }
  function respondWeather(original,choice){
    assertGame(original);
    if(!original.weather?.pending)throw Error('NO_PENDING_WEATHER');
    if(!['shelter','continue_eva'].includes(choice))throw Error('INVALID_WEATHER_CHOICE');
    const g=clone(original);
    const deltas=choice==='shelter'?{energy:-8,shield:11,research:-5}:{research:9,oxygen:-5,shield:-12,health:-7};
    for(const[k,v]of Object.entries(deltas))g.metrics[k]=clamp(g.metrics[k]+v);
    if(choice==='shelter'){remove(g,'eva_riesgosa');remove(g,'exposicion_sin_control')}
    else{add(g,'eva_riesgosa');add(g,'exposicion_sin_control')}
    g.weather.pending=false;g.weather.choice=choice;
    const result={choice,day:g.day,turn:g.turn,delta:deltas,reference:g.weather.event?.id||null,
      note:'Consecuencias numéricas ficticias, no cálculo de dosis NASA.'};
    g.events.push({type:'WEATHER_DECISION',...result});
    if(isCritical(g)){g.phase='completed';g.endingId=endingFor(g);g.currentMissionId=null}
    return {state:g,result};
  }
  function sendMessage(original,type){
    assertGame(original);
    const allowed=['status_report','science_report','rescue_request'];if(!allowed.includes(type))throw Error('INVALID_MESSAGE_TYPE');
    if(original.metrics.energy<5)throw Error('INSUFFICIENT_ENERGY');
    const g=clone(original);g.metrics.energy-=5;
    const signalPoor=g.metrics.comms<45||has(g,'enlace_saturado')||has(g,'sin_respuesta');
    const delay=signalPoor?3:1; // turnos de trabajo por interrupciones/protocolos, NO tiempo-luz físico.
    const message={id:`msg-${++g.communicationSequence}`,type,sentTurn:g.turn,arrivalTurn:g.turn+delay,status:'pending',delayCount:0,simulatedDelayTurns:delay};
    g.messages.push(message);g.events.push({type:'MESSAGE_SENT',turn:g.turn,messageId:message.id,messageType:type});
    return {state:g,result:message};
  }
  function repeatDay(original,requestedDay=original.day){
    assertGame(original,true);
    const n=Number(requestedDay),snap=original.snapshots[String(n)];
    if(!Number.isInteger(n)||n<1||n>original.day||!snap)throw Error('INVALID_REPLAY_DAY');
    const restored=clone(snap);restored.snapshots={};
    for(const[k,v]of Object.entries(original.snapshots)){if(Number(k)<=n)restored.snapshots[k]=clone(v)}
    restored.receipts={};restored.world={...(restored.world||{}),avatar:original.world?.avatar??null,scene:original.world?.scene??'exterior',pos:original.world?.pos??null};restored.events.push({type:'DAY_REPEATED',day:n,previousTurn:original.turn});
    return {state:restored,result:{replayedDay:n,turn:restored.turn,day:restored.day,warning:'La repetición restaura recursos, decisiones, compras y aleatoriedad de ese día y elimina cambios posteriores del estado activo.'}};
  }
  // Glosario de clima espacial de Kita (v0.4). Definiciones generales, sin cifras inventadas.
  const GLOSSARY={
    CME:'Una CME (eyección de masa coronal) es una nube enorme de gas con carga eléctrica y campo magnético que el Sol lanza al espacio. DONKI registra cuándo sale y a qué velocidad viaja.',
    SEP:'Las SEP (partículas energéticas solares) son protones y otras partículas que el Sol acelera a gran velocidad. Fuera de la protección magnética de la Tierra pueden aumentar la radiación; por eso una base lunar necesita un refugio.',
    GST:'Una GST es una tormenta geomagnética: el campo magnético de la Tierra se agita cuando llega una CME o viento solar rápido. Ocurre alrededor de la Tierra, así que no mide la radiación en la Luna.',
    KP:'El índice Kp va de 0 a 9 y mide cuánto se agita el campo magnético de la Tierra. Desde Kp 5 se considera tormenta geomagnética. Es una medida de la Tierra, no de la Luna.',
    DONKI:'DONKI (Space Weather Database Of Notifications, Knowledge, Information) es la base de datos de clima espacial de NASA, del Community Coordinated Modeling Center (CCMC). Guarda eventos como CME, SEP y tormentas geomagnéticas.'
  };
  const GLOSSARY_EN={
    CME:'A CME (coronal mass ejection) is a huge cloud of charged gas and magnetic field that the Sun throws into space. DONKI records when it leaves and how fast it travels.',
    SEP:'SEPs (solar energetic particles) are protons and other particles that the Sun speeds up to very high speeds. Outside the Earth\'s magnetic shield they can raise radiation, so a Moon base needs a shelter.',
    GST:'A GST is a geomagnetic storm: the Earth\'s magnetic field shakes when a CME or fast solar wind arrives. It happens around the Earth, so it does not measure radiation on the Moon.',
    KP:'The Kp index goes from 0 to 9 and shows how much the Earth\'s magnetic field is shaking. From Kp 5 it counts as a geomagnetic storm. It is a measure for Earth, not the Moon.',
    DONKI:'DONKI (Space Weather Database Of Notifications, Knowledge, Information) is NASA\'s space weather database at the Community Coordinated Modeling Center (CCMC). It stores events like CMEs, SEPs and geomagnetic storms.'
  };
  const SUGGESTIONS_EN={
    storm:['What does SEP mean?','What is the latest DONKI event saved?','What is the Kp index?'],
    life:['What happens if there is a leak?','How is my base?','What does CME mean?'],
    food:['How much water do plants need?','How is my base?','What do I do in this challenge?'],
    energy:['What are batteries for?','How is my base?','What do I do in this challenge?'],
    comms:['How long does a message to Earth take?','What does CME mean?','How is my base?'],
    radiation:['What does SEP mean?','What is the latest DONKI event saved?','What do I do in this challenge?'],
    default:['What does CME mean?','How is my base?','What do I do in this challenge?']
  };
  // Preguntas que Kita sugiere después de cada respuesta, según el tema.
  const SUGGESTIONS={
    storm:['¿Qué significa SEP?','¿Cuál es el último evento DONKI guardado?','¿Qué es el índice Kp?'],
    life:['¿Qué pasa si hay una fuga?','¿Cómo va mi base?','¿Qué significa CME?'],
    food:['¿Cuánta agua necesitan las plantas?','¿Cómo va mi base?','¿Qué hago en este reto?'],
    energy:['¿Para qué sirven las baterías?','¿Cómo va mi base?','¿Qué hago en este reto?'],
    comms:['¿Cuánto tarda un mensaje a la Tierra?','¿Qué significa CME?','¿Cómo va mi base?'],
    radiation:['¿Qué significa SEP?','¿Cuál es el último evento DONKI guardado?','¿Qué hago en este reto?'],
    default:['¿Qué significa CME?','¿Cómo va mi base?','¿Qué hago en este reto?']
  };
  // Kita funciona sin Internet y solo utiliza el catálogo y eventos ya descargados.
  function npcAsk(original,question,{hint=false}={}){
    if(typeof question!=='string'||question.length>350||question.trim().length<2)throw Error('INVALID_QUESTION');
    const g=clone(original);const EN=lang==='en';const T=(es,en)=>EN?en:es;
    const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
    const q=norm(question);
    const hasWord=word=>(' '+q+' ').includes(' '+norm(word)+' ');
    const any=(...words)=>words.some(hasWord);
    const current=currentMission(g);
    const groups={
      donki:['donki','tormenta','tormentas','solar','solares','sol','sep','cme','gst','kp','radiacion','dosimetro','dosis','particula','particulas','refugio','crater','storm','storms','radiation','dose','particles','shelter','sun','flare'],
      oxygen:['oxigeno','aire','respirar','co2','dioxido','fuga','fugas','tanque','tanques','presion','ventilacion','oxygen','air','breathe','breathing','leak','leaks','tank','tanks','pressure'],
      plant:['agua','riego','cultivo','cultivos','comida','alimento','alimentos','invernadero','semilla','semillas','planta','plantas','hidroponia','water','plants','plant','crops','crop','food','greenhouse','seeds','garden'],
      power:['energia','bateria','baterias','panel','paneles','electricidad','apagon','apagones','circuito','energy','power','battery','batteries','solar panel','panels','electricity','blackout'],
      comms:['comunicacion','comunicaciones','mensaje','mensajes','antena','antenas','latencia','retraso','senal','transmitir','communication','communications','message','messages','antenna','delay','signal','radio'],
      sources:['fuente','fuentes','referencias','bibliografia','sources','references','source']
    };
    const scores=Object.fromEntries(Object.entries(groups).map(([id,terms])=>[id,terms.filter(hasWord).length]));
    const topic=Object.entries(scores).filter(([id])=>id!=='sources').sort((a,b)=>b[1]-a[1])[0];
    const nasaAsk=any('nasa','donki','space weather','solar storm','solar event','evento solar','eventos solares','tormenta','tormentas','cme','sep','gst','kp','actividad solar','clima espacial')||(any('evento','eventos','registro','registros')&&any('ultimo','ultima','reciente','hoy','ayer','2024','2025','2026'));
    const askMission=any('que hago','que hago ahora','que debo hacer','que deberia hacer','pista','ayuda','ayudame','esta mision','este reto','mi reto','consejo','what do i do','what should i do','hint','help','this challenge','my challenge','advice','tip');
    const askStatus=any('como voy','como va mi base','como esta mi base','como esta la base','estado de la base','mi estado','mis recursos','cuanta energia','cuanto oxigeno','cuanta agua','cuanta comida','cuanto queda','how am i doing','how is my base','how is the base','my base','status','my resources','how much');
    const askHello=any('hola','buenas','gracias','quien eres','como te llamas','hello','hi','hey','thanks','thank you','who are you','your name');
    const type=any('sep','particulas energeticas','solar energetic particles')?'SEP':any('cme','eyeccion de masa','coronal mass')?'CME':any('gst','kp','geomagnetica','geomagnetic')?'GST':null;
    const askDefinition=any('que significa','que es','que son','que quiere decir','significado','definicion','define','what does','what is','what are','meaning','definition');
    const term=hasWord('kp')?'KP':type||(hasWord('donki')?'DONKI':null);
    const archived=(g.scienceEventPool||[]).slice();
    if(g.science?.registeredEvent&&!archived.some(x=>x.id===g.science.registeredEvent.id))archived.push(g.science.registeredEvent);
    archived.sort((a,b)=>String(b.observedAt||'').localeCompare(String(a.observedAt||'')));
    const year=(q.match(/\b20\d{2}\b/)||[])[0]||null;
    const matching=archived.filter(e=>(!type||e.type===type)&&(!year||String(e.observedAt||'').startsWith(year)));
    const event=matching[0]||null;
    const sources=[];
    const source=(name,url,kind)=>{if(url?.startsWith('https://')&&!sources.some(s=>s.url===url))sources.push({title:name,url,kind})};
    let answer='',observation=null,matchedTopic=null;
    if(askHello&&!nasaAsk){
      answer=T('¡Hola! Soy Kita, la mascota de Luna-7. Podés preguntarme por oxígeno, energía, agua, cultivos, comunicaciones y tormentas solares. También puedo ofrecer pistas sobre el reto actual o mostrar datos archivados de NASA.','Hi! I am Kita, the mascot of Luna-7. You can ask me about oxygen, energy, water, crops, communications and solar storms. I can also give hints about your current challenge or show archived NASA data.');
    }else if(askStatus&&!nasaAsk){
      answer=EN?`Day ${g.day}: oxygen ${g.metrics.oxygen}/100, water ${g.metrics.water}/100, energy ${g.metrics.energy}/100, food ${g.metrics.food}/100, health ${g.metrics.health}/100 and communications ${g.metrics.comms}/100. These scales are made up for the game, not NASA measurements.`:`Día ${g.day}: oxígeno ${g.metrics.oxygen}/100, agua ${g.metrics.water}/100, energía ${g.metrics.energy}/100, comida ${g.metrics.food}/100, salud ${g.metrics.health}/100 y comunicaciones ${g.metrics.comms}/100. Estas escalas son inventadas para el videojuego, no medidas de NASA.`;
      if(g.statuses.length)answer+=T(' Alertas pendientes: ',' Pending alerts: ')+g.statuses.slice(0,3).map(k=>statusNames[k]||k).join(', ')+'.';
    }else if(askMission&&!nasaAsk&&(!topic||topic[1]===0)&&current){
      answer=EN?`Your challenge #${current.id} is "${current.name}". ${current.intro} ${current.science} To decide, compare the effects on people and resources: a quick fix can cause problems later.`:`Tu reto #${current.id} es «${current.name}». ${current.intro} ${current.science} Para decidir, compará las consecuencias para las personas y los recursos: una solución rápida puede ocasionar problemas después.`;
      const f=facts.find(f=>f.topic===current.category);if(f)source(f.source,f.sourceUrl,f.kind);
      matchedTopic=current.category;
    }else if(askDefinition&&term&&!askMission){
      // Glosario de clima espacial (v0.4): definiciones cortas para niños, con fuente NASA.
      matchedTopic='storm';
      answer=(EN?GLOSSARY_EN:GLOSSARY)[term];
      source('NASA CCMC DONKI','https://ccmc.gsfc.nasa.gov/tools/DONKI/','glosario');
      const ofType=term==='DONKI'?archived:archived.filter(e=>e.type===(term==='KP'?'GST':term));
      if(ofType.length){
        const e=ofType[0];
        observation={id:e.id,type:e.type,title:e.title,observedAt:e.observedAt,source:e.source,sourceUrl:e.sourceUrl,disclaimer:evText(e.note||'No mide la dosis lunar.')};
        answer+=EN?`\n\nIn this game there ${ofType.length===1?'is':'are'} ${ofType.length} saved ${term==='DONKI'?'DONKI':e.type} record${ofType.length===1?'':'s'}; the latest is from ${String(e.observedAt||'').slice(0,10)}. They are archive records, not a live NASA query.`:`\n\nEn esta partida hay ${ofType.length} registro${ofType.length===1?'':'s'} ${term==='DONKI'?'de DONKI':e.type} guardado${ofType.length===1?'':'s'}; el más reciente es del ${String(e.observedAt||'').slice(0,10)}. Son registros de archivo, no una consulta NASA en vivo.`;
        source(e.source,e.sourceUrl,'registro_nasa_descargado');
      }
    }else if(nasaAsk&&(any('nasa','donki','evento','eventos','solar','solares','tormenta','tormentas','sep','cme','gst','kp','clima espacial'))){
      const f=facts.find(f=>f.id==='donki');
      matchedTopic='storm';
      answer=f?.answer||T('DONKI es el registro de clima espacial de NASA.','DONKI is the NASA space weather record.');
      source(f?.source||'NASA DONKI',f?.sourceUrl||'https://ccmc.gsfc.nasa.gov/tools/DONKI/','hecho_cientifico');
      if(event){
        const date=String(event.observedAt||'fecha no disponible').slice(0,10);
        observation={id:event.id,type:event.type,title:event.title,observedAt:event.observedAt,source:event.source,sourceUrl:event.sourceUrl,disclaimer:evText(event.note||'No mide la dosis lunar.')};
        answer+=EN?`\n\nOf the ${archived.length} records saved in this game, I found: ${event.title} (${event.type}), dated ${date}. ${evText(event.summary)||''}`:`\n\nDe los ${archived.length} registros guardados en esta partida, encontré: ${event.title} (${event.type}), con fecha ${date}. ${event.summary||''}`;
        source(event.source,event.sourceUrl,'registro_nasa_descargado');
      }else answer+=archived.length?T('\n\nNo hay eventos guardados del tipo o año solicitado.','\n\nThere are no saved events of that type or year.'):T('\n\nNo hay eventos DONKI cargados en esta partida.','\n\nNo DONKI events are loaded in this game.');
      answer+=T('\n\nLos registros son de archivo, no una consulta NASA en vivo ni mediciones de radiación en la base lunar.','\n\nThese are archive records, not a live NASA query or radiation measurements at the Moon base.');
    }else if(scores.sources>0){
      const f=facts.find(f=>f.id==='sources');answer=f?.answer||T('Las referencias científicas acompañan a los retos.','Scientific references come with the challenges.');
      if(f)source(f.source,f.sourceUrl,f.kind);
    }else if(topic&&topic[1]>0){
      // Preguntas por radiación o dosis usan la ficha medida cerca de la Luna (RadLab · LRO CRaTER).
      const wantsDose=topic[0]==='donki'&&any('radiacion','dosis','dosimetro','crater','radiation','dose');
      const f=(wantsDose&&facts.find(f=>f.id==='radiation'))||facts.find(f=>f.id===topic[0]);
      if(f){
        answer=f.answer;matchedTopic=f.topic;source(f.source,f.sourceUrl,f.kind);
        const metric={donki:'shield',oxygen:'oxygen',plant:'food',power:'energy',comms:'comms'}[topic[0]];
        if(metric)answer+=EN?`\n\nIn this game, the ${metric} meter is at ${g.metrics[metric]}/100. It is a teaching scale.`:`\n\nEn esta partida, el indicador de ${metric} está en ${g.metrics[metric]}/100. Es una escala didáctica.`;
      }
    }
    if(!answer)answer=T('No tengo una ficha científica verificable para esa pregunta todavía. Probá preguntarme por oxígeno, agua, cultivos, baterías, comunicaciones, radiación, DONKI o por el reto actual. Prefiero reconocer mis límites a inventar datos.','I do not have a checked science card for that question yet. Try asking about oxygen, water, crops, batteries, communications, radiation, DONKI or your current challenge. I prefer to admit my limits than to make up facts.');
    if(hint){g.npcHelpCount++;g.performance.hints++}
    const asked=norm(question);
    const SG=EN?SUGGESTIONS_EN:SUGGESTIONS;const suggestions=(SG[matchedTopic]||SG.default).filter(s=>norm(s)!==asked).slice(0,3);
    const response={npc:'Kita',mode:'asistente_educativo_por_reglas_sin_IA_generativa',answer,observation,matchedTopic,
      hint:hint&&current?T(`Pista del reto #${current.id}: ${current.science} Pensá qué recursos y qué riesgos cambian.`,`Hint for challenge #${current.id}: ${current.science} Think about which resources and risks change.`):null,
      sources,suggestions,disclaimer:T('Kita no utiliza IA generativa y no consulta DONKI en vivo. Los datos NASA son registros históricos; los indicadores de la base son simulaciones ficticias.','Kita does not use generative AI and does not query DONKI live. NASA data are historical records; the base meters are made-up simulations.')};
    return {state:g,response};
  }
  function report(g){
    if(g.phase!=='completed')throw Error('REPORT_NOT_READY');
    return {gameId:g.id,endingId:g.endingId,ending:{id:g.endingId,...endings[g.endingId]},why:explanationFor(g,g.endingId),day:g.day,
      turnsPlayed:g.turn,metrics:g.metrics,statuses:g.statuses,coins:g.coins,earned:g.earned,spent:g.spent,
      inventory:g.inventory,performance:g.performance,missions:g.history,daySummaries:g.daySummaries,science:g.science,messages:g.messages};
  }
  function shop(g){return items.map(i=>({...i,purchased:g.inventory[i.id]||0,remaining:i.limit-(g.inventory[i.id]||0),affordable:g.coins>=i.price,available:g.phase==='active'&&g.coins>=i.price&&(g.inventory[i.id]||0)<i.limit}))}

  // ── Mundo jugable (v0.5): pedidos físicos, bolsa, traje y guardado del mundo ──────────────────────────
  // El frontend simula el movimiento; el motor decide saldo, pedidos, bolsa y efectos. Cada operación acepta
  // un requestId: repetirla devuelve el mismo resultado sin volver a cobrar ni a entregar.
  const EVA_BASE=180,ORDER_SECONDS=20,BAG_CAPACITY=12;
  const WORLD_SCENES=['exterior','zora','invernadero','paneles','crater'];
  const AV={skin:8,hair:10,style:15,eyes:6,suit:6,emblem:16};
  const ACCESSORIES=['none','freckles','glasses','beard'],EXPRESSIONS=['neutral','happy','determined'];
  function ensureWorld(g){
    g.orders=g.orders||[];g.bag=g.bag||{};g.receipts=g.receipts||{};
    g.world=g.world||{avatar:null,scene:'exterior',pos:null,clock:0};
    g.world.suit=g.world.suit||{fill:0,eva:0,evaMax:EVA_BASE,loaded:false,outside:false};
    if(typeof g.world.clock!=='number')g.world.clock=0;
    return g;
  }
  function replay(original,requestId,action){
    if(requestId===undefined||requestId===null)return null;
    if(typeof requestId!=='string'||requestId.length<8||requestId.length>120)throw Error('INVALID_REQUEST_ID');
    const prev=original.receipts?.[requestId];
    if(!prev)return null;
    if(prev.action!==action)throw Error('INVALID_REQUEST_ID');
    return {state:clone(original),result:{...clone(prev.result),duplicate:true}};
  }
  function remember(g,requestId,action,result){
    if(!requestId)return;
    g.receipts[requestId]={action,result:clone(result)};
    const keys=Object.keys(g.receipts);if(keys.length>100)delete g.receipts[keys[0]];
  }
  const bagCount=g=>Object.values(g.bag).reduce((a,b)=>a+b,0);
  function orderItem(original,itemId,{requestId}={}) {
    assertGame(original);
    const again=replay(original,requestId,'ORDER');if(again)return again;
    const item=itemMap.get(itemId);if(!item)throw Error('ITEM_NOT_FOUND');
    const used=original.inventory[item.id]||0;if(used>=item.limit)throw Error('OUT_OF_STOCK');
    if(original.coins<item.price)throw Error('INSUFFICIENT_COINS');
    const g=ensureWorld(clone(original));
    g.coins-=item.price;g.spent+=item.price;g.inventory[item.id]=used+1;
    const order={id:`P${(g.orderSeq=(g.orderSeq||0)+1)}`,itemId:item.id,name:item.name,price:item.price,status:'confirmed',
      day:g.day,turn:g.turn,orderedAt:g.world.clock,readyAt:g.world.clock+ORDER_SECONDS};
    g.orders.push(order);
    const result={order:clone(order),coinsAfter:g.coins,day:g.day,turn:g.turn};
    g.events.push({type:'ORDER_PLACED',orderId:order.id,itemId:item.id,day:g.day,turn:g.turn});
    remember(g,requestId,'ORDER',result);
    return {state:g,result};
  }
  function tickWorld(original,{seconds=0,outside=false}={}) {
    assertGame(original);
    const dt=Math.max(0,Math.min(120,Number(seconds)||0));
    const g=ensureWorld(clone(original));
    g.world.clock=Math.round((g.world.clock+dt)*1000)/1000;
    const ready=[];
    for(const o of g.orders)if(o.status==='confirmed'&&g.world.clock>=o.readyAt){o.status='ready';ready.push(o.id)}
    const suit=g.world.suit;let exhausted=false;
    if(outside&&suit.loaded){
      suit.eva=Math.max(0,Math.round((suit.eva-dt)*1000)/1000);
      if(suit.eva<=0&&!suit.exhausted){
        suit.exhausted=true;exhausted=true;
        g.metrics.health=clamp(g.metrics.health-8);g.metrics.oxygen=clamp(g.metrics.oxygen-4);add(g,'oxigeno_agotado');
        g.events.push({type:'EVA_EXHAUSTED',day:g.day,turn:g.turn,delta:{health:-8,oxygen:-4}});
        if(isCritical(g)){g.phase='completed';g.endingId=endingFor(g);g.currentMissionId=null}
      }
    }
    return {state:g,result:{clock:g.world.clock,ready,exhausted,eva:suit.eva,evaMax:suit.evaMax,loaded:suit.loaded,outside:suit.outside}};
  }
  function collectOrders(original,{requestId}={}) {
    assertGame(original);
    const again=replay(original,requestId,'COLLECT');if(again)return again;
    const g=ensureWorld(clone(original));
    const ready=g.orders.filter(o=>o.status==='ready');
    if(!ready.length)throw Error('NO_ORDER_READY');
    const collected=[];
    for(const o of ready){if(bagCount(g)>=BAG_CAPACITY)break;o.status='collected';o.collectedAt=g.world.clock;g.bag[o.itemId]=(g.bag[o.itemId]||0)+1;collected.push(o.id)}
    if(!collected.length)throw Error('BAG_FULL');
    const result={collected,left:ready.length-collected.length,bag:clone(g.bag)};
    g.events.push({type:'ORDER_COLLECTED',orders:collected,day:g.day,turn:g.turn});
    remember(g,requestId,'COLLECT',result);
    return {state:g,result};
  }
  function useItem(original,itemId,{requestId}={}) {
    assertGame(original);
    const again=replay(original,requestId,'USE_ITEM');if(again)return again;
    const item=itemMap.get(itemId);if(!item)throw Error('ITEM_NOT_FOUND');
    const g=ensureWorld(clone(original));
    if((g.bag[item.id]||0)<1)throw Error('ITEM_NOT_IN_BAG');
    g.bag[item.id]-=1;if(!g.bag[item.id])delete g.bag[item.id];
    for(const[k,v]of Object.entries(item.delta))g.metrics[k]=clamp(g.metrics[k]+v);
    for(const st of item.remove)remove(g,st);
    const result={itemId:item.id,name:item.name,delta:clone(item.delta),removedStatuses:clone(item.remove),bag:clone(g.bag)};
    g.events.push({type:'ITEM_USED',itemId:item.id,day:g.day,turn:g.turn});
    remember(g,requestId,'USE_ITEM',result);
    return {state:g,result};
  }
  // Cada salida de Zora gasta un tanque: hay que llenarlo en los depósitos de soporte vital (cuesta oxígeno de la base).
  const TANK_COST=3,TANK_MIN_STATION=10;
  function tankFill(original,percent,{requestId}={}) {
    assertGame(original);
    const again=replay(original,requestId,'TANK_FILL');if(again)return again;
    const p=Number(percent);if(!Number.isFinite(p))throw Error('INVALID_PERCENT');
    const g=ensureWorld(clone(original));const suit=g.world.suit;
    if(suit.outside)throw Error('TANK_FILL_OUTSIDE');
    if(g.metrics.oxygen<TANK_MIN_STATION)throw Error('INSUFFICIENT_STATION_OXYGEN');
    const fill=Math.round(clamp(p));
    g.metrics.oxygen=clamp(g.metrics.oxygen-TANK_COST);
    suit.fill=fill;suit.evaMax=Math.round(EVA_BASE*(0.4+0.6*fill/100));suit.eva=suit.evaMax;suit.exhausted=false;suit.loaded=true;
    remove(g,'oxigeno_agotado');
    if(fill<60)add(g,'tanque_incompleto');else remove(g,'tanque_incompleto');
    const result={fill,evaMax:suit.evaMax,insufficient:fill<60,stationCost:TANK_COST,day:g.day,turn:g.turn};
    g.events.push({type:'TANK_FILL',...result});
    remember(g,requestId,'TANK_FILL',result);
    return {state:g,result};
  }
  // Salir de Zora exige un tanque lleno; el tanque se usa (queda en uso hasta volver).
  function leaveBase(original,{requestId}={}) {
    assertGame(original);
    const again=replay(original,requestId,'LEAVE_BASE');if(again)return again;
    const g=ensureWorld(clone(original));const suit=g.world.suit;
    if(suit.outside)return {state:g,result:{outside:true,eva:suit.eva,evaMax:suit.evaMax,already:true}};
    if(!suit.loaded)throw Error('TANK_NOT_LOADED');
    suit.outside=true;
    const result={outside:true,eva:suit.eva,evaMax:suit.evaMax,fill:suit.fill};
    g.events.push({type:'LEAVE_BASE',day:g.day,turn:g.turn,fill:suit.fill});
    remember(g,requestId,'LEAVE_BASE',result);
    return {state:g,result};
  }
  // Volver a Zora vacía el tanque: para la próxima salida hay que llenar otro.
  function enterBase(original) {
    assertGame(original,true);
    const g=ensureWorld(clone(original));const suit=g.world.suit;
    const wasOutside=suit.outside;
    suit.outside=false;suit.loaded=false;suit.eva=0;suit.exhausted=false;
    if(wasOutside)g.events.push({type:'ENTER_BASE',day:g.day,turn:g.turn});
    return {state:g,result:{outside:false,loaded:false,wasOutside}};
  }
  function setAvatar(original,avatar) {
    assertGame(original,true);
    const a=avatar||{};const int=(v,n)=>Number.isInteger(v)&&v>=0&&v<n;
    if(!int(a.skin,AV.skin)||!int(a.hair,AV.hair)||!int(a.style,AV.style)||!int(a.eyes,AV.eyes)||!int(a.suit,AV.suit)||!int(a.emblem??0,AV.emblem)
      ||!ACCESSORIES.includes(a.accessory)||!EXPRESSIONS.includes(a.expression))throw Error('INVALID_AVATAR');
    const name=String(a.name||'').replace(/[^\p{L}\p{N} _-]/gu,'').trim().slice(0,16)||'Astro';
    const g=ensureWorld(clone(original));
    g.world.avatar={name,skin:a.skin,hair:a.hair,style:a.style,eyes:a.eyes,suit:a.suit,accessory:a.accessory,expression:a.expression,emblem:a.emblem??0};
    return {state:g,result:{avatar:clone(g.world.avatar)}};
  }
  function setWorldState(original,{scene,pos}={}) {
    assertGame(original,true);
    if(!WORLD_SCENES.includes(scene))throw Error('INVALID_SCENE');
    const ok=pos&&Number.isFinite(pos.x)&&Number.isFinite(pos.y)&&pos.x>=0&&pos.y>=0&&pos.x<=2000&&pos.y<=2000;
    if(!ok)throw Error('INVALID_POSITION');
    const g=ensureWorld(clone(original));
    g.world.scene=scene;g.world.pos={x:Math.round(pos.x*10)/10,y:Math.round(pos.y*10)/10};
    return {state:g,result:{scene,pos:g.world.pos}};
  }
  return {evText,evLocal,setLanguage,getLanguage:()=>lang,languages:()=>LANGUAGES.map(l=>({...l,ready:l.code==='es'||!!baseCatalog.i18n?.[l.code]})),localize,statusNames:()=>({...statusNames}),createGame,nextMission,resolveMission,skipMission,purchase,orderItem,tickWorld,collectOrders,useItem,tankFill,leaveBase,enterBase,setAvatar,setWorldState,ensureWorld,sendMessage,respondWeather,repeatDay,npcAsk,report,shop,endingFor,assess,currentMission,challengeMap};
}

/**
 * Contrato sencillo para frontend HTML/CSS/JavaScript o Phaser.
 * No introduce reglas nuevas: delega las decisiones al motor lunar existente.
 * Independiente de Node, SQLite, HTML y Phaser.
 */
function createFrontendBridge(engine, {
  storage = undefined,
  storageKey = 'moon-survival-partida-v03',
  now = () => Date.now(),
  autoStart = true,
  seed = undefined,
} = {}) {
  if (!engine || typeof engine.createGame !== 'function' || typeof engine.resolveMission !== 'function') {
    throw new Error('INVALID_ENGINE');
  }
  const clone = object => structuredClone(object);
  const listeners = new Set();
  let game = null;
  let pendingChoice = null;
  let lastResult = null;
  let lastLuni = null;
  let storageAvailable = false;
  let storageError = null;
  const getStorage = () => {
    if (storage !== undefined) return storage;
    try { return typeof localStorage === 'undefined' ? null : localStorage; }
    catch { return null; }
  };
  const store = getStorage();
  // Idioma: preferencia aparte de la partida (se puede cambiar desde el menú, antes de empezar).
  const langKey = storageKey + '-lang';
  const readLang = () => { try { return store?.getItem(langKey) || null; } catch { return null; } };
  const browserLang = () => { try { return String(navigator.language || '').slice(0, 2).toLowerCase(); } catch { return ''; } };
  if (typeof engine.setLanguage === 'function') {
    const wanted = readLang() || browserLang();
    try { engine.setLanguage(engine.languages().some(l => l.code === wanted && l.ready) ? wanted : 'es'); } catch { /* queda en español */ }
  }
  const langInfo = () => typeof engine.setLanguage === 'function'
    ? {lang:engine.getLanguage(), languages:engine.languages(), statusNames:engine.statusNames()}
    : {lang:'es', languages:[{code:'es',name:'Español',native:'Español',ready:true}], statusNames:{}};
  function setLanguage(code) {
    if (typeof engine.setLanguage !== 'function') throw new Error('INVALID_LANGUAGE');
    const info = engine.languages().find(l => l.code === code);
    if (!info || !info.ready) throw new Error('INVALID_LANGUAGE');
    engine.setLanguage(code);
    try { store?.setItem(langKey, code); } catch { /* sin almacenamiento: dura la sesión */ }
    notify('LANGUAGE', {result:{lang:code}});
    return getView();
  }
  function notify(action, extra = {}) {
    const view = getView();
    for (const fn of listeners) fn(view, {action, ...extra});
  }
  function save() {
    if (!store) {storageAvailable = false; storageError = 'STORAGE_UNAVAILABLE'; return false;}
    try {
      store.setItem(storageKey, JSON.stringify({format:'moon-frontend-bridge-1', game, pendingChoice, updatedAt:now()}));
      storageAvailable = true; storageError = null;
      return true;
    } catch {
      storageAvailable = false; storageError = 'STORAGE_WRITE_FAILED';
      return false;
    }
  }
  function restore() {
    if (!store) return false;
    try {
      // Compatibilidad con la primera demo offline, que utilizaba otra clave.
      const raw = store.getItem(storageKey) ?? (storageKey === 'moon-survival-partida-v03' ? store.getItem('moon-survival-v03-offline') : null);
      if (!raw) { storageAvailable = true; return false; }
      const parsed = JSON.parse(raw);
      // Admite también el guardado anterior de v0.3, que contenía directamente game.
      const saved = parsed && parsed.format === 'moon-frontend-bridge-1' ? parsed.game : parsed;
      if (!saved || saved.schemaVersion !== 3 || !Array.isArray(saved.statuses) || !saved.metrics || !Number.isInteger(saved.turn)) {
        storageAvailable = true; return false;
      }
      game = clone(saved);
      pendingChoice = parsed?.format === 'moon-frontend-bridge-1' && ['A','B'].includes(parsed.pendingChoice) ? parsed.pendingChoice : null;
      storageAvailable = true;
      return true;
    } catch {
      storageAvailable = false; storageError = 'STORAGE_READ_FAILED'; return false;
    }
  }
  function requireGame() { if (!game) throw new Error('NO_GAME'); return game; }
  function commit(output, action) {
    game = output.state;
    pendingChoice = null;
    lastResult = output.result ?? null;
    save(); notify(action, {result:lastResult});
    return {view:getView(), result:lastResult, state:getState()};
  }
  function newGame({seed:chosenSeed, scienceEvents} = {}) {
    const actualSeed = chosenSeed ?? seed ?? `luna-${now()}-${Math.random().toString(36).slice(2)}`;
    const events = scienceEvents ?? engine.catalog?.events ?? [];
    game = engine.createGame({seed:actualSeed, scienceEvents:events});
    pendingChoice = null; lastResult = null; lastLuni = null;
    save(); notify('NEW_GAME');
    return getView();
  }
  function getState() { return game ? clone(game) : null; }
  const localWeather = w => { const c = clone(w); if (typeof engine.evLocal === 'function') { if (c.event) c.event = engine.evLocal(c.event); if (c.note) c.note = engine.evText(c.note); } return c; };
  const localScience = sc => { const c = clone(sc); if (typeof engine.evLocal === 'function') { if (c.registeredEvent) c.registeredEvent = engine.evLocal(c.registeredEvent); } return c; };
  const localEvents = list => { const c = clone(list); if (typeof engine.evText === 'function') for (const e of c) { if (e.explanation) e.explanation = engine.evText(e.explanation); if (e.note) e.note = engine.evText(e.note); } return c; };
  const localResult = r => deepEv(clone(r));
  // Traduce los textos de los registros DONKI en cualquier parte de un objeto (solo cambia de idioma si está en inglés).
  const EV_KEYS = new Set(['note', 'location', 'summary', 'explanation', 'disclaimer']);
  const deepEv = o => { if (typeof engine.evText !== 'function' || !o || typeof o !== 'object') return o;
    for (const [k, v] of Object.entries(o)) { if (typeof v === 'string' && EV_KEYS.has(k)) o[k] = engine.evText(v); else if (v && typeof v === 'object') deepEv(v); } return o; };
  function getView() {
    if (!game) return {phase:'not_started', ...langInfo(), storage:{available:storageAvailable,error:storageError}};
    const next = engine.nextMission(game).next;
    let ending = null;
    if (game.phase === 'completed') {
      try { ending = engine.report(game); ending = deepEv(ending); } catch { ending = null; }
    }
    return {
      gameId:game.id, phase:game.phase, scene:game.phase==='completed'?'ending':game.weather?.pending?'weather':'mission',
      day:game.day, turn:game.turn, maxDays:game.maxDays, maxTurns:game.maxTurns,
      daysCompleted:Math.floor(game.turn/2), seed:game.seed, skill:game.skill,
      metrics:clone(game.metrics), statuses:[...game.statuses],
      coins:game.coins, inventory:clone(game.inventory), shop:engine.shop(game),
      mission:next?{id:next.id, name:next.name, intro:next.intro, cause:next.cause, science:next.science,
        category:next.category, difficulty:next.difficulty, options:next.choices.map((choice,index)=>({
          id:index===0?'A':'B', label:choice.label, consequence:choice.consequence,
          delta:clone(choice.delta), risk:choice.risk
        })), modifiers:clone(next.modifiers)}:null,
      pendingChoice,
      weather:game.weather?localWeather(game.weather):null,
      science:localScience(game.science),
      messages:clone(game.messages), events:localEvents(game.events),
      performance:clone(game.performance),
      lastResult:lastResult?localResult(lastResult):null,
      lastLuni:lastLuni?clone(lastLuni):null,
      orders:clone(game.orders||[]), bag:clone(game.bag||{}), world:clone(game.world||{avatar:null,scene:'exterior',pos:null,clock:0}),
      ending, ...langInfo(),
      storage:{available:storageAvailable,error:storageError}
    };
  }
  function subscribe(fn, {immediate=true} = {}) {
    if (typeof fn !== 'function') throw new TypeError('Listener must be a function');
    listeners.add(fn);
    if (immediate) fn(getView(), {action:'SUBSCRIBED'});
    return () => listeners.delete(fn);
  }
  function validateChoice(id) {
    if (!['A','B'].includes(id)) throw new Error('INVALID_CHOICE');
    const current = engine.nextMission(requireGame()).next;
    if (!current) throw new Error('NO_CURRENT_MISSION');
    if (game.weather?.pending) throw new Error('WEATHER_RESPONSE_REQUIRED');
    return current.id;
  }
  // Para una carta SIN minijuego: resuelve en un solo paso.
  function chooseCard(choiceId, {performance, hintUsed=false} = {}) {
    const id = validateChoice(choiceId);
    return commit(engine.resolveMission(game,id,choiceId,{performance,hintUsed}), 'CHOOSE_CARD');
  }
  // Para carta CON minijuego: separar selección y resultado visual sin avanzar turnos al elegir.
  function prepareMinigame(choiceId) {
    validateChoice(choiceId);
    pendingChoice = choiceId;
    save(); notify('PREPARE_MINIGAME');
    return getView();
  }
  function finishMinigame(performance, {hintUsed=false} = {}) {
    if (!pendingChoice) throw new Error('NO_PENDING_MINIGAME');
    const id = validateChoice(pendingChoice);
    return commit(engine.resolveMission(game,id,pendingChoice,{performance,hintUsed}), 'FINISH_MINIGAME');
  }
  function skipCard() { return commit(engine.skipMission(requireGame()), 'SKIP_CARD'); }
  function buy(itemId) { return commit(engine.purchase(requireGame(),itemId), 'BUY'); }
  function respondWeather(choice) { return commit(engine.respondWeather(requireGame(),choice), 'WEATHER'); }
  function sendMessage(type) { return commit(engine.sendMessage(requireGame(),type), 'MESSAGE'); }
  function repeatDay(day=undefined) {
    return commit(engine.repeatDay(requireGame(),day ?? game.day), 'REPEAT_DAY');
  }
  function askLuni(question,{hint=false}={}) {
    const output=engine.npcAsk(requireGame(),question,{hint});
    game=output.state;lastLuni=output.response;
    save();notify('LUNI_ANSWER', {response:clone(output.response)});
    return clone(output.response);
  }
  function refreshNASA(events) {
    if (!Array.isArray(events)) throw new Error('INVALID_SCIENCE_EVENTS');
    const g=clone(requireGame());
    const existing=new Map((g.scienceEventPool||[]).map(e=>[e.id,e]));
    for(const e of events) {
      if (!e || typeof e.id !== 'string' || !['SEP','CME','GST'].includes(e.type) || !e.observedAt || typeof e.sourceUrl !== 'string' || !/^https:\/\/([a-z0-9.-]+\.)?nasa\.gov(\/|$)/i.test(e.sourceUrl)) continue;
      existing.set(e.id,clone(e));
    }
    g.scienceEventPool=[...existing.values()];
    game=g;save();notify('NASA_REFRESH');
    return {count:g.scienceEventPool.length,view:getView()};
  }
  // ── Mundo jugable (v0.5) ──
  function worldOp(action, fn, name) {
    const out = fn(engine.ensureWorld(requireGame()));
    return commit(out, name || action);
  }
  const order = (itemId, {requestId} = {}) => worldOp('ORDER', g => engine.orderItem(g, itemId, {requestId}), 'ORDER');
  const collect = ({requestId} = {}) => worldOp('COLLECT', g => engine.collectOrders(g, {requestId}), 'COLLECT');
  const useItem = (itemId, {requestId} = {}) => worldOp('USE_ITEM', g => engine.useItem(g, itemId, {requestId}), 'USE_ITEM');
  const fillTank = (percent, {requestId} = {}) => worldOp('TANK_FILL', g => engine.tankFill(g, percent, {requestId}), 'TANK_FILL');
  const leaveBase = ({requestId} = {}) => worldOp('LEAVE_BASE', g => engine.leaveBase(g, {requestId}), 'LEAVE_BASE');
  const enterBase = () => worldOp('ENTER_BASE', g => engine.enterBase(g), 'ENTER_BASE');
  const setAvatar = avatar => worldOp('AVATAR', g => engine.setAvatar(g, avatar), 'AVATAR');
  // Reloj del mundo: no guarda ni avisa en cada segundo, solo cuando cambia algo (pedido listo, oxígeno agotado).
  function tick(seconds, {outside = false} = {}) {
    const out = engine.tickWorld(engine.ensureWorld(requireGame()), {seconds, outside});
    game = out.state;
    if (out.result.ready.length || out.result.exhausted) { save(); notify('WORLD_TICK', {result: out.result}); }
    return out.result;
  }
  // Punto de guardado del mundo (cambio de zona, tarea, compra, recogida, pausa, cierre).
  function checkpoint(scene, pos) {
    const out = engine.setWorldState(engine.ensureWorld(requireGame()), {scene, pos});
    game = out.state; save();
    return out.result;
  }
  function clearProgress() {
    game=null;pendingChoice=null;lastLuni=null;lastResult=null;
    try {store?.removeItem(storageKey);if(storageKey==='moon-survival-partida-v03')store?.removeItem('moon-survival-v03-offline');storageAvailable=!!store;storageError=null;}
    catch {storageAvailable=false;storageError='STORAGE_DELETE_FAILED';}
    notify('CLEAR_PROGRESS');
    return getView();
  }
  const restored=restore();
  if (!restored && autoStart) newGame();
  return {setLanguage,getLanguages:()=>langInfo().languages,newGame,getState,getView,subscribe,save,chooseCard,prepareMinigame,finishMinigame,skipCard,buy,
    respondWeather,sendMessage,repeatDay,askLuni,refreshNASA,clearProgress,order,collect,useItem,fillTank,leaveBase,enterBase,setAvatar,tick,checkpoint};
}

const engine={...createEngine(CATALOG),catalog:CATALOG};
window.MoonSurvival=engine;
window.MoonSurvivalFrontend=(options)=>createFrontendBridge(engine,options);
})();
