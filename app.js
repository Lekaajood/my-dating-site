document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('feed') || document.getElementById('people-container');
  if (!mount) return;
  const people = [
    {name:'ليلى', age:28, city:'عمّان', bio:'أحب السفر والموسيقى', photo:'https://i.pravatar.cc/300?img=47'},
    {name:'أحمد', age:30, city:'القاهرة', bio:'رياضي وهادئ', photo:'https://i.pravatar.cc/300?img=52'},
    {name:'سارة', age:24, city:'الرياض', bio:'قراءة وطبخ', photo:'https://i.pravatar.cc/300?img=56'},
    {name:'خالد', age:27, city:'دبي', bio:'تكنولوجيا وجري', photo:'https://i.pravatar.cc/300?img=15'}
  ];
  mount.innerHTML = people.map(p => `
    <div class="card">
      <img src="${p.photo}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="meta">${p.age} سنة • ${p.city}</div>
      <p>${p.bio}</p>
    </div>
  `).join('');
});