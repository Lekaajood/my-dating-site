
const EMAIL_DOMAIN = "example.com";
let INDEX=[], QUEUE=[], VISIBLE=[], CACHE={}, pendingTarget=null;

function photoFallback(id){ return `https://picsum.photos/seed/girl${id}/400/400`; }
function getUser(){ try{return JSON.parse(localStorage.getItem('user'))||null;}catch(e){return null;} }
function setUser(u){ localStorage.setItem('user', JSON.stringify(u)); }
function sanitizeLocal(s){ return s.replace(/\s+/g,'').toLowerCase().replace(/[^\u0600-\u06FFa-z0-9]/g,''); }
function mailtoFor(name, id){
  const to=encodeURIComponent(sanitizeLocal(name)+id+'@'+EMAIL_DOMAIN);
  const u=getUser(); const who=u?(u.name+' — '+u.email):'زائر';
  const subject=encodeURIComponent('رسالة إلى '+name);
  const body=encodeURIComponent('مرحباً '+name+'\n\n[اكتب رسالتك هنا]\n\n—\nالمرسل: '+who);
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function takeNext(){ if(QUEUE.length===0) QUEUE = shuffle(INDEX.map(e=>e.id)); return QUEUE.shift(); }

async function fetchIndex(){
  try{
    const r = await fetch('profiles/index.json',{cache:'no-store'});
    INDEX = await r.json();
    INDEX = INDEX.map(e => ({...e, photo: e.photo || photoFallback(e.id)}));
  }catch(e){
    INDEX = Array.from({length:10}, (_,i)=>({id:i+1,name:'مجهولة '+(i+1),hobby:'—',photo:photoFallback(i+1)}));
  }
  QUEUE = shuffle(INDEX.map(e=>e.id));
}
async function fetchProfile(id){
  if(CACHE[id]) return CACHE[id];
  try{
    const r = await fetch(`profiles/${id}.json`,{cache:'no-store'});
    const d = await r.json();
    d.photo = d.photo || photoFallback(id);
    CACHE[id] = d; return d;
  }catch(e){
    const lite = INDEX.find(x=>x.id===id) || {id,name:'مجهولة',hobby:'—',photo:photoFallback(id)};
    const d = { id, name: lite.name, age:25, city:'—', height_cm:165, weight_kg:55, hobby: lite.hobby, photo: lite.photo };
    CACHE[id]=d; return d;
  }
}
async function initVisible(){ VISIBLE=[]; for(let i=0;i<5;i++) VISIBLE.push(takeNext()); }

function renderCards(){
  const root=document.getElementById('cards');
  const byId=new Map(INDEX.map(e=>[e.id,e]));
  root.innerHTML = VISIBLE.map(id=>{
    const e=byId.get(id);
    return `
      <div class="card" data-id="${id}">
        <img src="${e.photo}" alt="${e.name}">
        <div class="body">
          <div class="name" data-id="${id}">${e.name}</div>
          <div class="meta">الهواية: ${e.hobby||'—'}</div>
          <div class="actions">
            <a href="#" class="btn message" data-id="${id}">راسلها</a>
            <a href="#" class="btn ghost skip" data-id="${id}">تخطي</a>
          </div>
        </div>
      </div>`;
  }).join('');

  root.querySelectorAll('.name').forEach(n=>n.addEventListener('click', async (ev)=>{
    const id=Number(ev.currentTarget.getAttribute('data-id'));
    const p=await fetchProfile(id); openProfile(p);
  }));
  root.querySelectorAll('.message').forEach(btn=>btn.addEventListener('click', async (ev)=>{
    ev.preventDefault();
    const id=Number(btn.getAttribute('data-id')); const p=await fetchProfile(id);
    const u=getUser(); if(!u){ pendingTarget={id}; openLogin(); return; }
    window.location.href = mailtoFor(p.name, p.id);
    replaceCard(id);
  }));
  root.querySelectorAll('.skip').forEach(btn=>btn.addEventListener('click', (ev)=>{
    ev.preventDefault(); const id=Number(btn.getAttribute('data-id')); replaceCard(id);
  }));
}
function replaceCard(id){ const i=VISIBLE.indexOf(id); if(i===-1) return; VISIBLE[i]=takeNext(); renderCards(); }

function openProfile(p){
  const modal=document.getElementById('profileModal');
  const body=document.getElementById('profileBody');
  body.innerHTML = `
    <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
      <img src="${p.photo}" alt="${p.name}" style="width:180px;height:180px;object-fit:cover;border-radius:10px;border:1px solid #eee">
      <div style="flex:1">
        <div class="detail"><div>الاسم</div><div>${p.name}</div></div>
        <div class="detail"><div>العمر</div><div>${p.age||'—'}</div></div>
        <div class="detail"><div>المدينة</div><div>${p.city||'—'}</div></div>
        <div class="detail"><div>الطول</div><div>${p.height_cm||'—'} سم</div></div>
        <div class="detail"><div>الوزن</div><div>${p.weight_kg||'—'} كغ</div></div>
        <div class="detail"><div>الهواية</div><div>${p.hobby||'—'}</div></div>
      </div>
    </div>`;
  modal.classList.remove('hidden');
}
function closeProfile(){ document.getElementById('profileModal').classList.add('hidden'); }
function openLogin(){ document.getElementById('loginModal').classList.remove('hidden'); }
function closeLogin(){ document.getElementById('loginModal').classList.add('hidden'); }

document.addEventListener('DOMContentLoaded', async ()=>{
  document.getElementById('closeProfile').addEventListener('click', closeProfile);
  document.getElementById('profileModal').addEventListener('click', (e)=>{ if(e.target.id==='profileModal') closeProfile(); });
  document.getElementById('closeLogin').addEventListener('click', closeLogin);
  document.getElementById('loginForm').addEventListener('submit', (e)=>{
    e.preventDefault(); const name=document.getElementById('loginName').value.trim(); const email=document.getElementById('loginEmail').value.trim();
    if(!name||!email){ alert('اكتب اسمك وإيميلك'); return; }
    localStorage.setItem('user', JSON.stringify({name,email})); closeLogin();
    if(pendingTarget){ fetchProfile(pendingTarget.id).then(p=>{ window.location.href=mailtoFor(p.name, p.id); replaceCard(pendingTarget.id); pendingTarget=null; }); }
  });

  await fetchIndex(); await initVisible(); renderCards();
});
