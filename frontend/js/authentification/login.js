function addButtonClickListeners() {
    document.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", (event) => {
            document.getElementById("username").focus();
            event.target.blur();
        });
    });
}

function addLoginFormListener() {
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;

        fetch("http://localhost:8080/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Fehler bei der Anmeldung");
                }
                return response.json();
            })
            .then((data) => {
                localStorage.setItem("loggedIn", true);
                console.log(data);
                window.location.href = "./index.html";
            })
            .catch((error) => {
                document.getElementById("errorMessage").style.display = "block";
                console.error("Anmeldefehler:", error);
            });
    });
}

function addAdminLoginFormListener() {
    document.getElementById("adminLoginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        var adminUsername = document.getElementById("adminUsername").value;
        var adminPassword = document.getElementById("adminPassword").value;

        fetch("http://localhost:8080/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: adminUsername,
                password: adminPassword,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Falsche Administrator-Anmeldeinformationen");
                }
                return response.json();
            })
            .then((data) => {
                $("#adminLoginModal").modal("hide");
                $("#createUserModal").modal("show");

                document.getElementById("adminLoginErrorMessage").style.display = "none";
                document.getElementById("adminUsername").value = "";
                document.getElementById("adminPassword").value = "";
            })
            .catch((error) => {
                var errorMessageElement = document.getElementById("adminLoginErrorMessage");
                errorMessageElement.style.display = "block";
            });
    });
}

function addCreateUserFormListener() {
    document.getElementById("createUserForm").addEventListener("submit", function (event) {
        event.preventDefault();

        var newUsername = document.getElementById("newUsername").value;
        var newPassword = document.getElementById("newPassword").value;
        var newRole = document.getElementById("newRole").value;

        fetch("http://localhost:8080/users/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: newUsername,
                password: newPassword,
                role: newRole,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Fehler beim Erstellen des Benutzers");
                }
            })
            .then((data) => {
                $("#createUserModal").modal("hide");
                $("#successModal").modal("show");
            })
            .catch((error) => {
                var errorMessageElement = document.getElementById("createUserErrorMessage");
                errorMessageElement.style.display = "block";
            });
    });
}

function addOpenCreateUserModalLinkListener() {
    document.getElementById("openCreateUserModalLink").addEventListener("click", function (event) {
        event.preventDefault();
        $("#adminLoginModal").modal("show");
    });
}

$("#adminLoginModal").on("hidden.bs.modal", function () {
    document.getElementById("adminLoginErrorMessage").style.display = "none";
    document.getElementById("adminUsername").value = "";
    document.getElementById("adminPassword").value = "";
});

$("#createUserModal").on("hidden.bs.modal", function () {
    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("newRole").value = "USER";

    var errorMessageElement = document.getElementById("createUserErrorMessage");
    errorMessageElement.style.display = "none";
});

document.addEventListener("DOMContentLoaded", function () {
    addButtonClickListeners();
    addLoginFormListener();
    addAdminLoginFormListener();
    addCreateUserFormListener();
    addOpenCreateUserModalLinkListener();
});
