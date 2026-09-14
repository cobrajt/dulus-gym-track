
/* Experiencia coach/alumnos local. La comunidad no publica datos en Internet. */
labels['routine-detail']=['ENTRENAMIENTO','Tu rutina'];
labels['community-profile']=['PROGRESO COMPARTIDO','Cada paso cuenta'];
document.querySelector('.app-shell').insertAdjacentHTML('beforeend','<section id="screen-routine-detail" class="screen"><button class="back-button" id="routine-back" aria-label="Volver a Entreno">‹</button><div id="routine-detail"></div></section><section id="screen-community-profile" class="screen"><button class="back-button" id="community-back" aria-label="Volver al progreso">‹</button><div id="community-profile"></div></section>');
document.querySelector('#routine-back').addEventListener('click',()=>switchScreen('workout'));
document.querySelector('#community-back').addEventListener('click',()=>switchScreen('progress'));
document.querySelector('#workout-list').insertAdjacentHTML('beforebegin','<div class="workout-toolbar"><button class="action-button" id="create-workout-from-hub">+ Crear rutina para un alumno</button></div>');
document.querySelector('#screen-workout .screen-intro>p:last-child').textContent='Crea rutinas, consulta los ejercicios y registra cada sesión.';
document.querySelector('#create-workout-from-hub').addEventListener('click',()=>{
 const dialog=document.createElement('dialog');dialog.className='dulus-dialog';
 dialog.innerHTML='<h2>Elige un alumno</h2><p>La rutina quedará guardada en su ficha.</p>'+(students.length?'<div class="students-list">'+students.map(s=>'<button class="action-button" data-choose-student="'+s.id+'">'+workoutEscape(s.name)+'</button>').join('')+'</div>':'<p>Añade primero un alumno para crear su rutina.</p><button class="action-button" id="create-first-student">Añadir alumno</button>')+'<div class="dialog-actions"><button class="secondary-action" data-close>Cancelar</button></div>';
 document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove());dialog.querySelector('#create-first-student')?.addEventListener('click',()=>{dialog.close();openStudentForm()});dialog.querySelectorAll('[data-choose-student]').forEach(b=>b.onclick=()=>{dialog.close();openWorkoutPlanModal(Number(b.dataset.chooseStudent))});dialog.showModal();
});
function renderWorkoutHub(){
 const root=document.querySelector('#workout-list');if(!root)return;
 const plans=workoutPlans.filter(p=>p.active!==false);
 root.innerHTML=plans.length?plans.map(p=>{const s=students.find(s=>Number(s.id)===Number(p.studentId));return '<button class="program-card" data-open-routine="'+p.id+'"><header><h3>'+workoutEscape(p.name)+'</h3><span class="tag">Ver rutina →</span></header><p>'+workoutEscape(s?.name||'Alumno')+'</p><div class="program-meta"><span>'+p.exercises.length+' ejercicios</span><span>'+p.days.map(d=>WORKOUT_DAY_LABELS[d]).join(' · ')+'</span></div></button>'}).join(''):'<div class="workout-empty"><h3>Tu próxima rutina empieza aquí</h3><p>Crea una rutina para un alumno o explora la biblioteca completa de ejercicios.</p></div>';
 root.querySelectorAll('[data-open-routine]').forEach(b=>b.onclick=()=>openRoutineDetail(Number(b.dataset.openRoutine)));
}
function openRoutineDetail(id){
 const plan=workoutPlans.find(p=>Number(p.id)===Number(id));if(!plan)return;const s=students.find(s=>Number(s.id)===Number(plan.studentId));
 document.querySelector('#routine-detail').innerHTML='<article class="exercise-detail-hero"><div><p class="label">'+workoutEscape(s?.name||'Alumno')+'</p><h2>'+workoutEscape(plan.name)+'</h2><p>'+plan.days.map(d=>WORKOUT_DAY_LABELS[d]).join(' · ')+'</p></div></article><div class="routine-actions"><button id="routine-record">Registrar sesión</button><button id="routine-student">Abrir ficha del alumno</button></div><h3>Ejercicios de esta rutina</h3>'+plan.exercises.map(item=>{const e=findExercise(item.exerciseId);return '<button class="routine-exercise" data-routine-exercise="'+workoutEscape(item.exerciseId)+'">'+(e?.media?.image?'<img src="'+e.media.image+'" alt="" loading="lazy">':'')+'<span><strong>'+workoutEscape(e?.name||item.exerciseId)+'</strong><small>'+item.sets+' series × '+item.reps+' repeticiones · Ver técnica →</small></span></button>'}).join('');
 document.querySelector('#routine-record').onclick=()=>openWorkoutSessionModal(id);document.querySelector('#routine-student').onclick=()=>{if(s)openStudent(s.id)};
 document.querySelectorAll('[data-routine-exercise]').forEach(b=>b.onclick=()=>openExerciseDetail(b.dataset.routineExercise));switchScreen('routine-detail');
}
const picker=document.querySelector('#workout-exercise-picker');picker.insertAdjacentHTML('beforebegin','<label>Buscar en el catálogo<input type="search" id="routine-search" placeholder="Nombre, músculo o equipamiento"></label>');
document.querySelector('#routine-search').addEventListener('input',e=>{const q=e.target.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();document.querySelectorAll('[data-workout-exercise]').forEach(row=>row.hidden=!row.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q));});
function previousSessionCount(id){
 const today=new Date();today.setHours(0,0,0,0);const from=new Date(today);from.setDate(from.getDate()-59);const to=new Date(today);to.setDate(to.getDate()-30);
 return workoutPlansForStudent(id).reduce((sum,p)=>sum+(p.sessions||[]).filter(s=>{const d=new Date(s.date+'T00:00:00');return d>=from&&d<=to&&(s.completedExerciseIds||[]).length>0}).length,0);
}
function renderCommunity(){
 renderWorkoutHub();
 const screen=document.querySelector('#screen-progress');let root=document.querySelector('#team-ranking');if(!root){root=document.createElement('section');root.id='team-ranking';root.className='team-ranking';document.querySelector('.progress-overview').insertAdjacentElement('afterend',root);}
 const entries=students.map(student=>({student,metric:workoutStudentMetrics(student.id)}));
 const scored=entries.filter(e=>e.metric.score!==null);const ordered=[...scored].sort((a,b)=>b.metric.score-a.metric.score||b.metric.completed-a.metric.completed);
 const top=ordered.slice(0,3);const support=[...scored].filter(e=>e.metric.missed>0||e.metric.score<50).sort((a,b)=>a.metric.score-b.metric.score).slice(0,3);
 const card=(item,kind)=>{const m=item.metric;const rank=1+ordered.filter(e=>e.metric.score>m.score).length;return '<button class="ranking-card '+(kind==='support'?'attention':'')+'" data-community-id="'+item.student.id+'"><span class="ranking-avatar">'+(kind==='top'?rank:workoutEscape(item.student.initials||'DG'))+'</span><div><strong>'+workoutEscape(item.student.name)+'</strong><small>'+(m.score===null?'Su proceso está por comenzar':m.completed+' sesiones · '+(kind==='support'?'Un buen momento para volver':'Ver su avance'))+'</small></div><b>'+(m.score===null?'→':m.score+'%')+'</b></button>';};
 root.innerHTML='<div class="ranking-heading"><p class="label">CRECEMOS JUNTOS · ÚLTIMOS 30 DÍAS</p><h2>Constancia que inspira</h2><span>Cada persona tiene su ritmo. El orden reconoce hábitos, no compara cuerpos.</span></div><p class="local-note">Vista del equipo guardado en este dispositivo. Las cuentas compartidas entre teléfonos aún no están conectadas.</p><div class="ranking-columns"><section><h3>Hoy nos inspiran</h3>'+ (top.length?top.map(e=>card(e,'top')).join(''):'<p class="ranking-empty">Al registrar sesiones, aquí aparecerán los avances de tu equipo.</p>')+'</section><section><h3>Un impulso para retomar</h3>'+(support.length?support.map(e=>card(e,'support')).join(''):'<p class="ranking-empty">Cuando alguien necesite recuperar el ritmo, podremos acompañarlo desde aquí.</p>')+'</section></div><details class="community-story"><summary>¿Cómo se reconoce la constancia?</summary><p>70% de asistencia a las sesiones previstas y 30% de ejercicios completados en los últimos 30 días. No se puntúa el peso ni la apariencia. Los empates comparten posición.</p></details><section class="community-story"><h3>Conoce el proceso de tu equipo</h3>'+entries.map(e=>card(e,'all')).join('')+'</section>';
 root.querySelectorAll('[data-community-id]').forEach(b=>b.onclick=()=>openCommunityProfile(Number(b.dataset.communityId)));
 document.querySelector('#progress-list').innerHTML='';
 document.querySelector('#progress-heading').textContent='Avanzamos juntos';
 document.querySelector('#screen-progress .screen-intro>p:last-child').textContent='Descubre la constancia de tus compañeros y acompaña a quienes retoman.';
 const average=scored.length?Math.round(scored.reduce((sum,e)=>sum+e.metric.attendance,0)/scored.length):null;
 document.querySelector('.progress-overview strong').textContent=average===null?'—':average+'%';
 document.querySelector('.ring span').textContent=average===null?'Sin datos':'30 días';
 document.querySelector('.ring').style.background='conic-gradient(var(--green) 0 '+(average||0)+'%,#ffffff15 '+(average||0)+'%)';
 document.querySelector('.hero-stat strong').textContent=String(scored.reduce((n,e)=>n+e.metric.completed,0));
 document.querySelector('.hero-stat span').innerHTML='sesiones<br>en 30 días';
 const stats=document.querySelectorAll('.metric-card');stats[0].querySelector('strong').textContent=students.length;stats[0].querySelector('p').textContent='Alumnos del equipo';stats[0].querySelector('small').textContent='En este dispositivo';stats[1].querySelector('strong').textContent=average===null?'—':average+'%';stats[1].querySelector('small').textContent='Según sesiones registradas';
 document.querySelector('#sessions-list').innerHTML='<p class="local-note">Consulta las rutinas asignadas en Entreno para registrar la próxima sesión.</p>';document.querySelector('#screen-home .section-heading .count').textContent=String(workoutPlans.filter(p=>p.active!==false).length);
 document.querySelector('#screen-home .section-heading h2').textContent='Seguimos en movimiento';
 const profileStats=document.querySelectorAll('.profile-stats strong');profileStats[0].textContent=students.length;profileStats[1].textContent=workoutPlans.filter(p=>p.active!==false).length;profileStats[2].textContent='Local';document.querySelectorAll('.profile-stats span')[2].textContent='Espacio actual';
 document.querySelector('.profile-note h3').textContent='Un espacio para acompañar';document.querySelector('.profile-note p').textContent='Cada alumno tiene objetivos y un ritmo propio.';
}
function openCommunityProfile(id){
 const s=students.find(s=>Number(s.id)===Number(id));if(!s)return;const m=workoutStudentMetrics(id);const previous=previousSessionCount(id);const delta=m.completed-previous;
 const sessions=workoutPlansForStudent(id).flatMap(p=>(p.sessions||[]).map(x=>({...x,plan:p.name}))).filter(s=>(s.completedExerciseIds||[]).length>0&&s.date<=workoutIsoDate(new Date())).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
 document.querySelector('#community-profile').innerHTML='<article class="detail-hero"><p class="label">PERFIL DE CONSTANCIA</p><h2>'+workoutEscape(s.name)+'</h2><p>Un proceso propio, un equipo que acompaña.</p></article><div class="community-stats"><div><strong>'+m.completed+'</strong><span>Sesiones · 30 días</span></div><div><strong>'+(m.attendance===null?'—':m.attendance+'%')+'</strong><span>Asistencia</span></div><div><strong>'+(m.exerciseRate===null?'—':m.exerciseRate+'%')+'</strong><span>Ejercicios completados</span></div></div><section class="community-story"><h3>El esfuerzo detrás del avance</h3><ul><li>'+(m.score===null?'Todavía no hay suficientes registros para calcular la constancia.':m.completed+' sesiones registradas de '+m.expected+' previstas; índice de constancia: '+m.score+'%.')+'</li><li>'+(previous? (delta>0?delta+' sesiones más que en los 30 días anteriores.':delta<0?'Un período con menos sesiones. Volver también es avanzar.':'Mantiene el número de sesiones del período anterior.'):'Aún no hay un período anterior con sesiones para comparar.')+'</li><li>Se reconoce la asistencia y el trabajo registrado, no se compara la apariencia de los alumnos.</li></ul></section><section class="community-story"><h3>Sus pasos recientes</h3>'+(sessions.length?'<ul>'+sessions.map(x=>'<li>'+workoutDateLabel(x.date)+' · '+x.completedExerciseIds.length+' de '+x.totalExercises+' ejercicios completados</li>').join('')+'</ul>':'<p>La primera sesión será el inicio de su historia.</p>')+'</section><p class="local-note">Esta vista muestra constancia. Las medidas, fotos y notas personales pertenecen a la ficha privada del coach. Compartir entre cuentas requiere conectar el servicio de usuarios.</p>';
 switchScreen('community-profile');
}
function addGoalsEdit(){
 const hero=document.querySelector('#student-detail .detail-hero');if(!hero||hero.querySelector('.goals-edit-button'))return;
 const b=document.createElement('button');b.type='button';b.className='goals-edit-button';b.textContent='Editar objetivos';b.onclick=()=>editStudentGoals(activeStudentId);hero.append(b);
}
function editStudentGoals(id){
 const s=students.find(s=>s.id===id);if(!s)return;const current=studentGoals(s);
 const dialog=document.createElement('dialog');dialog.className='dulus-dialog';
 dialog.innerHTML='<form><h2>Todos sus objetivos</h2><p>Selecciona varios y elige la prioridad actual.</p><div class="goal-options">'+DULUS_GOALS.map(g=>'<label class="goal-chip"><input type="checkbox" name="goals" value="'+workoutEscape(g)+'" '+(current.all.includes(g)?'checked':'')+'><span>'+workoutEscape(g)+'</span></label>').join('')+'</div><label>Otros objetivos (uno por línea)<textarea name="custom" maxlength="500">'+workoutEscape(current.all.filter(g=>!DULUS_GOALS.includes(g)).join('\n'))+'</textarea></label><label>Objetivo principal<select name="primary" required></select></label><p class="goal-form-message" role="status"></p><div class="dialog-actions"><button type="button" class="secondary-action" data-close>Cancelar</button><button type="submit" class="action-button">Guardar objetivos</button></div></form>';
 document.body.append(dialog);const form=dialog.querySelector('form'),select=form.elements.primary;
 const selected=()=>[...new Set([...form.querySelectorAll('input:checked')].map(x=>x.value).concat(form.elements.custom.value.split('\n').map(x=>x.trim()).filter(Boolean)))];
 const sync=()=>{const goals=selected(),previous=select.value||current.primary;select.innerHTML=goals.map(g=>'<option>'+workoutEscape(g)+'</option>').join('');select.value=goals.includes(previous)?previous:goals[0]||'';};
 form.addEventListener('input',sync);form.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove());
 form.onsubmit=async e=>{e.preventDefault();const goals=selected();if(!goals.length){form.querySelector('[role=status]').textContent='Selecciona al menos un objetivo.';return;}const updated={...s,goals,primaryGoal:select.value,goal:select.value};try{await DulusStorage.saveStudent(updated);Object.assign(s,updated);dialog.close();renderStudents();openStudent(s.id);}catch{form.querySelector('[role=status]').textContent='No se pudo guardar. Inténtalo de nuevo.';}};
 sync();dialog.showModal();
}
new MutationObserver(addGoalsEdit).observe(document.querySelector('#student-detail'),{childList:true});addGoalsEdit();renderCommunity();
