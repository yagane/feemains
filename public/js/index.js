async function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');
    const userFirstname = document.getElementById('auth-link');
    const userRole = document.getElementById('role');

    const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if (data.connected) {
        authLink.style.display = 'none';
        userGreeting.style.display = 'inline';
        userFirstname.textContent = `Bonjour, ${data.prenom} ▼`;
        if(data.role == 'admin'){
            userRole.href = '/admin';
        }
    } else {
        authLink.style.display = 'inline-block';
        userGreeting.style.display = 'none';
    }
}

document.getElementById("logout").addEventListener("click", async function (e) {
    const response = await fetch("/api/logout", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if(data.success){
        window.location.href = "/index";
    }
});

window.onload = updateAuthUI;