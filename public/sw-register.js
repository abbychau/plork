// Service Worker Registration Script

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Update on reload
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
        });
      })
      .catch(function(error) {
        console.error('Service Worker registration failed:', error);
      });
  });
} else {
  console.warn('Service Worker not supported in this browser');
}
