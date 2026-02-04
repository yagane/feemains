// Fonction pour récupérer les paramètres de l'URL
function getUrlParameter(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        this.submit();
    });
});

// Afficher les messages en fonction des paramètres
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

async function checkAuthStatus() {
    const response = await fetch('https://php.fee-mains.com/check_auth.php');
    const data = await response.json();

    const connect = document.getElementById('connect');

    if (data.connected) {
        connect.textContent = `Bonjour, ${data.prenom}`;
        connect.href = "https://php.fee-mains.com/logout.php";
    } else {
        connect.textContent = "Connexion";
        connect.href = "/login.html";
    }
}

window.onload = checkAuthStatus;