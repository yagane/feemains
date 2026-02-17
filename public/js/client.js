let userID = null;

async function loadHistoric() {
    const historicDiv = document.querySelector(".historique-rdv");
    const reservationsList = document.getElementById('reservations-list');

    try {
        // Envoyer les données au serveur
        const response = await fetch("/api/resaByUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ userID })
        });

        const reservations = await response.json();

        reservations.forEach(reservation => {
            if(reservation.user_id == userID){
            const row = document.createElement('tr');

            const date = new Date(reservation.date_reservation);
            const formattedDate = date.toLocaleString('fr-FR');

            // Créer les cellules du tableau
            row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${reservation.duree_reservation.split(':')[0]} h ${reservation.duree_reservation.split(':')[1]} min</td>
            <td>${reservation.statut}</td>
            <td class="actions">
            <button class="cancel-button">Annuler</button>
            </td>`;

            reservationsList.appendChild(row);
            }
        });

    } catch (error) {
        console.error("Erreur lors de l'envoi de la réservation :", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
}

async function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const login = document.getElementById('login');
    const userGreeting = document.getElementById('user-greeting');
    const menuAccount = document.getElementById('menu-account');
    const userFirstname = document.getElementById('user-name');
    const userFullname = document.getElementById('user-fullname');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');
    const userRole = document.getElementById('role');
    const userRole1 = document.getElementById('role1');

    const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    userID = data.id

    if (data.connected) {
         if(login){
            login.classList.add("hidden");
            menuAccount.classList.remove("hidden");

            if(data.role == 'admin'){
                userRole1.href = '/admin';
            }
        }

        authLink.classList.add("hidden");
        userGreeting.classList.remove("hidden");
        userFirstname.textContent = `Bonjour, ${data.prenom} ▼`;
        userFullname.textContent = `${data.prenom} ${data.nom}` ;
        userEmail.textContent = data.email;
        userPhone.textContent = data.phone;

        if(data.role == 'admin'){
            userRole.href = '/admin';
        }
    } else {
        authLink.classList.remove("hidden");
        userGreeting.classList.add("hidden");

        if(login){
            login.classList.remove("hidden");
            menuAccount.classList.add("hidden");
        }
    }

    loadHistoric();
}

const navPhone = document.querySelector('.nav-phone');
const menuContainer = document.querySelector('.nav-div');

let dynamicMenu = null;


function createDynamicMenu() {
    const menu = document.createElement('div');
    menu.className = 'phone-dropdown-menu';

    menu.innerHTML = `
        <a href="/">Acceuil</a>
        <a href="/#prestation">Prestations</a>
        <a href="/reservation">Reservation</a>
        <a href="/#contact">Contact</a>

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
        updateAuthUI()
    } else {
        menuContainer.removeChild(dynamicMenu);
        dynamicMenu = null;
    }
});

window.onload = updateAuthUI;