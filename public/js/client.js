const options = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false // Pour afficher en format 24h
};

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
                const formattedDate = date.toLocaleString('fr-FR', options);

                // Créer les cellules du tableau
                row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${reservation.statut}</td>
                <td class="actions" id=${reservation.id}>
                    <button class="resume-button">Resumé</button>
                    <button class="cancel-button">Annuler</button>
                </td>`;

                reservationsList.appendChild(row);
            }
        });

        const cancelButton = document.querySelectorAll('.cancel-button');

        cancelButton.forEach(button => {
            button.addEventListener('click', async function(event) {
                const parent = button.parentElement;

                const reservationId = parent.id;

                const response = await fetch("/api/deleteResa", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ reservationId })
                });

                const data = await response.json();

                if(data.success){
                    window.location.href = "/client";
                }
            });
        });

        const resumeButton = document.querySelectorAll('.resume-button');

        resumeButton.forEach(button => {
            button.addEventListener('click', async function(event) {
                const parent = button.parentElement;

                const id = parent.id;

                const response = await fetch("/api/resaByID", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ id })
                });

                const data = await response.json();

                const date = new Date(data.date_reservation);
                const formattedDate = date.toLocaleString('fr-FR', options);

                const prestation_noms = data.prestation_noms.split(', ');
                const prestation_prix = data.prestation_prix.split(', ');
                const prestation_duree = data.prestation_duree.split(', ');


                const mainFooter = document.querySelector('.main-footer');

                const modal = document.createElement('div');
                modal.className = 'modal-backdrop';

                modal.innerHTML = `

                    <div class="modal-content">
                        <div class="modal-nav">
                            <button class="close-button">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="modal-main">
                            <div class="modal-header">
                                <h3>Reservation du ${formattedDate.split(' ')[0]}</h3>
                            </div>
                            <div class="modal-table">
                                <table id="reservation-table">
                                    <thead>
                                        <tr>
                                            <th>Prestation</th>
                                            <th>Duree</th>
                                            <th>Prix</th>
                                        </tr>
                                    </thead>
                                    <tbody id="reservation-list">
                                    </tbody>
                                </table>
                            </div>
                            <div class="modal-footer" id=${id}>
                                <button class="cancel-button">Annuler</button>
                            </div>
                        </div>
                    </div>
                `;

                mainFooter.appendChild(modal);

                const cancelButton = document.querySelectorAll('.cancel-button');

                cancelButton.forEach(button => {
                    button.addEventListener('click', async function(event) {
                        const parent = button.parentElement;

                        const reservationId = parent.id;

                        const response = await fetch("/api/deleteResa", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({ reservationId })
                        });

                        const data = await response.json();

                        if(data.success){
                            window.location.href = "/client";
                        }
                    });
                });

                const reservationList = document.getElementById('reservation-list');

                let totalPrix = 0;
                let totalDuree = 0;

                for (let i = 0; i < prestation_noms.length; i++){

                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${prestation_noms[i]}</td>
                        <td class="td-center">${parseInt(prestation_duree[i], 10)} min</td>
                        <td class="td-center">${parseInt(prestation_prix[i], 10)} €</td>
                    `;

                    totalPrix += parseInt(prestation_prix[i], 10);
                    totalDuree += parseInt(prestation_duree[i], 10);

                    reservationList.appendChild(row);
                }

                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>Total :</td>
                    <td class="td-center">${totalDuree} min</td>
                    <td class="td-center">${totalPrix} €</td>
                `;

                reservationList.appendChild(row);



                const closeBtn = document.querySelector('.close-button');

                closeBtn.addEventListener('click', (event) => {
                    const modal = document.querySelector('.modal-backdrop');

                    modal.remove();
                });
            });
        });
    } catch (error) {
        console.error("Une erreur est survenue :", error);
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