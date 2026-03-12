document.addEventListener("DOMContentLoaded", init);

async function init(){
    loadLocations();
}

async function loadLocations(){

    const res = await fetch("http://localhost:5001/api/locations");
    const locations = await res.json();

    const list = document.getElementById("locationList");
    list.innerHTML = "";

    locations.forEach(loc => {

        const item = document.createElement("div");

        item.innerHTML = `
        <strong>${loc.name}</strong> (${loc.city})
        <button onclick="deleteLocation('${loc._id}')">Delete</button>
        `;

        list.appendChild(item);
    });

}
document.getElementById("save-location").addEventListener("click", async function(){

    const data = {
        name: document.getElementById("location-name").value,
        city: document.getElementById("location-city").value,
        address: document.getElementById("location-address").value,
        phone: document.getElementById("location-phone").value,
        lat: parseFloat(document.getElementById("location-lat").value),
        lng: parseFloat(document.getElementById("location-lng").value)
    };

    try {

        const res = await fetch("http://localhost:5001/api/locations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log(result);

        if(!res.ok){
            throw new Error("Failed to create location");
        }

        alert("Location created successfully");
        window.location.href = "locations.html";

    } catch(err) {

        console.error(err);
        alert("Error creating location");

    }

});

async function deleteLocation(id){

    if(!confirm("Delete this location?")) return;

    await fetch(`http://localhost:5001/api/locations/${id}`,{
        method:"DELETE"
    });

    loadLocations();

}