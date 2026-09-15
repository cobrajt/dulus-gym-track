importScripts('./exercise-image-assets.js');
const CACHE='dulus-gym-track-v41';
const ASSETS=['./progress-analytics.js','./coach-action-center.js','./goal-tracking-profile.js','./team-measurements.js','./body-assessment.js','./body-goals.js','./initial-assessment.js','./objective-summary.js','./performance-goals.js','./student-guidance.js','./team-bridge.js','./team-bridge.css','./team-training.js','./team-training.css','./team.html','./team.css','./team.js','./account.html','./account.css','./account.js','./assets/vendor/supabase-2.116.0.js','./','./index.html','./styles.css','./library.css','./workouts.css','./experience.css','./storage.js','./exercises.js','./exercise-media.js','./exercise-image-assets.js','./exercise-catalog-data.js','./catalog.js','./app.js','./library.js','./workouts.js','./community.js','./experience.js','./manifest.webmanifest','./icons/dulus-192.png','./icons/dulus-512.png','./assets/fonts/Courgette-Regular.ttf','./assets/fonts/Manrope[wght].ttf',...self.EXERCISE_IMAGE_ASSETS];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('dulus-gym-track-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 const image=event.request.destination==='image'||event.request.destination==='font';
 event.respondWith((async()=>{
 const cache=await caches.open(CACHE);const cached=await cache.match(event.request);
 if(image&&cached)return cached;
 try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}catch(error){if(cached)return cached;throw error;}
 })());
});
