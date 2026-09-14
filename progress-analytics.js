/* Dulus progress analytics: e1RM estimates, normalized muscle trends, PRs and coach shortcuts. */
(() => {
'use strict';
const avg=a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:null;
const round=(n,d=0)=>Number.isFinite(n)?Number(n.toFixed(d)):null;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const estimate1RM=x=>{const w=Number(x?.weightKg),reps=Number(x?.reps),rir=Number(x?.rir);if(!(w>0)||!Number.isFinite(reps)||reps<1||reps>15)return null;const effective=clamp(reps+(Number.isFinite(rir)?clamp(rir,0,5):0),1,15);return w*(1+effective/30);};
const strengthMuscle=e=>e?.primaryMuscle||e?.targetMuscles?.[0]||e?.bodyParts?.[0]||'Sin clasificar';
const svgEl=(tag,attrs={})=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
function build(api,sessions,plans,roster){
 const planById=new Map(plans.map(p=>[p.id,p])),studentById=new Map(roster.map(r=>[r.id,r]));
 const exerciseSeries=new Map(),exposures=new Map(),fatigue=new Map();
 for(const s of [...sessions].sort((a,b)=>String(a.date).localeCompare(String(b.date)))){
  const p=planById.get(s.plan_id),studentId=p?.student_id;if(!studentId)continue;const student=studentById.get(studentId),studentName=student?.name||'Alumno';
  if(Number.isFinite(Number(s.details?.fatigue))){const a=fatigue.get(studentId)||[];a.push(Number(s.details.fatigue));fatigue.set(studentId,a);}
  for(const id of s.completed_ids||[]){const exercise=api.catalog.find(e=>e.id===id),muscle=strengthMuscle(exercise),x=(s.details?.exercises||[]).find(y=>y.exerciseId===id)||{exerciseId:id};
   const expKey=studentId+':'+muscle,exp=exposures.get(expKey)||{studentId,studentName,muscle,count:0};exp.count++;exposures.set(expKey,exp);
   const e1rm=estimate1RM(x);if(e1rm===null)continue;const key=studentId+':'+id,series=exerciseSeries.get(key)||{studentId,studentName,exerciseId:id,name:exercise?.name||id,muscle,points:[]};
   series.points.push({date:s.date,e1rm,weight:Number(x.weightKg),reps:Number(x.reps),rir:Number.isFinite(Number(x.rir))?Number(x.rir):null});exerciseSeries.set(key,series);
  }
 }
 for(const series of exerciseSeries.values()){const base=series.points[0]?.e1rm||1;for(const p of series.points)p.index=p.e1rm/base*100;}
 return {exerciseSeries,exposures,fatigue};
}
function muscleSeries(studentId,muscle,data){
 const list=[...data.exerciseSeries.values()].filter(s=>s.studentId===studentId&&s.muscle===muscle);if(!list.length)return [];
 const dates=[...new Set(list.flatMap(s=>s.points.map(p=>p.date)))].sort(),out=[];
 for(const date of dates){const values=[];for(const s of list){const p=[...s.points].reverse().find(x=>x.date<=date);if(p)values.push(p.index);}if(values.length)out.push({date,index:avg(values)});}
 return out;
}
function studentMuscles(studentId,data){
 const names=new Set();for(const s of data.exerciseSeries.values())if(s.studentId===studentId)names.add(s.muscle);for(const x of data.exposures.values())if(x.studentId===studentId)names.add(x.muscle);
 return [...names].map(muscle=>{const curve=muscleSeries(studentId,muscle,data),exp=data.exposures.get(studentId+':'+muscle)?.count||0,current=curve.at(-1)?.index??null,delta=current===null?null:current-100;
  const recent=curve.slice(-4),short=recent.length>1?recent.at(-1).index-recent[0].index:null,plateau=recent.length>=4&&Math.abs(short)<2;
  const status=current===null?'Sin carga':plateau?'Meseta':short!==null&&short>2?'Subiendo':short!==null&&short<-2?'Bajando':curve.length<3?'Recopilando':'Estable';
  return {muscle,curve,exp,current,delta,status,plateau};
 }).sort((a,b)=>(b.current??-1)-(a.current??-1));
}
function exerciseSummary(studentId,muscle,data){
 return [...data.exerciseSeries.values()].filter(s=>s.studentId===studentId&&s.muscle===muscle).map(s=>{const first=s.points[0],latest=s.points.at(-1),best=s.points.reduce((a,b)=>b.e1rm>a.e1rm?b:a,s.points[0]);
  let silentPrCount=0;for(let i=1;i<s.points.length;i++){const p=s.points[i],before=s.points.slice(0,i),oldBest=Math.max(...before.map(x=>x.e1rm)),oldWeight=Math.max(...before.map(x=>x.weight));if(p.e1rm>oldBest*1.005&&p.weight<=oldWeight)silentPrCount++;}
  return {...s,first,latest,best,delta:latest.index-100,silentPr:silentPrCount>0,silentPrCount};
 }).sort((a,b)=>b.latest.index-a.latest.index);
}
function insightFor(studentId,muscles,data){
 const withData=muscles.filter(m=>m.current!==null),fat=(data.fatigue.get(studentId)||[]).slice(-3),recentFat=avg(fat),notes=[];
 const top=[...withData].sort((a,b)=>(b.delta??0)-(a.delta??0))[0];if(top?.delta>2)notes.push('Mejor avance: '+top.muscle+' '+(top.delta>=0?'+':'')+round(top.delta,1)+'% desde su referencia.');
 const plateau=withData.find(m=>m.plateau);if(plateau)notes.push('Meseta detectada en '+plateau.muscle+': revisa progresión, técnica o recuperación antes de cambiar todo el plan.');
 const falling=withData.find(m=>m.status==='Bajando');if(falling&&recentFat!==null&&recentFat>=7)notes.push('Atención: '+falling.muscle+' baja mientras la fatiga reciente promedia '+round(recentFat,1)+'/10. Conviene revisar carga y recuperación.');
 const low=muscles.find(m=>m.exp>=3&&m.current===null);if(low)notes.push(low.muscle+' tiene actividad, pero aún no suficientes datos de peso/repeticiones para medir fuerza.');
 return notes.length?notes:['Todavía no hay una señal fuerte que requiera atención. Sigue registrando carga, repeticiones y RIR.'];
}
function render({api,sessions,plans,roster,node}){
 const data=build(api,sessions,plans,roster),section=node('details',undefined,'load-progress progress-hub');section.open=true;section.append(node('summary','Progreso y fuerza'));
 section.append(node('p','e1RM = repetición máxima estimada a partir de peso, repeticiones y RIR; no necesitas probar un máximo real. El índice muscular usa 100 como referencia inicial y combina ejercicios normalizados; no mezcla kilos distintos ni estima crecimiento muscular.','progress-note'));
 const available=api.coach()?roster:roster.slice(0,1);if(!available.length){section.append(node('p','Todavía no hay un perfil con sesiones registradas.'));return section;}
 const controls=node('div',undefined,'progress-controls'),studentSelect=node('select'),muscleSelect=node('select');let studentId=api.student?.()?.id||available[0].id,selectedMuscle='';if(!available.some(r=>r.id===studentId))studentId=available[0].id;
 if(api.coach()){studentSelect.setAttribute('aria-label','Alumno para analizar');for(const r of available)studentSelect.append(new Option(r.name,r.id));studentSelect.value=studentId;controls.append(node('label','Alumno'),studentSelect);}
 controls.append(node('label','Grupo muscular'),muscleSelect);section.append(controls);
 const summary=node('div',undefined,'progress-overview'),muscleGrid=node('div',undefined,'muscle-score-grid'),curveCard=node('article',undefined,'progress-curve-card'),insights=node('div',undefined,'progress-insights'),exerciseDetails=node('details',undefined,'progress-exercise-details');
 exerciseDetails.append(node('summary','Ver detalle por ejercicio'));section.append(summary,node('h3','Mapa muscular de progreso'),muscleGrid,curveCard,insights,exerciseDetails);
 function drawCurve(m){curveCard.replaceChildren();curveCard.append(node('h3','Curva de progreso · '+m.muscle));if(!m.curve.length){curveCard.append(node('p','Hay actividad en este músculo, pero falta registrar peso y repeticiones para calcular fuerza.'));return;}
  const width=640,height=220,pad=34,vals=m.curve.map(p=>p.index),min=Math.min(95,...vals)-2,max=Math.max(105,...vals)+2,range=Math.max(1,max-min),svg=svgEl('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':'Curva de progreso de '+m.muscle});
  const y=n=>height-pad-(n-min)/range*(height-pad*2),x=i=>pad+(m.curve.length===1?0:(width-pad*2)*i/(m.curve.length-1));svg.append(svgEl('line',{x1:pad,y1:y(100),x2:width-pad,y2:y(100),class:'progress-baseline'}));
  const points=m.curve.map((p,i)=>x(i)+','+y(p.index)).join(' ');svg.append(svgEl('polyline',{points,class:'progress-line'}));for(let i=0;i<m.curve.length;i++)svg.append(svgEl('circle',{cx:x(i),cy:y(m.curve[i].index),r:5,class:'progress-dot'}));curveCard.append(svg);
  const labels=node('div',undefined,'progress-curve-labels');labels.append(node('small',m.curve[0].date),node('strong','Índice '+round(m.current,1)),node('small',m.curve.at(-1).date));curveCard.append(labels);
 }
 function redraw(){const muscles=studentMuscles(studentId,data);if(!muscles.length){summary.replaceChildren();muscleGrid.replaceChildren(node('p','El progreso aparecerá al guardar ejercicios completados.'));curveCard.replaceChildren();insights.replaceChildren();exerciseDetails.replaceChildren(node('summary','Ver detalle por ejercicio'));return;}
  if(!muscles.some(m=>m.muscle===selectedMuscle))selectedMuscle=muscles.find(m=>m.current!==null)?.muscle||muscles[0].muscle;muscleSelect.replaceChildren();for(const m of muscles)muscleSelect.append(new Option(m.muscle,m.muscle));muscleSelect.value=selectedMuscle;
  const strength=muscles.filter(m=>m.current!==null),overall=avg(strength.map(m=>m.current)),up=strength.filter(m=>m.status==='Subiendo').length,allExercises=[...data.exerciseSeries.values()].filter(s=>s.studentId===studentId),silent=allExercises.reduce((n,s)=>n+exerciseSummary(studentId,s.muscle,data).filter(x=>x.exerciseId===s.exerciseId&&x.silentPr).length,0);
  summary.replaceChildren();for(const [value,label] of [[overall===null?'—':round(overall,1),'Índice general de fuerza'],[up,'Músculos subiendo'],[silent,'PR silenciosos detectados'],[strength.length+'/'+muscles.length,'Músculos con datos de fuerza']]){const c=node('div');c.append(node('strong',String(value)),node('span',label));summary.append(c);}
  muscleGrid.replaceChildren();for(const m of muscles){const card=node('button',undefined,'muscle-score-card');card.type='button';card.dataset.active=String(m.muscle===selectedMuscle);const delta=m.delta===null?'Sin e1RM':(m.delta>=0?'+':'')+round(m.delta,1)+'%';card.append(node('strong',m.muscle),node('span',m.current===null?'—':round(m.current,1)),node('small',delta+' · '+m.status+' · '+m.exp+' '+(m.exp===1?'exposición':'exposiciones')));card.onclick=()=>{selectedMuscle=m.muscle;redraw();};muscleGrid.append(card);}
  const selected=muscles.find(m=>m.muscle===selectedMuscle)||muscles[0],exercises=exerciseSummary(studentId,selected.muscle,data);drawCurve(selected);
  const stat=node('div',undefined,'progress-selected-stats'),latestBest=exercises.filter(x=>x.latest).sort((a,b)=>b.latest.e1rm-a.latest.e1rm)[0],bestEver=exercises.filter(x=>x.best).sort((a,b)=>b.best.e1rm-a.best.e1rm)[0],confidence=exercises.reduce((n,x)=>n+x.points.length,0)>=8?'Alta':exercises.reduce((n,x)=>n+x.points.length,0)>=4?'Media':'Inicial';
  for(const [v,l] of [[selected.current===null?'—':round(selected.current,1),'Índice actual'],[selected.delta===null?'—':(selected.delta>=0?'+':'')+round(selected.delta,1)+'%','Cambio vs. inicio'],[latestBest?round(latestBest.latest.e1rm,1)+' kg':'—','e1RM actual destacado'],[confidence,'Confianza de tendencia']]){const c=node('div');c.append(node('strong',String(v)),node('small',l));stat.append(c);}curveCard.append(stat);
  if(latestBest)curveCard.append(node('p','e1RM destacado: '+latestBest.name+' · '+round(latestBest.latest.e1rm,1)+' kg estimados. Mejor histórico del grupo: '+round(bestEver.best.e1rm,1)+' kg en '+bestEver.name+'.','progress-note'));
  insights.replaceChildren(node('h3',api.coach()?'Lectura rápida para el coach':'Tu lectura rápida'));for(const text of insightFor(studentId,muscles,data))insights.append(node('p',text));
  exerciseDetails.replaceChildren(node('summary','Ver detalle por ejercicio'));const list=node('div',undefined,'progress-exercises');for(const e of exercises){const c=node('article',undefined,'progress-card'),pr=e.silentPrCount?' · PR silencioso ✦'+(e.silentPrCount>1?' ×'+e.silentPrCount:''):'';c.append(node('h3',e.name),node('p','e1RM actual '+round(e.latest.e1rm,1)+' kg · mejor '+round(e.best.e1rm,1)+' kg · '+(e.delta>=0?'+':'')+round(e.delta,1)+'%'+pr),node('small',e.points.length+' registros de fuerza'));list.append(c);}if(!exercises.length)list.append(node('p','Este músculo todavía no tiene e1RM calculable.'));exerciseDetails.append(list);
 }
 studentSelect.onchange=()=>{studentId=studentSelect.value;selectedMuscle='';redraw();};muscleSelect.onchange=()=>{selectedMuscle=muscleSelect.value;redraw();};redraw();return section;
}
window.DulusProgress={estimate1RM,build,render};
})();
