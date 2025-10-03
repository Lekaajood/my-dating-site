
const EMAIL_DOMAIN='example.com';
let INDEX=[], QUEUE=[], VISIBLE=[], CACHE={}, pendingTarget=null;
function photoFallback(id){return `https://picsum.photos/seed/girl${id}/600/600`;}

async function fetchIndex(){ const r = await fetch('profiles/index.json'); INDEX = await r.json(); QUEUE = INDEX.map(e=>e.id); shuffleInPlace(QUEUE); }
function shuffleInPlace(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

async function fetchProfile(id){ if(CACHE[id]) return CACHE[id]; const r = await fetch(`profiles/${id}.json`); const d = await r.json(); CACHE[id]=d; return d; }

function takeNext(){ if(QUEUE.length===0) QUEUE = INDEX.map(e=>e.id); return QUEUE.shift(); }

async function initVisible(){ VISIBLE=[]; for(let i=0;i<5;i++) VISIBLE.push(takeNext()); }

function renderCards(){ const root=document.getElementById('cards'); const byId=new Map(INDEX.map(e=>[e.id,e])); root.innerHTML = VISIBLE.map(id=>{ const e=byId.get(id); return `<div class="card" data-id="${id}"><img src="${e.photo}"><div class="body"><div class="name" data-id="${id}">${e.name}</div><div class="meta">الهواية: ${e.hobby||'—'}</div><div class="actions"><a class="btn message" data-id="${id}">راسلها</a><a class="btn" data-id="${id}" onclick="skip(${id})">تخطي</a></div></div></div>`}).join(''); document.querySelectorAll('.name').forEach(n=>n.addEventListener('click', async (ev)=>{ const id=Number(ev.currentTarget.getAttribute('data-id')); const p=await fetchProfile(id); openProfile(p); })); document.querySelectorAll('.message').forEach(b=>b.addEventListener('click', async (ev)=>{ ev.preventDefault(); const id=Number(ev.currentTarget.getAttribute('data-id')); const p=await fetchProfile(id); const u=getUser(); if(!u){ pendingTarget={id}; openLogin(); return; } window.location.href = mailtoFor(p.name,p.id); replaceCard(id); })); }

function skip(id){ const i=VISIBLE.indexOf(id); if(i!==-1) VISIBLE[i]=takeNext(); renderCards(); }
function replaceCard(id){ skip(id); }

function openProfile(p){ const modal=document.getElementById('profileModal'); const body=document.getElementById('profileBody'); body.innerHTML = `<div style="display:flex;gap:12px"><img src="${p.photo}" style="width:160px;height:160px;object-fit:cover;border-radius:8px"><div style="flex:1"><div class="detail"><div>الاسم</div><div>${p.name}</div></div><div class="detail"><div>العمر</div><div>${p.age}</div></div><div class="detail"><div>المدينة</div><div>${p.city}</div></div><div class="detail"><div>الطول</div><div>${p.height_cm} سم</div></div><div class="detail"><div>الوزن</div><div>${p.weight_kg} كغ</div></div><div class="detail"><div>الهواية</div><div>${p.hobby}</div></div></div></div>`; modal.classList.remove('hidden'); }
function closeProfile(){ document.getElementById('profileModal').classList.add('hidden'); }

function getUser(){ try{return JSON.parse(localStorage.getItem('user'))||null;}catch(e){return null;} }
function setUser(u){ localStorage.setItem('user',JSON.stringify(u)); }
function openLogin(){ document.getElementById('loginModal').classList.remove('hidden'); }
function closeLogin(){ document.getElementById('loginModal').classList.add('hidden'); }

function sanitizeLocal(s){ return s.replace(/\s+/g,'').toLowerCase().replace(/[^\u0600-\u06FFa-z0-9]/g,''); }
function mailtoFor(name,id){ const to=encodeURIComponent(sanitizeLocal(name)+id+'@'+EMAIL_DOMAIN); const u=getUser(); const who=u?(u.name+' — '+u.email):'زائر'; const subject=encodeURIComponent('رسالة إلى '+name); const body=encodeURIComponent('مرحباً '+name+'\n\n[اكتب رسالتك هنا]\n\n—\nالمرسل: '+who); return `mailto:${to}?subject=${subject}&body=${body}`; }

document.addEventListener('DOMContentLoaded', async ()=>{ document.getElementById('closeProfile').addEventListener('click', closeProfile); document.getElementById('closeLogin').addEventListener('click', closeLogin); document.getElementById('loginForm').addEventListener('submit',(e)=>{ e.preventDefault(); const name=document.getElementById('loginName').value.trim(); const email=document.getElementById('loginEmail').value.trim(); if(!name||!email){ alert('اكتب اسمك وإيميلك'); return; } setUser({name,email}); closeLogin(); if(pendingTarget){ fetchProfile(pendingTarget.id).then(p=>{ window.location.href = mailtoFor(p.name,p.id); replaceCard(pendingTarget.id); pendingTarget=null; }); } }); await fetchIndex(); await initVisible(); renderCards(); });
