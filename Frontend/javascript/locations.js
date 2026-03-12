let map;

document.addEventListener("DOMContentLoaded", initMap);

async function initMap(){

    map = L.map('sl-map').setView([7.6, 80.65], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19,
        attribution:'© OpenStreetMap'
    }).addTo(map);

    loadLocations();
}

async function loadLocations(){

    const res = await fetch("http://localhost:5001/api/locations");
    const locations = await res.json();

    const grid = document.querySelector(".location-grid");
    grid.innerHTML = "";

    locations.forEach(loc => {

        L.marker([loc.lat, loc.lng])
        .addTo(map)
        .bindPopup(`<b>${loc.name}</b><br>${loc.address}<br>${loc.phone}`);

        const card = document.createElement("div");

        card.className = "loc-card";

        card.innerHTML = `
        <h3><i class="fa-solid fa-location-dot"></i> ${loc.city}</h3>
        <p>${loc.name}<br>${loc.address}</p>
        `;

        card.onclick = () => focusMap(loc.lat, loc.lng);

        grid.appendChild(card);

    });

}

function focusMap(lat,lng){
    map.flyTo([lat,lng],13,{
        animate:true,
        duration:1.5
    });
}