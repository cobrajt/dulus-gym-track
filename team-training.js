/* Dulus: day-specific plans and guided workout. No credentials or account data stored here. */
(() => {
'use strict';
const $=id=>document.getElementById(id),names=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],order=[1,2,3,4,5,6,0];
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const btn=(text,fn)=>{const e=node('button',text);e.type='button';e.onclick=fn;return e;};
const field=(text,type,value)=>{const label=node('label',text),input=node('input');input.type=type;input.value=value;label.append(input);return {label,input};};
const safeRead=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
const safeWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
window.DulusTraining={create(api){
 const byId=new Map(api.catalog.map(e=>[e.id,e])),drafts=new Map();let active=null,saving=false,activePlan=null,saveSession=false,editingPlan=null;
 const form=$('plan-form'),panel=$('plan-panel'),picker=$('plan-picker'),tabs=node('div',undefined,'training-days'),planStatus=node('p'),planHeading=panel.querySelector('h2'),planSubmit=form.querySelector('.submit-student'),startLabel=$('plan-start').parentElement;
 const changeReasonLabel=node('label','Por qué cambias la rutina'),changeReason=node('textarea');changeReason.maxLength=1200;changeReason.rows=3;changeReason.placeholder='Ej.: ajustar volumen y selección de ejercicios tras revisar el progreso';changeReasonLabel.append(changeReason);changeReasonLabel.hidden=true;
 tabs.setAttribute('aria-label','Ejercicios por día');planStatus.setAttribute('role','status');planStatus.id='daily-plan-status';
 $('plan-days').after(tabs);startLabel.after(changeReasonLabel);form.prepend(planStatus);$('plan-name').maxLength=100;
 
 function plannerExtras(row,model,pick){
  const extra=node('details',undefined,'planner-notes');extra.append(node('summary','Notas, descansos y videoguía'));
  const note=node('textarea');note.maxLength=1000;note.value=model.coachNote||'';const noteLabel=api.isSolo?.()?'Notas para este ejercicio':'Notas de tu Coach';note.placeholder=noteLabel;note.setAttribute('aria-label',noteLabel);note.oninput=()=>model.coachNote=note.value;extra.append(note);
  for(const [key,label] of [['restSets','Descanso entre series (segundos)'],['restExercises','Descanso entre ejercicios (segundos)']]){const f=field(label,'number',model[key]||120);f.input.min='1';f.input.max='86400';f.input.step='1';f.input.oninput=()=>model[key]=Number(f.input.value);extra.append(f.label);}
  const guide=field('Videoguía propia · enlace HTTPS a MP4 o WebM','url',model.videoUrl||'');guide.input.placeholder='https://…';guide.input.oninput=()=>model.videoUrl=guide.input.value.trim();extra.append(guide.label,node('small','Usa únicamente videos propios o con permiso. Las fotos del catálogo siguen disponibles.'));row.append(extra);
 }
 function orderEditor(){const container=$('plan-selected');const map=selected();const entries=[...map];for(let i=0;i<entries.length;i++){const [id,item]=entries[i],r=node('div',undefined,'planner-order');r.draggable=true;r.append(node('span',(i+1)+'. '+(byId.get(id)?.name||id)));const move=target=>{if(target<0||target>=entries.length)return;const next=[...entries],entry=next.splice(i,1)[0];next.splice(target,0,entry);drafts.set(active,new Map(next));summary();renderPicker();};r.ondragstart=e=>e.dataTransfer.setData('text/plain',id);r.ondragover=e=>e.preventDefault();r.ondrop=e=>{e.preventDefault();const source=entries.findIndex(([key])=>key===e.dataTransfer.getData('text/plain'));if(source<0)return;const next=[...entries],entry=next.splice(source,1)[0];next.splice(i,0,entry);drafts.set(active,new Map(next));summary();renderPicker();};r.append(btn('↑',()=>move(i-1)),btn('↓',()=>move(i+1)));container.append(r);}}
 const templates=node('select');templates.setAttribute('aria-label','Plantilla de rutina');const reuse=btn('Usar como plantilla del día',()=>{const p=api.getPlans?.().find(p=>p.id===templates.value);if(!p||active===null){planStatus.textContent='Selecciona un día y una plantilla.';return;}for(const e of p.exercises)if(!selected().has(e.exerciseId))selected().set(e.exerciseId,{...structuredClone(e),weightKg:e.weightKg??0});summary();renderPicker();});
 $('plan-search').parentElement.before(templates,reuse);
 function loadTemplates(){templates.replaceChildren(node('option','Elige una rutina existente'));templates.firstChild.value='';for(const p of api.getPlans?.()||[]){const o=node('option',p.name);o.value=p.id;templates.append(o);}}

 const selectedDays=()=>order.filter(day=>$('plan-days').querySelector('input[value="'+day+'"]').checked);
 const selected=()=>{if(active===null)return new Map();if(!drafts.has(active))drafts.set(active,new Map());return drafts.get(active);};
 const recommender=node('section',undefined,'routine-recommender');recommender.append(node('h3','Sugerencia automática'),node('p','Elige el contexto y Dulus preparará una base editable. Revísala antes de asignarla.'));
 const recControls=node('div',undefined,'routine-recommender-controls');
 function selectControl(label,options){const box=node('label',label),select=node('select');for(const [value,text] of options){const o=node('option',text);o.value=value;select.append(o);}box.append(select);recControls.append(box);return select;}
 const recLevel=selectControl('Experiencia',[['Principiante','Principiante'],['Intermedio','Intermedio'],['Avanzado','Avanzado']]),recGoal=selectControl('Objetivo',[['muscle','Ganar músculo / tono'],['strength','Fuerza general'],['glutes','Énfasis glúteos y piernas'],['conditioning','Acondicionamiento / perder grasa']]),recEquipment=selectControl('Equipo',[['gym','Gimnasio completo'],['home','Casa básica'],['none','Sin equipamiento']]);
 const recButton=btn('Generar / reemplazar selección',generateRecommendation);recButton.className='recommend-routine';recControls.append(recButton);recommender.append(recControls,node('small','1–3 días: full body · 4 días: torso/pierna · 5–6 días: combinaciones torso/pierna y push-pull-legs cuando procede.'));$('plan-search').parentElement.before(recommender);
 const levelRank={Principiante:1,Intermedio:2,Avanzado:3},equipmentSets={gym:null,home:new Set(['Peso corporal','Sin equipamiento','Bandas','Mancuernas','Kettlebell']),none:new Set(['Peso corporal','Sin equipamiento'])};
 function splitForDays(n,goal){const full=goal==='glutes'?['Pecho','Espalda','Cuádriceps','Glúteos','Glúteos','Isquiotibiales','Core/Abdominales']:['Pecho','Espalda','Cuádriceps','Glúteos','Isquiotibiales','Core/Abdominales'];if(n<=3)return Array.from({length:n},()=>full);const upper=['Pecho','Espalda','Hombros','Bíceps','Tríceps','Core/Abdominales'],lower=[goal==='glutes'?'Glúteos':'Cuádriceps','Cuádriceps','Isquiotibiales','Glúteos','Pantorrillas','Core/Abdominales'],push=['Pecho','Hombros','Tríceps','Cuádriceps','Core/Abdominales'],pull=['Espalda','Bíceps','Isquiotibiales','Glúteos','Core/Abdominales'],legs=['Cuádriceps','Glúteos','Isquiotibiales','Pantorrillas','Core/Abdominales'];if(n===4)return [upper,lower,upper,lower];if(n===5)return [upper,lower,push,pull,legs];return [push,pull,legs,push,pull,legs];}
 function recommendationSettings(){return recGoal.value==='strength'?{sets:4,reps:6,restSets:150,restExercises:150}:recGoal.value==='conditioning'?{sets:3,reps:12,restSets:60,restExercises:75}:{sets:3,reps:10,restSets:90,restExercises:90};}
 function candidates(muscle,used){const allowed=equipmentSets[recEquipment.value],rank=levelRank[recLevel.value]||1;return api.catalog.filter(e=>e.primaryMuscle===muscle&&!used.has(e.id)&&levelRank[e.level]<=rank&&(!allowed||allowed.has(e.equipment)));}
 function generateRecommendation(){const ds=selectedDays();if(!ds.length){planStatus.textContent='Primero marca los días disponibles.';return;}const split=splitForDays(ds.length,recGoal.value),settings=recommendationSettings();drafts.clear();for(let i=0;i<ds.length;i++){const map=new Map(),used=new Set();for(let j=0;j<split[i].length;j++){const muscle=split[i][j],pool=candidates(muscle,used);if(!pool.length)continue;const e=pool[0];used.add(e.id);map.set(e.id,{exerciseId:e.id,...settings,weightKg:0,coachNote:'Sugerencia inicial de Dulus. Ajusta carga, descansos o ejercicio según el alumno.'});}drafts.set(ds[i],map);}active=ds[0];if(!$('plan-name').value.trim())$('plan-name').value=recGoal.selectedOptions[0].textContent+' · '+ds.length+' días';summary();renderPicker();planStatus.textContent='Sugerencia creada. Revisa y ajusta cada día antes de guardar.';}

 function summary(){const ds=selectedDays();$('plan-selected').textContent=ds.length?ds.map(d=>names[d]+': '+(drafts.get(d)?.size||0)+' ejercicios').join(' · '):'Selecciona al menos un día.';tabs.replaceChildren();for(const d of ds){const b=btn(names[d]+' ('+(drafts.get(d)?.size||0)+')',()=>{active=d;summary();renderPicker();});b.setAttribute('aria-pressed',String(d===active));b.disabled=saving;tabs.append(b);}orderEditor();}
 function renderPicker(){
  picker.replaceChildren();if(active===null){$('picker-count').textContent='Marca los días que quieres preparar.';return;}
  const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),q=norm($('plan-search').value),found=api.catalog.filter(e=>norm(e.name+' '+e.primaryMuscle+' '+e.equipment).includes(q)),map=selected();
  const visible=[...found.filter(e=>map.has(e.id)),...found.filter(e=>!map.has(e.id)).slice(0,24)];
  $('picker-count').textContent=names[active]+' · '+found.length+' coincidencias. Se muestran los seleccionados y hasta 24 más; usa la búsqueda para encontrar otros.';
  for(const e of visible){
   const row=node('div',undefined,'daily-exercise'),pick=field(e.name,'checkbox','');pick.input.checked=map.has(e.id);pick.label.className='daily-choice';pick.input.setAttribute('aria-label','Elegir '+e.name);
   const meta=node('p',e.primaryMuscle+' · '+e.equipment,'daily-meta'),controls=node('div',undefined,'daily-numbers');
   const model=map.get(e.id)||{exerciseId:e.id,sets:3,reps:10,weightKg:0};
   const inputs=[];
   for(const [key,label,min,max,step] of [['sets','Series',1,20,1],['reps','Repeticiones',1,100,1],['weightKg','Peso (kg)',0,1000,0.5]]){
    const f=field(label,'number',model[key]??0);Object.assign(f.input,{min:String(min),max:String(max),step:String(step),required:true,disabled:!pick.input.checked||saving});
    f.input.setAttribute('aria-label',label+' · '+e.name);f.input.oninput=()=>{model[key]=f.input.value===''?null:Number(f.input.value);};inputs.push(f.input);controls.append(f.label);
   }
   pick.input.disabled=saving;pick.input.onchange=()=>{if(pick.input.checked){if(map.size>=100){pick.input.checked=false;planStatus.textContent='Máximo 100 ejercicios por día.';return;}map.set(e.id,model);}else map.delete(e.id);inputs.forEach(i=>i.disabled=!pick.input.checked);row.classList.toggle('selected',pick.input.checked);summary();};
   row.classList.toggle('selected',pick.input.checked);row.append(pick.label,meta,controls,api.technique(e));plannerExtras(row,model,pick);picker.append(row);
  }
 }
 $('plan-days').onchange=()=>{const ds=selectedDays();if(!ds.includes(active))active=ds[0]??null;summary();renderPicker();};
 $('plan-search').oninput=renderPicker;
 function addDay(date,days=1){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
 function lockDays(day=null){for(const input of $('plan-days').querySelectorAll('input')){input.checked=day===null?false:Number(input.value)===day;input.disabled=day!==null;}}
 function resetPlannerMode(){editingPlan=null;planHeading.textContent='Crear rutina';planSubmit.textContent='Guardar rutina';startLabel.firstChild.nodeValue='Comenzar el';changeReason.value='';changeReason.required=false;changeReasonLabel.hidden=true;lockDays(null);$('plan-start').min='';}
 function editPlan(plan){
  if(!api.isCoach()||!api.getStudent()||plan.created_by!==api.getUser())return;
  if(plan.end_date){api.say('Esta versión ya está cerrada. Edita la versión activa.');return;}
  if(!(plan.days||[]).length){api.say('Esta rutina no tiene días válidos.');return;}
  editingPlan=plan;form.reset();loadTemplates();drafts.clear();const day=plan.days[0];active=day;drafts.set(day,new Map((plan.exercises||[]).map(x=>[x.exerciseId,{...structuredClone(x),weightKg:x.weightKg??0}])));lockDays(day);
  const last=(api.getSessions?.()||[]).filter(s=>s.plan_id===plan.id).map(s=>s.date).sort().at(-1),minDate=[api.today(),plan.start_date,last?addDay(last):api.today()].sort().at(-1);
  planHeading.textContent='Editar rutina · nueva versión';planSubmit.textContent='Guardar nueva versión';startLabel.firstChild.nodeValue='Aplicar cambios desde';$('plan-name').value=plan.name;$('plan-start').min=minDate;$('plan-start').value=minDate;changeReasonLabel.hidden=!!api.isSolo?.();changeReason.required=!api.isSolo?.();const scheduleText=(plan.days||[]).map(d=>names[d]).join(' · ');planStatus.textContent=(plan.days.length>1?'Calendario '+scheduleText+' preservado. Edita aquí los ejercicios compartidos. ':'')+'La versión anterior conservará sus sesiones. Esta nueva versión empezará desde la fecha indicada.';panel.hidden=false;summary();renderPicker();$('plan-name').focus();
 }
 $('new-plan').onclick=()=>{if(!api.isCoach()||!api.getStudent())return;resetPlannerMode();form.reset();loadTemplates();drafts.clear();active=null;planStatus.textContent='Elige los días. Cada día conserva su propia selección; 0 kg significa sin carga añadida.';$('plan-start').value=api.today();panel.hidden=false;summary();renderPicker();$('plan-name').focus();};
 $('cancel-plan').onclick=()=>{if(!saving){panel.hidden=true;resetPlannerMode();drafts.clear();active=null;}};
 form.onsubmit=async event=>{
  event.preventDefault();if(saving)return;planStatus.textContent='';
  const ds=selectedDays(),title=$('plan-name').value.trim(),date=$('plan-start').value,student=api.getStudent();
  if(!api.isCoach()||!student)return;
  if(!ds.length||!title||!date){planStatus.textContent='Escribe el nombre, la fecha y selecciona los días.';return;}
  if(editingPlan){
   const day=editingPlan.days[0],exercises=[...(drafts.get(day)?.values()||[])];
   if(ds.length!==1||ds[0]!==day){planStatus.textContent='La edición conserva el día original de esta versión.';return;}
   if(!exercises.length){planStatus.textContent='Selecciona al menos un ejercicio para '+names[day]+'.';return;}
   if(exercises.some(x=>!Number.isInteger(x.sets)||x.sets<1||x.sets>20||!Number.isInteger(x.reps)||x.reps<1||x.reps>100||typeof x.weightKg!=='number'||!Number.isFinite(x.weightKg)||x.weightKg<0||x.weightKg>1000)){planStatus.textContent='Revisa series, repeticiones y peso.';return;}
   if(exercises.some(x=>[x.restSets??120,x.restExercises??120].some(n=>!Number.isInteger(n)||n<1||n>86400)||(x.videoUrl&&!/^https:\/\//i.test(x.videoUrl)))){planStatus.textContent='Revisa los descansos y el enlace HTTPS del video.';return;}
   if(!api.isSolo?.()&&changeReason.value.trim().length<3){planStatus.textContent='Explica brevemente por qué cambias la rutina.';changeReason.focus();return;}
   saving=true;const controls=[...form.querySelectorAll('input,button,textarea,select')],disabled=controls.map(e=>e.disabled);controls.forEach(e=>e.disabled=true);planStatus.textContent='Creando nueva versión…';
   try{await api.replacePlan({p_plan:editingPlan.id,p_name:title,p_exercises:exercises,p_effective:date,p_reason:changeReason.value.trim()});panel.hidden=true;drafts.clear();resetPlannerMode();await api.refresh();api.say(api.isSolo?.()?'Nueva versión de tu rutina guardada.':'Nueva versión guardada sin alterar el historial anterior.');}
   catch(e){planStatus.textContent=e.message||'No se pudo guardar la nueva versión. Tus cambios siguen aquí.';}
   finally{saving=false;controls.forEach((e,i)=>e.disabled=disabled[i]);}
   return;
  }
  const rows=[];for(const day of ds){const exercises=[...(drafts.get(day)?.values()||[])];if(!exercises.length){active=day;summary();renderPicker();planStatus.textContent='Selecciona al menos un ejercicio para '+names[day]+'.';return;}
   if(exercises.some(x=>!Number.isInteger(x.sets)||x.sets<1||x.sets>20||!Number.isInteger(x.reps)||x.reps<1||x.reps>100||typeof x.weightKg!=='number'||!Number.isFinite(x.weightKg)||x.weightKg<0||x.weightKg>1000)){active=day;summary();renderPicker();planStatus.textContent='Revisa series, repeticiones y peso de '+names[day]+'.';return;}
   if(exercises.some(x=>[x.restSets??120,x.restExercises??120].some(n=>!Number.isInteger(n)||n<1||n>86400)||(x.videoUrl&&!/^https:\/\//i.test(x.videoUrl)))){planStatus.textContent='Revisa los descansos y el enlace HTTPS del video.';return;}
   rows.push({student_id:student.id,name:title+' · '+names[day],start_date:date,days:[day],exercises});
  }
  saving=true;const controls=[...form.querySelectorAll('input,button')],disabled=controls.map(e=>e.disabled);controls.forEach(e=>e.disabled=true);planStatus.textContent='Guardando los días…';
  try{await api.createPlans(rows);panel.hidden=true;drafts.clear();await api.refresh();api.say(api.isSolo?.()?'Rutina personal guardada.':'Rutina por días guardada y asignada al alumno.');}
  catch(e){planStatus.textContent=e.message||'No se pudo guardar. Tu selección sigue aquí.';}
  finally{saving=false;controls.forEach((e,i)=>e.disabled=disabled[i]);}
 };
 let exerciseIndex=0,seriesDone={};
 const sessionPanel=$('session-panel'),sessionForm=$('session-form'),sessionDate=$('session-date'),exerciseList=$('session-exercises'),sessionStatus=node('p');
 sessionStatus.id='workout-status';sessionStatus.setAttribute('role','status');sessionForm.prepend(sessionStatus);
 const timer=node('section',undefined,'rest-timer'),clock=node('output','02:00','rest-clock'),timerStatus=node('p','Elige un descanso para comenzar.'),duration=field('Duración del descanso (segundos)','number',120);
 duration.input.min='1';duration.input.max='86400';duration.input.step='1';duration.input.id='rest-seconds';clock.setAttribute('aria-label','Tiempo de descanso restante');timerStatus.setAttribute('role','status');
 let remaining=120,deadline=0,interval=null,audio=null,preferences={sound:true,vibration:true},prefsKey='',exerciseSeconds=120,restKind='setRest';
 const pause=btn('Pausar',()=>{if(!deadline)return;remaining=Math.max(0,(deadline-Date.now())/1000);stop();timerStatus.textContent='Descanso en pausa.';paint();});
 const start=btn('Iniciar / continuar',()=>startTimer(remaining||Number(duration.input.value)));
 const reset=btn('Reiniciar',()=>{stop();remaining=validSeconds();paint();timerStatus.textContent='Temporizador reiniciado.';});
 const settings=node('details',undefined,'training-preferences');settings.append(node('summary','Ajustes del entrenamiento'));
 const sound=field('Sonido al terminar el descanso','checkbox',''),vibration=field('Vibración al terminar el descanso','checkbox','');sound.label.className=vibration.label.className='daily-choice';
 const setRest=field('Mi descanso entre series (segundos)','number',120),nextRest=field('Mi descanso entre ejercicios (segundos)','number',120);
 for(const f of [setRest,nextRest]){f.input.min='1';f.input.max='86400';f.input.step='1';}
 settings.append(sound.label,vibration.label,setRest.label,nextRest.label,node('p','Estos ajustes se guardan en este dispositivo. La vibración depende del navegador y del teléfono. Mantén esta pantalla abierta para recibir los avisos.'));
 function loadPreferences(){prefsKey='dulus-training-settings:'+api.getUser();const stored=safeRead(prefsKey)||{};preferences={sound:stored.sound!==false,vibration:stored.vibration!==false,setRest:stored.setRest,exerciseRest:stored.exerciseRest};sound.input.checked=preferences.sound;vibration.input.checked=preferences.vibration;setRest.input.value=preferences.setRest||restDefault('setRest');nextRest.input.value=preferences.exerciseRest||restDefault('exerciseRest');}
 function storePreferences(){preferences.sound=sound.input.checked;preferences.vibration=vibration.input.checked;for(const [key,f] of [['setRest',setRest],['exerciseRest',nextRest]]){if(f.input.checkValidity())preferences[key]=Number(f.input.value);}if(!safeWrite(prefsKey,preferences))timerStatus.textContent='El navegador no permite guardar los ajustes; se aplicarán mientras estés aquí.';}
 sound.input.onchange=vibration.input.onchange=setRest.input.onchange=nextRest.input.onchange=storePreferences;
 async function unlockAudio(){if(!preferences.sound)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(AC){audio=audio||new AC();if(audio.state==='suspended')await audio.resume();}}catch{}}
 function notify(){if(preferences.vibration&&typeof navigator.vibrate==='function')navigator.vibrate([180,100,180]);if(preferences.sound&&audio?.state==='running'){try{const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);osc.frequency.value=740;gain.gain.setValueAtTime(0.12,audio.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.5);osc.start();osc.stop(audio.currentTime+0.5);}catch{}}}
 function stop(){clearInterval(interval);interval=null;deadline=0;}
 function paint(){const secs=Math.max(0,Math.ceil(remaining));clock.textContent=String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0');pause.disabled=!deadline;}
 function tick(){if(!deadline)return;remaining=Math.max(0,(deadline-Date.now())/1000);paint();if(remaining<=0){stop();paint();timerStatus.textContent='Descanso terminado. Continúa cuando estés preparado.';notify();}}
 function restDefault(kind){const item=activePlan?.exercises[exerciseIndex];return Number(kind==='setRest'?item?.restSets:item?.restExercises)||120;}
 function validSeconds(){const n=Number(duration.input.value);return Number.isFinite(n)&&n>=1&&n<=86400?n:120;}
 function startTimer(seconds){if(!Number.isFinite(seconds)||seconds<1||seconds>86400){timerStatus.textContent='Elige entre 1 y 86400 segundos.';return;}unlockAudio();stop();remaining=seconds;deadline=Date.now()+seconds*1000;timerStatus.textContent='Descansando…';paint();interval=setInterval(tick,200);}
 duration.input.onchange=()=>{if(!duration.input.reportValidity())return;const running=!!deadline;preferences[restKind]=Number(duration.input.value);(restKind==='setRest'?setRest:nextRest).input.value=duration.input.value;storePreferences();stop();remaining=validSeconds();if(running)startTimer(remaining);else paint();};
 const presets=node('div',undefined,'timer-actions');
 presets.append(btn('Descanso entre series',()=>{restKind='setRest';const n=preferences.setRest||restDefault('setRest');duration.input.value=n;startTimer(n);}),btn('Descanso entre ejercicios',()=>{restKind='exerciseRest';const n=preferences.exerciseRest||exerciseSeconds;duration.input.value=n;startTimer(n);}));
 const timerActions=node('div',undefined,'timer-actions');timerActions.append(start,pause,reset);
 timer.append(node('h3','Descanso'),node('p','Sugerencia inicial: 2 minutos entre series y al cambiar de ejercicio. Puedes adaptarlo según tu objetivo y recuperación.'),clock,presets,duration.label,timerActions,timerStatus,settings);
 sessionForm.before(timer);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')tick();});
 const helper=node('p','Marca el círculo al completar cada serie. Las series en curso se conservan en este dispositivo; al guardar, los ejercicios completados quedarán en tu historial.');exerciseList.after(helper);
 const adjust=node('details',undefined,'guided-adjust');adjust.append(node('summary','Personalizar descanso y avisos'),node('p','Sugerencia inicial: 2 minutos. Ajusta el tiempo según tus necesidades o las indicaciones de tu coach.'),presets,duration.label,timerActions,settings);
 timer.replaceChildren(clock,timerStatus);timer.classList.add('guided-timer');clock.setAttribute('aria-live','off');timer.append(node('p','Tiempo recomendado: 2 minutos. Ajustable según tu plan.','rest-recommended'),duration.label,start,pause);sessionPanel.classList.add('guided-session');
 $('cancel-session').textContent='Volver a mis rutinas';
 
 function draftKey(){return 'dulus-workout-draft:'+api.getUser()+':'+activePlan.id+':'+sessionDate.value;}

 function setCount(item){return Math.max(1,Math.min(20,Number(item.sets)||1));}
 function completion(){return activePlan.exercises.filter(item=>(seriesDone[item.exerciseId]||[]).length===setCount(item)).map(item=>item.exerciseId);}
 function persistSeries(){return safeWrite(draftKey(),{version:2,series:seriesDone});}
 function updateProgress(){const item=activePlan.exercises[exerciseIndex],n=(seriesDone[item.exerciseId]||[]).length;sessionStatus.textContent=n+' de '+setCount(item)+' series de este ejercicio · '+completion().length+' de '+activePlan.exercises.length+' ejercicios completados.';}
 function navigateExercise(step){
  if(saveSession)return;const target=exerciseIndex+step;if(target<0){$('cancel-session').click();return;}if(target>=activePlan.exercises.length)return;
  const done=(seriesDone[activePlan.exercises[exerciseIndex].exerciseId]||[]).length===setCount(activePlan.exercises[exerciseIndex]);const keepRest=step>0&&done; if(!keepRest)stop();exerciseIndex=target;renderExercise();
  if(!keepRest){remaining=validSeconds();paint();timerStatus.textContent='Elige un descanso o completa una serie.';}
 }
 function renderExercise(){
  exerciseList.replaceChildren();if(!activePlan)return;
  const item=activePlan.exercises[exerciseIndex],exercise=byId.get(item.exerciseId),name=exercise?.name||item.exerciseId,row=node('article',undefined,'guided-exercise');
  const weight=item.weightKg===undefined?'Peso no indicado':item.weightKg===0?'Sin carga añadida':item.weightKg+' kg';
  row.append(node('p','Ejercicio '+(exerciseIndex+1)+' de '+activePlan.exercises.length,'guided-counter'),node('h3',name),node('p',setCount(item)+' series · '+item.reps+' repeticiones · '+weight,'guided-prescription'));
  const media=node('div',undefined,'guided-demo'),technique=exercise?api.technique(exercise):null,photos=technique?.querySelector('.exercise-photos');
  if(photos?.children.length){media.append(photos);for(const img of photos.querySelectorAll('img')){img.loading='eager';}}
  else media.append(node('p','Sin imagen disponible para este ejercicio. Consulta las indicaciones técnicas del ejercicio.'));
  media.setAttribute('aria-label','Demostración de '+name);if(item.videoUrl&&/^https:\/\//i.test(item.videoUrl)){const video=node('video');Object.assign(video,{src:item.videoUrl,controls:true,loop:true,muted:true,autoplay:true,playsInline:true});video.onerror=()=>{video.remove();media.append(node('p','No se pudo cargar la videoguía. Consulta las fotos y las notas.'));};media.prepend(video);}
  row.append(media);const coachNote=node('aside',undefined,'coach-note');coachNote.append(node('strong',api.isSolo?.()?'Mis notas':'Notas de tu Coach'),node('p',item.coachNote||(api.isSolo?.()?'Sin notas personales para este ejercicio.':'Tu coach todavía no ha añadido notas para este ejercicio.')));row.append(coachNote);if(technique)row.append(technique);
  const navigation=node('div',undefined,'guided-navigation'),previous=btn('←',()=>navigateExercise(-1)),next=btn('→',()=>navigateExercise(1));
  previous.setAttribute('aria-label',exerciseIndex===0?'Volver a mis rutinas':'Ejercicio anterior');next.setAttribute('aria-label','Siguiente ejercicio');previous.disabled=saveSession;next.disabled=exerciseIndex===activePlan.exercises.length-1;navigation.append(previous,timer,next);row.append(navigation);
  const stars=node('div',undefined,'guided-series');stars.setAttribute('aria-label','Series de '+name);
  const selected=new Set(seriesDone[item.exerciseId]||[]);
  for(let i=0;i<setCount(item);i++){
   const line=node('div',undefined,'guided-series-line'),star=btn(selected.has(i)?'✓':String(i+1),()=>{
    if(saveSession)return;const was=selected.has(i);if(was)selected.delete(i);else selected.add(i);seriesDone[item.exerciseId]=[...selected].sort((a,b)=>a-b);const saved=persistSeries();renderExercise();
    if(!was&&selected.size<setCount(item)){restKind='setRest';const secs=preferences.setRest||restDefault('setRest');duration.input.value=secs;startTimer(secs);}
    else if(!was&&exerciseIndex<activePlan.exercises.length-1){restKind='exerciseRest';const secs=preferences.exerciseRest||restDefault('exerciseRest');duration.input.value=secs;startTimer(secs);timerStatus.textContent='Descanso antes del siguiente ejercicio.';}
    else{stop();remaining=validSeconds();paint();timerStatus.textContent=was?'Serie desmarcada.':'Ejercicio completado. Puedes pasar al siguiente.';}
    if(!saved)sessionStatus.textContent+=' El navegador no pudo conservar el avance; evita cerrar esta página.';
    exerciseList.querySelectorAll('.series-check')[i]?.focus();
   });
   star.className='series-check';star.setAttribute('aria-pressed',String(selected.has(i)));star.setAttribute('aria-label','Serie '+(i+1)+' de '+name);star.disabled=saveSession;
   line.append(star,node('span','Serie '+(i+1)),node('strong',item.reps+' reps'),node('span',weight,'series-weight'));stars.append(line);
  }
  const complete=btn(selected.size===setCount(item)?'Ejercicio completado':'✓ Serie completada',()=>{exerciseList.querySelector('.series-check[aria-pressed=false]')?.click();});complete.className='complete-next-set';complete.disabled=saveSession||selected.size===setCount(item);const rec=timer.querySelector('.rest-recommended');if(rec)rec.textContent=item.restSets||item.restExercises?(api.isSolo?.()?'Tu plan recomienda: ':'Tu coach recomienda: ')+(item.restSets||120)+' s entre series · '+(item.restExercises||120)+' s entre ejercicios.':api.isSolo?.()?'Tiempo recomendado: 2 minutos. Ajustable según tu plan.':'Tiempo recomendado: 2 minutos. Ajustable según tu coach.';row.append(complete,stars,adjust);if(api.bridge)row.append(api.bridge.exerciseView(activePlan,item));exerciseList.append(row);updateProgress();paint();
 }
 const feedbackHolder=node('div');exerciseList.parentElement.insertBefore(feedbackHolder,sessionForm.querySelector('.submit-student'));
 function renderSession(){
  if(!activePlan)return;stop();restKind='setRest';duration.input.value=preferences.setRest||restDefault('setRest');remaining=validSeconds();paint();exerciseIndex=0;seriesDone={};
  const draft=safeRead(draftKey()),done=new Set(Array.isArray(draft)?draft:[]);
  for(const item of activePlan.exercises){
   const saved=draft?.version===2&&Array.isArray(draft.series?.[item.exerciseId])?draft.series[item.exerciseId]:null;
   seriesDone[item.exerciseId]=saved?[...new Set(saved.filter(i=>Number.isInteger(i)&&i>=0&&i<setCount(item)))]:done.has(item.exerciseId)?Array.from({length:setCount(item)},(_,i)=>i):[];
  }
  api.bridge?.open(activePlan,sessionDate.value);timerStatus.textContent='Elige un descanso o completa una serie.';feedbackHolder.replaceChildren();if(api.bridge)feedbackHolder.append(api.bridge.feedbackView());renderExercise();
  if(draft)sessionStatus.textContent+=' Retomaste tu entrenamiento pendiente.';
  else if(api.getSessions().some(s=>s.plan_id===activePlan.id&&s.date===sessionDate.value))sessionStatus.textContent+=' Nuevo inicio sin marcas. Al guardar actualizarás el registro de esta fecha.';
 }
 sessionDate.onchange=renderSession;
 $('cancel-session').onclick=()=>{if(saveSession)return;api.bridge?.close();stop();sessionPanel.hidden=true;$('team-content').classList.remove('training-active');};
 sessionForm.onsubmit=async event=>{
  event.preventDefault();if(saveSession||!activePlan)return;if(!sessionDate.reportValidity())return;const completed=completion();if(!completed.length){sessionStatus.textContent='Completa las series de al menos un ejercicio antes de guardar.';return;}
  const plan=activePlan,date=sessionDate.value,key=draftKey();saveSession=true;const controls=[...sessionForm.querySelectorAll('input,button')];controls.forEach(e=>e.disabled=true);sessionStatus.textContent='Guardando sesión…';
  try{await api.recordSession({p_plan:plan.id,p_date:date,p_completed:completed},api.bridge?.snapshot(completed));api.bridge?.saved();try{if(activePlan.exercises.some(item=>{const n=(seriesDone[item.exerciseId]||[]).length;return n>0&&n<setCount(item);}))persistSeries();else localStorage.removeItem(key);}catch{}stop();await api.refresh();sessionStatus.textContent='Sesión guardada en línea: '+completed.length+' ejercicios. '+(api.isSolo?.()?'Tu progreso ya está actualizado.':'Tu coach puede verla al actualizar.');api.say('Sesión guardada en línea.');}
  catch(e){sessionStatus.textContent=e.message||'No se pudo guardar. Conservamos tus marcas para reintentar.';}
  finally{saveSession=false;controls.forEach(e=>e.disabled=false);const arrows=exerciseList.querySelectorAll('.guided-navigation>button');if(arrows.length===2){arrows[0].disabled=false;arrows[1].disabled=exerciseIndex===activePlan.exercises.length-1;}paint();}
 };
 return {editPlan,openSession(plan,targetExercise){if(saveSession)return;stop();activePlan=plan;loadPreferences();$('session-title').textContent='Mi entrenamiento · '+plan.name;sessionDate.value=api.today();sessionDate.min=plan.start_date;sessionDate.max=api.today();sessionPanel.hidden=false;$('team-content').classList.add('training-active');renderSession();if(targetExercise){exerciseIndex=Math.max(0,plan.exercises.findIndex(e=>e.exerciseId===targetExercise));renderExercise();}sessionPanel.scrollIntoView({behavior:'smooth',block:'start'});},close(){api.bridge?.close();stop();sessionPanel.hidden=true;$('team-content').classList.remove('training-active');activePlan=null;},dispose(){stop();audio?.close().catch(()=>{});}};
}};
})();