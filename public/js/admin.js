const calendarGrid = document.getElementById("calendar-grid");
const calendarSection = document.querySelector(".calendar");
const monthYear = document.getElementById("month-year");

const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

let currentDate = new Date();
let selectedDate = currentDate;

let connected = null;
let role = null;

function toLocalISOString(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  const offset = date.getTimezoneOffset() * 60000; // Décalage en millisecondes
  const localDate = new Date(date - offset);

  return (
    localDate.getFullYear() + '-' +
    pad(localDate.getMonth() + 1) + '-' +
    pad(localDate.getDate()) + 'T' +
    pad(localDate.getHours()) + ':' +
    pad(localDate.getMinutes()) + ':' +
    pad(localDate.getSeconds())
  );
}

function renderCalendar() {
    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYear.textContent = `${months[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stopDay = new Date(new Date(today).setMonth(today.getMonth() + 3));

    // Cases vides
    for (let i = 1; i < firstDay; i++) {
        calendarGrid.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const div = document.createElement("div");
        div.className = "day";
        div.textContent = day;

        const dateObj = new Date(year, month, day);

        if (toLocalISOString(dateObj).split('T')[0] == toLocalISOString(currentDate).split('T')[0]){
            div.classList.add("selected");

            selectedDate = dateObj;
            loadTimeSlots(selectedDate);
        }

        const isSunday = dateObj.getDay() === 0;

        div.onclick = () => {
            document.querySelectorAll(".day").forEach(el => el.classList.remove("selected"));

            div.classList.add("selected");

            selectedDate = dateObj;
            loadTimeSlots(selectedDate);
        };

        calendarGrid.appendChild(div);
    }
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

async function loadTimeSlots(date) {
    document.getElementById('selected-date').textContent = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
    });

    document.getElementById('agenda-container').style.display = 'block';

    const appointmentsContainer = document.getElementById('appointments-container');
    appointmentsContainer.innerHTML = '';

    for (let i = 0; i <= 10; i++) {
        const timeLine = document.createElement('div');
        timeLine.className = 'time-line';
        timeLine.style.top = `${i * 10}%`;
        appointmentsContainer.appendChild(timeLine);
    }

    const dateSplit = toLocalISOString(date).split('T')[0];

    const response = await fetch("/api/resaAllByDate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ dateSplit })
    });

    const appointments = await response.json();


    appointments.forEach(appointment => {
        let startTime = appointment.date_reservation.split(' ')[1];
        let dureeReservation = appointment.duree_reservation;

        const startHour = parseInt(startTime.split(':')[0], 10);
        const startMinute = parseInt(startTime.split(':')[1], 10);
        const dureeHour = parseInt(dureeReservation.split(':')[0], 10);
        const dureeMinute = parseInt(dureeReservation.split(':')[1], 10);

        let endHour = 0;
        let endMinute = 0;

        if((startMinute + dureeMinute) >= 60){
            endHour = startHour + dureeHour + 1;
            endMinute = startMinute + dureeMinute - 60;
        }else{
            endHour = startHour + dureeHour;
            endMinute = startMinute + dureeMinute;
        }

        let endTime = null;

        if(endMinute < 10){
            endTime = `${endHour}:0${endMinute}`;
        }else{
            endTime = `${endHour}:${endMinute}`;
        }

        if(startMinute < 10){
            startTime = `${startHour}:0${startMinute}`;
        }else{
            startTime = `${startHour}:${startMinute}`;
        }

        const startTotalMinutes = (startHour - 10) * 60 + startMinute;
        const endTotalMinutes = (endHour - 10) * 60 + endMinute;

        const topPosition = (startTotalMinutes / 600) * 100;
        const height = ((endTotalMinutes - startTotalMinutes) / 600) * 100;

        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'appointment';
        appointmentElement.style.top = `${topPosition}%`;
        appointmentElement.style.height = `${height}%`;

        const spanTime = document.createElement('span');
        spanTime.style.position = 'absolute';
        spanTime.style.left = '10px';
        spanTime.textContent = `${startTime} - ${endTime}`;

        const spanName = document.createElement('span');
        spanName.style.position = 'absolute';
        spanName.style.right = '10px';
        spanName.textContent = `${appointment.prenom} ${appointment.nom}`;

        appointmentElement.appendChild(spanTime);
        appointmentElement.appendChild(spanName);
        appointmentsContainer.appendChild(appointmentElement);

        /*appointmentsContainer.addEventListener('click', async function(event) {
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
                                        <th class="duree">Duree</th>
                                        <th class="prix">Prix</th>
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
        });*/
    });


}

async function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');
    const userFirstname = document.getElementById('user-name');
    const userRole = document.getElementById('role');
    const userRole1 = document.getElementById('role1');

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
        <a href="/">Acceuil</a>
        <a href="/#prestation">Prestations</a>
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