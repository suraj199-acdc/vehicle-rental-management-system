// ============================================
// VROOM LOCAL STORAGE DATABASE
// ============================================

const DB = {
    get(key, fallback = []) {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? fallback;
        } catch {
            return fallback;
        }
    },

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    users() {
        return this.get("vroom_users");
    },

    vehicles() {
        return this.get("vroom_vehicles");
    },

    bookings() {
        return this.get("vroom_bookings");
    },

    currentUser() {
        return this.get("vroom_current_user", null);
    },

    saveUsers(data) {
        this.set("vroom_users", data);
    },

    saveVehicles(data) {
        this.set("vroom_vehicles", data);
    },

    saveBookings(data) {
        this.set("vroom_bookings", data);
    },

    setCurrentUser(user) {
        this.set("vroom_current_user", user);
    },

    logout() {
        localStorage.removeItem("vroom_current_user");
        location.href = "index.html";
    },

    id() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    },

    initialize() {
        if (!localStorage.getItem("vroom_users")) {
            this.saveUsers([
                {
                    id: "admin001",
                    name: "VROOM Administrator",
                    email: "admin@vroom.com",
                    password: "admin123",
                    phone: "9800000000",
                    role: "admin"
                }
            ]);
        }

        if (!localStorage.getItem("vroom_vehicles")) {
            this.saveVehicles([
                {
                    id: "car001",
                    name: "Hyundai Creta",
                    brand: "Hyundai",
                    model: "Creta",
                    category: "SUV",
                    price: 4500,
                    transmission: "Automatic",
                    seats: 5,
                    fuel: "Petrol",
                    image: "",
                    description: "Comfortable SUV for city drives and long journeys.",
                    status: "available"
                },
                {
                    id: "car002",
                    name: "Toyota Corolla",
                    brand: "Toyota",
                    model: "Corolla",
                    category: "Car",
                    price: 3500,
                    transmission: "Automatic",
                    seats: 5,
                    fuel: "Petrol",
                    image: "",
                    description: "Reliable and comfortable sedan.",
                    status: "available"
                },
                {
                    id: "bike001",
                    name: "Yamaha R15",
                    brand: "Yamaha",
                    model: "R15",
                    category: "Bike",
                    price: 1800,
                    transmission: "Manual",
                    seats: 2,
                    fuel: "Petrol",
                    image: "",
                    description: "Sporty motorcycle for your next adventure.",
                    status: "available"
                },
                {
                    id: "van001",
                    name: "Toyota Hiace",
                    brand: "Toyota",
                    model: "Hiace",
                    category: "Van",
                    price: 6500,
                    transmission: "Manual",
                    seats: 12,
                    fuel: "Diesel",
                    image: "",
                    description: "Spacious van for group travel.",
                    status: "available"
                }
            ]);
        }

        if (!localStorage.getItem("vroom_bookings")) {
            this.saveBookings([]);
        }
    }
};

DB.initialize();

// ============================================
// SHARED HELPER FUNCTIONS
// ============================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function formatMoney(amount) {
    return "Rs. " + Number(amount || 0).toLocaleString("en-IN");
}

function requireLogin() {
    const user = DB.currentUser();

    if (!user) {
        location.href = "login.html";
        return null;
    }

    return user;
}

function requireAdmin() {
    const user = requireLogin();

    if (!user) return null;

    if (user.role !== "admin") {
        alert("Access denied. Admin only.");
        location.href = "index.html";
        return null;
    }

    return user;
}

function logout() {
    DB.logout();
}

function showMessage(element, message, type = "success") {
    if (!element) return;

    element.innerHTML = `
        <div class="alert ${type}">
            ${escapeHTML(message)}
        </div>
    `;
}