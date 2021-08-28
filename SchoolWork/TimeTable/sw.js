const cache = "cache";

const toCache = ["SchoolWork", "gstatic", "fonts.googleapis"];

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    addToCache([
      "/SchoolWork/TimeTable/error.html",
      "/SchoolWork/TimeTable/redirect.html",

      "/SchoolWork/general.css",
      "/SchoolWork/TimeTable/style.css",

      "/SchoolWork/TimeTable/script.js",

      "/SchoolWork/bg768.webp",
      "/SchoolWork/bg1080.webp",
    ])
  );
});

self.addEventListener("fetch", (ev) => {
  if (
    ev.request.method == "GET" &&
    toCache.some((elem) => ev.request.url.includes(elem))
  ) {
    console.log(`${ev.request.method} Request for ${ev.request.url}`);
    ev.respondWith(
      get(ev.request).then((stuff) =>
        stuff
          ? stuff
          : getFromCache("/SchoolWork/TimeTable/error.html").then(
              (error) => error
            )
      )
    );

    ev.waitUntil(
      openCache(cache, async (cache) => {
        cache.put(ev.request.url, await fetch(ev.request));
      })
    );
  }
});

function openCache(cache, callback) {
  return caches.open(cache).then(callback);
}

function addToCache(things) {
  openCache(cache, (cache) => {
    if (typeof things == "object") cache.addAll(things);
    else cache.add(things);
  });
}

async function getFromCache(toGet) {
  return await caches.match(toGet);
}

async function get(toGet) {
  return (await getFromCache(toGet)) || (await fetch(toGet));
}
