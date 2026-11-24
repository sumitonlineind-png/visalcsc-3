'use strict';
const F=fbInit();let db,auth,orders=[],svcs=[],flt='new',fails=0,lockT=0,idle;
const OPT=Object.keys(ST).map(k=>k);
function show(on){$('lf').hidden=on;$('panel').hidden=!on;$('out').hidden=!on}
if(!F){$('lerr').textContent='Firebase load nahi hua. Internet check karke refresh karo.'}else{db=F.db;auth=F.auth;
 auth.onAuthStateChanged(u=>{show(!!u);if(u)start()});}
$('lf').onsubmit=async e=>{e.preventDefault();$('lerr').textContent='';if(!F)return;
 if(Date.now()<lockT){$('lerr').textContent='Bahut koshish ho gayi — 1 minute baad try karo.';return}
 try{await auth.signInWithEmailAndPassword($('ae').value.trim(),$('ap').value)}catch(x){if(++fails>=5){fails=0;lockT=Date.now()+60000}$('lerr').textContent='Login nahi hua — email ya password galat hai.'}};
$('out').onclick=()=>auth.signOut();
const arm=()=>{clearTimeout(idle);if(auth&&auth.currentUser)idle=setTimeout(()=>auth.signOut(),30*60000)};
['click','keydown','touchstart'].forEach(v=>document.addEventListener(v,arm,{passive:true}));
$('tabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('.pane').forEach(p=>p.hidden=p.id!==b.dataset.t);[...$('tabs').children].forEach(x=>x.classList.toggle('on',x===b))};
let started=false;
function start(){if(started)return;started=true;arm();const q=e=>console.warn(e.code);
 db.collection('orders').orderBy('createdAt','desc').limit(150).onSnapshot(sn=>{orders=sn.docs.map(d=>({id:d.id,...d.data()}));renderOrders()},q);
 db.collection('services').onSnapshot(sn=>{svcs=sn.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0));renderSvcs()},q);
 db.collection('news').orderBy('createdAt','desc').limit(30).onSnapshot(sn=>{$('nl').innerHTML=sn.docs.map(d=>{const n=d.data();return `<div class="card rowb"><span class="grow">${esc(n.text)}</span><button class="btn out sm" data-nt="${d.id}" data-a="${n.active?1:0}">${n.active?'Live ✓':'Hidden'}</button><button class="btn dng sm" data-del="news/${d.id}">Delete</button></div>`}).join('')},q);
 db.collection('posts').orderBy('createdAt','desc').limit(30).onSnapshot(sn=>{$('pl').innerHTML=sn.docs.map(d=>{const p=d.data();return `<div class="card rowb">${okImg(p.image)?`<img src="${p.image}" alt="" width="48" height="48" style="border-radius:8px;object-fit:cover">`:''}<span class="grow">${esc(p.title)}</span><button class="btn dng sm" data-del="posts/${d.id}">Delete</button></div>`}).join('')},q);
 db.doc('settings/shop').onSnapshot(d=>{const s=d.data()||{};$('so').checked=s.open!==false;if(document.activeElement!==$('sh'))$('sh').value=s.hours||'9AM – 8PM'},q);
}
function renderOrders(){
 const n=orders.filter(o=>o.status==='new').length;$('ncnt').textContent=n||'';$('ncnt').hidden=!n;document.title=(n?`(${n}) `:'')+'Vishal CSC Admin';
 $('fl').innerHTML=['new','processing','ready','done','cancelled','all'].map(k=>`<button class="btn out sm ${flt===k?'on':''}" data-f="${k}">${k==='all'?'Sab':ST[k]}</button>`).join('');
 const l=orders.filter(o=>flt==='all'||o.status===flt);
 $('ol').innerHTML=l.map(o=>{const m=esc(o.mobile),id=o.id,msg=encodeURIComponent(`Namaste ${o.name}, aapka order #${id.slice(0,6).toUpperCase()} (${o.service}) — Vishal CSC Centre.`);
  return `<div class="card ord"><div class="rowb"><b>${esc(o.service)}</b><span class="st ${esc(o.status)}">${esc(ST[o.status]||o.status)}</span></div><p><b>${esc(o.name)}</b> · <a href="tel:${m}" style="color:var(--ac)">${m}</a></p>${o.details?`<p class="mu">${esc(o.details)}</p>`:''}<p class="mu">#${esc(id.slice(0,6).toUpperCase())} · ${fmt(o.createdAt)}</p><div class="acts"><select data-st="${id}" aria-label="Status">${OPT.map(k=>`<option value="${k}" ${o.status===k?'selected':''}>${ST[k]}</option>`).join('')}</select><a class="btn out sm" href="tel:${m}">Call</a><a class="btn out sm" target="_blank" rel="noopener noreferrer" href="https://wa.me/91${m}?text=${msg}">WhatsApp</a><button class="btn dng sm" data-del="orders/${id}">Delete</button></div></div>`}).join('')||'<p class="mu">Is category mein koi order nahi.</p>'}
function renderSvcs(){$('sl').innerHTML=svcs.map(s=>`<div class="card row"><span class="ico">${ic(s.icon||'file-text')}</span><div class="grow"><h3>${esc(s.name)} ${s.active===false?'<span class="st cancelled">Hidden</span>':''}</h3><p class="mu" style="font-size:.85rem">${esc(s.desc)}</p>${s.price?`<span class="price">${esc(s.price)}</span>`:''}</div><div class="stack"><button class="btn out sm" data-edit="${s.id}">Edit</button><button class="btn dng sm" data-del="services/${s.id}">Delete</button></div></div>`).join('')||'<p class="mu">Abhi koi service nahi.</p>';$('seed').hidden=svcs.length>0}
$('si').innerHTML=ICONS.map(i=>`<option>${i}</option>`).join('');
function clearSvc(){$('sf').reset();$('sid').value='';$('sact').checked=true;$('sfh').textContent='Nayi service jodo'}
$('addS').onclick=()=>{clearSvc();$('sfw').hidden=false;$('sn').focus()};
$('cancelS').onclick=()=>{$('sfw').hidden=true};
$('sf').onsubmit=async e=>{e.preventDefault();
 const d={name:$('sn').value.trim(),desc:$('sd').value.trim(),icon:$('si').value,price:$('sp').value.trim(),order:Number($('so2').value)||0,active:$('sact').checked},id=$('sid').value;
 try{id?await db.collection('services').doc(id).update(d):await db.collection('services').add(d);$('sfw').hidden=true}catch(x){alert('Save nahi hua (login/rules check karo)')}};
$('seed').onclick=async()=>{if(!confirm('14 default services daalein?'))return;const b=db.batch();DEF.forEach((s,i)=>b.set(db.collection('services').doc(),{...s,price:'',order:i+1,active:true}));try{await b.commit()}catch(x){alert('Nahi hua')}};
$('addN').onclick=async()=>{const t=$('ni').value.trim();if(!t)return;try{await db.collection('news').add({text:t,active:true,createdAt:F.ts()});$('ni').value=''}catch(x){alert('Nahi hua')}};
const shrink=f=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const k=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.72))};im.onerror=rej;im.src=URL.createObjectURL(f)});
$('addP').onclick=async()=>{const t=$('pt').value.trim();if(!t)return;$('pm').textContent='Uploading…';
 try{const f=$('pf').files[0],image=f?await shrink(f):'';await db.collection('posts').add({title:t,body:$('pb').value.trim(),image,createdAt:F.ts()});$('pt').value='';$('pb').value='';$('pf').value='';$('pm').textContent='Published ✓'}catch(x){$('pm').textContent='Nahi hua — chhoti photo try karo'}};
$('saveShop').onclick=async()=>{try{await db.doc('settings/shop').set({open:$('so').checked,hours:$('sh').value.trim()},{merge:true});$('shm').textContent='Saved ✓'}catch(x){$('shm').textContent='Save nahi hua'}};
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
 try{
 if(b.dataset.f){flt=b.dataset.f;renderOrders()}
 else if(b.dataset.edit){const s=svcs.find(x=>x.id===b.dataset.edit);$('sid').value=s.id;$('sn').value=s.name;$('sd').value=s.desc||'';$('si').value=s.icon||'file-text';$('sp').value=s.price||'';$('so2').value=s.order||0;$('sact').checked=s.active!==false;$('sfh').textContent='Service edit karo';$('sfw').hidden=false;$('sn').focus()}
 else if(b.dataset.nt)await db.collection('news').doc(b.dataset.nt).update({active:b.dataset.a!=='1'});
 else if(b.dataset.del&&confirm('Delete karna hai?')){const[c,i]=b.dataset.del.split('/');await db.collection(c).doc(i).delete()}
 }catch(x){alert('Nahi hua — permission check karo')}});
document.addEventListener('change',async e=>{const s=e.target.closest('[data-st]');if(s)try{await db.collection('orders').doc(s.dataset.st).update({status:s.value})}catch(x){alert('Status update nahi hua')}});
regSW('/admin-sw.js','/admin');
