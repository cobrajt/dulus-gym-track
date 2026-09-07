# Dulus Gym Track

PWA de seguimiento y entrenamiento para coaches y alumnos. Esta primera versión es una interfaz estática, responsive y utilizable sin backend.

## Ejecutar localmente

La PWA necesita un servidor HTTP (los *service workers* no funcionan desde `file://`). Con Node.js instalado, desde esta carpeta ejecuta:

```powershell
node server.js
```

Después abre `http://localhost:4173` en Chrome o Edge. Para probar la instalación, usa el icono de instalar de la barra del navegador. En móvil, abre la misma dirección desde un dispositivo en la red local servido por una herramienta equivalente.

## Tecnologías

- HTML5, CSS3 y JavaScript moderno, sin dependencias.
- Web App Manifest y Service Worker para instalación y funcionamiento básico sin conexión.
