"use strict";
var precacheConfig = [['img.jpg','asdsadasdasd']]
  , cacheName = "sw-precache-v3-instore.travel-" + (self.registration ? self.registration.scope : "")
  , ignoreUrlParametersMatching = [/^utm_/]
  , addDirectoryIndex = function(e, a) {
    var c = new URL(e);
    return "/" === c.pathname.slice(-1) && (c.pathname += a),
    c.toString()
}
  , cleanResponse = function(e) {
    return e.redirected ? ("body"in e ? Promise.resolve(e.body) : e.blob()).then(function(a) {
        return new Response(a,{
            headers: e.headers,
            status: e.status,
            statusText: e.statusText
        })
    }) : Promise.resolve(e)
}
  , createCacheKey = function(e, a, c, s) {
    var d = new URL(e);
    return s && d.pathname.match(s) || (d.search += (d.search ? "&" : "") + encodeURIComponent(a) + "=" + encodeURIComponent(c)),
    d.toString()
}
  , isPathWhitelisted = function(e, a) {
    if (0 === e.length)
        return !0;
    var c = new URL(a).pathname;
    return e.some(function(e) {
        return c.match(e)
    })
}
  , stripIgnoredUrlParameters = function(e, a) {
    var c = new URL(e);
    return c.hash = "",
    c.search = c.search.slice(1).split("&").map(function(e) {
        return e.split("=")
    }).filter(function(e) {
        return a.every(function(a) {
            return !a.test(e[0])
        })
    }).map(function(e) {
        return e.join("=")
    }).join("&"),
    c.toString()
}
  , hashParamName = "_sw-precache"
  , urlsToCacheKeys = new Map(precacheConfig.map(function(e) {
    var a = e[0]
      , c = e[1]
      , s = new URL(a,self.location)
      , d = createCacheKey(s, hashParamName, c, /\.\w{8}\./);
    return [s.toString(), d]
}));
function setOfCachedUrls(e) {
    return e.keys().then(function(e) {
        return e.map(function(e) {
            return e.url
        })
    }).then(function(e) {
        return new Set(e)
    })
}
self.addEventListener("install", function(e) {
    e.waitUntil(caches.open(cacheName).then(function(e) {
        return setOfCachedUrls(e).then(function(a) {
            return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(c) {
                if (!a.has(c)) {
                    var s = new Request(c,{
                        credentials: "same-origin"
                    });
                    return fetch(s).then(function(a) {
                        if (!a.ok)
                            throw new Error("Request for " + c + " returned a response with status " + a.status);
                        return cleanResponse(a).then(function(a) {
                            return e.put(c, a)
                        })
                    })
                }
            }))
        })
    }).then(function() {
        return self.skipWaiting()
    }))
}),
self.addEventListener("activate", function(e) {
    var a = new Set(urlsToCacheKeys.values());
    e.waitUntil(caches.open(cacheName).then(function(e) {
        return e.keys().then(function(c) {
            return Promise.all(c.map(function(c) {
                if (!a.has(c.url))
                    return e.delete(c)
            }))
        })
    }).then(function() {
        return self.clients.claim()
    }))
}),
self.addEventListener("fetch", function(e) {
    console.log(e.request);
    if ("GET" === e.request.method) {
        var a, c = stripIgnoredUrlParameters(e.request.url, ignoreUrlParametersMatching);
        (a = urlsToCacheKeys.has(c)) || (c = addDirectoryIndex(c, "index.html"),
        a = urlsToCacheKeys.has(c));
        !a && "navigate" === e.request.mode && isPathWhitelisted([], e.request.url) && (c = new URL("/resources/index.html",self.location).toString(),
        a = urlsToCacheKeys.has(c)),
        a && e.respondWith(caches.open(cacheName).then(function(e) {
            return e.match(urlsToCacheKeys.get(c)).then(function(e) {
                if (e)
                    return e;
                throw Error("The cached response that was expected is missing.")
            })
        }).catch(function(a) {
            return console.warn('Couldn\'t serve response for "%s" from cache: %O', e.request.url, a),
            fetch(e.request)
        }))
    }
});
