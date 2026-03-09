document.addEventListener("DOMContentLoaded", loadTips);

async function loadTips() {

    try {

        const res = await fetch("http://localhost:5001/api/health-tips");
        const tips = await res.json();

        const catContainer = document.getElementById("catTips");
        const dogContainer = document.getElementById("dogTips");

        catContainer.innerHTML = "";
        dogContainer.innerHTML = ""; 

        tips.forEach(tip => {

            if (tip.status !== "published") return;

            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <img src="${tip.image ? "http://localhost:5001" + tip.image : "../../Resources/default.png"}">
                <div class="card-content">
                    <h3>${tip.title}</h3>
                    <p>${tip.description}</p>
                </div>
            `;

            if (tip.category.toLowerCase() === "cats" && tip.status.toLowerCase() === "published") {
                catContainer.appendChild(card);
            }

            if (tip.category.toLowerCase() === "dogs" && tip.status.toLowerCase() === "published") {
                dogContainer.appendChild(card);
            }

        });

    } catch (error) {
        console.error("Failed to load tips", error);
    }

}