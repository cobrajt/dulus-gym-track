import fs from 'node:fs';
import path from 'node:path';
const root='C:/Users/user/Desktop/DulusGymWork';
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const write=(name,text)=>fs.writeFileSync(path.join(root,name),text,'utf8');
let library=read('library.js');
library=library.replace(/const exerciseCard = exercise => `[\s\S]*?<\/button>`;/,`const exerciseCard = exercise => \`<button class="exercise-card" type="button" data-exercise-id="\${exercise.id}">
  <span class="exercise-card-thumb" aria-hidden="true">\${exercise.media?.image ? \`<img src="\${exercise.media.image}" alt="" loading="lazy" />\` : \`<span>\${exercise.weighted ? '◈' : '○'}</span>\`}</span>
  <span class="exercise-card-copy"><strong>\${escapeExerciseText(exercise.name)}</strong><small>\${escapeExerciseText(exercise.primaryMuscle)} · \${escapeExerciseText(exercise.equipment)}</small></span>
  <span class="exercise-card-level \${exercise.level.toLowerCase()}">\${escapeExerciseText(exercise.level)}</span><span class="exercise-card-arrow" aria-hidden="true">›</span>
</button>\`;`);
const oldMedia=`  const media = exercise.media.image || exercise.media.video
    ? '<div class="exercise-media-ready">Contenido demostrativo disponible próximamente.</div>'
    : '<div class="exercise-media-placeholder"><span>▶</span><p>Espacio reservado para imagen o video demostrativo</p></div>';`;
const newMedia=`  const images = exercise.media?.images || (exercise.media?.image ? [exercise.media.image] : []);
  const media = images.length
    ? \`<section class="exercise-media-gallery" aria-label="Demostración visual">\${images.slice(0,2).map((src,index)=>\`<figure><img src="\${src}" alt="\${escapeExerciseText(exercise.name)} · \${index===0?'posición inicial':'posición final'}" loading="lazy" /><figcaption>\${index===0?'Posición inicial':'Posición final'}</figcaption></figure>\`).join('')}</section><p class="exercise-media-note">Referencia visual del movimiento. Sigue también las instrucciones y consejos de técnica de esta ficha.</p>\`
    : '<div class="exercise-media-placeholder"><span>▶</span><p>Guía visual pendiente. Usa las instrucciones paso a paso mientras añadimos una demostración fiable.</p></div>';`;
if(!library.includes(oldMedia))throw new Error('No se encontró el bloque media');
library=library.replace(oldMedia,newMedia);
write('library.js',library);
let css=read('library.css');
if(!css.includes('.exercise-card-thumb'))css+=`\n.exercise-card-thumb{display:grid;place-items:center;flex:none;width:48px;height:48px;overflow:hidden;border:1px solid #ffffff16;border-radius:13px;background:#102640;color:#8fc2ff}.exercise-card-thumb img{width:100%;height:100%;object-fit:contain;background:#f4f5f7}.exercise-card-thumb>span{font-size:1rem}.exercise-media-gallery{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.exercise-media-gallery figure{position:relative;overflow:hidden;margin:0;border:1px solid #ffffff1d;border-radius:17px;background:#f4f5f7}.exercise-media-gallery img{display:block;width:100%;aspect-ratio:4/3;object-fit:contain}.exercise-media-gallery figcaption{position:absolute;right:7px;bottom:7px;left:7px;padding:6px 8px;border-radius:9px;background:#071326d9;color:#e9f2ff;font-size:.59rem;font-weight:800;text-align:center}.exercise-media-note{margin:7px 3px 0;color:#8198b8;font-size:.62rem;line-height:1.4}@media(max-width:360px){.exercise-card-thumb{width:42px;height:42px}.exercise-media-gallery{gap:6px}}\n`;
write('library.css',css);
let index=read('index.html');
if(!index.includes('exercise-media.js'))index=index.replace('    <script src="exercises.js"></script>','    <script src="exercises.js"></script>\n    <script src="exercise-media.js"></script>');
write('index.html',index);
let server=read('server.js');
if(!server.includes("'.jpg'"))server=server.replace("  '.svg': 'image/svg+xml',","  '.svg': 'image/svg+xml',\n  '.jpg': 'image/jpeg',\n  '.jpeg': 'image/jpeg',\n  '.png': 'image/png',\n  '.webp': 'image/webp',");
write('server.js',server);
const imageAssets=fs.readdirSync(path.join(root,'assets','exercises')).filter(name=>name.endsWith('.jpg')).sort().map(name=>`./assets/exercises/${name}`);
write('exercise-image-assets.js',`self.EXERCISE_IMAGE_ASSETS=${JSON.stringify(imageAssets)};\n`);
let sw=read('service-worker.js').replace(/dulus-gym-track-v\d+/,'dulus-gym-track-v7');
if(!sw.startsWith('importScripts'))sw=`importScripts('./exercise-image-assets.js');\n`+sw;
sw=sw.replace("'./exercises.js',", "'./exercises.js', './exercise-media.js', './exercise-image-assets.js',");
sw=sw.replace(/const ASSETS = \[([^\n]+)\];/,(_,items)=>`const ASSETS = [${items}, ...self.EXERCISE_IMAGE_ASSETS];`);
write('service-worker.js',sw);
console.log(`Integradas ${imageAssets.length} imágenes locales.`);
