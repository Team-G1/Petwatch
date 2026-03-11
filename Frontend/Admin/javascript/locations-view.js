document.addEventListener("DOMContentLoaded", init);

async function init(){
loadLocations();
}

async function loadLocations(){

const res = await fetch("http://localhost:5001/api/locations");
const locations = await res.json();

const grid = document.getElementById("locationsGrid");
grid.innerHTML="";

document.getElementById("totalLocations").textContent = locations.length;

const cities = new Set(locations.map(l => l.city));
document.getElementById("totalCities").textContent = cities.size;

locations.forEach(loc => {

const card = document.createElement("div");
card.className="tip-card";

card.innerHTML = `
<div class="tip-content">

<h3>${loc.name}</h3>

<p><i class="fas fa-city"></i> ${loc.city}</p>
<p><i class="fas fa-map-marker-alt"></i> ${loc.address}</p>
<p><i class="fas fa-phone"></i> ${loc.phone || ""}</p>

<div style="margin-top:12px">
<button class="btn-secondary delete-btn" data-id="${loc._id}">
<i class="fas fa-trash"></i> Delete
</button>
</div>

</div>
`;

grid.appendChild(card);

});

attachDeleteEvents();

}


function attachDeleteEvents(){

document.querySelectorAll(".delete-btn").forEach(btn => {

btn.addEventListener("click", async () => {

const id = btn.dataset.id;

if(!confirm("Delete this location?")) return;

await fetch(`http://localhost:5001/api/locations/${id}`,{
method:"DELETE"
});

loadLocations();

});

});

}