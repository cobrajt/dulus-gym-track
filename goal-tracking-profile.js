(() => {
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const bodyDefs={weight:['Peso','1–3 veces/semana si aporta; mira la tendencia'],waist:['Cintura','Cada 2–4 semanas'],glutes:['Glúteos','Cada 2–4 semanas'],hips:['Cadera','Cada 2–4 semanas'],chest:['Pecho','Cada 2–4 semanas'],abdomen:['Abdomen','Cada 2–4 semanas'],leftArm:['Brazo izq.','Cada 2–4 semanas'],rightArm:['Brazo der.','Cada 2–4 semanas'],leftThigh:['Muslo izq.','Cada 2–4 semanas'],rightThigh:['Muslo der.','Cada 2–4 semanas']};
const perfDefs={vertical_jump:['Salto vertical','Cada 4–6 semanas'],sprint_20m:['Sprint 20 m','Cada 4–6 semanas'],pullups:['Dominadas máximas','Cada 4–6 semanas']};
function profile(student){const text=norm((student?.goals||[]).join(' ')),body=new Set(),performance=new Set(),automatic=new Set(),reasons=[];const addBody=(...x)=>x.forEach(k=>body.add(k)),addPerf=(...x)=>x.forEach(k=>performance.add(k));
 if(/perder|grasa|adelgazar|definir|cintura|lose weight|fat loss/.test(text)){addBody('weight','waist');automatic.add('Fuerza/e1RM desde los entrenamientos');reasons.push('La cintura ayuda a distinguir progreso aunque el peso se mueva poco.');}
 if(/gluteo|glute/.test(text)){addBody('glutes','hips');automatic.add('Fuerza de tren inferior desde los entrenamientos');reasons.push('Glúteos y cadera se siguen junto con fuerza, no como tamaño aislado.');}
 if(/bicep|brazo|arm/.test(text)){addBody('leftArm','rightArm');automatic.add('Fuerza de tirón/empuje desde los entrenamientos');}
 if(/pecho|chest/.test(text))addBody('chest'); if(/abdomen|abdominal|abs/.test(text))addBody('waist','abdomen'); if(/muslo|pierna|leg/.test(text))addBody('leftThigh','rightThigh');
 if(/baloncesto|basket|salto|vertical|explos|velocidad|speed|sprint|atlet/.test(text)){addPerf('vertical_jump','sprint_20m');automatic.add('Fuerza de tren inferior y PR desde las sesiones');reasons.push('Para rendimiento, una prueba periódica vale más que medir perímetros sin objetivo.');}
 if(/fuerza|strength|powerlift/.test(text)){automatic.add('e1RM de ejercicios clave desde cada sesión');addPerf('pullups');}
 if(/masa|musculo|hipertrof|muscle|ganar/.test(text)&&!body.size){addBody('weight','chest','leftArm','rightArm','leftThigh','rightThigh');automatic.add('e1RM por grupo muscular');}
 if(!body.size&&!performance.size&&!automatic.size){addBody('weight','waist');automatic.add('Fuerza/e1RM desde los entrenamientos');reasons.push('Perfil general: seguimiento mínimo para no pedir datos innecesarios.');}
 return {body:[...body].map(key=>({key,label:bodyDefs[key]?.[0]||key,cadence:bodyDefs[key]?.[1]||'Periódicamente'})),performance:[...performance].map(key=>({key,label:perfDefs[key]?.[0]||key,cadence:perfDefs[key]?.[1]||'Periódicamente'})),automatic:[...automatic],reasons};}
function measurementKeys(student){return profile(student).body.map(x=>x.key);}
window.DulusGoalTracking={profile,measurementKeys,bodyDefs,perfDefs};
})();
