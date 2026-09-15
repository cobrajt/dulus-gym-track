(() => {
'use strict';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),teamId=params.get('team'),solo=params.get('solo')==='1',uuid=/^[0-9a-f-]{36}$/i,days=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const say=(s,bad=false)=>{$('team-status').textContent=s;$('team-status').classList.toggle('error',bad);};
if(!solo&&(!teamId||!uuid.test(teamId))){say('Abre un equipo o tu entrenamiento personal desde Cuenta y equipos.',true);return;}
if(!window.supabase){say('No se pudo cargar la conexión. Revisa internet y recarga.',true);return;}
const db=supabase.createClient('https://rnrciqyngdequkbmttxu.supabase.co','sb_publishable_LqmoY41LO5axFmitkS2_FQ_o7QlCROr',{auth:{storageKey:'dulus-account-v1'}});
if(solo){document.querySelector('.topbar .eyebrow').textContent='ENTRENAMIENTO PERSONAL';document.querySelector('.local-note').textContent='Tus rutinas, sesiones y progreso son tuyos. Si después te vinculas con un coach, conservarás este historial.';$('new-plan').textContent='Crear mi rutina';}
let currentUserId=null,coach=false,team=null,roster=[],plans=[],sessions=[],student=null,sessionPlan=null,chosen=new Map(),busy=false,reviewRenderId=0;
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(text,action,cls)=>{const n=el('button',text,cls);n.type='button';n.onclick=action;return n;};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
async function check(query){const {data,error}=await query;if(error)throw error;return data;}
async function run(action){if(busy)return;busy=true;const buttons=[...document.querySelectorAll('#team-content button')];buttons.forEach(b=>b.disabled=true);try{await action();}catch(e){say(/fetch|network/i.test(e.message)?'No hay conexión. No se guardó el cambio; vuelve a intentarlo.':e.message||'No se pudo completar.',true);}finally{busy=false;buttons.forEach(b=>b.disabled=false);}}
async function refresh(){
 const result=await db.auth.getUser();if(result.error||!result.data.user){$('team-content').hidden=true;throw Error('Inicia sesión desde Cuenta y equipos.');}
 const user=result.data.user;currentUserId=user.id;
 if(solo){const sid=await check(db.rpc('dulus_ensure_solo_student'));team={id:null,name:'Mi entrenamiento',owner_id:null};coach=false;roster=await check(db.from('dulus_students').select('*').eq('id',sid));}
 else{team=await check(db.from('dulus_teams').select('id,name,owner_id').eq('id',teamId).maybeSingle());if(!team){$('team-content').hidden=true;throw Error('No tienes acceso a este equipo.');}coach=team.owner_id===user.id;if(!coach)await check(db.rpc('dulus_open_student',{p_team:teamId}));roster=await check(db.from('dulus_students').select('*').eq('team_id',teamId).order('created_at'));}
 const ids=roster.map(s=>s.id);
 plans=ids.length?await check(db.from('dulus_plans').select('*').in('student_id',ids).order('created_at')):[];
 sessions=plans.length?await check(db.from('dulus_sessions').select('*').in('plan_id',plans.map(p=>p.id)).order('date',{ascending:false})):[];
 $('team-title').textContent=solo?'Mi entrenamiento':team.name;$('students-title').textContent=solo?'Mi perfil':coach?'Alumnos':'Mi seguimiento';$('invite-student').hidden=!coach||solo;$('team-content').hidden=false;
 $('team-students').replaceChildren();
 if(!roster.length)$('team-students').append(el('p',solo?'No se pudo preparar tu perfil personal.':'Tu equipo está vacío. Los alumnos aparecerán cuando acepten una invitación y abran el equipo.'));
 for(const s of roster)$('team-students').append(button(s.name,()=>openStudent(s.id),'team-student'));
 if(student&&roster.some(s=>s.id===student.id))openStudent(student.id);else if(!coach&&roster[0])openStudent(roster[0].id);else $('student-panel').hidden=true;
 say(solo?'Modo personal listo. Tus rutinas y sesiones se conservarán si más adelante te vinculas con un coach.':'Datos actualizados.');bridge?.sync();
}
function openStudent(id){if(student?.id!==id){trainingUI.close();$('plan-panel').hidden=true;$('session-panel').hidden=true;}student=roster.find(s=>s.id===id);if(!student)return;$('student-panel').hidden=false;$('student-title').textContent=student.name;$('student-goals').textContent=student.goals.length?student.goals.join(' · '):'Sin objetivos definidos';$('goals-input').value=student.goals.join('\n');$('goals-form').hidden=!(coach||solo);$('new-plan').hidden=!(coach||solo);
 $('student-plans').replaceChildren();const own=plans.filter(p=>p.student_id===id);
 if(!own.length)$('student-plans').append(el('p',solo?'Todavía no has creado rutinas.':'Todavía no hay rutinas asignadas.'));
 for(const p of own){
  const closed=!!p.end_date,future=!closed&&p.start_date>today(),card=el('article',undefined,'cloud-plan'),source=p.created_by?(p.created_by===student.user_id?(solo?'Creada por ti':coach?'Creada por el alumno':'Creada por ti'):(coach?'Creada por ti':'Creada por tu coach')):'';
  const state=closed?' · Hasta '+p.end_date+' · Versión anterior':future?' · Próxima versión':' · Activa';
  card.append(el('h3',p.name),el('p',p.days.map(d=>days[d]).join(' · ')+' · Desde '+p.start_date+state+(source?' · '+source:'')));
  const list=el('ul');
  for(const item of p.exercises){const e=EXERCISES.find(x=>x.id===item.exerciseId);const li=el('li',(e?.name||item.exerciseId)+' · '+item.sets+' × '+item.reps+(item.weightKg===undefined?'':item.weightKg===0?' · Sin carga añadida':' · '+item.weightKg+' kg'));if(e)li.append(technique(e));list.append(li);}
  card.append(list);const history=sessions.filter(s=>s.plan_id===p.id);card.append(el('p',history.length+' sesiones registradas'));const historyList=el('ul');history.slice(0,10).forEach(s=>historyList.append(el('li',s.date+' · '+s.completed_ids.length+' de '+s.total_exercises+' ejercicios')));
  const actions=el('div',undefined,'plan-version-actions');
  if(!closed&&!future)actions.append(button('Ver entrenamiento y registrar',()=>openSession(p.id)));
  if(!closed&&(coach||solo)&&p.created_by===currentUserId)actions.append(button('Editar rutina',()=>trainingUI.editPlan(p)));
  if(!closed&&p.supersedes_plan_id&&!history.length&&(coach||solo)&&p.created_by===currentUserId){const undo=button('Deshacer última versión',()=>{});let armed=false,timer=null;undo.onclick=()=>{if(!armed){armed=true;undo.textContent='Confirmar deshacer';clearTimeout(timer);timer=setTimeout(()=>{armed=false;undo.textContent='Deshacer última versión';},5000);return;}run(async()=>{await check(db.rpc('dulus_revert_plan_version',{p_plan:p.id}));await refresh();say('Última versión deshecha. La versión anterior vuelve a estar activa.');});};actions.append(undo);}
  if(closed)actions.append(el('small','Versión cerrada: conserva sus sesiones y no admite nuevos registros.'));else if(future)actions.append(el('small','Esta versión todavía no ha comenzado.'));
  card.append(historyList,actions);$('student-plans').append(card);
 }
 renderStudentReviews(id);initialAssessment?.render(student);measurements?.render(student);bodyAssessment?.render(student);bodyGoals?.render(student);performanceGoals?.render(student);coachDecisions?.render(student);
}
async function renderStudentReviews(id){
 const token=++reviewRenderId;if(!coach)return;const own=plans.filter(p=>p.student_id===id),ids=own.map(p=>p.id),host=$('student-plans'),wrap=el('section',undefined,'student-reviews');wrap.append(el('h3','Revisiones y mensajes del alumno'));const loading=el('p','Cargando revisiones…');wrap.append(loading);host.append(wrap);if(!ids.length){loading.textContent='Todavía no hay rutinas para revisar.';return;}
 try{const rows=await check(db.from('dulus_messages').select('*').in('plan_id',ids).order('created_at',{ascending:false}).limit(30));if(token!==reviewRenderId||student?.id!==id)return;wrap.replaceChildren(el('h3','Revisiones y mensajes del alumno'));if(!rows?.length){wrap.append(el('p','Todavía no hay videos ni mensajes enviados por este alumno.'));return;}for(const m of rows){const p=own.find(x=>x.id===m.plan_id),e=EXERCISES.find(x=>x.id===m.exercise_id),card=el('article',undefined,'cloud-plan review-card');card.append(el('strong',m.video_path?'🎥 Video de técnica para revisión':'💬 Mensaje'),el('p',(e?.name||m.exercise_id)+' · '+(p?.name||'Rutina')),el('p',m.body||''),el('small',new Date(m.created_at).toLocaleString('es')));if(m.video_path){const view=button('Ver video privado',async()=>{view.disabled=true;try{const data=await check(db.storage.from('dulus-technique').createSignedUrl(m.video_path,300));const v=el('video');v.controls=true;v.playsInline=true;v.src=data.signedUrl;v.style.width='100%';v.style.maxWidth='520px';card.append(v);view.remove();}catch{say('No se pudo abrir el video privado. Puede haber caducado.',true);view.disabled=false;}});card.append(view);}wrap.append(card);}}catch{loading.textContent='No se pudieron cargar las revisiones. Pulsa Actualizar para reintentar.';}
}
function technique(e){const details=el('details');details.append(el('summary','Ver técnica'));if(e.instructionLanguage==='en')details.append(el('p','Instrucciones originales en inglés.'));const list=el('ol');(e.instructions||[]).forEach(s=>list.append(el('li',s)));details.append(list);const photos=el('div',undefined,'exercise-photos');let images=e.media?.images||EXERCISE_MEDIA[e.id]?.images||[];for(const src of images.slice(0,2)){if(typeof src!=='string'||(!src.startsWith('./assets/')&&!src.startsWith('assets/')))continue;const img=el('img');img.src=src;img.alt=e.name;img.loading='lazy';photos.append(img);}details.append(photos);return details;}
$('refresh-team').onclick=()=>run(refresh);
$('invite-student').onclick=()=>run(async()=>{const code=await check(db.rpc('dulus_create_invitation',{p_team:teamId}));$('invite-result').textContent='Código de un solo uso (7 días): '+code;say('Invitación creada. El alumno la introduce en Cuenta y equipos.');});
$('goals-form').onsubmit=e=>{e.preventDefault();run(async()=>{const goals=[...new Set($('goals-input').value.split('\n').map(s=>s.trim()).filter(Boolean))];await check(db.from('dulus_students').update({goals}).eq('id',student.id).select('id').single());await refresh();say('Objetivos guardados en línea.');});};
for(const day of [1,2,3,4,5,6,0]){const l=el('label',days[day]),input=el('input');input.type='checkbox';input.value=day;l.prepend(input);$('plan-days').append(l);}
function openSession(id,exercise){const p=plans.find(p=>p.id===id);if(p)trainingUI.openSession(p,exercise);}
db.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){coachDecisions?.clear();initialAssessment?.clear();performanceGoals?.clear();bodyGoals?.clear();bodyAssessment?.clear();measurements?.clear();trainingUI.close();currentUserId=null;roster=[];plans=[];sessions=[];student=null;$('team-content').hidden=true;$('team-students').replaceChildren();$('student-plans').replaceChildren();say('Sesión cerrada. Vuelve a Cuenta y equipos para entrar.');}});
const measurements=window.DulusMeasurements?.create({db,check,say});
const bodyAssessment=window.DulusBodyAssessment?.create({db,check,say});
const bodyGoals=window.DulusBodyGoals?.create({db,check,say,coach:()=>coach});
const performanceGoals=window.DulusPerformanceGoals?.create({db,check,say,catalog:EXERCISES,getPlans:()=>plans,getSessions:()=>sessions});
const initialAssessment=window.DulusInitialAssessment?.create({db,check,say,coach:()=>coach});
const coachDecisions=window.DulusCoachDecisions?.create({db,check,say,coach:()=>coach,getPlans:()=>plans,getSessions:()=>sessions,catalog:EXERCISES,sync:()=>bridge?.sync()});
const bridge=window.DulusBridge?.create({db,user:()=>currentUserId,team:()=>solo?'solo-'+currentUserId:teamId,coach:()=>coach,solo:()=>solo,student:()=>student,roster:()=>roster,plans:()=>plans,catalog:EXERCISES,open:openSession,select:openStudent,reload:refresh});
const trainingUI=window.DulusTraining.create({bridge,getPlans:()=>plans,catalog:EXERCISES,technique,today,getUser:()=>currentUserId,getStudent:()=>student,isCoach:()=>coach||solo,isSolo:()=>solo,getSessions:()=>sessions,createPlans:rows=>check(db.from('dulus_plans').insert(rows)),replacePlan:args=>check(db.rpc('dulus_replace_plan_version',args)),recordSession:(args,details)=>check(db.rpc(details?'dulus_finish_session':'dulus_record_session',details?{...args,p_details:details}:args)),refresh,say});
run(refresh);
})();