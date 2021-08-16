const cacheName = "cache"

self.addEventListener("install", ev => {
  ev.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll([
        "/SchoolWork/TimeTable/error.html",

        "/SchoolWork/general.css",
        "/SchoolWork/TimeTable/style.css",

        "/SchoolWork/TimeTable/script.js",

        "https://fonts.googleapis.com/css2?family=Bitter:wght@700&family=Roboto+Slab:wght@400;700&display=swap",
      ]);
    })
  );
});

self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName)
          .map(key => caches.delete(key))
      )
    })
  );
});

// Right now this is here so that the user gets a prompt for install the pwa to
// their homescreen
self.addEventListener("fetch", ev => {
  ev.respondWith(
    caches.match(ev.request, {
      ignoreSearch: true
    }).then(resp => {
      return resp || (async () => {
        caches.open(cacheName).then(cache => cache.add(ev.request))
        return fetch(ev.request).catch(err => {
          return caches.open(cacheName).then(cache => cache.match("/SchoolWork/TimeTable/error.html"));
        });
      })();
    })
  );
});