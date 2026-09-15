# Dulus Gym Track — publicación

Estado: preparado para despliegue, **no publicado todavía**.

## Destino previsto
- GitHub Pages: `https://cobrajt.github.io/dulus-gym-track/`
- Cuenta / callback de autenticación: `https://cobrajt.github.io/dulus-gym-track/account.html`
- El workflow `.github/workflows/pages.yml` es manual (`workflow_dispatch`); no publica con cada push.

## Antes del primer despliegue
1. Mantener el respaldo estable de la rama de trabajo.
2. Terminar pruebas funcionales y el rediseño final decidido para el proyecto.
3. En GitHub Pages, seleccionar GitHub Actions como origen de publicación.
4. En Supabase Auth > URL Configuration:
   - Site URL: `https://cobrajt.github.io/dulus-gym-track/`
   - Redirect URL permitida: `https://cobrajt.github.io/dulus-gym-track/account.html`
   - Conservar también la URL local de desarrollo mientras siga siendo necesaria.
5. Ejecutar manualmente `Deploy Dulus to GitHub Pages`.

## Qué publica el workflow
- HTML, CSS, JavaScript y `manifest.webmanifest` de la app.
- `assets/` e `icons/`.
- Excluye `server.js`, `exercise-image-assets.js`, `supabase/`, migraciones SQL y documentación interna.

## Pruebas después de publicar
- Inicio, Cuenta y Equipo abren directamente por URL.
- Registro, login, recuperación de contraseña y confirmación de correo vuelven a `account.html`.
- Crear/revisar/revocar invitación y consentimiento del alumno.
- Vincular y desvincular coach–alumno sin perder historial.
- Crear/editar rutina, versionado y progresión de carga.
- Registrar sesión normal y sesión con alternativa sin gym.
- Video privado: subir, visualizar y retención.
- Instalar PWA en Android/desktop y volver a abrirla desde el icono.
- Con red offline, la carcasa de Inicio/Cuenta/Equipo carga; los datos online muestran un mensaje claro si no hay conexión.

## Rendimiento PWA verificado localmente
- Catálogo publicado: ~100 MB de recursos, principalmente imágenes que se cargan bajo demanda.
- Precache inicial `v67`: 49 recursos, ~2.36 MB.
- 0 imágenes del catálogo precargadas en la instalación.
