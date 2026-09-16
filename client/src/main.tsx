import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.js';
import { InstallLanding } from './components/InstallLanding.js';
import { setWorkerUrl } from 'maplibre-gl';
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

// Vite must bundle the v6 worker and its shared imports for production.
setWorkerUrl(mapWorkerUrl);

// Register Service Worker for PWA offline capabilities & ensure updates are applied immediately
if ('serviceWorker' in navigator && import.meta.env.PROD && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.update().catch(() => {});
    }).catch((err) => {
      console.log('[PWA] ServiceWorker registration failed: ', err);
    });

    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!reloading) {
        reloading = true;
        window.location.reload();
      }
    });
  });
}

const installPlatform = new URLSearchParams(location.search).get('install');
const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {!standalone && (installPlatform === 'ios' || installPlatform === 'android') ? <InstallLanding platform={installPlatform} /> : <App />}
  </StrictMode>,
);
