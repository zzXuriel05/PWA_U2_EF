// main.js
// Registro del Service Worker y manejo de permiso de notificaciones

let swRegistration = null;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(reg => {
      swRegistration = reg;
      console.log('Service Worker registrado:', reg);
      // Verificar si hay actualizaciones
      reg.addEventListener('updatefound', () => {
        console.log('Nueva versión del SW disponible');
      });
    })
    .catch(err => console.error('Error al registrar el SW:', err));
}

// Botón (user gesture) para solicitar permiso y pedir mostrar notificación
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnNotificaciones');
  const btnPush = document.getElementById('btnPush');
  const btnInstall = document.getElementById('btnInstall');
  let deferredPrompt = null;

  // ============ ACTIVAR NOTIFICACIONES ============
  if (btn) {
    btn.addEventListener('click', async () => {
      // Pedir permiso solo con acción del usuario
      if (!('Notification' in window)) {
        alert('Tu navegador no soporta Notificaciones Web.');
        return;
      }

      // Si estado default, pedir permiso
      if (Notification.permission === 'default') {
        try {
          const permiso = await Notification.requestPermission();
          console.log('Permiso solicitado:', permiso);
          
          if (permiso !== 'granted') {
            alert('Permiso de notificaciones no concedido.');
            return;
          }
        } catch (err) {
          console.error('Error pidiendo permiso:', err);
          return;
        }
      }

      if (Notification.permission === 'granted') {
        alert('¡Notificaciones activadas correctamente!');
        btn.textContent = 'Notificaciones Activadas ✓';
        btn.disabled = true;
      } else if (Notification.permission === 'denied') {
        alert('Las notificaciones están bloqueadas. Verifica los permisos del navegador.');
      }
    });

    // Mostrar estado inicial de notificaciones
    if (Notification.permission === 'granted') {
      btn.textContent = 'Notificaciones Activadas ✓';
      btn.disabled = true;
    } else if (Notification.permission === 'denied') {
      btn.textContent = 'Notificaciones Bloqueadas ✗';
      btn.disabled = true;
    }
  }

  // ============ ENVIAR NOTIFICACIÓN PUSH ============
  if (btnPush) {
    btnPush.addEventListener('click', async () => {
      // Verificar que las notificaciones estén permitidas
      if (!('Notification' in window)) {
        alert('Tu navegador no soporta Notificaciones Web.');
        return;
      }

      if (Notification.permission !== 'granted') {
        alert('Por favor, primero activa las notificaciones.');
        return;
      }

      // Esperar a que el SW esté listo
      if (!navigator.serviceWorker.controller) {
        try {
          await navigator.serviceWorker.ready;
        } catch (err) {
          console.error('Error esperando Service Worker:', err);
          alert('Error: Service Worker no disponible');
          return;
        }
      }

      // Enviar mensaje al SW para mostrar la notificación
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'MOSTRAR_NOTIFICACION',
          title: '¡Hola desde Sir Chloe!',
          options: {
            body: 'Explora toda la música de Sir Chloe y disfruta del mejor rock indie.',
            icon: './img/logo.png',
            badge: './icons/icon-192.png',
            tag: 'sir-chloe-notification',
            requireInteraction: false,
            actions: [
              {
                action: 'open',
                title: 'Abrir sitio'
              },
              {
                action: 'close',
                title: 'Cerrar'
              }
            ]
          }
        });
        console.log('Notificación enviada');
      } else if (swRegistration) {
        // Fallback: usar la registration si no hay controller
        swRegistration.showNotification('¡Hola desde Sir Chloe!', {
          body: 'Explora toda la música de Sir Chloe y disfruta del mejor rock indie.',
          icon: './img/logo.png',
          badge: './icons/icon-192.png',
          tag: 'sir-chloe-notification',
          requireInteraction: false
        });
        console.log('Notificación enviada (fallback)');
      } else {
        alert('Error: No se puede enviar la notificación');
      }
    });
  }

  // ============ INSTALACIÓN PWA ============
  if (btnInstall) {
    btnInstall.style.display = 'none';

    // Escuchar el evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('beforeinstallprompt disparado');
      btnInstall.style.display = 'inline-block';
    });

    // Click en el botón de instalar
    btnInstall.addEventListener('click', async () => {
      if (!deferredPrompt) {
        console.warn('deferredPrompt no está disponible');
        alert('La instalación no está disponible en este momento.');
        return;
      }
      
      try {
        const p = deferredPrompt;
        deferredPrompt = null;
        const { outcome } = await p.prompt();
        console.log(`Usuario respondió: ${outcome}`);
        
        if (outcome !== 'accepted') {
          deferredPrompt = p; // Restaurar si no acepta
          console.log('Instalación rechazada, botón seguirá visible');
        } else {
          btnInstall.style.display = 'none';
          console.log('Aplicación instalada correctamente');
        }
      } catch (err) {
        console.error('Error durante la instalación:', err);
        btnInstall.style.display = 'inline-block';
      }
    });

    // Evento cuando la app se instala
    window.addEventListener('appinstalled', () => {
      console.log('App instalada exitosamente');
      btnInstall.style.display = 'none';
      deferredPrompt = null;
    });
  }

  // Escuchar cambios en la conexión
  window.addEventListener('online', () => {
    console.log('Conexión restaurada');
  });

  window.addEventListener('offline', () => {
    console.log('Sin conexión - usando caché');
  });
});
