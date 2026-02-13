document.getElementById("login-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    console.log(data)

    if(data.success){
        window.location.href = "/reservation.html";
    }
});

function getUrlParameter(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

window.onload = function() {
    const error = getUrlParameter('error');
    const messageDiv = document.getElementById('message');

    if (error === 'email') {
        messageDiv.textContent = "Email incorrect ou non trouvé.";
        messageDiv.style.backgroundColor = "#f8d7da";
        messageDiv.style.color = "#721c24";
    } else if (error === 'password') {
        messageDiv.textContent = "Mot de passe incorrect.";
        messageDiv.style.backgroundColor = "#f8d7da";
        messageDiv.style.color = "#721c24";
    }
};

async function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');
    const userFirstname = document.getElementById('user-firstname');
    const userRole = document.getElementById('role');

    const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if (data.connected) {
        // Utilisateur connecté : masquer le lien de connexion et afficher le menu déroulant
        authLink.style.display = 'none';
        userGreeting.style.display = 'inline';
        userFirstname.textContent = data.prenom;
        userId = data.id;
        if(data.role == 'admin'){
            userRole.href = '/admin.html';
        }
        window.location.href = "/reservation.html";
    }
}

document.getElementById("logout").addEventListener("click", function (e) {
    const response = await fetch("/api/logout", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if(data.success){
        window.location.href = "/index.html";
    }
});

window.onload = updateAuthUI;