(() => {
'use strict';
if (!('serviceWorker' in navigator)) return;
window.addEventListener('load', () => {
  navigator.serviceWorker.register('./service-worker.js').catch(error => console.warn('No se pudo activar el modo sin conexión.', error));
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (document.querySelector('#app-update')) return;
    const notice = document.createElement('button');
    notice.id = 'app-update';
    notice.className = 'action-button';
    notice.textContent = 'Nueva versión lista · Actualizar';
    notice.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:100';
    notice.onclick = () => location.reload();
    document.body.append(notice);
  });
});
})();
