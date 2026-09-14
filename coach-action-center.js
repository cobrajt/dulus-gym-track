/* Dulus coach action center: explainable signals, never automatic prescriptions. */
(() => {
'use strict';
const avg=a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:null;
const round=(n,d=0)=>Number.isFinite(n)?Number(n.toFixed(d)):null;
const keyDate=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const daysBetween=(a,b)=>Math.floor((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000);
function adherence(studentId,plans,sessions,days=14){
 const own=plans.filter(p=>p.student_id===studentId),today=new Date(),todayKey=keyDate(today);let due=0,done=0,partial=0;
 for(let ago=1;ago<=days;ago++){const d=new Date(today);d.setDate(d.getDate()-ago);const date=keyDate(d);for(const p of own){if(p.start_date>date||!p.days?.includes(d.getDay()))continue;due++;const s=sessions.find(x=>x.plan_id===p.id&&x.date===date);if(!s)continue;if((s.completed_ids?.length||0)>=(s.total_exercises||Infinity))done++;else if((s.completed_ids?.length||0)>0)partial++;}}
 const ownSessions=sessions.filter(s=>own.some(p=>p.id===s.plan_id)).sort((a,b)=>String(b.date).localeCompare(String(a.date))),last=ownSessions[0]?.date||null;
 return {due,done,partial,rate:due?done/due:null,lastSession:last,inactiveDays:last?daysBetween(last,todayKey):null,sessions:ownSessions};
}
function pendingFor(uid,teamId,studentId,plans,messages){
 const own=new Set(plans.filter(p=>p.student_id===studentId).map(p=>p.id));let seen=new Set();try{seen=new Set(JSON.parse(localStorage.getItem('dulus-coach-seen:'+uid+':'+teamId)||'[]'));}catch{}
 const rows=messages.filter(m=>own.has(m.plan_id)&&m.author_id!==uid&&!seen.has('message:'+m.id));return {videos:rows.filter(m=>m.video_path).length,messages:rows.filter(m=>!m.video_path).length};
}
function analyzeStudent({api,uid,teamId,student,plans,sessions,messages,progressData}){
 const stats=adherence(student.id,plans,sessions),recent=stats.sessions.slice(0,3),fat=recent.map(s=>Number(s.details?.fatigue)).filter(Number.isFinite),pain=stats.sessions.filter(s=>daysBetween(s.date,keyDate(new Date()))<=7).map(s=>Number(s.details?.pain||0)),maxPain=pain.length?Math.max(...pain):0,recentFat=avg(fat);
 const muscles=window.DulusProgress?.studentMuscles?.(student.id,progressData)||[],strength=muscles.filter(m=>m.current!==null),falling=strength.filter(m=>m.status==='Bajando'),plateau=strength.filter(m=>m.plateau),pending=pendingFor(uid,teamId,student.id,plans,messages);
 const signals=[];const add=(severity,title,evidence,action)=>signals.push({severity,title,evidence,action});
 if(maxPain>=7)add(3,'Dolor alto reportado','Dolor máximo reciente: '+maxPain+'/10.','Contacta al alumno y revisa la molestia antes de aumentar carga o volumen.');
 else if(maxPain>=4)add(2,'Molestia a revisar','Dolor máximo reciente: '+maxPain+'/10.','Pregunta cómo evoluciona la molestia y revisa los ejercicios implicados.');
 if(falling.length&&recentFat!==null&&recentFat>=7)add(2,'Rendimiento bajando con fatiga alta',falling.map(x=>x.muscle).join(', ')+' baja · fatiga media '+round(recentFat,1)+'/10.','Revisa recuperación, volumen, RIR y proximidad al fallo antes de progresar cargas.');
 if(stats.due>=3&&stats.rate!==null&&stats.rate<0.5)add(2,'Baja adherencia',stats.done+' de '+stats.due+' sesiones programadas completadas en 14 días.','Pregunta por barreras de horario y ajusta frecuencia o volumen si hace falta.');
 if(stats.due>=2&&stats.inactiveDays!==null&&stats.inactiveDays>=7)add(2,'Inactividad reciente','Última sesión hace '+stats.inactiveDays+' días.','Haz un seguimiento breve y confirma si el plan sigue siendo realista.');
 if(plateau.length)add(1,'Meseta detectada',plateau.map(x=>x.muscle).join(', ')+'.','Revisa técnica, selección de ejercicio y progresión antes de cambiar el plan completo.');
 if(recentFat!==null&&recentFat>=8&&!falling.length)add(1,'Fatiga alta',round(recentFat,1)+'/10 de media en las últimas sesiones con dato.','Revisa recuperación y carga percibida; no hace falta cambiar el plan si el rendimiento sigue estable.');
 if(pending.videos)add(1,'Video pendiente de revisión',pending.videos+' video'+(pending.videos===1?'':'s')+' sin revisar.','Revisa la técnica y deja una indicación concreta al alumno.');
 if(pending.messages)add(1,'Comentario pendiente',pending.messages+' comentario'+(pending.messages===1?'':'s')+' nuevo'+(pending.messages===1?'':'s')+'.','Responde la duda o confirma que no requiere cambio de rutina.');
 if(stats.sessions.length>=3&&muscles.length&&strength.length/Math.max(1,muscles.length)<0.5)add(1,'Faltan datos de fuerza',strength.length+' de '+muscles.length+' grupos musculares tienen e1RM calculable.','Pide registrar peso, repeticiones y RIR en las próximas sesiones.');
 const severity=signals.reduce((m,s)=>Math.max(m,s.severity),0),positive=strength.filter(m=>m.status==='Subiendo').length,coverage=muscles.length?strength.length/muscles.length:null;
 let bottleneck='Sin bloqueo claro';if(!stats.sessions.length)bottleneck='Sin datos';else if(maxPain>=4||(recentFat!==null&&recentFat>=7))bottleneck='Recuperación';else if(stats.due>=3&&stats.rate!==null&&stats.rate<0.6)bottleneck='Constancia';else if(stats.sessions.length>=3&&coverage!==null&&coverage<0.5)bottleneck='Registro de datos';else if((plateau.length||falling.length)&&(stats.rate===null||stats.rate>=0.7)&&(recentFat===null||recentFat<7))bottleneck='Progresión / técnica';
 return {student,stats,muscles,strength,falling,plateau,pending,recentFat,maxPain,signals,severity,positive,coverage,bottleneck};
}
function summaryText(row){
 if(row.signals.length){const top=row.signals.slice().sort((a,b)=>b.severity-a.severity)[0];return top.title+' · '+top.evidence;}
 if(row.stats.rate!==null&&row.stats.rate>=0.8&&row.positive)return 'En buen camino · '+Math.round(row.stats.rate*100)+'% de adherencia y '+row.positive+' grupo'+(row.positive===1?'':'s')+' muscular'+(row.positive===1?'':'es')+' subiendo.';
 if(row.stats.sessions.length)return 'Sin señales importantes. Hay '+row.stats.sessions.length+' sesión'+(row.stats.sessions.length===1?'':'es')+' registrada'+(row.stats.sessions.length===1?'':'s')+'.';
 return 'Aún no hay sesiones suficientes para evaluar progreso.';
}
function coachMessage(row){
 const s=row.signals.slice().sort((a,b)=>b.severity-a.severity)[0];if(!s)return 'Vas bien. Sigue registrando tus sesiones, cargas, repeticiones y RIR para que pueda seguir tu progreso con precisión.';
 return 'He revisado tu seguimiento. '+s.evidence+' '+s.action;
}
function render({api,uid,teamId,plans,roster,sessions,messages,node,button}){
 if(!api.coach?.()||!roster.length||!window.DulusProgress)return null;const progressData=window.DulusProgress.build(api,sessions,plans,roster),rows=roster.map(student=>analyzeStudent({api,uid,teamId,student,plans,sessions,messages,progressData})).sort((a,b)=>b.severity-a.severity||(a.stats.rate??1)-(b.stats.rate??1));
 const section=node('section',undefined,'coach-action-center'),head=node('div',undefined,'coach-action-head'),copy=node('div');copy.append(node('p','SUPERVISIÓN INTELIGENTE','eyebrow'),node('h3','Centro de Acción del Coach'),node('p','Dulus prioriza señales respaldadas por datos. No modifica rutinas automáticamente.'));
 const high=rows.filter(r=>r.severity>=2).length,watch=rows.filter(r=>r.severity===1).length,ok=rows.filter(r=>r.severity===0&&r.stats.sessions.length).length,empty=rows.filter(r=>!r.stats.sessions.length).length,stats=node('div',undefined,'coach-action-metrics');
 for(const [v,l] of [[high,'Revisar hoy'],[watch,'Observar'],[ok,'En curso'],[empty,'Sin datos']]){const c=node('div');c.append(node('strong',String(v)),node('span',l));stats.append(c);}head.append(copy,stats);section.append(head);
 const list=node('div',undefined,'coach-action-list');for(const row of rows){const card=node('article',undefined,'coach-action-card');card.dataset.level=String(row.severity);const title=node('div',undefined,'coach-action-title'),label=row.severity>=3?'Prioridad alta':row.severity===2?'Revisar':row.severity===1?'Observar':row.stats.sessions.length?'En curso':'Sin datos';title.append(node('h4',row.student.name),node('span',label));card.append(title,node('p',summaryText(row)));
  const evidence=node('div',undefined,'coach-action-evidence');const adherence=row.stats.rate===null?'—':Math.round(row.stats.rate*100)+'%',last=row.stats.lastSession||'Sin sesión',trend=row.strength.length?(row.positive+' subiendo · '+row.plateau.length+' meseta · '+row.falling.length+' bajando'):'Sin e1RM';for(const [v,l] of [[row.bottleneck,'Cuello de botella probable'],[adherence,'Adherencia 14 d'],[last,'Última sesión'],[trend,'Fuerza']]){const x=node('div');x.append(node('strong',String(v)),node('small',l));evidence.append(x);}card.append(evidence);
  if(row.signals.length){const details=node('details',undefined,'coach-action-details');details.append(node('summary','Por qué aparece aquí'));for(const s of row.signals.slice().sort((a,b)=>b.severity-a.severity)){const item=node('div',undefined,'coach-action-signal');item.append(node('strong',s.title),node('p',s.evidence),node('small','Siguiente paso: '+s.action));details.append(item);}card.append(details);}
  const actions=node('div',undefined,'coach-action-buttons'),open=button('Abrir alumno',()=>{api.select?.(row.student.id);document.getElementById('student-panel')?.scrollIntoView({behavior:'smooth',block:'start'});}),progress=button('Ver progreso',()=>{const hub=document.querySelector('.progress-hub'),sel=hub?.querySelector('select[aria-label="Alumno para analizar"]');if(sel){sel.value=row.student.id;sel.dispatchEvent(new Event('change'));}hub?.scrollIntoView({behavior:'smooth',block:'start'});}),copyAdvice=button('Copiar consejo sugerido',async()=>{try{await navigator.clipboard.writeText(coachMessage(row));copyAdvice.textContent='Consejo copiado ✓';setTimeout(()=>copyAdvice.textContent='Copiar consejo sugerido',1800);}catch{copyAdvice.textContent='No se pudo copiar';}});actions.append(open,progress,copyAdvice);card.append(actions);list.append(card);}
 section.append(list);return section;
}
window.DulusCoachAction={analyzeStudent,render};
})();
