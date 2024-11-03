import { Workbox, type WorkboxLifecycleEvent } from 'workbox-window';

export function register() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox(`${process.env.PUBLIC_URL}/service-worker.js`);

    wb.addEventListener('installed', (event: WorkboxLifecycleEvent) => {
      if (event.isUpdate) {
        const shouldUpdate = !sessionStorage.getItem('updatePrompted') && 
          window.confirm('New app update is available! Click OK to refresh.');
        
        if (shouldUpdate) {
          sessionStorage.setItem('updatePrompted', 'true');
          window.location.reload();
        }
      } else {
        sessionStorage.removeItem('updatePrompted');
      }
    });

    wb.addEventListener('activated', () => {
      sessionStorage.removeItem('updatePrompted');
    });

    wb.register().catch(error => {
      console.error('Service worker registration failed:', error);
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
} 