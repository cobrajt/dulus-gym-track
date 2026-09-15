# Dulus Gym Track — estado de continuidad

Fecha: 11 de septiembre de 2026
Rama de trabajo: `feature/workout-tracking`
Ruta local usada: `C:\Users\user\Desktop\DulusGymWork`
Servidor local: `node server.js` → `http://localhost:4173`

## Para retomar la próxima vez
1. Pedir al usuario acceso remoto al PC al comenzar.
2. En PowerShell ejecutar:
   `npx.cmd --yes @wonderwhy-er/desktop-commander@latest remote`
3. Dejar esa ventana abierta mientras se trabaja.
4. Confirmar que `DESKTOP-BKJFJHN` aparece online.
5. Trabajar sobre `feature/workout-tracking`, no sobre la primera versión React/Codespaces.

## Fuente de ejercicios a recordar
- Nombre: **Free Exercise DB**.
- Repositorio: `yuhonas/free-exercise-db`.
- Página navegable: `https://yuhonas.github.io/free-exercise-db/`.
- GitHub: `https://github.com/yuhonas/free-exercise-db`.
- Tiene más de 800 ejercicios y un catálogo de imágenes de ejecución.
- El proyecto se publica como dataset de dominio público bajo Unlicense.
- Para Dulus Gym Track ya se descargaron imágenes locales desde esta fuente; no depender de enlaces externos en producción.

## Estado actual
- Requisitos completos y conversaciones recuperadas en PRODUCT_REQUIREMENTS.md. Leerlo al retomar.
- Tipografía: Courgette caligráfica para títulos y Manrope para lectura; fuentes locales y licencias OFL.
- Fondos distintos por sección e icono PNG de Dulus dominicus con ojo rojo (192/512).
- Motivación diaria y verso bíblico destacados; ajustes independientes y persistentes en Perfil > Ajustes.
- Entreno funcional: biblioteca, crear rutina para un alumno, abrir rutina, consultar técnica y registrar sesión.
- Biblioteca de 883 fichas: 876 oficiales Free Exercise DB + 7 propias. 1.746 imágenes oficiales locales; instrucciones nuevas en inglés original indicado en cada ficha.
- 29 fichas existentes conservan sus IDs para no romper rutinas. 3 fichas oficiales y 7 propias no tienen imágenes.
- Objetivos múltiples/personalizados tanto al crear como al editar un alumno; elección de objetivo principal.
- Comunidad LOCAL: constancia, motivos de la posición, quienes necesitan retomar y perfil sin medidas/fotos. Sin cuentas ni sincronización todavía.
- Indicadores iniciales calculados de registros locales; retiradas tarjetas/estadísticas ficticias sin interacción.
- Service worker v10: catálogo y fuentes offline, imágenes adicionales almacenadas al consultar.
- Pruebas Edge/Playwright: catálogo íntegro, paginación, filtros, ajustes tras recarga, alumno con 5 objetivos, rutina, sesión, perfil de constancia, 320/390/1280 px, offline y sin errores JS.
- Cambios guardados en disco SIN commit ni push. Revisar git status y git diff antes de seguir.
- Servidor: node server.js, http://localhost:4173, desde DulusGymWork.
- Copia de archivos previa al bloque visual: carpeta temporal dulus-before-experience-1789146127114.

## Próxima sesión
- Conectar cuentas y base compartida para coach/alumnos: usuario confirmó que no tiene ningún servicio conectado. Supabase era propuesta histórica.
- Definir visibilidad de comunidad y permisos por organización/alumno antes de compartir datos reales.
- Traducir y revisar las fichas importadas en inglés; completar imágenes faltantes sin inventar demostraciones.
- Hacer pruebas multiusuario cuando exista backend.
- Continuar en feature/workout-tracking, no cambiar de rama ni merge a main.


## Presupuesto confirmado por el usuario
- Comenzar exclusivamente con servicios gratuitos, con objetivo de coste recurrente $0.
- Evaluar mejoras de pago poco a poco solo cuando la app genere ingresos y el usuario las autorice expresamente.
- No activar planes de pago, pruebas con cobro posterior ni complementos facturables sin autorizacion.
- Supabase: comenzar con plan Free; verificar limites vigentes antes de conectar o desplegar.


## Punto actual - Supabase y cierre de hoy
DATOSGYM (rnrciqyngdequkbmttxu), organizacion pinpollo, plan Free.
- El usuario ya confirmo su cuenta, inicio sesion y creo su equipo "dulus gym track" como coach.
- Migraciones 2026091101_accounts_teams.sql y 2026091102_training.sql APLICADAS con autorizacion explicita.
- Permisos de cuentas/equipos y alumnos/rutinas/sesiones verificados con pruebas transaccionales. Fixtures descartadas por ROLLBACK. Nuevas tablas de entrenamiento con 0 registros.
- Usuario confirmo que alumnos locales son PRUEBAS: conservarlos localmente, no importarlos.
- account.html operativo para cuenta/equipo/invitaciones. team.html/team.js/team.css preparados y QA simulado aprobado; AUN NO enlazados desde Cuenta ni incluidos en cache. No presentar sincronizacion completa ni publicacion como terminadas.
- Proximo paso exacto: habilitar enlace Abrir equipo en account.js, actualizar textos/cache y probar flujo real coach/alumno. Despues correo gratuito para alumnos, publicacion para telefonos y funciones pendientes de medidas/fotos/comunidad.
- Usuario pidio parar por hoy al terminar migracion/verificacion. Trabajo detenido; no continuar autonomamente.
- Todos los cambios guardados localmente SIN commit/push; rama feature/workout-tracking, sin merge a main. Revisar Git al retomar.


## Reanudación 2026-09-12 — acceso al equipo habilitado
- Se leyeron ambos archivos de continuidad antes de editar. Git confirma origin cobrajt/dulus-gym-track y feature/workout-tracking; se conservaron todos los cambios pendientes.
- account.js ahora ofrece Abrir equipo para coach y alumno; se actualizaron los avisos de cuenta y service-worker v12 incluye team.html, team.css y team.js.
- Servidor local reiniciado. Verificación real en navegador: ruben entra a dulus gym track desde el nuevo enlace; panel del coach carga correctamente, equipo vacío y sin errores de consola. No se crearon invitaciones ni registros reales.
- QA aislada de team: creación de rutina y registro de sesión simulados PASS; anchos 320/390/1280 sin errores JS. La comprobación de sintaxis de account.js pasó.
- Los datos de prueba locales siguen sin importarse. No se modificó esquema, no se cambió de rama ni se hizo commit/push.
- Próximo paso: validar una segunda cuenta de alumno y su unión al equipo; resolver correo gratuito/OAuth si limita el alta. Después publicación gratuita para teléfonos. No se ha verificado hoy un alumno real extremo a extremo.


## 2026-09-12 — Rutinas por día y entrenamiento guiado
- Estado real previo confirmado: correo Brevo conectado a Supabase; el usuario autorizó la IP SMTP 54.201.188.200 y luego confirmó recepción. Alumno de prueba se unió, abrió el equipo y guardó sesión. Coach ve «prueba 2», objetivos y rutina «3 dia», 1 sesión de 5/5 ejercicios. No guardar claves SMTP en archivos.
- Implementado team-training.js y team-training.css. Coach selecciona días y cambia entre apartados independientes; cada ejercicio tiene casilla, series, repeticiones y peso kg en la misma fila. 0 kg = sin carga añadida.
- Cada día se guarda como una fila de dulus_plans, con days de un elemento y ejercicios propios (incluyen weightKg). Una única inserción por lote conserva atomicidad. Sin migración SQL ni cambios de permisos. Rutinas anteriores multidiarias y sesiones conservadas.
- Alumno: botón «Ver entrenamiento y registrar» muestra técnica, series/repeticiones/peso y casillas de ejercicios completados. Guarda por fecha mediante dulus_record_session existente; conserva borrador local por usuario/rutina/fecha si falla el envío.
- Temporizador de descanso editable (5–1800 s), inicio/pausa/continuación/reinicio, accesos entre series y entre ejercicios. Cuenta contra hora de finalización, sin acumular desvío de intervalos. Ajustes independientes de sonido/vibración y duraciones por usuario en este dispositivo.
- Sugerencia inicial de descanso: 120 s ajustables; referencia general ACSM https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/ . No se presenta como prescripción personalizada. Avisos requieren navegador/dispositivo compatible y pantalla abierta; no se promete vibración en todos los teléfonos.
- service-worker v13 incluye archivos nuevos. Comprobaciones de sintaxis PASS.
- tools/test-team-days.mjs: pruebas aisladas PASS de días distintos/pesos/retención, compatibilidad anterior, controles coach/alumno, reintento tras fallo, guardado por fecha sin duplicados, pausa/continuación/final, ajustes, señales de audio/vibración activadas/desactivadas simuladas y anchos 320/390/1280. No escribe en base real. Hardware de sonido/vibración pendiente de prueba en teléfono.
- Navegador real actualizado: rutina «3 dia» y sesión existentes cargan en nueva vista. No se han creado nuevas rutinas reales automáticamente.
- Copia previa a los cambios: C:/Users/user/AppData/Local/Temp/dulus-days-backup-4xIkWu .
- Próximo paso: usuario crea rutina nueva por días, alumno recarga su ventana y prueba descanso/registro. La app sigue local al PC; publicación gratuita para teléfonos y medidas/fotos/comunidad online siguen pendientes.
- Se mantiene feature/workout-tracking, sin merge, commit ni push. Sin servicios de pago.


## 2026-09-12 — Vista del alumno basada en dibujo (último punto)
- team-training.js/css: un ejercicio a la vez, demostración arriba, flechas anterior/siguiente a los lados del temporizador y una estrella por serie con repeticiones/peso. Volver a mis rutinas restaura el panel.
- Marcar una serie inicia descanso entre series; completar la última detiene el reloj. Avanzar desde ejercicio completo inicia descanso entre ejercicios. Navegar conserva estrellas y ajustes.
- Borrador local v2 por usuario/rutina/fecha conserva series parciales; borradores antiguos compatibles. La nube sigue guardando ejercicios completos mediante dulus_record_session; NO hay sincronización de series parciales entre dispositivos.
- service-worker v14. QA aislada PASS: días/pesos, rutinas anteriores, reintento/guardado, estrellas/navegación/descansos/imágenes, ajustes y señales simuladas, 320/390/1280. Revisión visual móvil PASS. No escrituras en base real. Hardware de sonido/vibración pendiente de teléfono compatible.
- Prueba actualizada en tools/test-team-days.mjs. Copia anterior: C:/Users/user/AppData/Local/Temp/dulus-guided-backup-7ULuJN.
- Próximo paso: alumno recarga su ventana, abre Ver entrenamiento y registrar y prueba la distribución. Publicación gratuita para teléfonos sigue pendiente.
- Rama feature/workout-tracking y origin cobrajt/dulus-gym-track comprobados; cambios guardados en disco, sin commit/push/merge ni servicios de pago.


## 2026-09-12 — Corrección de navegación y series
- Flecha izquierda del primer ejercicio vuelve a mis rutinas; en los demás vuelve al ejercicio anterior conservando avance.
- Círculos numerados con check verde al completar sustituyen estrellas.
- Nuevo inicio ya no precarga marcas de sesiones guardadas; borradores pendientes sí se recuperan. Si existe registro en la misma fecha se advierte que guardar lo actualizará, sin borrarlo al abrir.
- service-worker v15. QA aislada PASS incluye regresar desde primer ejercicio, inicio desmarcado después de guardar, registro anterior intacto, avance pendiente, navegación, temporizador y 320/390/1280. Sin escrituras reales durante pruebas.
- Backup C:/Users/user/AppData/Local/Temp/dulus-checks-yebmvI. Misma rama, sin commit/push/merge.

## 2026-09-12 — Descanso automatico y editable (v16)
- Ultima serie inicia descanso entre ejercicios si queda otro ejercicio. Flecha siguiente conserva la cuenta sin reinicio; ultimo ejercicio finaliza sin descanso adicional.
- Segundos editables junto al reloj, recomendacion inicial de 2 minutos siempre visible. Cambiar tiempo en marcha reinicia la cuenta con la duracion elegida y guarda preferencia del tipo de descanso en este dispositivo. Rango 1 a 86400 segundos.
- QA aislada PASS: inicio automatico antes de navegar, cuenta conservada al avanzar, duracion 43 segundos personalizada y recomendacion visible; regresiones de dias, guardado, controles, avisos y 320/390/1280 PASS. Sin escrituras reales.
- Backup C:/Users/user/AppData/Local/Temp/dulus-rest-Tkly95. Misma rama feature/workout-tracking; sin commit/push/merge. Proximo paso: usuario recarga y prueba.

## 2026-09-12 — Interfaz y conexión coach/alumno (v18, último punto)
- Referencia del usuario: capturas PulseFit 155221/155236/155245/155256/155304; UI propia con tarjetas, violeta, temas claro/oscuro, marca Dulus conservada. Modo ejecución oculta cabecera, botón grande de serie y cámara flotante.
- team-bridge.js/css añadidos. Coach: actividad en pantalla abierta mediante Supabase Postgres Changes, cumplimiento de últimos 7 días según días programados, gráficas de cargas registradas, avisos de cambio de carga/dolor y mayor peso si hay registros anteriores comparables.
- Editor: notas por ejercicio, descansos configurables, enlace HTTPS a videoguía propia, orden con drag/drop o flechas, reutilización de rutinas existentes como plantilla (se agrega al día sin borrar ejercicios ya elegidos). Copias antiguas sin peso proponen 0 kg editable.
- Alumno: notas visibles, reproductor loop/muted/controls si coach aporta enlace; fotos siguen como respaldo. Peso/repeticiones realizados y RIR por ejercicio (no por serie), esfuerzo/fatiga/dolor de sesión opcionales. Se guardan conjuntamente con sesión usando dulus_finish_session.
- Chat por ejercicio y plan. Cámara usa selector/captura nativa del móvil; elegir/grabar envía automáticamente clip privado al chat. MP4/WebM/MOV <=20 MB; URL firmada de 5 minutos para ver. No hay transcodificación ni promesa de compresión automática.
- Migración supabase/migrations/2026091201_feedback.sql APLICADA: details en sesiones, dulus_messages con RLS y bucket privado dulus-technique, RPC y publicación realtime. Validación reversible SQL PASS: guardado coach, lectura alumno, usuario ajeno sin acceso; todo registro de QA SQL revertido antes de aplicar solo esquema.
- QA UI aislada PASS: compatibilidad, guardar/reintentar, días y pesos, temporizador, modos, RIR/esfuerzo/dolor, comentario, subida simulada, plantilla/orden con flechas/notas/descanso; anchos 320/390/1280. Ningún mensaje o video real enviado por las pruebas. Drag nativo, cámara física y entrega realtime entre dos teléfonos pendientes de prueba real.
- La biblioteca de fotos NO se convirtió en 883 videos. Hay reproductor para enlaces del coach; fuente de videoguías masiva pendiente. Pregunta async sobre videos propios vs biblioteca sin respuesta todavía. Se investigó wger (https://github.com/wger-project/wger/pull/970) como candidato con licencia por entrada; no se importó. Repositorio arhxam declara procedencia incierta de videos, no usarlo como licencia verificada.
- Backup previo C:/Users/user/AppData/Local/Temp/dulus-bridge-NCqbTS. Se mantiene C:/Users/user/Desktop/DulusGymWork, origin cobrajt/dulus-gym-track, feature/workout-tracking; sin commit/push/merge ni pagos. Sitio aún localhost: publicación gratuita para teléfonos sigue pendiente.
- Próximo: usuario revisa modo claro/oscuro y nueva pantalla; probar coach/alumno real, clips físicos, realtime, videoguías licenciadas. No afirmar terminado el catálogo de videos ni notificaciones push con app cerrada.

## CIERRE DEL DIA — 2026-09-12 — continuar desde aqui
- Usuario solicito terminar por hoy, guardar todo y poder apagar el PC. No seguir desarrollando hasta que lo pida.
- Modo dia/noche OPCIONAL confirmado en vista equipo y entrenamiento: boton Modo claro / Modo oscuro, eleccion manual persistida por navegador con dulus-team-theme. No es un cambio obligatorio ni horario automatico. QA aislada tools/test-team-theme.mjs PASS para ambos cambios y persistencia tras recargar; sin datos reales modificados.
- Todos los cambios estan guardados en disco en C:/Users/user/Desktop/DulusGymWork. Ultima version service-worker v18; ampliacion SQL de feedback ya aplicada. Git permanece feature/workout-tracking, cambios locales sin commit/push/merge. No afirmar respaldo nuevo en GitHub.
- Al retomar: conectar DESKTOP-BKJFJHN mediante Remote Desktop Commander, leer PROJECT_STATE.md y WORKLOG.md y comprobar Git antes de editar. Reiniciar servidor local si el PC fue apagado; localhost no estara disponible mientras este apagado.
- Continuar con revision visual del usuario, prueba real coach/alumno de camara y avisos, y seleccion de videoguia licenciada. Mantener servicios gratuitos. Detalles y limitaciones del ultimo avance estan en el bloque v18 anterior.


## Reanudacion 2026-09-13
- Leidos estado y diario; rama y origen comprobados. Servidor local reiniciado y app abierta: equipo con un alumno y una sesion real conservados.
- Corregido resumen de actividad: peso ausente muestra Peso no indicado en lugar de null kg. No se modificaron registros. Sintaxis PASS; cache v19.
- Siguiente: validar comentarios/camara/avisos con alumno de prueba y resolver biblioteca de videos y acceso gratuito desde telefonos.

## 2026-09-13 — Comentario real alumno a coach verificado
- Usuario entro como alumno y envio comentario de prueba. Se observo en la pestaña existente del coach, sin pulsar Actualizar: prueba 2, Press de banca con barra, texto prueba conexion, 13/09/2026 12:34:53.
- Confirmado comentario contextual y llegada a actividad del coach con pantalla abierta. El asistente no envio mensajes ni modifico sesiones.
- Siguiente pendiente: grabacion/subida de clip real (la prueba previa fue simulada), acceso desde telefonos y biblioteca de videoguías. No afirmar notificaciones con app cerrada.

## 2026-09-13 — Estado visible de envio de videos (v20)
- Usuario no sabia si se envio su clip. Panel del coach consultado y actualizado: aun sin mensaje de video recibido; no se afirmo envio exitoso.
- team-bridge.js/css: tarjeta flotante persistente con nombre/tamaño, progreso indeterminado, etapas Subiendo video y Compartiendo con tu coach, confirmacion solo tras subida e insercion de mensaje, error o archivo mayor de 20 MB. Permanece al navegar ejercicios y puede cerrarse al terminar. Oculta datos al cerrar sesion y evita envios simultaneos. No se muestran porcentajes ficticios.
- tools/test-video-status.mjs PASS: carga pendiente, exito, navegacion durante envio, cerrar aviso, fallo de subida y limite de tamaño; solo archivos simulados, ningun video real transmitido. Sintaxis PASS. Capturas modo claro/oscuro generadas para revisar interfaz.
- Backup C:/Users/user/AppData/Local/Temp/dulus-video-status-Qdtw1R. Misma rama, sin migracion SQL ni cambios a registros. Siguiente: alumno recarga y reintenta clip; leer aviso para resolver causa si falla. Camara/subida real todavia pendiente.


## 2026-09-13 — Corregido bloqueo real de subida privada
- Captura del alumno: MP4 2.2 MB no confirmado, por debajo de 20 MB. Inspeccion pg_policies confirmo bug: name sin calificar se resolvia a p.name (nombre de rutina), bloqueando almacenamiento.
- Migracion 2026091301_video_path_policy.sql APLICADA: storage.objects.name explicito y comprobaciones directas de alumno asignado con membresia vigente o propietario del equipo. Bucket sigue privado; no se ampliaron destinatarios previstos.
- Auto-review rechazo primera propuesta por interpretar lectura demasiado amplia. No se aplico esa propuesta; se reforzaron condiciones explicitas y se validaron antes de aplicar la version aceptada.
- SQL reversible PASS en base real: alumno inserta y lee metadatos de objeto y comparte mensaje, coach lee, usuario ajeno no lee ni inserta. Todas las filas de prueba revertidas. Aplicacion final confirmada Success. No se subio ningun video personal por el asistente.
- Siguiente: alumno cierra aviso y vuelve a seleccionar su mismo MP4; comprobar confirmacion verde y recepcion real en coach. No afirmar que el archivo ya se envio.

## 2026-09-13 — Retención de videos preparada y notas recibidas
- Usuario propone borrar grabaciones tras 7 o 30 días; propuesta elegida: 7 días, solo dulus-technique, conservar comentarios/rutinas/sesiones. Borrado real de bytes mediante Storage API, nunca DELETE SQL sobre storage.objects.
- Preparados supabase/functions/dulus-video-cleanup/index.ts, migración 2026091302_video_retention.sql y VIDEO_RETENTION.md. Planificador cada hora, lote 100, token privado Vault validado por RPC exclusivo service_role, modo desactivado por defecto y dry_run.
- La retención NO está desplegada ni activada todavía. UI v21 consulta estado del servidor y no afirma activación cuando la configuración falta; fechas de caducidad y comentarios preservados listos cuando se active.
- SQL reversible PASS: candidato >7 días incluido, <7 días conservado, desactivado, RPC denegado a anon/authenticated, token incorrecto rechazado. Toda metadata sintética revertida; no se borró ni subió video personal.
- Faltan despliegue y prueba real del planificador; activar solo después de confirmar borrado irreversible. No afirmar limpieza funcionando aún.
- Apuntes del usuario consolidados en PRODUCT_REQUIREMENTS.md: progreso muscular/ejercicio, autonomía y vinculación coach con consentimiento, rutinas principiantes, comunidad lectura/chat, idiomas, nutrición educativa y lanzamiento gratuito con marketing/monetización posteriores.

## 2026-09-13 — Retencion de videos ACTIVADA tras confirmacion del usuario
- Usuario respondio «ok» a activar borrado definitivo a los 7 dias. Autorizacion resuelta, no pedirla de nuevo para completar esta misma configuracion.
- Migracion 2026091302_video_retention.sql APLICADA en DATOSGYM; pg_cron/pg_net instalados, tabla privada con RLS, token generado dentro de Vault sin leerlo ni copiarlo a archivos.
- Edge Function dulus-video-cleanup DESPLEGADA con el codigo local. Verify JWT legacy desactivado para esta funcion exclusivamente; valida x-cleanup-token privado mediante RPC exclusivo service_role antes de cualquier operacion. Autenticacion de usuarios y bucket privado intactos.
- Limpieza habilitada: public.dulus_video_retention_status devuelve {"days":7,"enabled":true}; cron dulus-technique-retention activo, minuto 17 de cada hora. Solo bucket dulus-technique, antiguedad de storage.objects.created_at, maximo 100 por ejecucion. Storage API elimina bytes, conserva todos los comentarios y datos de entrenamiento. Hasta una hora extra en condiciones normales; interrupciones/backlog pueden demorar mas.
- Verificacion real pg_net a Edge: request 1 dry_run HTTP 200 (0 candidatos, disabled); request 2 sin token HTTP 401; activacion y ejecucion manual del mismo comando cron request 3 HTTP 200 {"deleted":0}. No habia archivos caducados: NO afirmar haber observado eliminacion real de un video; seleccion de antiguedad y borrado simulado ya probados. No se borraron videos personales en esta activacion.
- QA UI y worker de retencion PASS en la sesion previa: fecha/caducado/comentarios, auth, disabled, dry-run, bucket fijo, reintento; SQL reversible de 7 dias PASS.
- UI v21 ya puede consultar configuracion activa. Usuario debe recargar para cargar interfaz y reintentar su video de 2.2MB. Envio/recepcion de ese archivo personal aun no confirmados.
- Guardado local en C:/Users/user/Desktop/DulusGymWork, feature/workout-tracking; sin commit/push/merge ni servicios de pago. Apuntes y prioridades siguen en PRODUCT_REQUIREMENTS.md.

## 2026-09-14 — Centro de Acción del Coach + modo personal preparado
- Centro de Acción del Coach conectado al dashboard. Ordena alumnos por prioridad con reglas transparentes, muestra evidencia y “cuello de botella probable”. No usa puntuación opaca ni cambia rutinas sin aprobación.
- Validación real: `prueba 2` aparece solo como Observar por videos pendientes; sin e1RM no inventa fuerza ni problemas. Validación sintética: dolor 8/10 + caída de fuerza + fatiga 8.3/10 => Prioridad alta y cuello de botella Recuperación; Constancia/Registro de datos/Progresión-Técnica también probados.
- Modo alumno autónomo funciona en QA aislada: crear rutina, registrar sesión, feedback y Progreso/e1RM. Textos de coach ocultos/adaptados y no se muestra chat/cámara en personal.
- Backend autónomo aún NO aplicado. Migración local `supabase/migrations/2026091401_solo_student.sql`. `account.html` oculta Entrenar por mi cuenta hasta que RPC `dulus_solo_available()` confirme que el backend está listo.
- Próximo paso seguro: respaldar cambios en GitHub; luego autorizar Supabase CLI temporal (`npx supabase`) y aplicar/verificar la migración. Después prueba real de vincular perfil personal a coach sin perder historial.

## 2026-09-14 — Último estado
- Centro de Acción del Coach operativo con señales explicables, confianza y cuello de botella probable.
- Cumplimiento por músculo calcula series planificadas vs completadas sin confundirlo con crecimiento muscular.
- Coach puede preparar/editar/enviar consejo; alumno puede marcar leído; coach puede retirarlo con confirmación.
- Modo autónomo backend activado en Supabase; tarjeta se habilita solo si RPC dulus_solo_available responde.
- Siguiente bloque recomendado: sincronizar medidas corporales online y añadir tendencias orientadas a objetivos sin inferir composición corporal no medida.

## 2026-09-14 — Medidas corporales y contexto corporal ACTIVOS
- Migraciones 2026091404–2026091407 aplicadas en DATOSGYM: medidas online, borrado, realtime y estatura del alumno.
- Coach y alumno comparten peso/perímetros; Progreso dibuja curvas por medida.
- Nueva lectura estatura/peso con IMC adulto, rango de referencia por estatura y cintura/estatura. Se usa como contexto, no diagnóstico ni estimación de grasa corporal.
- Centro de Acción muestra contexto corporal y solo genera señal por objetivo cuando existe tendencia suficiente; ejemplo: cintura sin cambio con objetivo de perder grasa + buena adherencia.
- La UI evita etiquetar “anorexia” por peso bajo y advierte que el IMC puede sobreestimar adiposidad en personas musculosas.
- Próximo paso: relacionar de forma prudente objetivo + fuerza + adherencia + medidas para un resumen de avance global sin puntuación opaca.

## 2026-09-14 — Guía mínima del alumno
- `student-guidance.js` muestra un único “Próximo paso útil” según los datos que faltan; evita ruido y reduce intervención manual del coach.
- La guía es contextual por objetivo y deja de pedir datos cuando el seguimiento ya es suficiente.

## Metas corporales (2026-09-14)
- `body-goals.js` activo; metas numéricas opcionales con progreso y fecha.
- Supabase: `dulus_body_goals`, perfil corporal opcional y RPCs guardar/cerrar/eliminar.
- Referencia corporal Hombre/Mujer/Prefiero no indicar se usa solo donde corresponda; no altera cortes de IMC adulto.
- La escala adulta se bloquea para menores conocidos; fecha de nacimiento es opcional.
- Primer hito automático de pérdida de peso usa 5% a ~6 meses y no se aplica si IMC alto contradice cintura/estatura baja.
- Coach y alumno comparten la misma meta; Centro de Acción puede avisar de una meta vencida sin modificar rutinas automáticamente.

## Resumen según objetivo (2026-09-14)
- `objective-summary.js` activo en dashboard coach/alumno.
- Resume Constancia, Fuerza, Medidas, Recuperación y Calidad de datos sin nota global opaca.
- El coach selecciona alumno; el alumno ve su propio estado y un único foco prioritario.
- Reutiliza las mismas sesiones, e1RM, medidas y metas corporales ya guardadas.

## 2026-09-14 — Estado metas avanzadas
- Perfil corporal opcional: Hombre/Mujer/Prefiero no indicar + fecha de nacimiento opcional.
- Edad solo refina/valida referencias; nunca es obligatoria para entrenar o registrar medidas.
- Metas corporales y rendimiento aceptan fecha objetivo opcional.
- Rendimiento soporta e1RM por ejercicio, salto vertical/horizontal, sprint 10/20/40 m, dominadas y plancha.
- Resumen global cruza Constancia, Fuerza, Rendimiento, Medidas, Recuperación y Calidad de datos.
- Centro de Acción puede avisar de meta de rendimiento vencida sin modificar el plan automáticamente.

## 2026-09-14 — Evaluación inicial
- La ficha del alumno incluye Evaluación inicial automática y no intrusiva.
- Datos mínimos: objetivo general + estatura + una medición base.
- Referencia Hombre/Mujer/Prefiero no indicar y fecha de nacimiento son opcionales.
- Si existe fecha, Dulus calcula edad y la usa solo donde modifica una referencia; si falta, no bloquea nada.
- Primer hito sugerido puede convertirse en meta, pero la fecha objetivo queda vacía salvo que coach/alumno decidan añadirla.

## Seguimiento por objetivo
- Dulus adapta la recopilación a la meta: no pide las mismas medidas a todos.
- `goal-tracking-profile.js` centraliza recomendaciones de medidas, pruebas físicas y datos automáticos.
- Evaluación inicial y formulario de medidas reutilizan el mismo perfil para evitar mensajes contradictorios.
- Rendimiento deportivo puede usar salto/sprint sin obligar a registrar perímetros corporales.
- Datos opcionales como sexo de referencia y fecha de nacimiento siguen sin bloquear el flujo.

## Evaluación inicial guiada
- El coach recibe una propuesta de seguimiento basada en el objetivo del alumno.
- Puede aprobar/personalizar medidas corporales y pruebas de rendimiento; sexo y fecha de nacimiento siguen siendo opcionales.
- El plan aprobado persiste en `dulus_students.tracking_plan` y reemplaza la propuesta automática hasta que el coach lo reinicie.
- El Centro de Acción avisa si un alumno con objetivo todavía necesita aprobación de seguimiento.
- Migración aplicada: `2026091411_tracking_plan.sql`.

## Seguimiento programado por objetivo
- `tracking-schedule.js` convierte el plan aprobado en un calendario de seguimiento por ventanas.
- El calendario usa las mediciones/pruebas reales como última fecha conocida; no inventa eventos ni exige repetir antes de tiempo.
- Alumno: ve el próximo dato útil y acceso directo a medidas/pruebas cuando toca.
- Coach: Centro de Acción alerta solo por línea base faltante o seguimiento vencido; las ventanas abiertas quedan como contexto.
- No requiere tabla nueva: se deriva de `tracking_plan`, `dulus_measurements` y `dulus_performance_entries`.

## Revisión automática de ciclo
- `cycle-review.js` compara las últimas 4 semanas con las 4 anteriores.
- Coach y alumno ven cambios de constancia, fuerza/e1RM, medidas, pruebas físicas y recuperación.
- La lectura incluye confianza y evita conclusiones fuertes con historial insuficiente.
- El Centro de Acción puede señalar una revisión de ciclo solo con confianza suficiente y sin duplicar alertas más directas.
- La interpretación de medidas depende del objetivo o meta activa; cambios ambiguos se muestran como contexto.
- Caché PWA actualizado a `dulus-gym-track-v45`.

## Calidad de datos de seguimiento
- `data-quality.js` estandariza protocolos de medición corporal y pruebas físicas.
- Los formularios de medidas y pruebas piden una segunda confirmación ante cambios grandes o repeticiones demasiado próximas.
- El aviso no impide guardar un dato que coach/alumno sabe que es correcto.
- Las pruebas QA temporales fueron eliminadas completamente.
- Caché actual: `dulus-gym-track-v46`.

## Seguimiento de molestias
- El alumno puede añadir zona y nota opcional cuando reporta dolor en una sesión.
- El coach ve esa información en avisos y Dulus detecta recurrencia de la misma zona en 14 días.
- La recurrencia leve se interpreta como observación, no como diagnóstico médico.
- Datos guardados dentro del JSON de sesión existente; no requiere migración nueva.
- Caché actual: `dulus-gym-track-v47`.

## Estado añadido: decisiones del coach
- Existe historial online de ajustes del coach (`dulus_coach_decisions`).
- Campos: categoría, cambio realizado, motivo, fecha efectiva y autor.
- Alumno y coach pueden leer el historial; solo el coach del equipo registra/elimina ajustes.
- Dulus compara una ventana breve antes/después y evita atribuir causalidad.
- Un ajuste reciente (<14 días) se considera en observación; la revisión aconseja no cambiar de nuevo sin una señal clara.
- Si aparece un ajuste posterior, la evaluación del anterior termina antes de ese segundo cambio.
- Centro de Acción y Revisión de ciclo consumen este historial.
- Caché PWA actual: `dulus-gym-track-v49`.

## Agenda inteligente del coach
- `coach-agenda.js` coloca arriba del panel una lista breve de alumnos que requieren acción.
- Reutiliza el mismo motor de `DulusCoachAction`; no existe una segunda lógica de diagnóstico que pueda contradecir al Centro de Acción.
- Agrupa varias señales del mismo alumno en una sola tarjeta y prioriza `Hoy` / `Esta semana`.
- Muestra antigüedad únicamente cuando la señal tiene una fecha real y enlaza a alumno, detalle o avisos.
- Estado validado en navegador real del coach con `prueba 2`; sin datos QA creados.

## Estado actual — Agenda del Coach
- `coach-agenda.js` está activo y usa las mismas señales explicables del Centro de Acción.
- Prioriza alumnos en Hoy / Esta semana y conserva los demás fuera de la vista operativa.
- `2026091413_agenda_snooze.sql` añade pospuestos privados por coach, con RLS y máximo 7 días.
- La interfaz permite posponer 1 o 3 días solo asuntos de baja prioridad y recuperarlos manualmente.
- El pospuesto se sincroniza entre dispositivos y no aplica a señales de seguridad/alta prioridad.

## Progresión inteligente de cargas
- `load-progression.js` analiza por ejercicio carga real, repeticiones, RIR, e1RM, fatiga y dolor.
- Estados: `Listo para progresar`, `Mantener`, `Revisar` y `Recopilando`.
- Una progresión requiere al menos 2 registros comparables con RIR válido y realizados al menos con la carga actualmente prescrita.
- Un RIR vacío nunca se interpreta como 0; sin RIR suficiente Dulus sigue recopilando datos.
- Si hay dolor/fatiga relevante, Dulus prioriza revisar antes de subir carga.
- La propuesta inicial usa un incremento conservador cercano al 2.5%, redondeado a 0.5 kg; el coach puede modificarlo y debe confirmar.
- Dulus nunca aplica una subida automáticamente. Las rutinas creadas por el alumno no se sobrescriben por esta vía.
- Una aprobación actualiza la prescripción en Supabase y queda registrada en el Historial de decisiones del coach.
- Las actualizaciones de planes se reflejan en tiempo real para coach/alumno con la app abierta.
- `2026091414_load_progression.sql` está aplicado en Supabase. Caché PWA actual: `dulus-gym-track-v54`.
