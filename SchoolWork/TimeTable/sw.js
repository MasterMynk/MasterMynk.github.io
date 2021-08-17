const cache = "cache";
const notToCache = [
    "googletagmanager",
    "google-analytics"
]

self.addEventListener("install", ev => {
    ev.waitUntil(addToCache([
        "/SchoolWork/TimeTable/error.html",
        "/SchoolWork/TimeTable/redirect.html",

        "/SchoolWork/general.css",
        "/SchoolWork/TimeTable/style.css",

        "/SchoolWork/TimeTable/script.js",

        "/SchoolWork/bg768.webp",
        "/SchoolWork/bg1080.webp",
    ]));
});

self.addEventListener("fetch", ev => {
    if (notToCache.filter(elem => !ev.request.url.includes(elem)).length >= 2) {
        console.log(`checking in cache for ${ev.request.url}`);
        ev.respondWith(get(ev.request)
            .then(stuff => stuff ? stuff :
                getFromCache("/SchoolWork/TimeTable/error.html")
                .then(error => error)));
    }
});

function openCache(cache, callback) {
    return caches.open(cache)
        .then(callback);
}

function addToCache(things) {
    openCache(cache, cache => {
        if (typeof things == "object")
            cache.addAll(things);
        else
            cache.add(things);
    })
}

async function getFromCache(toGet) {
    return await caches.match(toGet)
}

async function get(toGet) {
    return await getFromCache(toGet) || await fetch(toGet);
}