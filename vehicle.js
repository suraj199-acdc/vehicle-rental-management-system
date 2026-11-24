document.addEventListener("DOMContentLoaded", () => {

    const vehicleId = new URLSearchParams(location.search).get("id");

    const vehicle = DB.vehicles().find(item => item.id === vehicleId);

    const details = document.getElementById("vehicleDetails");
    const panel = document.getElementById("bookingPanel");
    const form = document.getElementById("bookingForm");
    const message = document.getElementById("message");

    if (!vehicle) {
        details.innerHTML = "<h2>Vehicle not found.</h2>";
        return;
    }

    details.innerHTML = `

        <div class="vehicle-detail">

            <div class="vehicle-image">

                ${vehicle.image
                    ? `<img src="${escapeHTML(vehicle.image)}" alt="">`
                    : `<div class="vehicle-placeholder">🚘</div>`
                }

            </div>

            <div>

                <span class="eyebrow">
                    ${escapeHTML(vehicle.category)}
                </span>

                <h1>${escapeHTML(vehicle.name)}</h1>

                <p class="muted">
                    ${escapeHTML(vehicle.brand)}
                    ${escapeHTML(vehicle.model)}
                </p>

                <h2 class="price">
                    ${formatMoney(vehicle.price)} / day
                </h2>

                <p>${escapeHTML(vehicle.description)}</p>

                <p class="vehicle-meta">
                    ${escapeHTML(vehicle.transmission)}
                    · ${vehicle.seats} Seats
                    · ${escapeHTML(vehicle.fuel)}
                </p>

                <span class="status">${escapeHTML(vehicle.status)}</span>

            </div>

        </div>

    `;

    if (vehicle.status !== "available") {
        return;
    }

    panel.hidden = false;

    const startInput = document.getElementById("startDate");
    const endInput = document.getElementById("endDate");
    const estimate = document.getElementById("priceEstimate");

    const today = new Date().toISOString().split("T")[0];

    startInput.min = today;
    endInput.min = today;

    function calculatePrice() {

        const start = new Date(startInput.value);
        const end = new Date(endInput.value);

        if (!startInput.value || !endInput.value || end <= start) {
            estimate.textContent = "Select valid dates.";
            return null;
        }

        const days = Math.ceil((end - start) / 86400000);
        const total = days * vehicle.price;

        estimate.textContent =
            `Estimated total: ${formatMoney(total)} (${days} days)`;

        return { days, total };
    }

    startInput.addEventListener("change", () => {
        endInput.min = startInput.value;
        calculatePrice();
    });

    endInput.addEventListener("change", calculatePrice);

    form.addEventListener("submit", event => {

        event.preventDefault();

        const user = requireLogin();

        if (!user) return;

        const price = calculatePrice();

        if (!price) {
            showMessage(message, "Please select valid dates.", "error");
            return;
        }

        if (!document.getElementById("pickupLocation").value.trim()) {
            showMessage(message, "Enter a pickup location.", "error");
            return;
        }

        const startDate = startInput.value;
        const endDate = endInput.value;

        const overlapping = DB.bookings().some(booking =>
            booking.vehicleId === vehicle.id &&
            ["pending", "approved"].includes(booking.status) &&
            startDate < booking.endDate &&
            endDate > booking.startDate
        );

        if (overlapping) {
            showMessage(message, "This vehicle already has a booking during those dates.", "error");
            return;
        }

        const booking = {
            id: DB.id(),
            customerId: user.id,
            customerName: user.name,
            customerEmail: user.email,
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            startDate,
            endDate,
            pickupLocation: document.getElementById("pickupLocation").value.trim(),
            notes: document.getElementById("notes").value.trim(),
            days: price.days,
            total: price.total,
            status: "pending",
            createdAt: new Date().toISOString()
        };

        const bookings = DB.bookings();

        bookings.push(booking);

        DB.saveBookings(bookings);

        showMessage(message, "Booking request submitted successfully!");

        form.reset();

        estimate.textContent = "";

    });

});