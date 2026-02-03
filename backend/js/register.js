// Fonction pour récupérer les paramètres de l'URL
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

async function checkAuthStatus() {
    const response = await fetch('/backend/php/check_auth.php');
    const data = await response.json();

    const connect = document.getElementById('connect');

    if (data.connected) {
        connect.textContent = `Bonjour, ${data.prenom}`;
        connect.href = "/backend/php/logout.php";
    } else {
        connect.textContent = "Connexion";
        connect.href = "/public/login.html";
    }
}

window.onload = checkAuthStatus;