(() => {
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const bodyDefs={weight:['Peso','1–3 veces/semana si aporta; mira la tendencia'],waist:['Cintura','Cada 2–4 semanas'],glutes:['Glúteos','Cada 2–4 semanas'],hips:['Cadera','Cada 2–4 semanas'],chest:['Pecho','Cada 2–4 semanas'],neck:['Cuello','Cada 4 semanas'],shoulders:['Hombros','Cada 2–4 semanas'],abdomen:['Abdomen','Cada 2–4 semanas'],leftArm:['Brazo izq.','Cada 2–4 semanas'],rightArm:['Brazo der.','Cada 2–4 semanas'],leftForearm:['Antebrazo izq.','Cada 2–4 semanas'],rightForearm:['Antebrazo der.','Cada 2–4 semanas'],leftThigh:['Muslo izq.','Cada 2–4 semanas'],rightThigh:['Muslo der.','Cada 2–4 semanas'],leftCalf:['Pantorrilla izq.','Cada 2–4 semanas'],rightCalf:['Pantorrilla der.','Cada 2–4 semanas']};
const perfDefs={vertical_jump:['Salto vertical','Cada 4–6 semanas'],broad_jump:['Salto horizontal','Cada 4–6 semanas'],sprint_10m:['Sprint 10 m','Cada 4–6 semanas'],sprint_20m:['Sprint 20 m','Cada 4–6 semanas'],sprint_40m:['Sprint 40 m','Cada 4–6 semanas'],pullups:['Dominadas máximas','Cada 4–6 semanas'],plank:['Plancha máxima','Cada 4–6 semanas']};
const mapBody=keys=>(keys||[]).filter(k=>bodyDefs[k]).map(key=>({key,label:bodyDefs[key][0],cadence:bodyDefs[key][1]}));
const mapPerf=keys=>(keys||[]).filter(k=>perfDefs[k]).map(key=>({key,label:perfDefs[key][0],cadence:perfDefs[key][1]}));
function suggestedProfile(student){const text=norm((student?.goals||[]).join(' ')),body=new Set(),performance=new Set(),automatic=new Set(),reasons=[];const addBody=(...x)=>x.forEach(k=>body.add(k)),addPerf=(...x)=>x.forEach(k=>performance.add(k));
 if(/perder|grasa|adelgazar|definir|cintura|lose weight|fat loss/.test(text)){addBody('weight','waist');automatic.add('Fuerza/e1RM desde los entrenamientos');reasons.push('La cintura ayuda a distinguir progreso aunque el peso se mueva poco.');}
 if(/gluteo|glute/.test(text)){addBody('glutes','hips');automatic.add('Fuerza de tren inferior desde los entrenamientos');reasons.push('Glúteos y cadera se siguen junto con fuerza, no como tamaño aislado.');}
 if(/bicep|brazo|arm/.test(text)){addBody('leftArm','rightArm');automatic.add('Fuerza de tirón/empuje desde los entrenamientos');}
 if(/pecho|chest/.test(text))addBody('chest');if(/abdomen|abdominal|abs/.test(text))addBody('waist','abdomen');if(/muslo|pierna|leg/.test(text))addBody('leftThigh','rightThigh');
 if(/baloncesto|basket|salto|vertical|explos|velocidad|speed|sprint|atlet/.test(text)){addPerf('vertical_jump','sprint_20m');automatic.add('Fuerza de tren inferior y PR desde las sesiones');reasons.push('Para rendimiento, una prueba periódica vale más que medir perímetros sin objetivo.');}
 if(/fuerza|strength|powerlift/.test(text)){automatic.add('e1RM de ejercicios clave desde cada sesión');addPerf('pullups');}
 if(/masa|musculo|hipertrof|muscle|ganar/.test(text)&&!body.size){addBody('weight','chest','leftArm','rightArm','leftThigh','rightThigh');automatic.add('e1RM por grupo muscular');}
 if(!body.size&&!performance.size&&!automatic.size){addBody('weight','waist');automatic.add('Fuerza/e1RM desde los entrenamientos');reasons.push('Perfil general: seguimiento mínimo para no pedir datos innecesarios.');}
 return {body:mapBody([...body]),performance:mapPerf([...performance]),automatic:[...automatic],reasons,approved:false,note:''};
}
function profile(student){const suggested=suggestedProfile(student),plan=student?.tracking_plan;if(plan?.approved===true&&Array.isArray(plan.body)&&Array.isArray(plan.performance))return {body:mapBody(plan.body),performance:mapPerf(plan.performance),automatic:suggested.automatic,reasons:['Plan de seguimiento aprobado. '+(plan.note||'').trim(),...suggested.reasons].filter(Boolean),approved:true,note:plan.note||'',approvedAt:plan.approved_at||null,approvedBy:plan.approved_by||null};return suggested;}
function measurementKeys(student){return profile(student).body.map(x=>x.key);}
window.DulusGoalTracking={profile,suggestedProfile,measurementKeys,bodyDefs,perfDefs};
})();
