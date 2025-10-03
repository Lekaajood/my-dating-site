async function loadFeed(){
  const res = await fetch('people.json');
  const items = await res.json();
  const feed = document.getElementById('feed');
  feed.innerHTML = items.map(renderCard).join('');
}
function renderCard(p){
  return `<div class="card">
    <img src="${p.photoURL}" alt="${p.name}">
    <h3>${p.name}, ${p.age}</h3>
    <p>${p.bio}</p>
  </div>`;
}
window.onload = loadFeed;
