'use strict';
const F=fbInit();let svc=DEF,uid=null,dp=null,last=0;
const store=(()=>{try{return JSON.parse(localStorage.getItem('cust')||'{}')}catch(e){return{}}})();
function render(){const q=$('q').value.trim().toLowerCase();
 $('list').innerHTML=svc.filter(s=>(s.name+' '+(s.desc||'')).toLowerCase().includes(q)).map(s=>`<div class="card row"><span class="ico">${ic(s.icon||'file-text')}</span><div class="grow"><h3>${esc(s.name)}</h3><p class="mu" style="font-size:.88rem">${esc(s.desc)}</p>${s.price?`<span class="price">${esc(s.price)}</span>`:''}</div><button class="btn pri sm" data-o="${esc(s.name)}">Order</button></div>`).join('')||'<p class="mu">Kuch nahi mila.</p>'}
function setSvc(l){svc=l;render();$('os').innerHTML=l.map(x=>`<option>${esc(x.name)}</option>`).join('')+'<option>Other</option>'}
setSvc(DEF);$('q').oninput=render;
document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!=='v-'+b.dataset.v);document.querySelectorAll('.bnav button').forEach(x=>x.classList.toggle('on',x===b));scrollTo(0,0)});
function openSheet(name){$('os').value=name||svc[0].name;$('on').value=store.name||'';$('om').value=store.mobile||'';$('od').value='';$('msg').hidden=true;$('of').hidden=false;$('sheet').hidden=false}
document.addEventListener('click',e=>{const b=e.target.closest('[data-o]');if(b)openSheet(b.dataset.o);if(e.target.closest('[data-close]')||e.target===$('sheet'))$('sheet').hidden=true});
$('of').onsubmit=async e=>{e.preventDefault();
 const o={service:$('os').value,name:$('on').value.trim(),mobile:$('om').value.trim(),details:$('od').value.trim()};
 const wa='https://wa.me/919812321208?text='+encodeURIComponent(`Order\nService: ${o.service}\nName: ${o.name}\nMobile: ${o.mobile}\n${o.details}`);
 localStorage.setItem('cust',JSON.stringify({name:o.name,mobile:o.mobile}));
 const show=(h)=>{$('of').hidden=true;$('msg').hidden=false;$('msg').innerHTML=h};
 if(Date.now()-last<30000){show('<p>Thoda ruko, 30 second baad dobara try karo.</p>');return}
 if(!F||!uid){show(`<h3>Order abhi online nahi ja pa raha</h3><p style="margin:8px 0 14px">WhatsApp par bhej do, hum turant dekhenge.</p><a class="btn pri w" target="_blank" rel="noopener noreferrer" href="${wa}">WhatsApp par bhejo</a>`);return}
 try{last=Date.now();const r=await F.db.collection('orders').add({uid,service:o.service,name:o.name,mobile:o.mobile,details:o.details,status:'new',createdAt:F.ts()});
  show(`<div style="text-align:center"><div class="ico" style="margin:0 auto 12px">${ic('circle-check')}</div><h3>Order mil gaya!</h3><p style="margin:8px 0">Order number: <b>#${esc(r.id.slice(0,6).toUpperCase())}</b></p><p class="mu">Hum jaldi call karenge. Documents shop par ya WhatsApp par dein — yahan upload na karein.</p><button class="btn dk w" style="margin-top:16px" data-close>Theek hai</button></div>`)}
 catch(x){show(`<h3>Order nahi gaya</h3><p style="margin:8px 0 14px">Internet check karo ya WhatsApp par bhejo.</p><a class="btn pri w" target="_blank" rel="noopener noreferrer" href="${wa}">WhatsApp par bhejo</a>`)}};
function myOrders(l){$('mo').innerHTML=l.length?l.map(o=>`<div class="card ord"><div class="rowb"><b>${esc(o.service)}</b><span class="st ${esc(o.status)}">${esc(ST[o.status]||o.status)}</span></div><p class="mu">#${esc(o.id.slice(0,6).toUpperCase())} · ${fmt(o.createdAt)}</p>${o.details?`<p>${esc(o.details)}</p>`:''}</div>`).join(''):'<p class="mu">Abhi tak koi order nahi.</p>'}
if(F){
 watchShared(F.db,setSvc);
 F.auth.onAuthStateChanged(u=>{if(!u){F.auth.signInAnonymously().catch(()=>{});return}uid=u.uid;
  F.db.collection('orders').where('uid','==',uid).onSnapshot(sn=>myOrders(sn.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?b.createdAt.toMillis():9e15)-(a.createdAt?a.createdAt.toMillis():9e15))),()=>{})});
}else myOrders([]);
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('inst').hidden=false});
$('inst').onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;$('inst').hidden=true}};
regSW('/app-sw.js','/app');
