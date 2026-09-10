import fs from 'node:fs';
import path from 'node:path';
const root='C:/Users/user/Desktop/DulusGymWork';
const dataset=JSON.parse(fs.readFileSync('C:/Users/user/AppData/Local/Temp/free-exercises.json','utf8'));
const mapping={
  'press-banca-barra':'Barbell_Bench_Press_-_Medium_Grip',
  'flexiones':'Pushups',
  'aperturas-mancuernas':'Dumbbell_Flyes',
  'dominadas':'Pullups',
  'remo-barra':'Bent_Over_Barbell_Row',
  'jalon-polea':'Wide-Grip_Lat_Pulldown',
  'press-militar':'Standing_Military_Press',
  'elevaciones-laterales':'Side_Lateral_Raise',
  'face-pull':'Face_Pull',
  'curl-barra':'Barbell_Curl',
  'curl-martillo':'Hammer_Curls',
  'fondos-banco':'Bench_Dips',
  'extension-polea':'Triceps_Pushdown',
  'press-frances':'Lying_Dumbbell_Tricep_Extension',
  'curl-muneca':'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench',
  'paseo-granjero':'Farmers_Walk',
  'sentadilla-barra':'Barbell_Squat',
  'zancadas':'Bodyweight_Walking_Lunge',
  'prensa-piernas':'Leg_Press',
  'peso-muerto-rumano':'Romanian_Deadlift',
  'curl-femoral':'Lying_Leg_Curls',
  'puente-talones':'Butt_Lift_Bridge',
  'hip-thrust':'Barbell_Hip_Thrust',
  'sentadilla-goblet':'Goblet_Squat',
  'patada-gluteo':'Glute_Kickback',
  'gemelo-maquina':'Standing_Calf_Raises',
  'plancha':'Plank',
  'crunch-polea':'Cable_Crunch',
  'dead-bug':'Dead_Bug'
};
const outDir=path.join(root,'assets','exercises');
fs.mkdirSync(outDir,{recursive:true});
const local={};
for(const [localId,sourceId] of Object.entries(mapping)){
  const ex=dataset.find(item=>item.id===sourceId);
  if(!ex||!ex.images?.length){console.warn('Sin imagen:',localId,sourceId);continue;}
  const saved=[];
  for(let i=0;i<Math.min(2,ex.images.length);i++){
    const url=`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.images[i]}`;
    const response=await fetch(url);
    if(!response.ok)throw new Error(`${response.status} ${url}`);
    const target=`assets/exercises/${localId}-${i}.jpg`;
    fs.writeFileSync(path.join(root,target),Buffer.from(await response.arrayBuffer()));
    saved.push('./'+target.replaceAll('\\','/'));
  }
  local[localId]={images:saved,sourceId};
  console.log(localId,'->',sourceId,saved.length);
}
const code=`/* Imágenes de ejercicios: Free Exercise DB (dominio público / Unlicense). */\nconst EXERCISE_MEDIA=${JSON.stringify(local,null,2)};\nObject.entries(EXERCISE_MEDIA).forEach(([id,media])=>{const item=EXERCISES.find(exercise=>exercise.id===id);if(item)item.media={...item.media,image:media.images[0]||'',images:media.images,status:'ready',source:'Free Exercise DB'};});\n`;
fs.writeFileSync(path.join(root,'exercise-media.js'),code,'utf8');
console.log(`Listas ${Object.keys(local).length} coincidencias.`);
