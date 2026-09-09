/* Rutinas, registro de sesiones y ranking de constancia. */
let workoutPlans = [];
let workoutPlanStudentId = null;
let workoutSessionPlanId = null;
const WORKOUT_DAY_LABELS = {0:'Dom',1:'Lun',2:'Mar',3:'Mié',4:'Jue',5:'Vie',6:'Sáb'};
const workoutEscape = value => String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const workoutIsoDate = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const workoutDateLabel = value => new Date(`${value}T00:00:00`).toLocaleDateString('es-DO',{day:'2-digit',month:'short'});
const workoutPlansForStudent = studentId => workoutPlans.filter(plan => Number(plan.studentId) === Number(studentId) && plan.active !== false);

const workoutExpectedCount = plan => {
  if (!plan.startDate || !plan.days?.length) return 0;
  const today = new Date(); today.setHours(0,0,0,0);
  const start = new Date(`${plan.startDate}T00:00:00`);
  const windowStart = new Date(today); windowStart.setDate(windowStart.getDate()-29);
  const from = start > windowStart ? start : windowStart;
  const todayCompleted = (plan.sessions||[]).some(session => session.date === workoutIsoDate(today));
  const to = new Date(today); if (!todayCompleted) to.setDate(to.getDate()-1);
  let expected = 0;
  for (const day = new Date(from); day <= to; day.setDate(day.getDate()+1)) if (plan.days.includes(day.getDay())) expected++;
  return expected;
};

const workoutPlanMetrics = plan => {
  const today = new Date(); today.setHours(0,0,0,0);
  const since = new Date(today); since.setDate(since.getDate()-29);
  const sessions = (plan.sessions||[]).filter(session => { const date = new Date(`${session.date}T00:00:00`); return date >= since && date <= today; });
  const expected = workoutExpectedCount(plan), completed = sessions.length;
  const attendance = expected ? Math.min(100,Math.round(completed/expected*100)) : (completed ? 100 : null);
  const totalExercises = sessions.reduce((sum,session)=>sum+(session.totalExercises||0),0);
  const doneExercises = sessions.reduce((sum,session)=>sum+(session.completedExerciseIds?.length||0),0);
  const exerciseRate = totalExercises ? Math.round(doneExercises/totalExercises*100) : (completed ? 0 : null);
  const score = attendance === null ? null : Math.round(attendance*.7 + (exerciseRate ?? 0)*.3);
  return {expected,completed,missed:Math.max(0,expected-completed),attendance,exerciseRate,score};
};
const workoutStudentMetrics = studentId => {
  const plans = workoutPlansForStudent(studentId);
  if (!plans.length) return {hasPlan:false,expected:0,completed:0,missed:0,attendance:null,exerciseRate:null,score:null};
  const metrics = plans.map(workoutPlanMetrics);
  const expected = metrics.reduce((sum,item)=>sum+item.expected,0), completed = metrics.reduce((sum,item)=>sum+item.completed,0);
  const missed = Math.max(0,expected-completed);
  const attendance = expected ? Math.min(100,Math.round(completed/expected*100)) : (completed ? 100 : null);
  let exerciseDone=0, exerciseTotal=0; const today=new Date(); today.setHours(0,0,0,0); const since=new Date(today); since.setDate(since.getDate()-29);
  plans.forEach(plan => (plan.sessions||[]).filter(session=>{const date=new Date(`${session.date}T00:00:00`);return date>=since&&date<=today;}).forEach(session => { exerciseDone += session.completedExerciseIds?.length||0; exerciseTotal += session.totalExercises||0; }));
  const exerciseRate = exerciseTotal ? Math.round(exerciseDone/exerciseTotal*100) : (completed ? 0 : null);
  const score = attendance === null ? null : Math.round(attendance*.7 + (exerciseRate ?? 0)*.3);
  return {hasPlan:true,expected,completed,missed,attendance,exerciseRate,score};
};

function workoutSection(student){
  const plans = workoutPlansForStudent(student.id);
  const cards = plans.length ? plans.map(plan => {
    const metric = workoutPlanMetrics(plan), days = plan.days.map(day=>WORKOUT_DAY_LABELS[day]).join(' · ');
    return `<article class="student-workout-card"><div><p class="label">${workoutEscape(days)}</p><h4>${workoutEscape(plan.name)}</h4><p>${plan.exercises.length} ejercicios · Inicio ${workoutDateLabel(plan.startDate)}</p></div><div class="workout-card-meta"><strong>${metric.attendance===null?'—':metric.attendance+'%'}</strong><span>constancia</span></div><button type="button" class="record-workout-session" data-workout-plan="${plan.id}">Registrar sesión</button></article>`;
  }).join('') : '<div class="workout-empty">Este alumno todavía no tiene una rutina asignada.</div>';
  return `<section class="student-workouts"><div class="measures-heading"><h3>🏋️ Rutinas y constancia</h3><button class="add-measurement" id="add-workout-plan" type="button">+ Crear rutina</button></div>${cards}</section>`;
}

function bindWorkoutSection(student){
  document.querySelector('#add-workout-plan')?.addEventListener('click',()=>openWorkoutPlanModal(student.id));
  document.querySelectorAll('[data-workout-plan]').forEach(button=>button.addEventListener('click',()=>openWorkoutSessionModal(Number(button.dataset.workoutPlan))));
}

const workoutEnsureUi = () => {
  if (document.querySelector('#workout-plan-modal')) return;
  document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="workout-plan-modal" aria-hidden="true"><div class="modal-panel workout-modal-panel"><div class="modal-heading"><div><p class="label">PROGRAMACIÓN</p><h2>Crear rutina</h2></div><button class="close-button" id="close-workout-plan" type="button">×</button></div><form id="workout-plan-form"><label>Nombre de la rutina<input id="workout-plan-name" type="text" placeholder="Ej. Fuerza 3 días" required></label><label>Fecha de inicio<input id="workout-plan-start" type="date" required></label><div><p class="workout-field-title">Días de entrenamiento</p><div class="workout-days">${[1,2,3,4,5,6,0].map(day=>`<label><input type="checkbox" name="workout-day" value="${day}"><span>${WORKOUT_DAY_LABELS[day]}</span></label>`).join('')}</div></div><div><p class="workout-field-title">Ejercicios</p><div class="workout-exercise-picker" id="workout-exercise-picker"></div></div><p class="workout-form-message" id="workout-plan-message"></p><div class="measurement-actions"><button class="secondary-action" id="cancel-workout-plan" type="button">Cancelar</button><button class="submit-student" type="submit">Guardar rutina</button></div></form></div></div>`);
  document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="workout-session-modal" aria-hidden="true"><div class="modal-panel workout-modal-panel"><div class="modal-heading"><div><p class="label">ENTRENAMIENTO</p><h2>Registrar sesión</h2></div><button class="close-button" id="close-workout-session" type="button">×</button></div><form id="workout-session-form"><label>Fecha<input id="workout-session-date" type="date" required></label><p class="workout-field-title">Marca los ejercicios completados</p><div class="workout-session-exercises" id="workout-session-exercises"></div><p class="workout-form-message" id="workout-session-message"></p><div class="measurement-actions"><button class="secondary-action" id="cancel-workout-session" type="button">Cancelar</button><button class="submit-student" type="submit">Guardar sesión</button></div></form></div></div>`);
  const closePlan=()=>workoutToggleModal('workout-plan-modal',false), closeSession=()=>workoutToggleModal('workout-session-modal',false);
  document.querySelector('#close-workout-plan').addEventListener('click',closePlan); document.querySelector('#cancel-workout-plan').addEventListener('click',closePlan);
  document.querySelector('#close-workout-session').addEventListener('click',closeSession); document.querySelector('#cancel-workout-session').addEventListener('click',closeSession);
  document.querySelector('#workout-plan-form').addEventListener('submit',saveWorkoutPlanFromForm);
  document.querySelector('#workout-session-form').addEventListener('submit',saveWorkoutSessionFromForm);
};

const workoutToggleModal = (id,open) => {
  const element=document.querySelector(`#${id}`); if(!element)return;
  element.classList.toggle('open',open); element.setAttribute('aria-hidden',String(!open));
};

const openWorkoutPlanModal = studentId => {
  workoutEnsureUi(); workoutPlanStudentId=studentId;
  const form=document.querySelector('#workout-plan-form'); form.reset();
  document.querySelector('#workout-plan-start').value=workoutIsoDate(new Date()); document.querySelector('#workout-plan-message').textContent='';
  document.querySelector('#workout-exercise-picker').innerHTML=EXERCISES.map(exercise=>`<article class="workout-pick" data-workout-exercise="${exercise.id}"><label><input type="checkbox" class="workout-exercise-check"><span><strong>${workoutEscape(exercise.name)}</strong><small>${workoutEscape(exercise.primaryMuscle)} · ${workoutEscape(exercise.equipment)}</small></span></label><div><input class="workout-sets" type="number" min="1" max="20" value="3" aria-label="Series"><span>×</span><input class="workout-reps" type="number" min="1" max="100" value="8" aria-label="Repeticiones"></div></article>`).join('');
  workoutToggleModal('workout-plan-modal',true); document.querySelector('#workout-plan-name').focus();
};

async function saveWorkoutPlanFromForm(event){
  event.preventDefault();
  const days=[...document.querySelectorAll('input[name="workout-day"]:checked')].map(input=>Number(input.value));
  const exercises=[...document.querySelectorAll('[data-workout-exercise]')].filter(row=>row.querySelector('.workout-exercise-check').checked).map(row=>({exerciseId:row.dataset.workoutExercise,sets:Number(row.querySelector('.workout-sets').value),reps:Number(row.querySelector('.workout-reps').value)}));
  const message=document.querySelector('#workout-plan-message');
  if(!days.length){message.textContent='Selecciona al menos un día de entrenamiento.';return;}
  if(!exercises.length){message.textContent='Selecciona al menos un ejercicio.';return;}
  const plan={id:Date.now(),studentId:workoutPlanStudentId,name:document.querySelector('#workout-plan-name').value.trim(),startDate:document.querySelector('#workout-plan-start').value,days,exercises,sessions:[],active:true,createdAt:new Date().toISOString()};
  await DulusStorage.saveWorkout(plan); workoutPlans.push(plan); workoutToggleModal('workout-plan-modal',false);
  const student=students.find(item=>Number(item.id)===Number(workoutPlanStudentId)); if(student)openStudent(student.id); renderTeamRanking();
}

const openWorkoutSessionModal = planId => {
  workoutEnsureUi(); workoutSessionPlanId=planId;
  const plan=workoutPlans.find(item=>Number(item.id)===Number(planId)); if(!plan)return;
  document.querySelector('#workout-session-date').value=workoutIsoDate(new Date()); document.querySelector('#workout-session-message').textContent='';
  document.querySelector('#workout-session-exercises').innerHTML=plan.exercises.map(item=>{const exercise=findExercise(item.exerciseId);return `<label class="workout-session-check"><input type="checkbox" value="${item.exerciseId}" checked><span><strong>${workoutEscape(exercise?.name||item.exerciseId)}</strong><small>${item.sets} × ${item.reps}</small></span></label>`}).join('');
  workoutToggleModal('workout-session-modal',true);
};

async function saveWorkoutSessionFromForm(event){
  event.preventDefault();
  const plan=workoutPlans.find(item=>Number(item.id)===Number(workoutSessionPlanId)); if(!plan)return;
  const date=document.querySelector('#workout-session-date').value, completedExerciseIds=[...document.querySelectorAll('#workout-session-exercises input:checked')].map(input=>input.value);
  const session={id:Date.now(),date,completedExerciseIds,totalExercises:plan.exercises.length};
  const existing=(plan.sessions||[]).findIndex(item=>item.date===date); if(existing>=0)plan.sessions[existing]=session;else plan.sessions=[...(plan.sessions||[]),session];
  await DulusStorage.saveWorkout(plan); workoutToggleModal('workout-session-modal',false);
  const student=students.find(item=>Number(item.id)===Number(plan.studentId)); if(student&&Number(activeStudentId)===Number(student.id))openStudent(student.id); renderTeamRanking();
}

const workoutRankCard=(student,metric,attention=false)=>`<article class="ranking-card ${attention?'attention':''}"><div class="ranking-avatar">${workoutEscape(student.initials||student.name.slice(0,2).toUpperCase())}</div><div><strong>${workoutEscape(student.name)}</strong><small>${metric.completed}/${metric.expected} sesiones · ${metric.exerciseRate??0}% ejercicios</small></div><b>${metric.score}%</b></article>`;

function renderTeamRanking(){
  const screen=document.querySelector('#screen-progress'); if(!screen)return;
  let root=document.querySelector('#team-ranking');
  if(!root){root=document.createElement('section');root.id='team-ranking';root.className='team-ranking';document.querySelector('.progress-overview')?.insertAdjacentElement('afterend',root);}
  const entries=students.map(student=>({student,metric:workoutStudentMetrics(student.id)})).filter(entry=>entry.metric.hasPlan&&entry.metric.score!==null);
  const top=[...entries].sort((a,b)=>b.metric.score-a.metric.score).slice(0,3), attention=[...entries].sort((a,b)=>a.metric.score-b.metric.score).slice(0,3);
  const empty='<div class="ranking-empty">Aún no hay suficientes sesiones registradas para calcular este ranking.</div>';
  root.innerHTML=`<div class="ranking-heading"><div><p class="label">ÚLTIMOS 30 DÍAS</p><h2>Ranking de constancia</h2></div><span>70% asistencia · 30% ejercicios</span></div><div class="ranking-columns"><section><h3>🔥 Top constancia</h3>${top.length?top.map(item=>workoutRankCard(item.student,item.metric)).join(''):empty}</section><section><h3>⚠️ Necesitan atención</h3>${attention.length?attention.map(item=>workoutRankCard(item.student,item.metric,true)).join(''):empty}</section></div>`;
  const average=entries.length?Math.round(entries.reduce((sum,item)=>sum+item.metric.attendance,0)/entries.length):null;
  const overview=document.querySelector('.progress-overview'); if(overview){overview.querySelector('strong').textContent=average===null?'—':`${average}%`;overview.querySelector('.ring span').textContent=average===null?'Sin datos':'30 días';}
}

const loadWorkoutPlans=async()=>{
  try{workoutPlans=await DulusStorage.getWorkouts();}catch(error){console.warn('No se pudieron cargar las rutinas.',error);workoutPlans=[];}
  renderTeamRanking();
};
workoutEnsureUi();
loadWorkoutPlans();
window.addEventListener('load',()=>setTimeout(renderTeamRanking,0));
