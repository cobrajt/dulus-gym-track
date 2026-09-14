# Dulus Gym Track — registro de trabajo

Este archivo es la memoria cronológica del proyecto. Antes de comenzar una sesión, revisar `PROJECT_STATE.md`, este archivo y `git status`.

## 2026-09-10
- Se consolidó el trabajo en `feature/workout-tracking`.
- Se implementaron motivación diaria, verso bíblico configurable, fecha dinámica y fondos premium.
- Se corrigieron problemas de codificación UTF-8 e iconos.
- Se descargaron 58 imágenes locales correspondientes a 29 ejercicios.
- Se creó `exercise-media.js` con el mapeo de imágenes.
- Se guardó el estado en el commit `fa0fd54` y en la rama de respaldo `backup/2026-09-10-cierre`.
- Pendiente principal: terminar la integración visual de las imágenes en la biblioteca.

## 2026-09-11
- Se reconectó Remote Desktop Commander al PC `DESKTOP-BKJFJHN`.
- Se confirmó que la rama activa es `feature/workout-tracking` y el árbol está limpio.
- Se acordó usar GitHub + `PROJECT_STATE.md` + `WORKLOG.md` como memoria oficial del proyecto.
- ChatGPT Work se usará como espacio dedicado al proyecto; los chats normales quedarán para otros temas.


### 2026-09-11 — Integración visual de ejercicios
- Se retomó directamente C:\Users\user\Desktop\DulusGymWork mediante Remote Desktop Commander en DESKTOP-BKJFJHN.
- Antes de editar: rama feature/workout-tracking limpia, origin cobrajt/dulus-gym-track y HEAD d28bdfe coincidente con GitHub.
- Se integraron miniaturas y vistas inicial/final para 29 ejercicios (58 imágenes); los 7 sin imágenes conservan un aviso de guía pendiente.
- Se añadieron los tipos de imagen al servidor, el inventario exercise-image-assets.js y la caché v8.
- Se detectó que no había registro del service worker en la app; se añadió para activar el modo sin conexión.
- Validación con Edge/Playwright: 36 fichas, carga y tipo JPEG de 58 recursos, búsqueda y estado vacío, filtro con/sin pesas, anchos 320/390/1280 sin desborde en la ficha, 58 imágenes en caché y recarga offline con imágenes. Sin errores JavaScript. Revisión visual de ficha móvil completada.
- Servidor local disponible en http://localhost:4173.
- Cambios guardados en disco, sin commit ni push; no se cambió de rama ni se hizo merge.
- Próximos pendientes: icono PWA Dulus dominicus, tipografías y fondos; completar los 7 ejercicios sin imágenes.

### 2026-09-11 — Recuperación de requisitos y experiencia coach/alumnos
- Se recuperaron «Continuar app Dulus Gym Track» y «Continuar app ideas nuevas»; sus acuerdos se consolidaron en PRODUCT_REQUIREMENTS.md.
- El usuario confirmó que no hay servicio de cuentas/base de datos conectado. Comunidad entre teléfonos sigue pendiente.
- Se comprobó la pestaña del usuario: tenía una página antigua con solo storage.js y app.js; recargar mostró las funciones actuales.
- Se reemplazaron tarjetas de rutina inertes por un recorrido real: escoger alumno, crear rutina, abrirla, ver ejercicios y registrar sesión.
- Se implementaron Courgette/Manrope locales, fondos por sección e icono Dulus dominicus generado con ImageGen, exportado a PNG 192/512.
- Se separaron motivación y verso; se corrigió la migración de la preferencia combinada para mantener ambos interruptores independientes después de recargar.
- Catálogo oficial fijado en commit a859101d633a01c4a1a920d6a8ce41dabba0705f: 876 ejercicios, 1.746 imágenes; integrado como 883 fichas preservando 29 IDs anteriores.
- Paginación de 24, filtros y búsqueda tolerante a tildes, instrucciones originales en inglés identificadas. No se inventaron imágenes faltantes.
- Comunidad local con explicaciones y perfiles de constancia; lista de apoyo para retomar. Datos personales de medidas/fotos no aparecen en esa vista.
- Se añadió edición de objetivos múltiples y personalizados, guardado antes de cerrar; se corrigió el ID de la foto ampliada.
- Prueba completa en contexto aislado de Edge: catálogo y JPG íntegros, filtros/paginación, ajustes persistentes, alumno, 5 objetivos, rutina, sesión, perfil, 320/390/1280 y offline. Sin errores JavaScript. Se revisó visualmente Inicio y se abrió la biblioteca real del usuario.
- Imágenes del catálogo adicionales se cachean al consultar; núcleo/fuentes/catálogo se cachean para offline. Caché v10.
- Sin cambios de rama, sin merge, sin commit ni push. Los cambios siguen locales y el servidor continúa activo.

### Presupuesto ? 2026-09-11
- El usuario confirmo inicio gratuito; mejoras de pago graduales solo si hay ingresos y autorizacion. Restriccion guardada en requisitos y estado.


### 2026-09-11 - Preparacion de cuentas Supabase (pendiente de aprobacion)
- Usuario identifico DATOSGYM como proyecto de Dulus. Organizacion pinpollo, plan Free, proyecto rnrciqyngdequkbmttxu.
- Diagnostico SQL de solo lectura: profiles, rutinas, detalle_rutina, registro_series y ejercicios tienen 0 registros; auth.users tiene 0 usuarios; no hay triggers ni funciones public, ni politicas RLS.
- Guardada migracion supabase/migrations/2026091101_accounts_teams.sql: conserva tablas antiguas, activa RLS/revoca acceso anon/authenticated; agrega dulus_accounts, dulus_teams, dulus_members, dulus_invitations y funciones controladas para perfil/equipo/invitacion.
- SDK Supabase 2.116.0 y licencia descargados a assets/vendor. Todavia NO integrado en la app.
- La revision automatica RECHAZO ejecutar la migracion por requerir aprobacion explicita del alcance y posible interrupcion del acceso. NO aplicada; no reintentar por otro medio sin resolver aprobacion.
- Proximo: obtener aprobacion del usuario, aplicar migracion, probar aislamiento/roles e invitaciones, implementar cuenta y sincronizacion. App sigue local.


### 2026-09-11 - Cuentas y equipos aplicados con autorizacion
- El usuario autorizo explicitamente aplicar la migracion: "si continuemos". Ejecucion confirmada por Supabase: Success. No rows returned.
- Creadas dulus_accounts, dulus_teams, dulus_members y dulus_invitations. Cinco tablas heredadas conservadas con RLS y acceso anon/authenticated revocado.
- Prueba SQL transaccional PASS: perfil propio, equipo invisible para externos, alumno no puede elevarse a coach ni invitar, invitacion de un uso, acceso anonimo denegado. Tres usuarios de prueba y equipo/invitacion descartados con ROLLBACK.
- account.html/account.js/account.css integran SDK 2.116.0 local y clave PUBLICABLE (no clave secreta), registro, acceso, recuperacion de contrasena, nombre, equipo e invitacion.
- Se agrego http://localhost:4173/account.html a Redirect URLs en Supabase; Site URL anterior localhost:3000 no se modifico. Cambiar direcciones cuando se publique.
- Perfil de la app enlaza a Cuenta y equipo. SW v11; copia previa index/SW en temp dulus-before-account-FITP8E.
- IMPORTANTE: rutinas, medidas, fotos y comunidad siguen LOCALES. Cuentas/equipos online no son aun sincronizacion del entrenamiento ni autorizacion completa de la app local. No publicar como producto multiusuario terminado.
- Pendiente inmediato: usuario crea su primera cuenta y confirma correo. Luego probar acceso real y completar sincronizacion de rutinas/alumnos con aislamiento por equipo.
- Plan Free, sin pago, sin cambio de rama, sin merge ni commit/push.

- QA final: 320/390/1280 sin desborde, registro/confirmacion y error de acceso simulados sin enviar correos, API Auth real accesible, consulta anonima a dulus_accounts denegada. Mensaje de credenciales traducido tambien para respuesta legacy. Sin errores JS. Revisión visual de account.html y navegacion Perfil-cuenta completadas. Primera cuenta real y sincronizacion siguen pendientes.


### 2026-09-11 - Espacio de entrenamiento online preparado, NO activado
- Usuario confirmo que entro a su cuenta y creo "dulus gym track"; visto en account.html con rol coach. Correo confirmado previamente; error al confirmar desde telefono se debia a localhost.
- Usuario confirmo que los alumnos existentes son PRUEBAS. No importar ni borrar los registros locales al conectar equipo.
- Guardados team.html, team.css, team.js y supabase/migrations/2026091102_training.sql. La pantalla prepara alumnos por invitacion/cuenta, objetivos, catalogo, crear rutina y registrar sesion contra nuevas tablas protegidas.
- La migracion NO SE APLICO: revision automatica rechazo Run porque requiere aprobacion explicita para dulus_students, dulus_plans, dulus_sessions, sus permisos y funciones. No se reintento por otro medio.
- No hay enlace habilitado desde Cuenta al nuevo espacio mientras falta aplicar/probar la migracion. Cuentas y equipo anterior se conservan operativos.
- Siguiente: obtener aprobacion de ese alcance, aplicar 2026091102, ejecutar pruebas RLS entre coach/alumnos/externos, habilitar enlace desde account.js y actualizar textos/cache. Luego resolver correo para alumnos y publicacion gratuita para acceder desde telefonos. Medidas/fotos y comunidad online siguen pendientes.


### 2026-09-11 - Cierre autorizado por el usuario
- Usuario autorizo aplicar alumnos/rutinas/sesiones y pidio parar despues por hoy.
- APLICADA en DATOSGYM la migracion supabase/migrations/2026091102_training.sql. Supabase confirmo Success. No rows returned.
- Creadas dulus_students, dulus_plans, dulus_sessions y funciones dulus_open_student/dulus_record_session. RLS y permisos por coach/alumno; sin acceso anonimo.
- Prueba transaccional PASS: coach crea rutina y edita objetivos; alumno ve su rutina y registra sesion, no crea rutinas ni modifica objetivos; externo no lee ni escribe ni se vincula sin invitacion; anon no lee; se rechazan ejercicios ajenos y fechas futuras; sesiones por fecha y ejercicios duplicados no duplican datos.
- ROLLBACK de todas las fixtures: conteos reales finales students=0, plans=0, sessions=0. Cuenta/equipo real conservados. No se importaron ni borraron las pruebas locales.
- team.html/team.js/team.css estan preparados y su flujo de pantalla paso QA con respuestas simuladas en 320/390/1280. Todavia NO hay enlace desde account.js ni cache actualizada para team; esto queda para la proxima sesion, respetando la parada solicitada.
- Proximo paso exacto: habilitar Abrir equipo en account.js, actualizar textos de alcance y cache, validar flujo real con cuenta coach y alumno. Configurar correo gratuito para alumnos y despliegue accesible desde telefonos mas adelante. Medidas/fotos/comunidad online pendientes.
- Cierre: rama feature/workout-tracking. Todo guardado en disco; SIN commit ni push y SIN merge. Plan Free sin cargos. No hay trabajo programado para continuar solo.


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

## 2026-09-14 — Envío real de video confirmado por alumno
- Al retomar se revisaron DULUS_CONTINUIDAD.md, PROJECT_STATE.md, WORKLOG.md y Git antes de editar; rama feature/workout-tracking conservada.
- Servidor local activo en http://localhost:4173 y team.html responde 200.
- Usuario reintentó el MP4 real de ~2.2 MB desde la cuenta del alumno y la interfaz mostró «Video enviado a tu coach».
- Esa confirmación solo aparece después de que terminan correctamente la subida al bucket privado y la inserción del mensaje con video_path; por tanto el envío desde alumno quedó confirmado.
- Pendiente inmediato: verificar visualmente que el coach puede verlo/abrirlo desde actividad del equipo; después continuar con publicación gratuita para teléfonos y videoguías licenciadas.

## 2026-09-14 — Perfiles separados para probar coach/alumno
- Se detectó que account.js y team.js usan la misma storageKey de Supabase (`dulus-account-v1`). Dos pestañas normales del mismo navegador comparten la misma sesión: iniciar como alumno puede reemplazar la sesión del coach y hacer desaparecer su vista del equipo.
- Para evitar confusión en pruebas reales, se crearon dos accesos persistentes en el Escritorio: `ABRIR_DULUS_COACH.cmd` y `ABRIR_DULUS_ALUMNO.cmd`.
- Cada acceso abre Chrome con un `--user-data-dir` distinto, por lo que coach y alumno pueden permanecer conectados simultáneamente sin pisarse la sesión.
- No se modificó código de la app ni datos de Supabase en este paso.

## 2026-09-14 — Centro de Avisos del coach
- Se añadió una bandeja global al inicio de la vista del coach, sin tener que abrir alumno por alumno.
- La bandeja agrupa videos para revisión, comentarios nuevos y sesiones con dolor reportado.
- Los avisos se pueden filtrar por alumno y muestran contador de pendientes.
- Cada aviso permite ver al alumno; los videos incluyen acceso privado desde la propia bandeja.
- Se añadió estado local de "Revisado" por coach/equipo para evitar que los avisos ya atendidos sigan contando como pendientes.
- Prueba real con el equipo actual: la bandeja detectó 5 avisos de `prueba 2` (3 videos, 1 comentario y 1 reporte de dolor 2/10).
- `team-bridge.js`, `team.js` y `service-worker.js` pasan `node --check`; caché PWA subida a `dulus-gym-track-v23`.
- Copias previas a este cambio guardadas fuera del repositorio en `C:\Users\user\Desktop\DulusPatchBackups\20260914`.

## 2026-09-14 — Centro de Avisos del coach mejorado
- Centro de Avisos probado con datos reales de `prueba 2`; el primer video privado abrió correctamente.
- Los avisos revisados se conservan en el perfil local del coach y ya no aparecen entre pendientes al recargar.
- Se añadió `Mostrar revisados` para consultar avisos antiguos sin ensuciar la bandeja principal.
- La pantalla inicial `Cuenta y equipos` ahora muestra `🔔 N avisos pendientes` para equipos donde el usuario es coach.
- Con pendientes, el acceso cambia a `Abrir Centro de Avisos` y dirige al equipo correspondiente.
- Prueba real: pantalla inicial muestra 4 avisos pendientes después de revisar el primer video.
- Cache PWA actualizado a `dulus-gym-track-v25`; sintaxis de `account.js`, `team-bridge.js` y service worker validada.
- Estos cambios fueron realizados directamente con Remote Desktop Commander; OmniRoute no se utilizó para editar esta parte.

## 2026-09-14 — Progreso real por ejercicio y grupo muscular
- Se reemplazó la vista de progreso que dependía exclusivamente de haber registrado peso.
- Ahora cualquier ejercicio completado genera un registro visible de progreso aunque el peso esté vacío.
- Por ejercicio se muestran cantidad de registros completados y, cuando existen, último peso, mejor peso registrado y barras de los últimos 8 registros.
- Se añadió Actividad por grupo muscular usando targetMuscles/bodyParts y fallback a primaryMuscle del catálogo normalizado.
- La interfaz aclara expresamente que estas exposiciones registradas no estiman crecimiento muscular.
- Prueba real con `prueba 2`: 4 ejercicios completados; Pecho 2 exposiciones, Hombros 1 y Tríceps 1.
- Cache PWA actualizado a `dulus-gym-track-v26` y JavaScript validado con `node --check`.

## 2026-09-14 — Sugerencias de rutina editables
- El creador de rutinas del coach incorpora ahora una sección `Sugerencia automática` sin eliminar la creación manual ni la reutilización de rutinas existentes.
- La sugerencia usa nivel (Principiante/Intermedio/Avanzado), objetivo y equipo disponible.
- La estructura depende de los días elegidos: 1–3 días full body, 4 días torso/pierna y 5–6 días combinaciones torso/pierna / push-pull-legs cuando procede.
- Los ejercicios sugeridos salen del catálogo real y siguen siendo totalmente editables antes de guardar; la carga inicial queda en 0 kg para que el coach la ajuste.
- Se priorizaron movimientos básicos del catálogo sobre variantes exóticas.
- Pruebas sin guardar datos: 3 días principiante generó 6 ejercicios básicos por día; 4 días intermedio generó 6 ejercicios por día con estructura torso/pierna.
- Cache PWA actualizado a `dulus-gym-track-v27`; sintaxis validada con `node --check`.

## 2026-09-14 — Centro de Progreso muscular + e1RM
- Reemplazada la vista simple de cargas por un Centro de Progreso para coach y alumno.
- e1RM estimado con peso, repeticiones y RIR; no obliga a probar un máximo real.
- Índice muscular normalizado: 100 = referencia inicial de cada ejercicio; permite combinar ejercicios sin sumar kilos incompatibles.
- Curva de progreso por grupo muscular con selector de alumno para coach.
- Resumen de índice general, músculos subiendo, músculos con datos y PR silenciosos.
- PR silencioso: detecta mejora de e1RM con el mismo peso gracias a más repeticiones/RIR.
- Lectura rápida: mejor avance, mesetas y alerta cuando baja rendimiento junto a fatiga alta registrada.
- Detalle por ejercicio queda colapsado como segundo nivel, no es necesario para leer la tendencia general.
- Probado con datos reales sin cargas (no inventa e1RM) y datos sintéticos con mejora y caída/fatiga.

## 2026-09-14 — Supervisión inteligente y modo autónomo (en preparación)
- Nuevo `coach-action-center.js`: prioriza alumnos por señales explicables; no modifica rutinas automáticamente.
- Señales: dolor, fatiga + caída de fuerza, adherencia 14 días, inactividad, meseta, videos/comentarios pendientes y falta de datos de fuerza.
- Nuevo “cuello de botella probable”: Recuperación, Constancia, Registro de datos, Progresión/Técnica, Sin datos o Sin bloqueo claro. La prioridad de recuperación domina cuando hay dolor/fatiga alta.
- Cada alumno muestra evidencia, siguiente paso, acceso directo al alumno/progreso y consejo sugerido copiable. Pruebas reales y sintéticas PASS.
- `progress-analytics.js` expone el mismo motor e1RM/músculos al Centro de Acción para evitar métricas contradictorias.
- Modo personal preparado en UI: crear rutina propia, registrar sesión, feedback y progreso; sin chat/cámara de coach. Las rutinas conservan `created_by` para distinguir origen.
- Migración `2026091401_solo_student.sql` preparada pero NO aplicada todavía. El acceso “Entrenar por mi cuenta” permanece oculto hasta que `dulus_solo_available()` exista en Supabase.

## 2026-09-14 — Supervisión inteligente y consejos coach → alumno
- Supabase CLI autorizado y proyecto DATOSGYM enlazado; historial de migraciones antiguas sincronizado sin reejecutarlas.
- Migración 2026091401 aplicada: perfil autónomo conservable al vincular coach.
- Centro de Acción distingue Recuperación, Constancia, Ejecución por músculo, Registro de datos y Progresión/Técnica.
- Añadido cumplimiento de series planificadas por músculo en 14 días y confianza de lectura Inicial/Media/Alta.
- Migraciones 2026091402 y 2026091403: consejos privados coach→alumno, leído por alumno y retiro por coach.
- Prueba real reversible: consejo QA enviado desde UI y retirado; no quedó en historial.

## 2026-09-14 — Medidas online + relación estatura/peso
- Medidas corporales online activadas en Supabase: peso y 15 perímetros opcionales, historial, borrado con confirmación y realtime.
- Centro de Progreso muestra curvas reales de Peso, Cintura, Glúteos, Cadera y Pecho; no interpreta automáticamente subir/bajar como bueno o malo.
- Añadida estatura online al perfil y `body-assessment.js` con indicador semicircular tipo velocímetro: Muy bajo peso, Bajo peso, Rango saludable, Sobrepeso y Obesidad.
- No se usa “anorexia” como categoría: es un diagnóstico clínico, no un rango de peso.
- El indicador calcula IMC de referencia para adultos, rango de peso asociado a IMC 18.5–24.9 y relación cintura/estatura cuando hay cintura medida.
- Caso sintético 1.80 m / 95 kg / cintura 82 cm => IMC 29.3 (Sobrepeso) + cintura/estatura 0.46; Dulus advierte que el IMC puede sobreestimar grasa en personas musculosas.
- Centro de Acción recibe “Contexto corporal” sin convertir IMC alto en alerta automática.
- Para objetivos de pérdida de grasa, 3+ mediciones durante 21+ días y buena adherencia pueden detectar “Cintura sin cambio medible”; si la cintura baja, la alerta desaparece.
- Toda medición QA previa fue eliminada; no quedó dato corporal sintético en `prueba 2`.

## 2026-09-14 — Próximo dato útil para el alumno
- Nueva tarjeta de una sola prioridad: pide únicamente el dato/acción que más mejora el seguimiento en ese momento.
- Prioridades probadas: primera rutina, primera sesión, estatura, cintura según objetivo, peso/reps/RIR, peso corporal y estado “Seguimiento al día”.
- Si hubo dolor reciente relevante, la guía prioriza no aumentar carga automáticamente y comunicar la molestia.
- La intención es reducir formularios y trabajo del coach: el alumno sabe qué registrar sin recibir una lista de avisos.

## 2026-09-14 — Objetivos corporales avanzados
- Nuevo apartado opcional y colapsado para metas de peso, IMC y perímetros (cintura, glúteos, brazos, muslos, pecho, etc.).
- Cada meta muestra inicio → actual → objetivo, porcentaje del trayecto, fecha opcional y quién la definió (coach/alumno).
- Perfil corporal opcional: Hombre/Mujer/Prefiero no indicar + fecha de nacimiento. El IMC adulto no cambia por sexo; menores no usan la escala adulta.
- Dulus puede sugerir un primer hito de peso para pérdida de grasa: 5% del peso actual a ~6 meses, solo cuando el contexto corporal no contradice esa sugerencia.
- Si IMC alto y cintura/estatura <0.50, no propone pérdida de peso automática por posible masa muscular elevada.
- Metas de bíceps/glúteos no reciben un “máximo ideal” inventado; se fijan manualmente o con datos suficientes de tendencia.
- Coach ve meta activa en Centro de Acción; alumno ve resumen en Inicio. Meta vencida sin alcanzar genera señal de revisión, no cambio automático.
- Migraciones 2026091408 y 2026091409 aplicadas en Supabase. Cache PWA v37.

## 2026-09-14 — Resumen de avance según objetivo
- Nuevo `objective-summary.js` para coach y alumno.
- Lectura simple en cinco áreas: Constancia, Fuerza, Medidas, Recuperación y Calidad de datos.
- No usa una puntuación opaca; cada estado muestra la evidencia que lo genera.
- Si existe meta corporal activa, el resumen usa su progreso real. Si no, usa el objetivo general y tendencias disponibles.
- Prioridad automática explicable: recuperación, constancia, meta vencida, caída de fuerza o falta de datos.
- Coach puede seleccionar alumno; alumno ve su propio resumen. Cache PWA v38.

## 2026-09-14 — Fechas opcionales + metas de rendimiento
- Fecha de nacimiento sigue siendo opcional: si existe se calcula edad y se usa solo donde cambia la interpretación; sin fecha el seguimiento continúa.
- Un perfil menor de 18 años no recibe sugerencias automáticas adultas de peso/IMC.
- Fecha objetivo de metas corporales y de rendimiento es opcional; sin fecha no existe concepto de “meta vencida”.
- Nuevo módulo `performance-goals.js`: metas e1RM automáticas por ejercicio y pruebas manuales de salto vertical/horizontal, sprint 10/20/40 m, dominadas y plancha.
- e1RM reutiliza sesiones reales de Dulus; no se duplica entrada manual.
- Rendimiento se integra en Resumen según objetivo y Centro de Acción del Coach.
- Meta de rendimiento vencida solo genera señal de revisión de objetivo/plazo; nunca cambia rutina automáticamente.
- Supabase: migración `2026091410_performance_goals.sql`; caché PWA `dulus-gym-track-v39`.
