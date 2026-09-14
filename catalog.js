
/* Adaptador del catálogo oficial. Conserva los IDs usados por las rutinas existentes. */
(() => {
  const muscles={abdominals:'Core/Abdominales',abductors:'Abductores',adductors:'Aductores',biceps:'Bíceps',calves:'Pantorrillas',chest:'Pecho',forearms:'Antebrazos',glutes:'Glúteos',hamstrings:'Isquiotibiales',lats:'Espalda',lower_back:'Espalda',middle_back:'Espalda',neck:'Cuello',quadriceps:'Cuádriceps',shoulders:'Hombros',traps:'Trapecio',triceps:'Tríceps'};
  const muscle=x=>muscles[x.replaceAll(' ','_')]||x;
  const equipment={'body only':'Peso corporal',barbell:'Barra',dumbbell:'Mancuernas',machine:'Máquina',cable:'Polea',bands:'Bandas',kettlebells:'Kettlebell','exercise ball':'Balón', 'medicine ball':'Balón medicinal','foam roll':'Rodillo','e-z curl bar':'Barra EZ',other:'Otro equipamiento'};
  const levels={beginner:'Principiante',intermediate:'Intermedio',expert:'Avanzado'};
  const types={strength:'Fuerza',stretching:'Estiramiento',cardio:'Cardio',plyometrics:'Pliometría',powerlifting:'Powerlifting', 'olympic weightlifting':'Halterofilia',strongman:'Strongman'};
  const aliases=new Map(Object.entries(EXERCISE_MEDIA).map(([id,m])=>[m.sourceId,id]));
  for(const item of EXERCISE_CATALOG_DATA){
    const existing=EXERCISES.find(e=>e.id===aliases.get(item.id));
    if(existing){existing.sourceId=item.id;continue;}
    const weighted=item.equipment==null||item.equipment==='other'?null:['barbell','dumbbell','machine','cable','kettlebells','e-z curl bar','medicine ball'].includes(item.equipment);
    const images=item.images.map(p=>'./assets/catalog/'+p);
    EXERCISES.push({id:'fedb-'+item.id,sourceId:item.id,name:item.name,alternativeName:'',primaryMuscle:muscle(item.primaryMuscles[0]||'Cuerpo completo'),secondaryMuscles:item.secondaryMuscles.map(muscle),type:types[item.category]||item.category,equipment:equipment[item.equipment]||(item.equipment==='e-z curl bar'?'Barra EZ':'Sin especificar'),weighted,level:levels[item.level]||'Sin especificar',instructions:item.instructions,commonErrors:[],techniqueTips:[],relatedVariants:[],instructionLanguage:'en',media:{images,image:images[0]||'',source:'Free Exercise DB',status:'ready'},routineDefaults:{sets:null,reps:null,restSeconds:null}});
  }
  for(const e of EXERCISES){if(!EXERCISE_EQUIPMENT.includes(e.equipment))EXERCISE_EQUIPMENT.push(e.equipment);if(!EXERCISE_MUSCLES.includes(e.primaryMuscle))EXERCISE_MUSCLES.push(e.primaryMuscle);}
})();
