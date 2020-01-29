self.addEventListener('fetch', function(event) {

  if (event.request.url.includes('?test')){
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
} 
}
});
