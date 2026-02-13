document.getElementById("register-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const prenom = document.getElementById("prenom").value;
    const nom = document.getElementById("nom").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ prenom, nom, phone, email, password })
    });
});

function getUrlParameter(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

window.onload = function() {
    const error = getUrlParameter('error');
    const messageDiv = document.getElementById('message');

	if (error === 'register') {
        messageDiv.textContent = "Erreur lors de l'inscription. Veuillez réessayer.";
        messageDiv.style.backgroundColor = "#f8d7da";
        messageDiv.style.color = "#721c24";
    } else if (error === 'email_exists') {
        messageDiv.textContent = "Cet email est déjà utilisé. Veuillez en choisir un autre.";
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

window.onload = updateAuthUI;