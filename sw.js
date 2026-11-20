/* 人格抽卡机 · Service Worker
   目标：第二次打开更快、断网也能抽；同时又不会把旧版本焊死。
   策略：
   - 导航请求：网络优先（保证拿到最新页面），失败回退缓存
   - 静态资源：先用缓存立刻渲染，同时后台拉新版本（stale-while-revalidate）
*/
var CACHE = "gacha-v4";
var ASSETS = [
  "./",
  "./index.html",
  "./assets/style.css",
  "./assets/app.js",
  "./assets/data.js",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/qr.png",
  "./assets/pay.png",
  "./og.png",
  "./manifest.webmanifest"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ASSETS);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put("./index.html", copy); });
        return res;
      }).catch(function () {
        return caches.match("./index.html");
      })
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req).then(function (hit) {
        var network = fetch(req).then(function (res) {
          if (res && res.status === 200) cache.put(req, res.clone());
          return res;
        }).catch(function () { return hit; });
        return hit || network;
      });
    })
  );
});
