const ASSET_BASE = "./frontend/public/";
export async function loadInfoCard(id = "moon") {
    try {
        const res = await fetch(`${ASSET_BASE}data/${id}.json`);
        if (!res.ok) throw new Error("Data file not found");

        const data = await res.json();

        // Header
        document.getElementById("card-title").textContent = data.name;
        document.getElementById("card-type").textContent = data.type;

        // Descriptions
        document.getElementById("card-description-short").textContent =
            data.description_short;
        document.getElementById("card-description-long").textContent =
            data.description_long;

        // Quick facts
        document.getElementById("fact-distance").textContent =
            `${data.quick_facts.distance_km.toLocaleString()} km`;
        document.getElementById("fact-radius").textContent =
            `${data.quick_facts.radius_km} km`;
        document.getElementById("fact-gravity").textContent =
            `${data.quick_facts.gravity_m_s2} m/s²`;
        document.getElementById("fact-orbit").textContent =
            `${data.quick_facts.orbital_period_days} days`;

        // Lists helper
        const fillList = (id, items) => {
            const el = document.getElementById(id);
            el.innerHTML = "";
            items.forEach(i => {
                const li = document.createElement("li");
                li.textContent = i;
                el.appendChild(li);
            });
        };

        fillList("surface-list", data.surface.composition);
        fillList("features-list", data.surface.major_features);
        fillList("fun-facts-list", data.fun_facts);

        // Toggle logic
        const details = document.getElementById("card-details");
        const btn = document.getElementById("toggle-details");

        btn.onclick = () => {
            const isOpen = details.classList.toggle("open");

            btn.textContent = isOpen
                ? "HIDE SYSTEM DATA"
                : "VIEW SYSTEM DATA";
        };

        const card = document.querySelector(".info-card");

        card.scrollTop = 0;

        // Show card
        card.classList.remove("hidden");


    } catch (e) {
        console.warn("Info card failed:", e.message);
    }
}
