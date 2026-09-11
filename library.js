/* Biblioteca, personalización y cargador de módulos de Dulus Gym Track. */
const exerciseState={query:'',muscle:'',weighted:'',equipment:'Todos'};
const visualStyle=document.createElement('link');visualStyle.rel='stylesheet';visualStyle.href='visuals.css';document.head.appendChild(visualStyle);
const escapeExerciseText=value=>String(value??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const findExercise=id=>EXERCISES.find(x=>String(x.id)===String(id));
const filteredExercises=()=>EXERCISES.filter(x=>{const q=exerciseState.query.toLocaleLowerCase('es'),text=`${x.name} ${x.alternativeName} ${x.primaryMuscle} ${x.equipment}`.toLocaleLowerCase('es');return(!q||text.includes(q))&&(!exerciseState.muscle||x.primaryMuscle===exerciseState.muscle)&&(!exerciseState.weighted||String(x.weighted)===exerciseState.weighted)&&(exerciseState.equipment==='Todos'||x.equipment===exerciseState.equipment)});
const exerciseCard=x=>`<button class="exercise-card" type="button" data-exercise-id="${x.id}"><span class="exercise-card-icon">${x.weighted?'◈':'○'}</span><span class="exercise-card-copy"><strong>${escapeExerciseText(x.name)}</strong><small>${escapeExerciseText(x.primaryMuscle)} · ${escapeExerciseText(x.equipment)}</small></span><span class="exercise-card-level ${x.level.toLowerCase()}">${escapeExerciseText(x.level)}</span><span class="exercise-card-arrow">›</span></button>`;
function renderEquipmentFilters(){document.querySelector('#equipment-filters').innerHTML=EXERCISE_EQUIPMENT.map(x=>`<button class="equipment-chip${exerciseState.equipment===x?' active':''}" type="button" data-equipment="${x}">${x}</button>`).join('');document.querySelectorAll('[data-equipment]').forEach(b=>b.onclick=()=>{exerciseState.equipment=b.dataset.equipment;renderExerciseLibrary()})}
function renderExerciseLibrary(){const list=filteredExercises();document.querySelector('#exercise-count').textContent=`${list.length} ${list.length===1?'ejercicio encontrado':'ejercicios encontrados'}`;document.querySelector('#exercise-list').innerHTML=list.length?list.map(exerciseCard).join(''):'<div class="exercise-empty">No encontramos ejercicios con esos filtros. Prueba otra búsqueda.</div>';document.querySelectorAll('[data-exercise-id]').forEach(b=>b.onclick=()=>openExerciseDetail(b.dataset.exerciseId));renderEquipmentFilters()}
const listMarkup=items=>`<ul class="exercise-detail-list">${items.map(x=>`<li>${escapeExerciseText(x)}</li>`).join('')}</ul>`;
const detailSection=(title,items)=>`<section class="exercise-detail-section"><h3>${title}</h3>${listMarkup(items)}</section>`;

function exerciseVisualType(x){
  const id=x.id;
  if(/press-banca|flexiones|aperturas/.test(id))return'press';
  if(/dominadas|jalon|colgar/.test(id))return'pullup';
  if(/remo|face-pull/.test(id))return'row';
  if(/press-militar/.test(id))return'overhead';
  if(/elevaciones-laterales/.test(id))return'lateral';
  if(/curl-barra|curl-martillo|curl-band|curl-muneca/.test(id))return'curl';
  if(/fondos-banco|extension-polea|press-frances/.test(id))return'triceps';
  if(/zancadas/.test(id))return'lunge';
  if(/sentadilla-barra|sentadilla-goblet|prensa-piernas/.test(id))return'squat';
  if(/peso-muerto-rumano/.test(id))return'hinge';
  if(/hip-thrust|puente-talones|patada-gluteo/.test(id))return'hip';
  if(/curl-femoral/.test(id))return'legcurl';
  if(/elevacion-talones|gemelo-maquina|gemelo-sentado/.test(id))return'calf';
  if(/plancha/.test(id))return'plank';
  if(/crunch-polea|dead-bug/.test(id))return'core';
  if(/paseo-granjero/.test(id))return'carry';
  return'generic';
}

const visualFloor='<line class="visual-floor" x1="12" y1="116" x2="148" y2="116"/>';
const visualHead=(x,y)=>`<circle class="visual-body" cx="${x}" cy="${y}" r="9"/>`;
const visualLine=(x1,y1,x2,y2,extra='visual-body')=>`<line class="${extra}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
const visualWeight=(x1,y1,x2,y2)=>`<line class="visual-equipment" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><circle class="visual-equipment-fill" cx="${x1}" cy="${y1}" r="4"/><circle class="visual-equipment-fill" cx="${x2}" cy="${y2}" r="4"/>`;

function exercisePoseSvg(type,phase){
  const end=phase==='end';
  let p='';
  if(type==='press'){
    p=`${visualFloor}${visualLine(25,92,133,92,'visual-bench')}${visualHead(46,71)}${visualLine(55,75,93,84)}${visualLine(93,84,119,105)}${visualLine(93,84,77,108)}${visualLine(67,80,67,end?43:62)}${visualLine(83,82,83,end?43:62)}${visualWeight(58,end?41:60,92,end?41:60)}`;
  }else if(type==='pullup'){
    p=`${visualLine(28,22,132,22,'visual-equipment')}${visualHead(80,end?49:65)}${visualLine(80,end?58:74,80,end?87:99)}${visualLine(80,end?64:78,53,25)}${visualLine(80,end?64:78,107,25)}${visualLine(80,end?87:99,62,112)}${visualLine(80,end?87:99,98,112)}`;
  }else if(type==='row'){
    p=`${visualFloor}${visualHead(end?67:61,52)}${visualLine(end?70:64,60,end?96:100,77)}${visualLine(end?96:100,77,116,108)}${visualLine(end?96:100,77,78,108)}${visualLine(end?79:76,65,end?101:118,end?70:88)}${visualLine(end?84:80,69,end?106:123,end?74:92)}${visualWeight(end?98:115,end?68:86,end?115:132,end?75:93)}`;
  }else if(type==='overhead'){
    p=`${visualFloor}${visualHead(80,37)}${visualLine(80,47,80,82)}${visualLine(80,82,61,112)}${visualLine(80,82,99,112)}${visualLine(80,57,end?61:57,end?23:54)}${visualLine(80,57,end?99:103,end?23:54)}${visualWeight(end?51:47,end?21:52,end?109:113,end?21:52)}`;
  }else if(type==='lateral'){
    p=`${visualFloor}${visualHead(80,35)}${visualLine(80,45,80,82)}${visualLine(80,82,62,112)}${visualLine(80,82,98,112)}${visualLine(80,56,end?38:68,end?56:84)}${visualLine(80,56,end?122:92,end?56:84)}${visualWeight(end?34:64,end?56:88,end?126:96,end?56:88)}`;
  }else if(type==='curl'){
    p=`${visualFloor}${visualHead(80,34)}${visualLine(80,44,80,82)}${visualLine(80,82,62,112)}${visualLine(80,82,98,112)}${visualLine(80,56,62,70)}${visualLine(80,56,98,70)}${visualLine(62,70,end?67:57,end?48:92)}${visualLine(98,70,end?93:103,end?48:92)}${visualWeight(end?62:52,end?46:94,end?98:108,end?46:94)}`;
  }else if(type==='triceps'){
    p=`${visualFloor}${visualHead(80,34)}${visualLine(80,44,80,83)}${visualLine(80,83,62,112)}${visualLine(80,83,98,112)}${visualLine(80,55,62,64)}${visualLine(80,55,98,64)}${visualLine(62,64,end?58:72,end?96:49)}${visualLine(98,64,end?102:88,end?96:49)}${visualWeight(end?52:67,end?99:46,end?108:93,end?99:46)}`;
  }else if(type==='squat'){
    const hy=end?64:48,hip=end?83:78,knee=end?96:94;
    p=`${visualFloor}${visualHead(80,hy-15)}${visualLine(80,hy-6,80,hip)}${visualLine(80,hip,58,knee)}${visualLine(58,knee,48,114)}${visualLine(80,hip,102,knee)}${visualLine(102,knee,112,114)}${visualLine(80,hy,58,hy+8)}${visualLine(80,hy,102,hy+8)}${visualWeight(47,hy+6,113,hy+6)}`;
  }else if(type==='lunge'){
    p=`${visualFloor}${visualHead(80,end?48:34)}${visualLine(80,end?57:43,80,end?82:79)}${visualLine(80,end?82:79,end?57:62,end?96:112)}${visualLine(end?57:62,end?96:112,end?43:48,114)}${visualLine(80,end?82:79,end?103:98,end?96:112)}${visualLine(end?103:98,end?96:112,end?121:112,114)}${visualLine(80,end?62:54,58,end?70:62)}${visualLine(80,end?62:54,102,end?70:62)}`;
  }else if(type==='hinge'){
    p=`${visualFloor}${visualHead(end?54:80,end?49:34)}${visualLine(end?60:80,end?57:43,end?92:80,end?76:80)}${visualLine(end?92:80,end?76:80,62,112)}${visualLine(end?92:80,end?76:80,102,112)}${visualLine(end?72:80,end?64:56,end?87:62,end?87:80)}${visualLine(end?79:80,end?67:56,end?94:98,end?87:80)}${visualWeight(end?82:52,end?89:82,end?101:108,end?89:82)}`;
  }else if(type==='hip'){
    p=`${visualFloor}${visualLine(20,78,68,78,'visual-bench')}${visualHead(54,end?55:70)}${visualLine(62,end?60:75,end?92:93,end?70:91)}${visualLine(end?92:93,end?70:91,115,110)}${visualLine(end?92:93,end?70:91,72,110)}${visualWeight(74,end?70:91,110,end?70:91)}`;
  }else if(type==='legcurl'){
    p=`${visualFloor}${visualLine(24,78,112,78,'visual-bench')}${visualHead(36,64)}${visualLine(45,69,90,76)}${visualLine(90,76,116,end?57:104)}${visualLine(90,78,116,end?61:108)}${visualLine(116,end?57:104,131,end?43:108)}${visualLine(116,end?61:108,131,end?47:112)}`;
  }else if(type==='calf'){
    p=`${visualFloor}${visualHead(80,end?29:34)}${visualLine(80,end?38:43,80,end?76:82)}${visualLine(80,end?76:82,63,end?105:112)}${visualLine(80,end?76:82,97,end?105:112)}${visualLine(80,54,61,69)}${visualLine(80,54,99,69)}${visualLine(63,end?105:112,52,end?109:116)}${visualLine(97,end?105:112,108,end?109:116)}`;
  }else if(type==='plank'){
    p=`${visualFloor}${visualHead(42,end?73:68)}${visualLine(51,end?77:72,106,end?91:94)}${visualLine(106,end?91:94,130,113)}${visualLine(58,end?80:75,42,104)}${visualLine(58,end?80:75,70,106)}`;
  }else if(type==='core'){
    p=`${visualFloor}${visualHead(end?60:42,end?69:84)}${visualLine(end?67:51,end?73:87,end?91:86,end?87:98)}${visualLine(end?91:86,end?87:98,111,112)}${visualLine(end?91:86,end?87:98,72,112)}${visualLine(end?70:55,end?74:86,end?92:78,end?61:66)}`;
  }else if(type==='carry'){
    p=`${visualFloor}${visualHead(80,34)}${visualLine(80,43,80,82)}${visualLine(80,82,62,end?108:112)}${visualLine(80,82,98,end?105:112)}${visualLine(80,55,58,87)}${visualLine(80,55,102,87)}${visualWeight(52,91,64,91)}${visualWeight(96,91,108,91)}${end?visualLine(115,108,138,108,'visual-motion'):''}`;
  }else{
    p=`${visualFloor}${visualHead(80,34)}${visualLine(80,43,80,82)}${visualLine(80,82,62,112)}${visualLine(80,82,98,112)}${visualLine(80,55,end?55:64,end?70:84)}${visualLine(80,55,end?105:96,end?70:84)}`;
  }
  return `<svg class="exercise-pose-svg" viewBox="0 0 160 130" role="img" aria-hidden="true">${p}</svg>`;
}

function exerciseVisualMarkup(x){
  const type=exerciseVisualType(x);
  return `<section class="exercise-visual-card" aria-label="Guía visual de ${escapeExerciseText(x.name)}">
    <div class="exercise-visual-heading"><div><span>GUÍA VISUAL</span><strong>Inicio → final</strong></div><small>Referencia técnica</small></div>
    <div class="exercise-visual-steps">
      <figure><div class="pose-frame">${exercisePoseSvg(type,'start')}</div><figcaption><b>1</b> INICIO</figcaption></figure>
      <div class="visual-arrow" aria-hidden="true">→</div>
      <figure><div class="pose-frame active">${exercisePoseSvg(type,'end')}</div><figcaption><b>2</b> FINAL</figcaption></figure>
    </div>
    <p class="exercise-visual-note"><span>✦</span>${escapeExerciseText(x.instructions[0]||'Mantén la técnica controlada durante todo el movimiento.')}</p>
  </section>`;
}

function openExerciseDetail(id){
  const x=findExercise(id);if(!x)return;
  const media=x.media.image?`<div class="exercise-real-media"><img src="${escapeExerciseText(x.media.image)}" alt="Demostración de ${escapeExerciseText(x.name)}"></div>`:x.media.video?`<div class="exercise-real-media"><video src="${escapeExerciseText(x.media.video)}" controls playsinline></video></div>`:exerciseVisualMarkup(x);
  document.querySelector('#exercise-detail').innerHTML=`<article class="exercise-detail-hero"><div><p class="label">${escapeExerciseText(x.primaryMuscle)} · ${escapeExerciseText(x.type)}</p><h2 id="exercise-detail-title">${escapeExerciseText(x.name)}</h2>${x.alternativeName?`<p class="exercise-alternative">${escapeExerciseText(x.alternativeName)}</p>`:''}</div><span class="exercise-card-level ${x.level.toLowerCase()}">${escapeExerciseText(x.level)}</span></article>${media}<section class="exercise-meta"><div><span>MÚSCULO PRINCIPAL</span><strong>${escapeExerciseText(x.primaryMuscle)}</strong></div><div><span>EQUIPAMIENTO</span><strong>${escapeExerciseText(x.equipment)}</strong></div><div><span>CARGA</span><strong>${x.weighted?'Con pesas':'Sin pesas'}</strong></div></section>${detailSection('Músculos trabajados',[x.primaryMuscle,...x.secondaryMuscles])}${detailSection('Instrucciones paso a paso',x.instructions)}${detailSection('Errores comunes',x.commonErrors)}${detailSection('Consejos de técnica',x.techniqueTips)}<section class="exercise-detail-section"><h3>Variantes relacionadas</h3><div class="variant-list">${x.relatedVariants.length?x.relatedVariants.map(v=>`<span>${escapeExerciseText(v)}</span>`).join(''):'<span class="variant-empty">Más variantes próximamente</span>'}</div></section>`;
  switchScreen('library-detail');
}

function setupExerciseLibrary(){const muscle=document.querySelector('#exercise-muscle-filter');muscle.insertAdjacentHTML('beforeend',EXERCISE_MUSCLES.map(x=>`<option value="${x}">${x}</option>`).join(''));document.querySelector('#open-exercise-library').onclick=()=>{renderExerciseLibrary();switchScreen('library')};document.querySelector('#exercise-search').oninput=e=>{exerciseState.query=e.target.value.trim();renderExerciseLibrary()};muscle.onchange=e=>{exerciseState.muscle=e.target.value;renderExerciseLibrary()};document.querySelector('#exercise-load-filter').onchange=e=>{exerciseState.weighted=e.target.value;renderExerciseLibrary()};renderExerciseLibrary()}
const DULUS_GOALS=['Perder grasa','Ganar masa muscular','Mejorar fuerza','Mejorar resistencia','Mejorar movilidad','Aumentar glúteos','Definir abdomen','Tonificar cuerpo','Mejorar rendimiento deportivo','Aumentar explosividad','Mejorar velocidad','Recomposición corporal','Mejorar salud general'];
const DULUS_MESSAGES=[{motivation:'La disciplina de hoy construye la versión fuerte de mañana.',verse:'Todo lo puedo en Cristo que me fortalece.',ref:'Filipenses 4:13'},{motivation:'No necesitas ser perfecto; necesitas volver a cumplir hoy.',verse:'Los que esperan en el Señor renovarán sus fuerzas.',ref:'Isaías 40:31'},{motivation:'Cada repetición con intención cuenta. Sigue avanzando.',verse:'Esfuérzate y sé valiente; no temas ni desmayes.',ref:'Josué 1:9'},{motivation:'La constancia transforma lo difícil en parte de tu rutina.',verse:'Corramos con perseverancia la carrera que tenemos por delante.',ref:'Hebreos 12:1'}];
const motivationEnabled=()=>localStorage.getItem('dulus:motivation-enabled')!=='false';
function dailyMessage(){const d=new Date(),n=Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);return DULUS_MESSAGES[n%DULUS_MESSAGES.length]}
function motivationMarkup(extra=''){if(!motivationEnabled())return'';const x=dailyMessage();return`<article class="dulus-inspiration ${extra}"><span class="inspiration-icon">✦</span><div><p class="inspiration-kicker">FUERZA PARA HOY</p><strong>${escapeExerciseText(x.motivation)}</strong><blockquote>“${escapeExerciseText(x.verse)}” <span>— ${escapeExerciseText(x.ref)}</span></blockquote></div></article>`}
function refreshMotivation(){document.querySelectorAll('.dulus-inspiration').forEach(n=>n.remove());if(!motivationEnabled())return;document.querySelector('#screen-home .hero-card')?.insertAdjacentHTML('afterend',motivationMarkup('home-inspiration'));document.querySelector('#student-detail .detail-hero')?.insertAdjacentHTML('afterend',motivationMarkup('student-inspiration'))}
function setupMotivationSettings(){const p=document.querySelector('#screen-profile');if(!p||p.querySelector('#motivation-toggle'))return;p.insertAdjacentHTML('beforeend',`<section class="dulus-settings-card"><div><p class="label">PERSONALIZACIÓN</p><h3>Motivación y verso bíblico</h3><p>Muestra un mensaje al iniciar y también en la ficha del alumno.</p></div><label class="dulus-switch"><input id="motivation-toggle" type="checkbox" ${motivationEnabled()?'checked':''}><span></span></label></section>`);document.querySelector('#motivation-toggle').onchange=e=>{localStorage.setItem('dulus:motivation-enabled',String(e.target.checked));refreshMotivation()}}
function setupGoalSelector(){const form=document.querySelector('#student-form'),select=form?.querySelector('select[name="goal"]');if(!form||!select||form.querySelector('.goal-multi-field'))return;select.required=false;select.classList.add('sr-only');const label=select.closest('label');label.classList.add('legacy-goal-field');label.insertAdjacentHTML('afterend',`<fieldset class="goal-multi-field"><legend>Objetivos <small>Puedes seleccionar varios</small></legend><div class="goal-chip-grid">${DULUS_GOALS.map(g=>`<label class="goal-chip"><input type="checkbox" value="${g}"><span>${g}</span></label>`).join('')}</div><p class="goal-helper" id="goal-helper">Selecciona uno o varios objetivos para este alumno.</p></fieldset>`);const checks=[...form.querySelectorAll('.goal-chip input')];function sync(){const a=checks.filter(x=>x.checked).map(x=>x.value),value=a.join(' · ');select.querySelectorAll('[data-multi-goal]').forEach(x=>x.remove());if(value){const o=document.createElement('option');o.value=o.textContent=value;o.dataset.multiGoal='true';select.append(o);select.value=value}else select.value='';const h=document.querySelector('#goal-helper');if(h)h.textContent=a.length?`${a.length} objetivo${a.length===1?'':'s'} seleccionado${a.length===1?'':'s'}.`:'Selecciona uno o varios objetivos para este alumno.'}checks.forEach(x=>x.onchange=sync);form.addEventListener('reset',()=>setTimeout(()=>{checks.forEach(x=>x.checked=false);sync()},0));form.addEventListener('submit',e=>{sync();if(!checks.some(x=>x.checked)){e.preventDefault();e.stopImmediatePropagation();const h=document.querySelector('#goal-helper');h.textContent='Selecciona por lo menos un objetivo.';h.classList.add('error');form.querySelector('.goal-multi-field').scrollIntoView({behavior:'smooth',block:'center'})}},true)}
function updateLiveDate(){const k=document.querySelector('#page-kicker');if(k)k.textContent=new Intl.DateTimeFormat('es-DO',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase()}
const detailTarget=document.querySelector('#student-detail');if(detailTarget)new MutationObserver(()=>{if(detailTarget.querySelector('.detail-hero')&&motivationEnabled()&&!detailTarget.querySelector('.student-inspiration'))detailTarget.querySelector('.detail-hero').insertAdjacentHTML('afterend',motivationMarkup('student-inspiration'))}).observe(detailTarget,{childList:true});
setupExerciseLibrary();setupGoalSelector();setupMotivationSettings();refreshMotivation();updateLiveDate();
const workoutModule=document.createElement('script');workoutModule.src='workouts.js';workoutModule.defer=true;document.body.appendChild(workoutModule);
