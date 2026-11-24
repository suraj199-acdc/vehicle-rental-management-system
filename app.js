document.addEventListener("DOMContentLoaded", () => {

    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const accountLink = document.getElementById("accountLink");
    const user = DB.currentUser();

    if (accountLink && user) {
        accountLink.textContent = user.name;
        accountLink.href = user.role === "admin"
            ? "admin.html"
            : "my-bookings.html";
    }

    const grid = document.getElementById("vehicleGrid");

    if (!grid) return;

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");
    const count = document.getElementById("vehicleCount");
    const notice = document.getElementById("fleetNotice");

    function renderVehicles() {

        let vehicles = DB.vehicles();

        const search = searchInput.value.toLowerCase().trim();
        const category = categoryFilter.value;

        vehicles = vehicles.filter(vehicle => {

            const matchesSearch =
                vehicle.name.toLowerCase().includes(search) ||
                vehicle.brand.toLowerCase().includes(search) ||
                vehicle.category.toLowerCase().includes(search);

            const matchesCategory =
                !category || vehicle.category === category;

            return matchesSearch && matchesCategory &&
                vehicle.status === "available";
        });

        if (sortFilter.value === "price-low") {
            vehicles.sort((a, b) => a.price - b.price);
        }

        if (sortFilter.value === "price-high") {
            vehicles.sort((a, b) => b.price - a.price);
        }

        count.textContent = `${vehicles.length} vehicles`;

        notice.textContent = "";

        if (!vehicles.length) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>No vehicles found</h3>
                    <p>Try another search or category.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = vehicles.map(vehicle => `

            <article class="vehicle-card">

                <div class="vehicle-image">

                    ${vehicle.image
                        ? `<img src="${escapeHTML(vehicle.image)}" alt="${escapeHTML(vehicle.name)}">`
                        : `<div class="vehicle-placeholder">🚘</div>`
                    }

                </div>

                <div class="vehicle-info">

                    <span class="eyebrow">
                        ${escapeHTML(vehicle.category)}
                    </span>

                    <h3>${escapeHTML(vehicle.name)}</h3>

                    <p class="vehicle-meta">
                        ${escapeHTML(vehicle.brand)}
                        ·
                        ${escapeHTML(vehicle.transmission)}
                        ·
                        ${vehicle.seats} seats
                    </p>

                    <div class="vehicle-bottom">

                        <span class="price">
                            ${formatMoney(vehicle.price)}
                            <small>/ day</small>
                        </span>

                        <a
                            href="vehicle.html?id=${encodeURIComponent(vehicle.id)}"
                            class="btn btn-small"
                        >
                            View
                        </a>

                    </div>

                </div>

            </article>

        `).join("");
    }

    document.getElementById("searchButton")
        .addEventListener("click", renderVehicles);

    searchInput.addEventListener("input", renderVehicles);
    categoryFilter.addEventListener("change", renderVehicles);
    sortFilter.addEventListener("change", renderVehicles);

    document.querySelectorAll("[data-category]").forEach(button => {

        button.addEventListener("click", () => {

            categoryFilter.value = button.dataset.category;

            document.querySelectorAll("[data-category]")
                .forEach(item => item.classList.remove("active"));

            button.classList.add("active");

            renderVehicles();
        });

    });

    renderVehicles();

});