document.addEventListener("DOMContentLoaded", () => {

    const message = document.getElementById("message");

    // ======================================
    // REGISTER
    // ======================================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", event => {

            event.preventDefault();

            const name = document.getElementById("fullName").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;

            const users = DB.users();

            if (users.some(user => user.email === email)) {
                showMessage(message, "Email already registered.", "error");
                return;
            }

            const newUser = {
                id: DB.id(),
                name,
                email,
                phone,
                password,
                role: "customer"
            };

            users.push(newUser);

            DB.saveUsers(users);

            DB.setCurrentUser({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            });

            alert("Account created successfully!");

            location.href = "index.html";

        });

    }

    // ======================================
    // LOGIN
    // ======================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", event => {

            event.preventDefault();

            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;

            const user = DB.users().find(item =>
                item.email === email && item.password === password
            );

            if (!user) {
                showMessage(message, "Invalid email or password.", "error");
                return;
            }

            DB.setCurrentUser({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            });

            location.href = user.role === "admin"
                ? "admin.html"
                : "index.html";

        });

    }

});