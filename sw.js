// Service Worker：讓網站可離線使用（快取行程／翻譯／搭車／背景照）
const CACHE = 'osaka-trip-v1';
const ASSETS = [
  './', './index.html', './translate.html', './guide.html',
  './manifest.webmanifest', './icon.svg',
  './images/day0.jpg', './images/day1.jpg', './images/day2.jpg',
  './images/day3.jpg', './images/day4.jpg', './images/day5.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 外部服務（翻譯 API、Google、字型等）不攔截，直接走網路
  if (url.origin !== location.origin) return;
  // 快取優先，找不到再上網；離線且未快取時退回首頁
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached =>
      cached || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
