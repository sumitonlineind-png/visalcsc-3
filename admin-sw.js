const C='v1-admin';
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['/admin','/style.css','/common.js','/admin.js','/icons.svg'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c2=r.clone();caches.open(C).then(c=>c.put(e.request,c2))}return r}).catch(()=>caches.match(e.request)))});
