<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mon Site - Auth Router</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f6f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }

        .card {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            width: 320px;
        }

        h2 {
            text-align: center;
        }

        input {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        button {
            width: 100%;
            padding: 10px;
            border: none;
            background: #007BFF;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }

        button:hover {
            background: #0056b3;
        }

        .message {
            margin-top: 10px;
            text-align: center;
        }

        .error { color: red; }
        .success { color: green; }

        .hidden { display: none; }
    </style>
</head>
<body>

<div class="card">

    <!-- Zone login -->
    <div id="loginSection">
        <h2>Connexion</h2>
        <form id="loginForm">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Mot de passe" required>
            <button type="submit">Se connecter</button>
        </form>
    </div>

    <!-- Zone utilisateur connecté -->
    <div id="userSection" class="hidden">
        <h2>Bienvenue</h2>
        <p id="userInfo"></p>
        <button id="logoutBtn">Se déconnecter</button>
    </div>

    <div id="message" class="message"></div>

</div>

<script>

const loginSection = document.getElementById("loginSection");
const userSection = document.getElementById("userSection");
const messageDiv = document.getElementById("message");
const userInfo = document.getElementById("userInfo");


// 🔐 Vérifier si déjà connecté
async function checkAuth() {
    try {
        const response = await fetch("/api/me", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            return;
        }

        const user = await response.json();
        showUser(user);

    } catch (error) {
        console.error("Erreur auth");
    }
}


// 🔑 Login
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    messageDiv.textContent = "Connexion...";
    messageDiv.className = "message";

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            messageDiv.textContent = data.error || "Erreur";
            messageDiv.classList.add("error");
            return;
        }

        showUser({ email });

        messageDiv.textContent = "Connexion réussie";
        messageDiv.classList.add("success");

    } catch (error) {
        messageDiv.textContent = "Erreur serveur";
        messageDiv.classList.add("error");
    }
});


// 🚪 Logout
document.getElementById("logoutBtn").addEventListener("click", async function() {

    await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
    });

    loginSection.classList.remove("hidden");
    userSection.classList.add("hidden");
    messageDiv.textContent = "Déconnecté";
    messageDiv.className = "message";
});


// 🎯 Affichage utilisateur
function showUser(user) {
    loginSection.classList.add("hidden");
    userSection.classList.remove("hidden");
    userInfo.textContent = "Connecté en tant que : " + user.email;
}


// 🚀 Vérification au chargement
checkAuth();

</script>

</body>
</html>
