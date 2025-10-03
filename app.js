// No upfront login. Show 5 cards. On "راسلها": ask login ONCE (modal), then proceed and rotate card.
const EMAIL_DOMAIN = "example.com"; // عدلها لو عندك دومين
let INDEX=[], QUEUE=[], VISIBLE=[], CACHE={};
let pendingTarget = null; // holds {id} when user clicked message but not logged yet

function getUser(){ try{return JSON.parse(localStorage.getItem('user'))||null;}catch(e){return null;} }
function setUser(u){ localStorage.setItem('user', JSON.stringify(u)); }
function sanitizeLocal(s){ return s.replace(/\s+/g,'').toLowerCase().replace(/[^\u0600-\u06FFa-z0-9]/g,''); }
function mailtoFor(name, id){
  const to = encodeURIComponent(sanitizeLocal(name)+id+'@'+EMAIL_DOMAIN);
  const u = getUser(); const who = u ? (u.name+' — '+u.email) : 'زائر';
  const subject = encodeURIComponent('رسالة إلى '+name);
  const body = encodeURIComponent('مرحباً '+name+'\n\n[اكتب رسالتك هنا]\n\n—\nالمرسل: '+who);
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function takeNext(){ if(QUEUE.length===0) QUEUE=shuffle(INDEX.map(e=>e.id)); return QUEUE.shift(); }

async function fetchIndex(){ const r=await fetch('profiles/index.json'); INDEX=await r.json(); QUEUE=shuffle(INDEX.map(e=>e.id)); }
async function fetchProfile(id){ if(CACHE[id])return CACHE[id]; const r=await fetch(`profiles/${id}.json`); const d=await r.json(); CACHE[id]=d; return d; }
async function initVisible(){ VISIBLE=[]; for(let i=0;i<5;i++) VISIBLE.push(takeNext()); }

function openModal(p){
  const modal=document.getElementById('modal'); const body=document.getElementById('modalBody');
  body.innerHTML=`
    <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
      <img src="${p.photo}" alt="${p.name}" style="width:180px;height:180px;object-fit:cover;border-radius:10px;border:1px solid #eee">
      <div style="flex:1">
        <div class="detail"><div>الاسم</div><div>${p.name}</div></div>
        <div class="detail"><div>العمر</div><div>${p.age}</div></div>
        <div class="detail"><div>المكان</div><div>${p.city}</div></div>
        <div class="detail"><div>الطول</div><div>${p.height_cm} سم</div></div>
        <div class="detail"><div>الوزن</div><div>${p.weight_kg} كغ</div></div>
        <div class="detail"><div>الهواية</div><div>${p.hobby}</div></div>
      </div>
    </div>`;
  modal.classList.remove('hidden');
}
function closeModal(){ document.getElementById('modal').classList.add('hidden'); }

function openLogin(){ document.getElementById('loginModal').classList.remove('hidden'); }
function closeLogin(){ document.getElementById('loginModal').classList.add('hidden'); }

function renderCards(){
  const root=document.getElementById('cards');
  const map=new Map(INDEX.map(e=>[e.id,e]));
  root.innerHTML=VISIBLE.map(id=>{
    const e=map.get(id);
    return `
      <div class="card" data-id="${id}">
        <img src="${e.photo}" alt="${e.name}">
        <div class="body">
          <div class="name" data-id="${e.id}">${e.name}</div>
          <div class="meta">الهواية: ${e.hobby}</div>
          <div class="actions">
            <a href="#" class="btn message" data-id="${e.id}">راسلها</a>
            <a href="#" class="btn secondary skip" data-id="${e.id}">تخطي</a>
          </div>
        </div>
      </div>`;
  }).join('');

  root.querySelectorAll('.name').forEach(el=>{
    el.addEventListener('click', async (ev)=>{
      const id=Number(ev.currentTarget.getAttribute('data-id'));
      const p=await fetchProfile(id); openModal(p);
    });
  });
  root.querySelectorAll('.message').forEach(el=>{
    el.addEventListener('click', async (ev)=>{
      ev.preventDefault();
      const id=Number(ev.currentTarget.getAttribute('data-id'));
      const p=await fetchProfile(id);
      const u=getUser();
      if(!u){ pendingTarget={id}; openLogin(); return; }
      window.location.href=mailtoFor(p.name, p.id);
      replaceCard(id);
    });
  });
  root.querySelectorAll('.skip').forEach(el=>{
    el.addEventListener('click', (ev)=>{ ev.preventDefault(); const id=Number(el.getAttribute('data-id')); replaceCard(id); });
  });
}

function replaceCard(id){
  const idx=VISIBLE.indexOf(id); if(idx===-1) return;
  VISIBLE[idx]=takeNext(); renderCards();
}

document.addEventListener('DOMContentLoaded', async ()=>{
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e)=>{ if(e.target.id==='modal') closeModal(); });
  document.getElementById('closeLogin').addEventListener('click', closeLogin);
  document.getElementById('loginForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name=document.getElementById('loginName').value.trim();
    const email=document.getElementById('loginEmail').value.trim();
    if(!name||!email){ alert('اكتب اسمك وإيميلك'); return; }
    setUser({name,email}); closeLogin();
    if(pendingTarget){ // proceed to mailto now
      fetchProfile(pendingTarget.id).then(p=>{
        window.location.href=mailtoFor(p.name, p.id);
        replaceCard(pendingTarget.id);
        pendingTarget=null;
      });
    }
  });

  await fetchIndex(); await initVisible(); renderCards();
});
