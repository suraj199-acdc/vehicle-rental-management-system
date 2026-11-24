document.addEventListener("DOMContentLoaded", () => {

    const user = requireLogin();

    if (!user) return;

    const list = document.getElementById("bookingsList");

    document.getElementById("userGreeting").textContent =
        `Welcome, ${user.name}`;

    document.getElementById("logoutButton")
        .addEventListener("click", logout);

    function renderBookings() {

        const bookings = DB.bookings().filter(booking =>
            booking.customerId === user.id
        );

        if (!bookings.length) {

            list.innerHTML = `
                <div class="panel empty-state">
                    <h3>No bookings yet</h3>
                    <p>Find a vehicle and make your first booking.</p>
                    <br>
                    <a href="index.html" class="btn">Browse vehicles</a>
                </div>
            `;

            return;
        }

        list.innerHTML = bookings.map(booking => `

            <article class="panel">

                <div class="section-heading">

                    <div>
                        <h3>${escapeHTML(booking.vehicleName)}</h3>
                        <p class="muted">
                            Booking ID: ${escapeHTML(booking.id)}
                        </p>
                    </div>

                    <span class="status ${
                        ["rejected", "cancelled"].includes(booking.status)
                            ? "unavailable"
                            : ""
                    }">
                        ${escapeHTML(booking.status)}
                    </span>

                </div>

                <p><strong>Pickup:</strong> ${escapeHTML(booking.startDate)}</p>

                <p><strong>Return:</strong> ${escapeHTML(booking.endDate)}</p>

                <p><strong>Location:</strong> ${escapeHTML(booking.pickupLocation)}</p>

                <p><strong>Duration:</strong> ${booking.days} days</p>

                <p><strong>Total:</strong> ${formatMoney(booking.total)}</p>

                ${
                    booking.status === "pending"
                    ? `<button class="btn btn-danger cancel-booking" data-id="${escapeHTML(booking.id)}">Cancel request</button>`
                    : ""
                }

            </article>

        `).join("");

        document.querySelectorAll(".cancel-booking").forEach(button => {

            button.addEventListener("click", () => {

                if (!confirm("Cancel this booking?")) return;

                const bookings = DB.bookings();

                const booking = bookings.find(item =>
                    item.id === button.dataset.id &&
                    item.customerId === user.id
                );

                if (booking && booking.status === "pending") {
                    booking.status = "cancelled";
                    DB.saveBookings(bookings);
                    renderBookings();
                }

            });

        });

    }

    renderBookings();

});