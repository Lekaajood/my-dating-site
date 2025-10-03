
// app.js — نسخة مع صور من Picsum + fallback
const EMAIL_DOMAIN = "example.com"; 
let INDEX = [], QUEUE = [], VISIBLE = [], CACHE = {};
let pendingTarget = null;

function photoUrl(id){ return `https://picsum.photos/seed/girl${id}/400/400`; }

const FALLBACK = [
  { id: 1, name: "ليلى الخطيب", age: 23, city: "بيروت", height: "165", weight: "55", hobby: "القراءة",  photo: photoUrl(1) },
  { id: 2, name: "نور المصري",  age: 25, city: "القاهرة", height: "160", weight: "52", hobby: "التصوير", photo: photoUrl(2) },
  { id: 3, name: "سارة الهاشمي", age: 22, city: "دبي",   height: "162", weight: "54", hobby: "الطبخ",    photo: photoUrl(3) },
  { id: 4, name: "مريم الأحمد", age: 24, city: "الرياض", height: "168", weight: "58", hobby: "الرياضة", photo: photoUrl(4) },
  { id: 5, name: "هناء عمر",    age: 21, city: "عمّان",  height: "164", weight: "53", hobby: "الموسيقى", photo: photoUrl(5) }
];

async function loadIndex() {
  try {
    let res = await fetch("profiles/index.json", { cache: "no-store" });
    if (!res.ok) throw new Error("no profiles");
    INDEX = await res.json();
    INDEX = INDEX.map(e => ({ ...e, photo: e.photo || photoUrl(e.id) }));
  } catch (e) {
    console.warn("استخدمنا fallback", e);
    INDEX = FALLBACK;
  }
  QUEUE = [...INDEX];
  nextSuggestions();
}

function nextSuggestions() {
  VISIBLE = QUEUE.splice(0, 5);
  renderCards();
}

function renderCards() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  VISIBLE.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.photo}" alt="${p.name}" style="width:100%;height:220px;object-fit:cover;border-radius:10px">
      <h3>${p.name} ${p.age ? "(" + p.age + ")" : ""}</h3>
      ${p.city ? `<p>🏙️ ${p.city}</p>` : ""}
      ${p.height && p.weight ? `<p>📏 ${p.height} سم – ⚖️ ${p.weight} كغ</p>` : ""}
      <p>🎯 الهواية: ${p.hobby||"—"}</p>
      <button onclick="contact('${p.name}')">راسلها</button>
    `;
    feed.appendChild(card);
  });
}

function contact(name) {
  const email = name.replace(/\s+/g, ".") + "@" + EMAIL_DOMAIN;
  window.location.href = `mailto:${email}?subject=مرحبا ${name}`;
  nextSuggestions();
}

loadIndex();
