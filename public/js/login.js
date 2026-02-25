let connected = null;
let role = null;

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

    if(data.success){
        window.location.href = "/reservation";
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
        userId = data.id;

        if(data.role == 'admin'){
            userRole.href = '/admin';
        }
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

    return menu;
}

navPhone.addEventListener('click', () => {
    navPhone.classList.toggle('active');

    if (!dynamicMenu) {
        dynamicMenu = createDynamicMenu();
        menuContainer.appendChild(dynamicMenu);
        const login = document.getElementById('login');
        const menuAccount = document.getElementById('menu-account');
        const userRole1 = document.getElementById('role1');

        if (connected) {
            login.classList.add("hidden");
            menuAccount.classList.remove("hidden");

            if(role == 'admin'){
                userRole1.href = '/admin';
            }
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