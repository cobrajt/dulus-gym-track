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
    : '<div class="exercise-media-placeholder"><span>▶</span><p>Espacio reservado para imagen o video demostrativo</p></div>';
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

/* Objetivos múltiples por alumno. Se monta sobre el formulario existente para mantener compatibilidad. */
const DULUS_GOALS = ['Perder grasa','Bajar de peso','Ganar masa muscular','Recomposición corporal','Aumentar glúteos','Definir abdomen','Aumentar piernas','Tonificar / definir','Ganar fuerza','Mejorar resistencia','Mejorar condición física','Rendimiento deportivo','Mejorar movilidad','Mejorar flexibilidad','Mejorar postura','Salud general','Mantener peso','Subir de peso de forma saludable','Recuperación / retorno al ejercicio'];
const setupMultiGoals = () => {
  const form = document.querySelector('#student-form');
  const legacy = form?.querySelector('select[name="goal"]');
  if (!form || !legacy || form.querySelector('#dulus-goal-fieldset')) return;
  const legacyLabel = legacy.closest('label');
  if (legacyLabel) legacyLabel.hidden = true;
  legacy.required = false;
  legacyLabel?.insertAdjacentHTML('afterend', `<fieldset class="goal-fieldset" id="dulus-goal-fieldset"><legend>Objetivos</legend><p class="goal-help">Selecciona todos los objetivos que apliquen y después marca cuál es la prioridad actual.</p><div class="goal-options">${DULUS_GOALS.map(goal=>`<label class="goal-chip"><input type="checkbox" name="goals" value="${escapeExerciseText(goal)}"><span>${escapeExerciseText(goal)}</span></label>`).join('')}</div><label class="custom-goal-label">Otro objetivo<input id="custom-goal" type="text" maxlength="60" placeholder="Ej. mejorar salto vertical"></label><input id="custom-goal-hidden" type="hidden" name="goals" disabled><label>Objetivo principal<select id="primary-goal" name="primaryGoal" required><option value="">Selecciona uno o más objetivos</option></select></label><p class="goal-form-message" id="goal-form-message" aria-live="polite"></p></fieldset>`);
  const checks = [...form.querySelectorAll('input[name="goals"][type="checkbox"]')];
  const custom = form.querySelector('#custom-goal');
  const customHidden = form.querySelector('#custom-goal-hidden');
  const primary = form.querySelector('#primary-goal');
  const message = form.querySelector('#goal-form-message');
  const sync = () => {
    const customValue = custom.value.trim();
    customHidden.disabled = !customValue;
    customHidden.value = customValue;
    const selected = checks.filter(input=>input.checked).map(input=>input.value);
    if (customValue) selected.push(customValue);
    const previous = primary.value;
    primary.innerHTML = `<option value="">${selected.length ? 'Elige la prioridad' : 'Selecciona uno o más objetivos'}</option>${selected.map(goal=>`<option value="${escapeExerciseText(goal)}">${escapeExerciseText(goal)}</option>`).join('')}`;
    primary.value = selected.includes(previous) ? previous : (selected[0] || '');
    message.textContent = selected.length ? `${selected.length} objetivo${selected.length===1?'':'s'} seleccionado${selected.length===1?'':'s'}.` : '';
  };
  checks.forEach(input=>input.addEventListener('change',sync));
  custom.addEventListener('input',sync);
  form.addEventListener('reset',()=>setTimeout(sync,0));
  form.addEventListener('submit',event=>{
    sync();
    const count = checks.filter(input=>input.checked).length + (custom.value.trim()?1:0);
    if (!count) {
      event.preventDefault(); event.stopImmediatePropagation();
      message.textContent = 'Selecciona por lo menos un objetivo.';
      form.querySelector('#dulus-goal-fieldset').scrollIntoView({behavior:'smooth',block:'center'});
    }
  }, true);
  sync();
};
setupMultiGoals();
