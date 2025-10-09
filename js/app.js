const petsGrid = document.getElementById('pets-grid')
const filterType = document.getElementById('filter-type')
const searchInput = document.getElementById('search')
const applyBtn = document.getElementById('apply-filter')
const viewPets = document.getElementById('view-pets')
const adoptModal = document.getElementById('adopt-modal')
const modalClose = document.querySelector('.modal-close')
const adoptForm = document.getElementById('adopt-form')
let allPets = []

// Load pets from API
async function loadPets(){
  const res = await fetch('/api/pets')
  allPets = await res.json()
  renderPets(allPets)
}

// Render pets in grid
function renderPets(pets){
  petsGrid.innerHTML = ''
  if(!pets.length) petsGrid.innerHTML = '<p class="muted">No pets found</p>'
  pets.forEach(p=>{
    const card = document.createElement('div')
    card.className = 'pet-card'
    card.innerHTML = `
      <div class="pet-photo">${p.photo || '🐶'}</div>
      <div class="pet-meta">
        <strong>${p.name}</strong>
        <div class="muted">${p.type} • ${p.breed || 'Unknown'} • ${p.age || 'Unknown'}</div>
        <p>${p.description ? p.description.slice(0,80) : ''}</p>
        <button class="btn adopt-btn" data-id="${p.id}">Adopt</button>
      </div>`
    petsGrid.appendChild(card)
  })
  document.querySelectorAll('.adopt-btn').forEach(b => b.addEventListener('click', openAdopt))
}

// Open adoption modal
function openAdopt(e){
  const id = e.target.dataset.id
  const pet = allPets.find(x=>x.id == id)
  adoptModal.classList.remove('hidden')
  document.querySelector('#modal-pet-name').textContent = `Adopt ${pet.name}`
  adoptForm.pet_id.value = pet.id
}

modalClose.addEventListener('click', ()=>adoptModal.classList.add('hidden'))

// Submit adoption form
adoptForm.addEventListener('submit', async ev=>{
  ev.preventDefault()
  const data = Object.fromEntries(new FormData(adoptForm).entries())
  const res = await fetch('/api/adopt',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify(data)
  })
  if(res.ok){ alert('Adoption request sent!'); adoptModal.classList.add('hidden') }
  else alert('Something went wrong')
})

// Filter pets
applyBtn.addEventListener('click', ()=>{
  const type = filterType.value
  const q = searchInput.value.toLowerCase().trim()
  const filtered = allPets.filter(p => (type ? p.type===type:true) && (q ? (p.name||'').toLowerCase().includes(q) || (p.breed||'').toLowerCase().includes(q):true))
  renderPets(filtered)
})

viewPets.addEventListener('click', ()=>{ location.href='#pets' })

// Contact form
document.getElementById('contact-form').addEventListener('submit', async ev=>{
  ev.preventDefault()
  const data = Object.fromEntries(new FormData(ev.target).entries())
  const res = await fetch('/api/contact',{method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(data)})
  if(res.ok){ alert('Message sent!'); ev.target.reset() }
  else alert('Error')
})

// Initial load
loadPets()
