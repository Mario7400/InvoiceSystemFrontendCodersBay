$(document).ready(function () {
    checkLoggedIn();

    $("#logoutLink").click(function (event) {
        event.preventDefault();
        logoutUser();
    });
});

function checkLoggedIn() {
    if (!localStorage.getItem("loggedIn") || localStorage.getItem("loggedIn") === "false") {
        redirectToLogin();
    }
}

function logoutUser() {
    localStorage.setItem("loggedIn", "false");
    redirectToLogin();
}

function redirectToLogin() {
    window.location.href = "http://127.0.0.1:5500/frontend/login.html";
}
