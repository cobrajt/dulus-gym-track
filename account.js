/* Only a public publishable key belongs in this browser client. */
(() => {
'use strict';
const $=id=>document.getElementById(id),status=$('account-status');
if(!window.supabase){status.textContent='No se pudo cargar la conexión. Revisa internet y recarga.';return;}
const client=window.supabase.createClient('https://rnrciqyngdequkbmttxu.supabase.co','sb_publishable_LqmoY41LO5axFmitkS2_FQ_o7QlCROr',{auth:{storageKey:'dulus-account-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let mode='login',user=null,recovery=false,refreshId=0;
const say=(text,error=false)=>{status.textContent=text;status.classList.toggle('error',error);};
const explain=error=>({invalid_credentials:'Correo o contraseña incorrectos.',email_not_confirmed:'Confirma tu correo antes de entrar.',over_email_send_rate_limit:'Se alcanzó el límite de correos. Espera unos minutos antes de volver a intentarlo.',email_address_not_authorized:'El servicio de correo aún está en modo de prueba. Usa el correo del propietario de Supabase para la primera cuenta.',signup_disabled:'El registro aún no está habilitado.',weak_password:'Elige una contraseña más larga y difícil de adivinar.'}[error?.code||error?.error_code]||(/Invalid login credentials/i.test(error?.message||'')?'Correo o contrase\u00f1a incorrectos.':null)||(/fetch|network/i.test(error?.message||'')?'No hay conexión. Tus datos no se han enviado. Inténtalo de nuevo.':error?.message||'No se pudo completar. Inténtalo de nuevo.'));
async function run(form,work){const buttons=[...form.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await work();}catch(e){say(explain(e),true);}finally{buttons.forEach(b=>b.disabled=false);}}
async function rpc(name,args){const {data,error}=await client.rpc(name,args);if(error)throw error;return data;}
async function coachPending(teamId){const students=await client.from('dulus_students').select('id').eq('team_id',teamId);if(students.error)throw students.error;const studentIds=(students.data||[]).map(x=>x.id);if(!studentIds.length)return 0;const plans=await client.from('dulus_plans').select('id').in('student_id',studentIds);if(plans.error)throw plans.error;const planIds=(plans.data||[]).map(x=>x.id);if(!planIds.length)return 0;const [messages,sessions]=await Promise.all([client.from('dulus_messages').select('id,author_id').in('plan_id',planIds).order('created_at',{ascending:false}).limit(100),client.from('dulus_sessions').select('id,details').in('plan_id',planIds).order('date',{ascending:false}).limit(100)]);if(messages.error)throw messages.error;if(sessions.error)throw sessions.error;let seen=new Set();try{seen=new Set(JSON.parse(localStorage.getItem('dulus-coach-seen:'+user.id+':'+teamId)||'[]'));}catch{}return (messages.data||[]).filter(m=>m.author_id!==user.id&&!seen.has('message:'+m.id)).length+(sessions.data||[]).filter(x=>Number(x.details?.pain||0)>0&&!seen.has('pain:'+x.id)).length;}
function choose(next){mode=next;$('signup-name').hidden=next!=='register';$('auth-name').required=next==='register';$('signup-help').hidden=next!=='register';$('mode-login').setAttribute('aria-pressed',String(next==='login'));$('mode-register').setAttribute('aria-pressed',String(next==='register'));$('auth-submit').textContent=next==='register'?'Crear cuenta':'Entrar';$('auth-password').autocomplete=next==='register'?'new-password':'current-password';$('auth-password').minLength=next==='register'?10:1;say('');}
$('mode-login').onclick=()=>choose('login');$('mode-register').onclick=()=>choose('register');
async function refresh(){
 const current=++refreshId;
 const {data,error}=await client.auth.getUser();
 if(current!==refreshId)return;
 user=data?.user||null;
 $('auth-panel').hidden=!!user;$('member-panel').hidden=!user||recovery;$('recovery-panel').hidden=!recovery||!user;
 if(!user){$('account-teams').replaceChildren();$('profile-name').value='';$('account-email').textContent='';$('invitation-result').textContent='';$('solo-training-card').hidden=true;say(error&&error.name!=='AuthSessionMissingError'?explain(error):'Entra o crea tu cuenta para preparar tu equipo.',!!error&&error.name!=='AuthSessionMissingError');return;}
 $('account-email').textContent=user.email||'';
 const result=await client.from('dulus_accounts').select('display_name').eq('id',user.id).maybeSingle();if(result.error)throw result.error;
 if(current!==refreshId)return;
 const name=result.data?.display_name||user.user_metadata?.display_name||'';
 $('profile-name').value=name;$('account-name').textContent=name||'Completa tu perfil';let soloReady=false;try{const soloResult=await client.rpc('dulus_solo_available');soloReady=!soloResult.error&&soloResult.data===true;}catch{}if(current!==refreshId)return;$('solo-training-card').hidden=!soloReady;
 const teams=await client.from('dulus_teams').select('id,name,owner_id').order('created_at');if(teams.error)throw teams.error;
 if(current!==refreshId)return;
 $('account-teams').replaceChildren();
 if(!teams.data.length)$('account-teams').textContent='Todavía no perteneces a un equipo.';
 for(const team of teams.data){const card=document.createElement('div');card.className='account-team';const title=document.createElement('h3');title.textContent=team.name;const role=document.createElement('p');role.textContent=team.owner_id===user.id?'Tu rol: coach':'Tu rol: alumno';card.append(title,role);const open=document.createElement('a');open.href='team.html?team='+encodeURIComponent(team.id);open.className='secondary-action';open.textContent='Abrir equipo';if(team.owner_id===user.id){const pending=await coachPending(team.id);if(pending){const alert=document.createElement('div');alert.className='account-alert-badge';alert.textContent='🔔 '+pending+' aviso'+(pending===1?'':'s')+' pendiente'+(pending===1?'':'s');card.append(alert);open.textContent='Abrir Centro de Avisos';}}card.append(open);
 if(team.owner_id===user.id){const button=document.createElement('button');button.type='button';button.className='secondary-action';button.textContent='Crear invitación para un alumno';button.onclick=()=>run(card,async()=>{const code=await rpc('dulus_create_invitation',{p_team:team.id});$('invitation-result').textContent='Código: '+code;say('Invitación creada. Puedes copiar el código y compartirlo con tu alumno.');});card.append(button);}else{const access=document.createElement('p');access.className='relationship-note';access.textContent='Acceso compartido con este coach mientras el vínculo esté activo. Tu historial seguirá siendo tuyo si sales del equipo.';card.append(access);const leave=document.createElement('button');leave.type='button';leave.className='secondary-action relationship-danger';leave.textContent='Salir de este equipo';let armed=false,timer=null;leave.onclick=()=>{if(!armed){armed=true;leave.textContent='Confirmar salida · conservar mi historial';clearTimeout(timer);timer=setTimeout(()=>{armed=false;leave.textContent='Salir de este equipo';},6000);return;}run(card,async()=>{await rpc('dulus_leave_team',{p_team:team.id});await refresh();say('Vínculo finalizado. Tu historial se conserva en Entrenamiento personal.');});};card.append(leave);}
 $('account-teams').append(card);}
 say(recovery?'Introduce tu nueva contraseña.':result.data?'Cuenta conectada. Abre tu equipo para gestionar alumnos y entrenamientos en línea.':'Guarda tu nombre para crear un equipo o unirte al de tu coach.');
}
$('auth-form').onsubmit=e=>{e.preventDefault();run(e.currentTarget,async()=>{
 const email=$('auth-email').value.trim(),password=$('auth-password').value;
 let result;
 if(mode==='register')result=await client.auth.signUp({email,password,options:{data:{display_name:$('auth-name').value.trim()},emailRedirectTo:new URL('account.html',location.href).href}});
 else result=await client.auth.signInWithPassword({email,password});
 if(result.error)throw result.error;$('auth-password').value='';
 if(result.data.session)await refresh();else say('Revisa tu correo para confirmar la cuenta. Después vuelve aquí e inicia sesión.');
 });};
$('forgot-password').onclick=()=>run($('auth-panel'),async()=>{const email=$('auth-email');if(!email.value||!email.reportValidity()){say('Escribe primero tu correo electrónico.',true);return;}const {error}=await client.auth.resetPasswordForEmail(email.value.trim(),{redirectTo:new URL('account.html',location.href).href});if(error)throw error;say('Si existe una cuenta para ese correo, recibirás un enlace para cambiar la contraseña.');});
$('recovery-form').onsubmit=e=>{e.preventDefault();run(e.currentTarget,async()=>{const {error}=await client.auth.updateUser({password:$('new-password').value});if(error)throw error;$('new-password').value='';recovery=false;await refresh();say('Contraseña actualizada.');});};
$('profile-form').onsubmit=e=>{e.preventDefault();run(e.currentTarget,async()=>{await rpc('dulus_save_account',{p_name:$('profile-name').value.trim()});await refresh();say('Nombre guardado.');});};
$('team-form').onsubmit=e=>{e.preventDefault();run(e.currentTarget,async()=>{await rpc('dulus_save_account',{p_name:$('profile-name').value.trim()});await rpc('dulus_create_team',{p_name:$('team-name').value.trim()});$('team-name').value='';await refresh();say('Equipo creado. Ya puedes preparar una invitación.');});};
$('join-form').onsubmit=e=>{e.preventDefault();run(e.currentTarget,async()=>{const token=$('invite-code').value.trim();if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))throw Error('Revisa el código de invitación.');await rpc('dulus_save_account',{p_name:$('profile-name').value.trim()});await rpc('dulus_join_team',{p_token:token});$('invite-code').value='';await refresh();say('Ya perteneces al equipo de tu coach.');});};
$('sign-out').onclick=()=>run($('member-panel'),async()=>{const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;recovery=false;await refresh();say('Sesión cerrada.');});
client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')recovery=true;if(['SIGNED_IN','SIGNED_OUT','PASSWORD_RECOVERY','USER_UPDATED'].includes(event))setTimeout(()=>refresh().catch(e=>say(explain(e),true)),0);});
refresh().catch(e=>say(explain(e),true));
})();