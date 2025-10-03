// app.js — Firebase Dating MVP
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const authSection = document.getElementById('authSection');
const authForm = document.getElementById('authForm');
const logoutBtn = document.getElementById('logoutBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const profileEditor = document.getElementById('profileEditor');
const profileForm = document.getElementById('profileForm');
const feed = document.getElementById('feed');
const cards = document.getElementById('cards');

authForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password).catch(async (err) => {
      if (err.code === 'auth/user-not-found') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else throw err;
    });
  } catch (err) {
    alert('خطأ في تسجيل الدخول: ' + err.message);
  }
});

logoutBtn?.addEventListener('click', () => signOut(auth));
editProfileBtn?.addEventListener('click', () => profileEditor.classList.toggle('hidden'));

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    editProfileBtn.classList.remove('hidden');
    profileEditor.classList.remove('hidden');
    await loadOrCreateProfile(user.uid);
    await loadFeed(user.uid);
  } else {
    authSection.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    editProfileBtn.classList.add('hidden');
    profileEditor.classList.add('hidden');
    feed.classList.add('hidden');
  }
});

async function loadOrCreateProfile(uid){
  const ref = doc(db, 'profiles', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { name: "", age: 18, gender: "", lookingFor: "", bio: "", photoURL: "", likes: [] });
  } else {
    const p = snap.data();
    document.getElementById('name').value = p.name || "";
    document.getElementById('age').value = p.age || 18;
    document.getElementById('gender').value = p.gender || "";
    document.getElementById('lookingFor').value = p.lookingFor || "";
    document.getElementById('bio').value = p.bio || "";
  }
}

profileForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  const file = document.getElementById('photo').files[0];
  let photoURL = null;
  if (file) {
    const r = ref(storage, `photos/${user.uid}/${file.name}`);
    await uploadBytes(r, file);
    photoURL = await getDownloadURL(r);
  }
  const data = {
    name: document.getElementById('name').value.trim(),
    age: Number(document.getElementById('age').value),
    gender: document.getElementById('gender').value,
    lookingFor: document.getElementById('lookingFor').value,
    bio: document.getElementById('bio').value,
  };
  if (photoURL) data.photoURL = photoURL;
  await setDoc(doc(db, 'profiles', user.uid), data, { merge: true });
  alert('تم حفظ البروفايل ✅');
  await loadFeed(user.uid);
});

async function loadFeed(uid){
  const q = query(collection(db, 'profiles'));
  const qs = await getDocs(q);
  const items = [];
  qs.forEach(d => { if (d.id !== uid) items.push({ id: d.id, ...d.data() }); });
  cards.innerHTML = items.map(renderCard).join('');
  feed.classList.remove('hidden');
}

function renderCard(p){
  const img = p.photoURL ? `<img src="${p.photoURL}" alt="photo">` : `<img src="https://picsum.photos/seed/${encodeURIComponent(p.name||'user')}/400/300" alt="ph">`;
  return `
  <div class="person" data-id="${p.id}">
    ${img}
    <div class="pbody">
      <h3>${escapeHTML(p.name || 'مستخدم')}</h3>
      <div class="meta">${p.age || '؟'} سنة • ${p.gender || ''}</div>
      <p>${escapeHTML(p.bio || '')}</p>
      <div class="likebar">
        <button class="btn" onclick="likeUser('${p.id}')">إعجاب ❤️</button>
      </div>
    </div>
  </div>`;
}

window.likeUser = async function(targetId){
  const user = auth.currentUser;
  if (!user) return alert('سجل دخول أولاً');
  const myRef = doc(db, 'profiles', user.uid);
  const mySnap = await getDoc(myRef);
  const my = mySnap.data();
  const likes = new Set(my.likes || []);
  likes.add(targetId);
  await updateDoc(myRef, { likes: Array.from(likes) });
  alert('أُضيف إعجابك ✅');
}

function escapeHTML(str){return (str||'').replace(/[&<>'"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[s]))}
