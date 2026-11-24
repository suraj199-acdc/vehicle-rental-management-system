document.addEventListener("DOMContentLoaded", () => {

    const admin = requireAdmin();

    if (!admin) return;

    const message = document.getElementById("adminMessage");

    const vehicleTable = document.getElementById("vehicleTable");
    const bookingTable = document.getElementById("bookingTable");
    const customerTable = document.getElementById("customerTable");

    document.getElementById("logoutButton")
        .addEventListener("click", logout);

    function notify(text, type = "success") {
        showMessage(message, text, type);
    }

    // ======================================
    // DASHBOARD
    // ======================================

    function loadDashboard() {

        const vehicles = DB.vehicles();
        const bookings = DB.bookings();
        const customers = DB.users().filter(user => user.role === "customer");

        document.getElementById("totalVehicles").textContent =
            vehicles.length;

        document.getElementById("totalBookings").textContent =
            bookings.length;

        document.getElementById("pendingBookings").textContent =
            bookings.filter(item => item.status === "pending").length;

        document.getElementById("approvedBookings").textContent =
            bookings.filter(item => item.status === "approved").length;

        renderVehicles(vehicles);
        renderBookings(bookings);
        renderCustomers(customers);
    }

    // ======================================
    // ADD VEHICLE
    // ======================================

    document.getElementById("vehicleForm")
        .addEventListener("submit", event => {

            event.preventDefault();

            const vehicle = {

                id: DB.id(),

                name: document.getElementById("name").value.trim(),

                category: document.getElementById("category").value,

                brand: document.getElementById("brand").value.trim(),

                model: document.getElementById("model").value.trim(),

                price: Number(document.getElementById("price").value),

                transmission: document.getElementById("transmission").value,

                seats: Number(document.getElementById("seats").value),

                fuel: document.getElementById("fuel").value,

                image: document.getElementById("image").value.trim(),

                description: document.getElementById("description").value.trim(),

                status: "available"

            };

            if (!vehicle.name || !vehicle.brand || vehicle.price <= 0) {
                notify("Please enter valid vehicle information.", "error");
                return;
            }

            const vehicles = DB.vehicles();

            vehicles.push(vehicle);

            DB.saveVehicles(vehicles);

            event.target.reset();

            notify("Vehicle added successfully!");

            loadDashboard();

        });

    // ======================================
    // VEHICLE TABLE
    // ======================================

    function renderVehicles(vehicles) {

        if (!vehicles.length) {
            vehicleTable.innerHTML = "<p>No vehicles found.</p>";
            return;
        }

        vehicleTable.innerHTML = `

            <table>

                <thead>
                    <tr>
                        <th>Vehicle</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    ${vehicles.map(vehicle => `

                        <tr>

                            <td>${escapeHTML(vehicle.name)}</td>

                            <td>${escapeHTML(vehicle.category)}</td>

                            <td>${formatMoney(vehicle.price)}</td>

                            <td>${escapeHTML(vehicle.status)}</td>

                            <td class="inline-actions">

                                <button
                                    class="toggle-vehicle"
                                    data-id="${escapeHTML(vehicle.id)}"
                                >
                                    ${vehicle.status === "available" ? "Disable" : "Enable"}
                                </button>

                                <button
                                    class="edit-vehicle"
                                    data-id="${escapeHTML(vehicle.id)}"
                                >
                                    Edit
                                </button>

                                <button
                                    class="delete-vehicle btn-danger"
                                    data-id="${escapeHTML(vehicle.id)}"
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        `;

        document.querySelectorAll(".toggle-vehicle").forEach(button => {

            button.addEventListener("click", () => {

                const list = DB.vehicles();

                const vehicle = list.find(item =>
                    item.id === button.dataset.id
                );

                if (!vehicle) return;

                vehicle.status = vehicle.status === "available"
                    ? "unavailable"
                    : "available";

                DB.saveVehicles(list);

                loadDashboard();

            });

        });

        document.querySelectorAll(".delete-vehicle").forEach(button => {

            button.addEventListener("click", () => {

                if (!confirm("Delete this vehicle?")) return;

                const hasBookings = DB.bookings().some(booking =>
                    booking.vehicleId === button.dataset.id &&
                    ["pending", "approved"].includes(booking.status)
                );

                if (hasBookings) {
                    notify("Cannot delete a vehicle with active bookings.", "error");
                    return;
                }

                DB.saveVehicles(
                    DB.vehicles().filter(vehicle =>
                        vehicle.id !== button.dataset.id
                    )
                );

                loadDashboard();

                notify("Vehicle deleted.");

            });

        });

        document.querySelectorAll(".edit-vehicle").forEach(button => {

            button.addEventListener("click", () => {

                const vehicle = DB.vehicles().find(item =>
                    item.id === button.dataset.id
                );

                if (!vehicle) return;

                const name = prompt("Vehicle name:", vehicle.name);
                if (name === null) return;

                const price = prompt("Price per day:", vehicle.price);
                if (price === null) return;

                if (!name.trim() || Number(price) <= 0) {
                    notify("Invalid vehicle details.", "error");
                    return;
                }

                vehicle.name = name.trim();
                vehicle.price = Number(price);

                DB.saveVehicles(DB.vehicles());

                loadDashboard();

                notify("Vehicle updated successfully.");

            });

        });

    }

    // ======================================
    // BOOKING TABLE
    // ======================================

    function renderBookings(bookings) {

        if (!bookings.length) {
            bookingTable.innerHTML = "<p>No bookings yet.</p>";
            return;
        }

        bookingTable.innerHTML = `

            <table>

                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Vehicle</th>
                        <th>Dates</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    ${bookings.map(booking => `

                        <tr>

                            <td>${escapeHTML(booking.customerName)}</td>

                            <td>${escapeHTML(booking.vehicleName)}</td>

                            <td>
                                ${escapeHTML(booking.startDate)}
                                →
                                ${escapeHTML(booking.endDate)}
                            </td>

                            <td>${formatMoney(booking.total)}</td>

                            <td>${escapeHTML(booking.status)}</td>

                            <td class="inline-actions">

                                ${
                                    booking.status === "pending"
                                    ? `
                                        <button
                                            class="booking-action"
                                            data-id="${escapeHTML(booking.id)}"
                                            data-status="approved"
                                        >
                                            Approve
                                        </button>

                                        <button
                                            class="booking-action btn-danger"
                                            data-id="${escapeHTML(booking.id)}"
                                            data-status="rejected"
                                        >
                                            Reject
                                        </button>
                                    `
                                    : "—"
                                }

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        `;

        document.querySelectorAll(".booking-action").forEach(button => {

            button.addEventListener("click", () => {

                const bookingsList = DB.bookings();

                const booking = bookingsList.find(item =>
                    item.id === button.dataset.id
                );

                if (!booking || booking.status !== "pending") return;

                if (button.dataset.status === "approved") {

                    const conflict = bookingsList.some(other =>
                        other.id !== booking.id &&
                        other.vehicleId === booking.vehicleId &&
                        other.status === "approved" &&
                        booking.startDate < other.endDate &&
                        booking.endDate > other.startDate
                    );

                    if (conflict) {
                        notify("This vehicle already has an approved booking for those dates.", "error");
                        return;
                    }

                }

                booking.status = button.dataset.status;

                DB.saveBookings(bookingsList);

                loadDashboard();

                notify("Booking status updated.");

            });

        });

    }

    // ======================================
    // CUSTOMER TABLE
    // ======================================

    function renderCustomers(customers) {

        if (!customers.length) {
            customerTable.innerHTML = "<p>No registered customers.</p>";
            return;
        }

        customerTable.innerHTML = `

            <table>

                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Bookings</th>
                    </tr>
                </thead>

                <tbody>

                    ${customers.map(customer => `

                        <tr>

                            <td>${escapeHTML(customer.name)}</td>

                            <td>${escapeHTML(customer.email)}</td>

                            <td>${escapeHTML(customer.phone)}</td>

                            <td>
                                ${DB.bookings().filter(booking =>
                                    booking.customerId === customer.id
                                ).length}
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        `;

    }

    loadDashboard();

});