
/* Inspiración diaria y preferencias locales independientes. */
(()=>{
const messages=[
['La disciplina de hoy construye la versión fuerte de mañana.','Todo lo puedo en Cristo que me fortalece.','Filipenses 4:13'],
['No necesitas hacerlo perfecto; necesitas volver a intentarlo hoy.','Los que esperan en el Señor renovarán sus fuerzas.','Isaías 40:31'],
['Cada repetición con intención cuenta. Sigue avanzando.','Esfuérzate y sé valiente; no temas ni desmayes.','Josué 1:9'],
['Tu constancia vale más que compararte con otra persona.','Corramos con perseverancia la carrera que tenemos por delante.','Hebreos 12:1'],
['Celebra lo que hoy puedes hacer y ayer parecía difícil.','Encomienda al Señor tus obras, y tus planes se cumplirán.','Proverbios 16:3'],
['Un paso pequeño también te acerca a tu objetivo.','El Señor es mi fortaleza y mi escudo.','Salmo 28:7'],
['Descansar con intención también forma parte del progreso.','Venid a mí todos los que estáis trabajados y cargados.','Mateo 11:28'],
['Hoy puedes empezar de nuevo. Tu proceso sigue abierto.','Nuevas son cada mañana; grande es tu fidelidad.','Lamentaciones 3:23'],
['Comparte tu avance: puede ser el impulso que alguien necesita.','Animaos unos a otros, y edificaos unos a otros.','1 Tesalonicenses 5:11'],
['Escucha tu cuerpo, cuida tu técnica y avanza a tu ritmo.','Todas vuestras cosas sean hechas con amor.','1 Corintios 16:14'],
['La fuerza se construye también en los días de poca motivación.','No nos cansemos, pues, de hacer bien.','Gálatas 6:9'],
['Tu esfuerzo de hoy merece ser reconocido. Sigue cuidándote.','Mejores son dos que uno.','Eclesiastés 4:9']
];
let motivation=true,verse=true;
const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dateKey=()=>{const d=new Date();return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000)};
function renderIn(host,anchor){
 if(!host||!anchor)return;
 const key=[dateKey(),motivation,verse].join(':');let card=host.querySelector('.dulus-inspiration');
 if(card?.dataset.key===key)return;
 card?.remove();if(!motivation&&!verse)return;
 const [m,v,r]=messages[dateKey()%messages.length];
 const html='<article class="dulus-inspiration" data-key="'+key+'"><p class="label">TU PAUSA DE HOY</p>'+
 (motivation?'<section class="daily-motivation"><h2>Un impulso para ti</h2><p>'+esc(m)+'</p></section>':'')+
 (verse?'<section class="daily-verse"><p class="label">VERSO DEL DÍA</p><blockquote>“'+esc(v)+'”</blockquote><cite>'+esc(r)+'</cite></section>':'')+'</article>';
 anchor.insertAdjacentHTML('afterend',html);
}
function render(){renderIn(document.querySelector('#screen-home'),document.querySelector('#screen-home .hero-card'));renderIn(document.querySelector('#student-detail'),document.querySelector('#student-detail .detail-hero'));}
function update(){const active=document.querySelector('.screen.active');document.body.dataset.section=active?.id.replace('screen-','')||'home';if(active?.id==='screen-home'){const el=document.querySelector('#page-kicker');const date=new Intl.DateTimeFormat('es-DO',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase();if(el.textContent!==date)el.textContent=date;}render();}
const profile=document.querySelector('#screen-profile');profile.insertAdjacentHTML('beforeend','<section class="dulus-settings-card" id="inspiration-settings"><p class="label">PERSONALIZA TU EXPERIENCIA</p><h2>Ajustes</h2><p>Elige lo que quieres ver cada día. Se guarda en este dispositivo.</p><label class="setting-row"><span><strong>Mensaje motivacional diario</strong><small>Un impulso para seguir a tu ritmo.</small></span><input id="motivation-toggle" type="checkbox" role="switch" checked disabled></label><label class="setting-row"><span><strong>Verso bíblico diario</strong><small>Puedes desactivarlo independientemente.</small></span><input id="verse-toggle" type="checkbox" role="switch" checked disabled></label><p id="settings-status" role="status"></p></section>');
async function save(event,key){const value=event.target.checked,previous=key==='motivationEnabled'?motivation:verse;if(key==='motivationEnabled')motivation=value;else verse=value;render();try{await DulusStorage.saveSetting(key,value);document.querySelector('#settings-status').textContent='Preferencia guardada.';}catch{if(key==='motivationEnabled')motivation=previous;else verse=previous;event.target.checked=previous;render();document.querySelector('#settings-status').textContent='No se pudo guardar. Inténtalo de nuevo.';}}
document.querySelector('#motivation-toggle').addEventListener('change',e=>save(e,'motivationEnabled'));document.querySelector('#verse-toggle').addEventListener('change',e=>save(e,'verseEnabled'));
Promise.all([DulusStorage.getSetting('motivationEnabled'),DulusStorage.getSetting('verseEnabled')]).then(async ([m,v])=>{motivation=m!==false;verse=v===undefined?m!==false:v!==false;if(v===undefined)await DulusStorage.saveSetting('verseEnabled',verse);document.querySelector('#motivation-toggle').checked=motivation;document.querySelector('#verse-toggle').checked=verse;render();}).catch(()=>{}).finally(()=>{document.querySelector('#motivation-toggle').disabled=false;document.querySelector('#verse-toggle').disabled=false;});
new MutationObserver(update).observe(document.querySelector('.app-shell'),{attributes:true,attributeFilter:['class'],subtree:true});
new MutationObserver(render).observe(document.querySelector('#student-detail'),{childList:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});setInterval(update,60000);update();
})();
