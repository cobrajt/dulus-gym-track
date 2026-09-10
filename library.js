/* Interfaz de la biblioteca. El catálogo vive en exercises.js para mantenerlo ampliable. */
const exerciseState = { query: '', muscle: '', weighted: '', equipment: 'Todos' };
const escapeExerciseText = value => String(value).replace(/[&<>"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[character]);
const findExercise = id => EXERCISES.find(exercise => exercise.id === id);

const filteredExercises = () => EXERCISES.filter(exercise => {
  const query = exerciseState.query.toLocaleLowerCase('es');
  const searchable = `${exercise.name} ${exercise.alternativeName} ${exercise.primaryMuscle} ${exercise.equipment}`.toLocaleLowerCase('es');
  return (!query || searchable.includes(query))
    && (!exerciseState.muscle || exercise.primaryMuscle === exerciseState.muscle)
    && (!exerciseState.weighted || String(exercise.weighted) === exerciseState.weighted)
    && (exerciseState.equipment === 'Todos' || exercise.equipment === exerciseState.equipment);
});

const exerciseCard = exercise => `<button class="exercise-card" type="button" data-exercise-id="${exercise.id}">
  <span class="exercise-card-icon" aria-hidden="true">${exercise.weighted ? '◈' : '○'}</span>
  <span class="exercise-card-copy"><strong>${escapeExerciseText(exercise.name)}</strong><small>${escapeExerciseText(exercise.primaryMuscle)} · ${escapeExerciseText(exercise.equipment)}</small></span>
  <span class="exercise-card-level ${exercise.level.toLowerCase()}">${escapeExerciseText(exercise.level)}</span><span class="exercise-card-arrow" aria-hidden="true">›</span>
</button>`;

const renderEquipmentFilters = () => {
  document.querySelector('#equipment-filters').innerHTML = EXERCISE_EQUIPMENT.map(equipment => `<button class="equipment-chip${exerciseState.equipment === equipment ? ' active' : ''}" type="button" data-equipment="${equipment}">${equipment}</button>`).join('');
  document.querySelectorAll('[data-equipment]').forEach(button => button.addEventListener('click', () => {
    exerciseState.equipment = button.dataset.equipment;
    renderExerciseLibrary();
  }));
};

const renderExerciseLibrary = () => {
  const exercises = filteredExercises();
  document.querySelector('#exercise-count').textContent = `${exercises.length} ${exercises.length === 1 ? 'ejercicio encontrado' : 'ejercicios encontrados'}`;
  document.querySelector('#exercise-list').innerHTML = exercises.length ? exercises.map(exerciseCard).join('') : '<div class="exercise-empty">No encontramos ejercicios con esos filtros. Prueba otra búsqueda.</div>';
  document.querySelectorAll('[data-exercise-id]').forEach(card => card.addEventListener('click', () => openExerciseDetail(card.dataset.exerciseId)));
  renderEquipmentFilters();
};

const listMarkup = items => `<ul class="exercise-detail-list">${items.map(item => `<li>${escapeExerciseText(item)}</li>`).join('')}</ul>`;
const detailSection = (title, items) => `<section class="exercise-detail-section"><h3>${title}</h3>${listMarkup(items)}</section>`;
const openExerciseDetail = id => {
  const exercise = findExercise(id);
  if (!exercise) return;
  const media = exercise.media.image || exercise.media.video
    ? '<div class="exercise-media-ready">Contenido demostrativo disponible próximamente.</div>'
    : `<div class="exercise-tech-visual" aria-label="Guía visual de ejecución"><div class="tech-figure"><span class="tech-head"></span><span class="tech-body"></span><span class="tech-arm left"></span><span class="tech-arm right"></span><span class="tech-leg left"></span><span class="tech-leg right"></span></div><div><strong>Guía de ejecución</strong><p>${escapeExerciseText(exercise.instructions[0] || 'Revisa la técnica antes de comenzar.')}</p><small>Próximamente: imagen o video real del movimiento.</small></div></div>`;
  document.querySelector('#exercise-detail').innerHTML = `<article class="exercise-detail-hero">
    <div><p class="label">${escapeExerciseText(exercise.primaryMuscle)} · ${escapeExerciseText(exercise.type)}</p><h2 id="exercise-detail-title">${escapeExerciseText(exercise.name)}</h2>${exercise.alternativeName ? `<p class="exercise-alternative">${escapeExerciseText(exercise.alternativeName)}</p>` : ''}</div>
    <span class="exercise-card-level ${exercise.level.toLowerCase()}">${escapeExerciseText(exercise.level)}</span>
  </article>${media}
  <section class="exercise-meta"><div><span>MÚSCULO PRINCIPAL</span><strong>${escapeExerciseText(exercise.primaryMuscle)}</strong></div><div><span>EQUIPAMIENTO</span><strong>${escapeExerciseText(exercise.equipment)}</strong></div><div><span>CARGA</span><strong>${exercise.weighted ? 'Con pesas' : 'Sin pesas'}</strong></div></section>
  ${detailSection('Músculos trabajados', [exercise.primaryMuscle, ...exercise.secondaryMuscles])}
  ${detailSection('Instrucciones paso a paso', exercise.instructions)}
  ${detailSection('Errores comunes', exercise.commonErrors)}
  ${detailSection('Consejos de técnica', exercise.techniqueTips)}
  <section class="exercise-detail-section"><h3>Variantes relacionadas</h3><div class="variant-list">${exercise.relatedVariants.map(variant => `<span>${escapeExerciseText(variant)}</span>`).join('')}</div></section>`;
  switchScreen('library-detail');
};

const setupExerciseLibrary = () => {
  const muscleFilter = document.querySelector('#exercise-muscle-filter');
  muscleFilter.insertAdjacentHTML('beforeend', EXERCISE_MUSCLES.map(muscle => `<option value="${muscle}">${muscle}</option>`).join(''));
  document.querySelector('#open-exercise-library').addEventListener('click', () => { renderExerciseLibrary(); switchScreen('library'); });
  document.querySelector('#exercise-search').addEventListener('input', event => { exerciseState.query = event.target.value.trim(); renderExerciseLibrary(); });
  muscleFilter.addEventListener('change', event => { exerciseState.muscle = event.target.value; renderExerciseLibrary(); });
  document.querySelector('#exercise-load-filter').addEventListener('change', event => { exerciseState.weighted = event.target.value; renderExerciseLibrary(); });
  renderExerciseLibrary();
};

setupExerciseLibrary();

/* Mejoras de experiencia y personalización de Dulus Gym Track. */
const DULUS_GOALS = [
  'Perder grasa',
  'Ganar masa muscular',
  'Mejorar fuerza',
  'Mejorar resistencia',
  'Mejorar movilidad',
  'Aumentar glúteos',
  'Definir abdomen',
  'Tonificar cuerpo',
  'Mejorar rendimiento deportivo',
  'Aumentar explosividad',
  'Mejorar velocidad',
  'Recomposición corporal',
  'Mejorar salud general'
];

const DULUS_MESSAGES = [
  { motivation: 'La disciplina de hoy construye la versión fuerte de mañana.', verse: 'Todo lo puedo en Cristo que me fortalece.', ref: 'Filipenses 4:13' },
  { motivation: 'No necesitas ser perfecto; necesitas volver a cumplir hoy.', verse: 'Los que esperan en el Señor renovarán sus fuerzas.', ref: 'Isaías 40:31' },
  { motivation: 'Cada repetición con intención cuenta. Sigue avanzando.', verse: 'Esfuérzate y sé valiente; no temas ni desmayes.', ref: 'Josué 1:9' },
  { motivation: 'La constancia transforma lo difícil en parte de tu rutina.', verse: 'Corramos con perseverancia la carrera que tenemos por delante.', ref: 'Hebreos 12:1' }
];

const motivationEnabled = () => localStorage.getItem('dulus:motivation-enabled') !== 'false';
const dailyMessage = () => {
  const now = new Date();
  const dayKey = Number(`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`);
  return DULUS_MESSAGES[dayKey % DULUS_MESSAGES.length];
};

const motivationMarkup = extraClass => {
  if (!motivationEnabled()) return '';
  const item = dailyMessage();
  return `<article class="dulus-inspiration ${extraClass || ''}"><span class="inspiration-icon">✦</span><div><p class="inspiration-kicker">FUERZA PARA HOY</p><strong>${escapeExerciseText(item.motivation)}</strong><blockquote>“${escapeExerciseText(item.verse)}” <span>— ${escapeExerciseText(item.ref)}</span></blockquote></div></article>`;
};

const refreshMotivation = () => {
  document.querySelectorAll('.dulus-inspiration').forEach(node => node.remove());
  if (!motivationEnabled()) return;
  const home = document.querySelector('#screen-home .hero-card');
  if (home) home.insertAdjacentHTML('afterend', motivationMarkup('home-inspiration'));
  const detail = document.querySelector('#student-detail .detail-hero');
  if (detail) detail.insertAdjacentHTML('afterend', motivationMarkup('student-inspiration'));
};

const setupMotivationSettings = () => {
  const profile = document.querySelector('#screen-profile');
  if (!profile || profile.querySelector('#motivation-toggle')) return;
  profile.insertAdjacentHTML('beforeend', `<section class="dulus-settings-card"><div><p class="label">PERSONALIZACIÓN</p><h3>Motivación y verso bíblico</h3><p>Muestra un mensaje al iniciar y también en la ficha del alumno.</p></div><label class="dulus-switch"><input id="motivation-toggle" type="checkbox" ${motivationEnabled() ? 'checked' : ''}><span></span></label></section>`);
  document.querySelector('#motivation-toggle').addEventListener('change', event => {
    localStorage.setItem('dulus:motivation-enabled', String(event.target.checked));
    refreshMotivation();
  });
};

const setupGoalSelector = () => {
  const form = document.querySelector('#student-form');
  const goalSelect = form?.querySelector('select[name="goal"]');
  if (!form || !goalSelect || form.querySelector('.goal-multi-field')) return;
  const label = goalSelect.closest('label');
  goalSelect.required = false;
  goalSelect.classList.add('sr-only');
  label?.classList.add('legacy-goal-field');
  label?.insertAdjacentHTML('afterend', `<fieldset class="goal-multi-field"><legend>Objetivos <small>Puedes seleccionar varios</small></legend><div class="goal-chip-grid">${DULUS_GOALS.map(goal => `<label class="goal-chip"><input type="checkbox" value="${escapeExerciseText(goal)}"><span>${escapeExerciseText(goal)}</span></label>`).join('')}</div><p class="goal-helper" id="goal-helper">Selecciona uno o varios objetivos para este alumno.</p></fieldset>`);

  const checkboxes = [...form.querySelectorAll('.goal-chip input')];
  const syncGoals = () => {
    const selected = checkboxes.filter(input => input.checked).map(input => input.value);
    const value = selected.join(' · ');
    [...goalSelect.querySelectorAll('[data-multi-goal]')].forEach(option => option.remove());
    if (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      option.dataset.multiGoal = 'true';
      goalSelect.append(option);
      goalSelect.value = value;
    } else goalSelect.value = '';
    const helper = document.querySelector('#goal-helper');
    if (helper) helper.textContent = selected.length ? `${selected.length} objetivo${selected.length === 1 ? '' : 's'} seleccionado${selected.length === 1 ? '' : 's'}.` : 'Selecciona uno o varios objetivos para este alumno.';
  };
  checkboxes.forEach(input => input.addEventListener('change', syncGoals));
  form.addEventListener('reset', () => setTimeout(() => { checkboxes.forEach(input => input.checked = false); syncGoals(); }, 0));
  form.addEventListener('submit', event => {
    syncGoals();
    if (!checkboxes.some(input => input.checked)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const helper = document.querySelector('#goal-helper');
      if (helper) { helper.textContent = 'Selecciona por lo menos un objetivo.'; helper.classList.add('error'); }
      form.querySelector('.goal-multi-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, true);
};

const updateLiveDate = () => {
  const kicker = document.querySelector('#page-kicker');
  if (!kicker) return;
  kicker.textContent = new Intl.DateTimeFormat('es-DO', { weekday:'long', day:'numeric', month:'long' }).format(new Date()).toUpperCase();
};

const detailObserver = new MutationObserver(() => refreshMotivation());
const detailTarget = document.querySelector('#student-detail');
if (detailTarget) detailObserver.observe(detailTarget, { childList:true });

setupGoalSelector();
setupMotivationSettings();
refreshMotivation();
updateLiveDate();
