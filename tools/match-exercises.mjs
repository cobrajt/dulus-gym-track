import fs from 'node:fs';
const root='C:/Users/user/Desktop/DulusGymWork';
const data=JSON.parse(fs.readFileSync('C:/Users/user/AppData/Local/Temp/free-exercises.json','utf8'));
const lines=fs.readFileSync(`${root}/exercises.js`,'utf8').split(/\r?\n/);
const items=[];
for(const line of lines){
  const m=line.match(/exercise\('([^']+)','([^']+)'.*?\], '([^']*)',/);
  if(m)items.push({id:m[1],name:m[2],alt:m[3]});
}
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const bigrams=s=>{const x=` ${norm(s)} `,a=[];for(let i=0;i<x.length-1;i++)a.push(x.slice(i,i+2));return a};
const similarity=(a,b)=>{const aa=bigrams(a),bb=bigrams(b),copy=[...bb];let hit=0;for(const x of aa){const i=copy.indexOf(x);if(i>=0){hit++;copy.splice(i,1)}}return aa.length+bb.length?2*hit/(aa.length+bb.length):0};
for(const item of items){
  const q=item.alt||item.name;
  const scored=data.map(ex=>({score:similarity(q,ex.name),name:ex.name,id:ex.id,images:ex.images||[]})).sort((a,b)=>b.score-a.score).slice(0,5);
  console.log(`\n${item.id} | ${item.name} | ${item.alt}`);
  scored.forEach(x=>console.log(`  ${x.score.toFixed(3)}  ${x.name} | ${x.id} | ${(x.images||[]).slice(0,2).join(', ')}`));
}
