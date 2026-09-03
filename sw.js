// Service Worker：讓網站可離線使用（行程/交通/餐廳/背景照全快取）
// 關鍵資訊都寫在各 HTML 內，離線也不會整頁失效
// v4：HTML 改「網路優先」，有網路一定拿最新版；圖片等靜態檔維持快取優先
const CACHE = 'osaka-trip-v4';
const ASSETS = [
  './', './index.html',
  './day1.html', './day2.html', './day3.html',
  './day4.html', './day5.html', './day6.html',
  './transport.html', './food.html',
  './assets/style.css', './assets/app.js',
  './manifest.webmanifest', './icon.svg',
  './images/day0.jpg', './images/day1.jpg', './images/day2.jpg',
  './images/day3.jpg', './images/day4.jpg', './images/day5.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 判斷是否為「頁面／樣式／程式」這類會更新內容的檔案（HTML、CSS、JS、manifest）
function isContent(url) {
  return /\.(html|css|js|webmanifest)$/.test(url.pathname) ||
         url.pathname.endsWith('/'); // 目錄（./）視同 index.html
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // 外部連結（Google Maps、來源網站）不攔截，直接走網路
  if (url.origin !== location.origin) return;

  // 導覽或內容檔（HTML/CSS/JS）→ 網路優先：有網路一定拿最新版，離線才退回快取
  if (e.request.mode === 'navigate' || isContent(url)) {
    e.respondWith(
      fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() =>
        caches.match(e.request, { ignoreSearch: true })
          .then(cached => cached || caches.match('./index.html'))
      )
    );
    return;
  }

  // 其餘（圖片等靜態檔）→ 快取優先，省流量
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached =>
      cached || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      })
    )
  );
});
