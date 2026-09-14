const {chromium}=await import(process.env.DULUS_PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://localhost:4173/account.html');await page.locator('#auth-panel').waitFor({state:'visible'});assert.match(await page.locator('#account-status').innerText(),/Entra o crea/);
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:850});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 await page.locator('#mode-register').click();assert.equal(await page.locator('#auth-name').isVisible(),true);assert.equal(await page.locator('#auth-password').getAttribute('minlength'),'10');
 await page.locator('#mode-login').click();assert.equal(await page.locator('#auth-name').isVisible(),false);
 await page.route('https://rnrciqyngdequkbmttxu.supabase.co/auth/v1/token**',route=>route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({code:'invalid_credentials',error_code:'invalid_credentials',message:'Invalid login credentials'})}));
 await page.locator('#auth-email').fill('qa@example.invalid');await page.locator('#auth-password').fill('not-a-real-password');await page.locator('#auth-submit').click();
 await page.waitForFunction(()=>document.querySelector('#account-status').textContent.includes('incorrectos'));assert.equal(await page.locator('#auth-password').inputValue(),'not-a-real-password');
 await page.locator('#mode-register').click();await page.locator('#auth-name').fill('QA');
 await page.route('https://rnrciqyngdequkbmttxu.supabase.co/auth/v1/signup**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:'00000000-0000-4000-8000-000000000001',email:'qa@example.invalid',identities:[]})}));
 await page.locator('#auth-submit').click();await page.waitForFunction(()=>document.querySelector('#account-status').textContent.includes('Revisa tu correo'));assert.equal(await page.locator('#auth-password').inputValue(),'');
 await page.setViewportSize({width:390,height:900});await page.screenshot({path:process.env.DULUS_QA_SCREENSHOT||'dulus-account-qa.png',fullPage:true});
 const apikey='sb_publishable_LqmoY41LO5axFmitkS2_FQ_o7QlCROr';
 const settings=await fetch('https://rnrciqyngdequkbmttxu.supabase.co/auth/v1/settings',{headers:{apikey}});assert.equal(settings.status,200);const config=await settings.json();assert.equal(config.external.email,true);
 const denied=await fetch('https://rnrciqyngdequkbmttxu.supabase.co/rest/v1/dulus_accounts?select=id',{headers:{apikey}});assert.ok([401,403].includes(denied.status));
 assert.deepEqual(errors,[]);console.log('PASS: responsive UI, login error, signup confirmation UI (mocked, no emails sent), real email provider reachable and anonymous database access denied.');
}catch(error){console.log('DIAGNOSTIC',await page.locator('#account-status').innerText(),JSON.stringify(errors));throw error;}finally{await browser.close();}