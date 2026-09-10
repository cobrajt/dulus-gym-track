/* Personalización visual, mensaje motivacional y fecha dinámica. */
(()=>{
const messages=[
  {motivation:'La disciplina de hoy construye la versión fuerte de mañana.',verse:'Todo lo puedo en Cristo que me fortalece.',ref:'Filipenses 4:13'},
  {motivation:'No necesitas hacerlo perfecto; necesitas volver a cumplir hoy.',verse:'Los que esperan en el Señor renovarán sus fuerzas.',ref:'Isaías 40:31'},
  {motivation:'Cada repetición con intención cuenta. Sigue avanzando.',verse:'Esfuérzate y sé valiente; no temas ni desmayes.',ref:'Josué 1:9'},
  {motivation:'La constancia transforma lo difícil en parte de tu rutina.',verse:'Corramos con perseverancia la carrera que tenemos por delante.',ref:'Hebreos 12:1'},
  {motivation:'Haz hoy el trabajo que tu futuro cuerpo te agradecerá.',verse:'Encomienda al Señor tus obras, y tus planes se cumplirán.',ref:'Proverbios 16:3'}
];
let enabled=true;
const esc=value=>String(value??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));
const daily=()=>{const d=new Date(),key=Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);return messages[key%messages.length]};
const markup=extra=>{const item=daily();return `<article class="dulus-inspiration ${extra}"><span class="inspiration-icon">✦</span><div><p class="inspiration-kicker">FUERZA PARA HOY</p><strong>${esc(item.motivation)}</strong><blockquote>“${esc(item.verse)}” <span>— ${esc(item.ref)}</span></blockquote></div></article>`};
function render(){document.querySelectorAll('.dulus-inspiration').forEach(node=>node.remove());if(!enabled)return;document.querySelector('#screen-home .hero-card')?.insertAdjacentHTML('afterend',markup('home-inspiration'));const hero=document.querySelector('#student-detail .detail-hero');if(hero&&!document.querySelector('#student-detail .student-inspiration'))hero.insertAdjacentHTML('afterend',markup('student-inspiration'))}
function profileSetting(){const profile=document.querySelector('#screen-profile');if(!profile||profile.querySelector('#motivation-toggle'))return;profile.insertAdjacentHTML('beforeend',`<section class="dulus-settings-card"><div><p class="label">PERSONALIZACIÓN</p><h3>Motivación y verso bíblico</h3><p>Muestra un mensaje al iniciar y en la ficha del alumno.</p></div><label class="dulus-switch" aria-label="Activar motivación y verso bíblico"><input id="motivation-toggle" type="checkbox" ${enabled?'checked':''}><span></span></label></section>`);document.querySelector('#motivation-toggle').addEventListener('change',async event=>{enabled=event.target.checked;try{await DulusStorage.saveSetting('motivationEnabled',enabled)}catch(error){console.warn('No se pudo guardar la preferencia.',error)}render()})}
function updateDate(){if(!document.querySelector('#screen-home.active'))return;const kicker=document.querySelector('#page-kicker');if(!kicker)return;const text=new Intl.DateTimeFormat('es-DO',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase();if(kicker.textContent!==text)kicker.textContent=text}
function init(){profileSetting();render();updateDate();DulusStorage.getSetting('motivationEnabled').then(saved=>{enabled=saved!==false;const toggle=document.querySelector('#motivation-toggle');if(toggle)toggle.checked=enabled;render()}).catch(()=>{enabled=true})}
const detail=document.querySelector('#student-detail');if(detail)new MutationObserver(()=>{if(enabled&&detail.querySelector('.detail-hero')&&!detail.querySelector('.student-inspiration'))render()}).observe(detail,{childList:true});
const kicker=document.querySelector('#page-kicker');if(kicker)new MutationObserver(updateDate).observe(kicker,{childList:true,characterData:true,subtree:true});
document.querySelectorAll('[data-screen="home"]').forEach(button=>button.addEventListener('click',()=>setTimeout(updateDate,0)));
init();
})();
