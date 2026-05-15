// Blank service worker; next-pwa will generate the real one during build, 
// but having the file prevents immediate 404s in some dev setups.
self.addEventListener('install', () => {
  self.skipWaiting();
});
