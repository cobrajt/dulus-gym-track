# Dulus Gym Track — requisitos de producto
Actualizado: 11 de septiembre de 2026.
Fuente oficial: cobrajt/dulus-gym-track. Rama: feature/workout-tracking.
Trabajo directo: C:\Users\user\Desktop\DulusGymWork, PC DESKTOP-BKJFJHN mediante Remote Desktop Commander.

## Acuerdos confirmados por el usuario
- App para coaches y sus alumnos, preparada para varios coaches y cuentas de alumnos.
- Tipografía con personalidad caligráfica; títulos expresivos y lectura cómoda en datos, formularios e instrucciones.
- Un mensaje motivacional diario y un verso bíblico diario, visibles y desactivables de forma independiente desde Ajustes.
- Comunidad de motivación: reconocer constancia, explicar por qué destaca cada alumno y abrir su perfil de progreso.
- Mostrar quién necesita retomar con lenguaje de acompañamiento, sin competir por cuerpos ni humillar al menos activo.
- Biblioteca completa Free Exercise DB, con ejercicios con/sin pesas, filtros, instrucciones e imágenes locales.
- Objetivos múltiples, objetivo principal y objetivos propios; permitir editarlos.
- Entreno interactivo: crear, abrir y asignar rutinas; consultar técnica y registrar sesiones.
- Fondos diferentes por apartado, con profundidad y patrones, conservando legibilidad.
- Icono PWA: Dulus dominicus de perfil con ojo rojo muy visible.

## Implementado en la versión local
- Courgette en títulos y Manrope para lectura, fuentes locales con licencias OFL.
- Fondos diferenciados por sección; nuevo icono PNG 192 y 512.
- Tarjeta diaria destacada y dos interruptores persistentes; migración de la preferencia combinada anterior.
- 883 fichas: 876 del catálogo oficial, incluyendo 29 vinculadas a IDs existentes, más 7 fichas propias. 1.746 imágenes oficiales descargadas.
- Paginación de 24 fichas y filtros. Las nuevas instrucciones/nombres del catálogo conservan el inglés original y se indica en la ficha.
- 3 entradas oficiales carecen de imágenes y 7 fichas propias siguen con guía visual pendiente.
- Rutinas reales y botones de acción reemplazan las tarjetas de ejemplo sin interacción.
- Comunidad local con motivos del índice (70% asistencia, 30% ejercicios), comparación de sesiones con el período anterior y perfil sin medidas/fotos.
- Creación y edición de objetivos múltiples y personalizados.
- Modo sin conexión: catálogo y app disponibles; imágenes nuevas se almacenan al consultarlas. No se precargan las 1.746 imágenes en cada teléfono.

## Pendiente para uso real entre personas
- El usuario confirmó que NO hay cuentas ni base de datos conectadas. Actualmente los datos son locales en IndexedDB.
- Conectar autenticación y base compartida (Supabase se había propuesto), organizaciones/coaches, alumnos y permisos en servidor.
- La vista de comunidad local NO equivale a un perfil público publicado ni a aislamiento de datos mediante roles.
- Definir participación y visibilidad de comunidad entre organizaciones; medidas y fotos privadas requieren permisos explícitos.
- Traducir/revisar el catálogo original al español y completar demostraciones faltantes.
- Prueba integral multiusuario y despliegue solo cuando se solicite. No cambiar de rama ni fusionar main.

## Conversaciones recuperadas
- «Continuar app Dulus Gym Track»: confirmó icono, tipografías, fondos, inspiración y fuente Free Exercise DB.
- «Continuar app ideas nuevas»: confirmó arquitectura multi-coach; Supabase/Auth/RLS estaba propuesto, no implementado.
- Las instrucciones actuales prevalecen sobre indicaciones históricas de integrar main.


## Presupuesto confirmado por el usuario
- Comenzar exclusivamente con servicios gratuitos, con objetivo de coste recurrente $0.
- Evaluar mejoras de pago poco a poco solo cuando la app genere ingresos y el usuario las autorice expresamente.
- No activar planes de pago, pruebas con cobro posterior ni complementos facturables sin autorizacion.
- Supabase: comenzar con plan Free; verificar limites vigentes antes de conectar o desplegar.


## Avance de cuentas - 2026-09-11
Registro/acceso y equipos con Supabase preparados en account.html; tablas y RLS aplicados. Primera cuenta real pendiente. Entrenamientos, alumnos y comunidad aun locales; sincronizacion y pruebas integrales pendientes.


## Cierre de sincronizacion - 2026-09-11
Tablas de alumnos/rutinas/sesiones aplicadas y permisos SQL verificados. Datos de prueba no importados. Pantalla team preparada; enlace desde cuenta y pruebas integrales reales pendientes para proxima sesion. Usuario solicito parar por hoy.

## Requisitos incorporados 2026-09-12 — referencia PulseFit
El usuario solicita interfaz limpia, clara/oscura, tarjetas, gráficas y pantallas móviles, manteniendo Dulus.
Alumno: videoguía en bucle con notas, ejecución despejada, botón grande de completar serie, descansos del coach editables, carga/repeticiones y RPE/RIR, grabación de técnica privada.
Coach: feed de actividad, cambios de carga y dolor, mejores marcas basadas en registros, rutina semanal con arrastre/plantillas, cumplimiento/progreso.
Conexión: comentarios por ejercicio y feedback al finalizar (esfuerzo 1-10, fatiga y dolor).
Estado de implementación y límites vigentes: consultar el último bloque de PROJECT_STATE.md. La referencia es visual, no se compró/copió el UI kit. Servicios gratuitos.

## 2026-09-13 — Apuntes del usuario consolidados (prioridades, no funciones terminadas)
Objetivo: primera etapa gratuita, al menos un mes de pruebas y mejora antes de evaluar cobros; comunicar cualquier cambio futuro de precio con anticipación. Nada de pagos/publicidad activados hoy.

### Ya disponible o parcialmente resuelto
- Identidad: ave Dulus dominicus con ojo rojo en iconos actuales. Mantenerla; no sustituirla sin necesidad por una marca genérica de gimnasio.
- Catálogo: 883 fichas con/sin pesas y variantes; no prometer todos los ejercicios existentes ni 883 videos. Pendientes traducción, guías faltantes y videos con licencia comprobada.
- Progreso: cumplimiento y cargas por ejercicio en el equipo ya existen. Falta una vista completa por grupo muscular y evolución más detallada por ejercicio. Medir volumen/series/carga de forma explícita, sin presentar esos números como crecimiento muscular medido.
- Coach/alumno: cuentas, equipos, rutinas por día, registros y comentarios por ejercicio ya conectados. Videos privados en prueba real; la subida tuvo un bloqueo de permisos corregido el 13/09.
- Comunidad: versión local no equivale a perfiles compartidos en línea. Seguridad/RLS probadas en casos concretos; auditoría integral previa al lanzamiento pendiente. No prometer que sea imposible hackear la app.

### Prioridad de producto después de estabilizar videos y publicar acceso móvil
1. Gráficas por ejercicio y grupo muscular, métricas explicadas y sin datos inventados.
2. Rutinas recomendadas para principiantes según días disponibles (full body, torso/pierna, PPL cuando proceda), experiencia, equipo y objetivos. Permitir ajustes; no asignar PPL a todos automáticamente.
3. Alumno autónomo con historial propio independiente del coach. Vincular luego mediante invitación/código de un solo uso y consentimiento, sin perder registros.
4. Compartir/vincular alumno con otro coach y mostrar historial autorizado. Separar compartir, transferir y revocar acceso; participación voluntaria del alumno, permisos de lectura/edición explícitos. Videos ya caducados no podrán recuperarse ni transferirse.
5. Comunidad en línea de apoyo: otros alumnos ven solo actividad autorizada, nunca pueden editarla. Chat grupal moderado visible para el coach del equipo, separado de dudas privadas o reportes de dolor.
6. Idiomas: comenzar español completo, preparar estructura de traducciones y decidir segundo idioma. No confundir traducir interfaz con revisar técnica de cada ejercicio.
7. Nutrición y suplementación: contenido educativo revisado y con fuentes; no prescripciones personalizadas ni dosis automáticas sin contexto profesional.

### Lanzamiento y negocio, después de validar la app
- Pruebas integrales de acceso, roles, privacidad, recuperación de cuenta, carga/caducidad de videos, sesiones, móviles, modos y seguridad antes de usuarios reales.
- Guías y anuncios TikTok: cómo instalar, usar sin coach, conectar coach y registrar una sesión. Mostrar únicamente funciones verificadas; recopilar sugerencias. No publicar desde herramientas sin autorización explícita.
- Plan de marketing y propuesta de valor pendiente; probar con grupo pequeño y usar su feedback antes de escalar.
- Donaciones opcionales PayPal u otro medio: evaluar después de definir cuenta receptora/condiciones. No inventar enlaces ni conectar cobros hoy.
- Premium y precio: decisión futura basada en costos, valor y pruebas, no fijar precio ahora. Recomendar conservar entrenamiento básico e historial gratis; evaluar herramientas avanzadas de coach. No introducir publicidad solo para vender su eliminación ni usar datos de salud para segmentación.
- El usuario ofrece libertad para priorizar y descartar duplicados. Estas notas son una hoja de ruta, no autorización para publicar anuncios, compartir historiales privados, contratar servicios o activar cobros.
