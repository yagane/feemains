const authLink = document.getElementById('auth-link');
const userGreeting = document.getElementById('user-greeting');
const userFirstname = document.getElementById('user-firstname');
const userRole = document.getElementById('role');

async function updateAuthUI() {
    const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if (data.connected) {
        authLink.style.display = 'none';
        userGreeting.style.display = 'inline';
        userFirstname.textContent = data.prenom;
        if(data.role == 'admin'){
            userRole.href = '/admin.html';
        }
    } else {
        authLink.style.display = 'inline-block';
        userGreeting.style.display = 'none';
    }
}

window.addEventListener('DOMContentLoaded', updateAuthUI);