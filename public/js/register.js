let connected = null;
let role = null;

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

    const data = await response.json();

    if(data.success){
        window.location.href = "/login";
    }
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
    const userFirstname = document.getElementById('user-name');
    const userRole = document.getElementById('role');

    const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    connected = data.connected;
    role = data.role;

    if (data.connected) {
        authLink.classList.add("hidden");
        userGreeting.classList.remove("hidden");
        userFirstname.textContent = `Bonjour, ${data.prenom} ▼`;

        if(data.role == 'admin'){
            userRole.href = '/admin';
        }

        window.location.href = "/reservation";
    } else {
        authLink.classList.remove("hidden");
        userGreeting.classList.add("hidden");
    }
}

const navPhone = document.querySelector('.nav-phone');
const menuContainer = document.querySelector('.nav-div');

let dynamicMenu = null;

function createDynamicMenu() {
    const menu = document.createElement('div');
    menu.className = 'phone-dropdown-menu';

    if(data.role == 'admin'){
        menu.innerHTML = `
            <a href="/">Prestations</a>
            <a href="/reservation">Reservation</a>

            <div class="menu-connexion">
                <a id="login" href="/login">Connexion</a>
                <div id="menu-account" class="menu-account">
                    <a href="/admin">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Mes statistiques
                    </a>
                    <a href="/admin">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Mon agenda
                    </a>
                    <form action="/api/logout" method="GET">
                        <button type="submit" class="logout-button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" class="svelte-rfuq4y"></path>
                                <polyline points="16,17 21,12 16,7" class="svelte-rfuq4y"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12" class="svelte-rfuq4y"></line>
                            </svg>
                            Déconnexion
                        </button>
                    </form>
                </div>
            </div>
        `;
    }else{
        menu.innerHTML = `
            <a href="/">Prestations</a>
            <a href="/reservation">Reservation</a>

            <div class="menu-connexion">
                <a id="login" href="/login">Connexion</a>
                <div id="menu-account" class="menu-account">
                    <a id="role1" href="/client">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Mon compte
                    </a>
                    <a href="/client">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Mes reservations
                    </a>
                    <form action="/api/logout" method="GET">
                        <button type="submit" class="logout-button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" class="svelte-rfuq4y"></path>
                                <polyline points="16,17 21,12 16,7" class="svelte-rfuq4y"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12" class="svelte-rfuq4y"></line>
                            </svg>
                            Déconnexion
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    return menu;
}

navPhone.addEventListener('click', () => {
    navPhone.classList.toggle('active');

    if (!dynamicMenu) {
        dynamicMenu = createDynamicMenu();
        menuContainer.appendChild(dynamicMenu);
        const login = document.getElementById('login');
        const menuAccount = document.getElementById('menu-account');

        if (connected) {
            login.classList.add("hidden");
            menuAccount.classList.remove("hidden");
        } else {
            login.classList.remove("hidden");
            menuAccount.classList.add("hidden");
        }
    } else {
        menuContainer.removeChild(dynamicMenu);
        dynamicMenu = null;
    }
});

window.onload = updateAuthUI;