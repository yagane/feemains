const monthYear = document.getElementById("month-year");

const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    console.log(year)
    console.log(month)

    monthYear.textContent = `${months[month]} ${year}`;

    const response = await fetch('/api/resaAllByMY', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({
            mois: month,
            annee: year
        })
    });

    const reservations = await response.json();

    const totalRevenu = document.querySelector(".total-revenu");
    const averageRevenu = document.querySelector(".average-revenu");
    const rdvCompte = document.querySelector(".rdv-compte");
    const bestPresta = document.querySelector(".best-presta");

    let totalPrix = 0;
    let passe = 0;
    let attente = 0;

    reservations.forEach(reservation => {
        if (reservation.statut == 'passé') {
            totalPrix += reservation.prix;
            passe += 1;
        } else {

            attente += 1;
        }
    });

    const spanTotal = document.createElement('span');
    const spanAverage = document.createElement('span');

    spanTotal.textContent = `${totalPrix} €`;
    spanAverage.textContent = `${totalPrix/passe} €`;

    totalRevenu.appendChild(spanTotal);
    averageRevenu.appendChild(spanAverage);

    rdvCompte.innerHTML = `
        <div>
            <span>Rendez-vous effectués</span>
            <span>${passe}</span>
        </div>
        <div>
            <span>Rendez-vous à venir</span>
            <span>${attente}</span>
        </div>
    `;
}

document.getElementById("prev").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
};

document.getElementById("next").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
};

renderCalendar();

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

    if(role == 'admin'){
        menu.innerHTML = `
            <a href="/">Prestations</a>
            <a href="/reservation">Reservation</a>

            <div class="menu-connexion">
                <a id="login" href="/login">Connexion</a>
                <div id="menu-account" class="menu-account">
                    <a href="/stat">
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