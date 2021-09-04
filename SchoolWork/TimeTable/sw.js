const cacheName = "cache";

const toCache = ["SchoolWork", "gstatic", "fonts.googleapis"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    addToCache([
      "/SchoolWork/TimeTable/error.html",
      "/SchoolWork/TimeTable/redirect.html",

      "/SchoolWork/general.css",
      "/SchoolWork/TimeTable/style.css",

      "/SchoolWork/TimeTable/script.js",

      "/SchoolWork/bg768.webp",

      "https://fonts.googleapis.com/css2?family=Bitter:wght@700&family=Roboto+Slab:wght@400;700&display=swap",
    ])
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) =>
        cache
          .matchAll()
          .then((matches) =>
            matches.forEach(
              async (match) =>
                match.url.includes("?") &&
                match.url.includes("/SchoolWork/TimeTable/") &&
                (await cache.delete(match.url))
            )
          )
      )
  );
});

self.addEventListener("fetch", (e) => {
  if (
    e.request.method == "GET" &&
    toCache.some((elem) => e.request.url.includes(elem))
  )
    e.respondWith(get(e.request));
});

function addToCache(things) {
  caches.open(cacheName).then(async (cache) => {
    if (things instanceof Array) await cache.addAll(things);
    else await cache.add(things);
  });
}

async function fromCache(toGet, options) {
  return await caches.match(toGet, options);
}

async function fallbackFile(url) {
  return (
    (await fromCache(url)) ||
    (await fromCache("/SchoolWork/TimeTable/error.html"))
  );
}

async function get(toGet) {
  return caches.open(cacheName).then(async (cache) => {
    return cache.add(toGet.url).then(() =>
      fromCache(toGet.url, {
        ignoreSearch: true,
      })
    );
  });
}
