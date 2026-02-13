<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Connexion - Mon Site</title>
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
            width: 300px;
        }

        h2 {
            text-align: center;
            margin-bottom: 20px;
        }

        input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
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
            text-align: center;
            margin-top: 10px;
            font-size: 14px;
        }

        .error {
            color: red;
        }

        .success {
            color: green;
        }
    </style>
</head>
<body>

<div class="card">
    <h2>Connexion</h2>

    <form id="loginForm">
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Mot de passe" required>
        <button type="submit">Se connecter</button>
    </form>

    <div id="message" class="message"></div>
</div>

<script>
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const messageDiv = document.getElementById("message");

    messageDiv.textContent = "Connexion en cours...";
    messageDiv.className = "message";

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            messageDiv.textContent = data.error || "Erreur inconnue";
            messageDiv.classList.add("error");
            return;
        }

        messageDiv.textContent = "Connexion réussie !";
        messageDiv.classList.add("success");

        // Exemple : redirection après connexion
        setTimeout(() => {
            window.location.href = "/dashboard.html";
        }, 1000);

    } catch (error) {
        messageDiv.textContent = "Erreur serveur.";
        messageDiv.classList.add("error");
    }
});

async function getCurrentUser() {
    try {
        const response = await fetch("/api/me", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            console.log("Non connecté");
            return;
        }

        console.log("Utilisateur connecté :", data);
        document.body.innerHTML += `<p>Connecté en tant que ${data.email}</p>`;

    } catch (error) {
        console.error("Erreur serveur");
    }
}

getCurrentUser();
</script>

</body>
</html>