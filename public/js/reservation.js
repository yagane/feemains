const monthYear = document.getElementById("month-year");
const calendarGrid = document.getElementById("calendar-grid");
const slotsContainer = document.getElementById("slots");
const slotsTitle = document.getElementById("slots-title");
const calendarSection = document.querySelector(".calendar");
const timeSlotsSection = document.querySelector(".time-slots");
const buttonSection = document.querySelector(".button-section");
const buttonResa = document.querySelector(".button-resa");
const recapList = document.getElementById('recap-list');

const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

let currentDate = new Date();
let selectedDate = null;
let selectedTimeSlot = null;
let selectedPrestationId = [];

let userId = null;
let prestationDuration = 0;
let total = 0;

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
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const isSunday = dateObj.getDay() === 0;

        if (dateObj < today || isSunday || dateObj > stopDay) {
            if (isSunday) div.classList.add("sunday");
            else div.classList.add("past");
        } else {
            div.onclick = () => {
                document.querySelectorAll(".day").forEach(el => el.classList.remove("selected"));
                document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));

                buttonSection.classList.add("hidden");

                div.classList.add("selected");

                selectedDate = new Date(dateStr);
                selectedTimeSlot = null;
                slotsTitle.textContent = `Créneaux disponibles le ${dateStr}`;
                displayTimeSlots();
            };
        }

        calendarGrid.appendChild(div);
    }
}

renderCalendar();

document.getElementById("prev").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
};

document.getElementById("next").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
};

function generateTimeSlots() {
    const slots = [];
    const startHour = 10;
    const endHour = 20;

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(time);
        }
    }

    return slots;
}

function ajouterDureeADate(date, duree) {
    const [hours, minutes, seconds] = duree.split(':').map(Number);
    const dureeMs = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
    return new Date(date.getTime() + dureeMs);
}

// Fonction pour vérifier si une tranche horaire est disponible
function checkTimeSlotAvailability(timeSlot, data) {
    // Convertir la tranche horaire en timestamp
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(hours, minutes, 0, 0);

    // Calculer la fin de la prestation
    const prestationEndTime = new Date(slotDateTime.getTime() + prestationDuration * 60000);

    // Vérifier si la prestation dépasse 20h
    if (prestationEndTime.getHours() >= 20) {
        return false;
    }

    // Vérifier si la tranche horaire ou la prestation chevauche un rendez-vous existant
    for (const reservation of data.reservations) {
        const reservationStart = new Date(reservation.date_reservation);
        const reservationEnd = ajouterDureeADate(reservationStart, reservation.duree_reservation);

        if (!(prestationEndTime <= reservationStart || reservationEnd <= slotDateTime)) {
            return false;
        }
    }

    // Vérifier les congés
    /*
    const congesResponse = await fetch('conges.php');
    const congesData = await congesResponse.json();

    if (!congesData.success) {
        console.error(congesData.message);
        return false;
    }

    for (const conge of congesData.conges) {
        const congeStart = new Date(conge.date_debut);
        const congeEnd = new Date(conge.date_fin);

        if (slotDateTime >= congeStart && prestationEndTime <= congeEnd) {
            return false;
        }
    }*/

    return true;
}

// Fonction pour afficher les tranches horaires disponibles
async function displayTimeSlots() {
    slotsContainer.innerHTML = '';

    const date = selectedDate.toISOString().split('T')[0];

    // Récupérer les rendez-vous existants pour cette date
    const response = await fetch("/api/resaTimeDurationByDate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ date })
    });

    const data = await response.json();

    if (!data.success) {
        console.error(data.message);
        return false;
    }

    // Générer les tranches horaires
    const allSlots = generateTimeSlots();

    // Vérifier la disponibilité de chaque tranche
    for (const slot of allSlots) {
        const isAvailable = await checkTimeSlotAvailability(slot, data);

        if (isAvailable) {
            const slotElement = document.createElement('div');
            slotElement.className = `time-slot`;
            slotElement.textContent = slot;
            slotElement.addEventListener('click', function() {
                document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
                slotElement.classList.add('selected');
                selectedTimeSlot = slot;
                buttonSection.classList.remove("hidden");
            });
            slotsContainer.appendChild(slotElement);
        }
    }
}

async function loadPrestations() {
    const prestationsList = document.getElementById('prestations-list');
    const prestationsLoading = document.getElementById('prestations-loading');
    const recapEmpty = document.getElementById('recap-empty');
    const recapTotal = document.getElementById('recap-total');

    try {
        const response = await fetch("/api/getAllPresta", {
            method: "GET",
            credentials: "include"
        });

        const prestations = await response.json();

        prestations.forEach(prestation => {
            const prestationItem = document.createElement('div');
            prestationItem.className = 'prestation-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `prestation-${prestation.id}`;
            checkbox.value = prestation.id;
            checkbox.dataset.price = prestation.prix;
            checkbox.dataset.duree = prestation.duree;

            const durationHours = Math.floor(prestation.duree/60);
            const durationMinutes = prestation.duree%60;

            const divPrestation = document.createElement('div');
            divPrestation.id = `prestation-${prestation.id}`;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'prestation-name';
            nameSpan.textContent = prestation.nom;

            const dureeSpan = document.createElement('span');
            if(durationHours == 0){
                dureeSpan.textContent = `${durationMinutes} min`;
            }else{
                dureeSpan.textContent = `${durationHours} h ${durationMinutes} min`;
            }


            const priceSpan = document.createElement('span');
            priceSpan.className = 'prestation-price';
            priceSpan.textContent = `${prestation.prix} €`;

            divPrestation.appendChild(nameSpan);
            divPrestation.appendChild(document.createTextNode(' '));
            divPrestation.appendChild(dureeSpan);
            divPrestation.appendChild(document.createTextNode(' - '));
            divPrestation.appendChild(priceSpan);

            prestationItem.appendChild(checkbox);
            prestationItem.appendChild(divPrestation);
            prestationsList.appendChild(prestationItem);


            // Ajouter un écouteur d'événement pour cocher la checkbox en cliquant sur la div
            prestationItem.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    updateRecap();
                }
            });
        });

        prestationsList.addEventListener('change', updateRecap);

        prestationsLoading.classList.add("hidden")

    }catch(error) {
        console.error("Erreur lors du chargement des prestations :", error);
    }
}

function updateRecap() {
    const checkboxes = document.querySelectorAll('#prestations-list input[type="checkbox"]:checked');
    const recapEmpty = document.getElementById('recap-empty');
    const recapTotal = document.getElementById('recap-total');
    const recapTemps = document.getElementById('recap-temps');

    // Vider la liste actuelle
    recapList.innerHTML = '';
    selectedPrestationId = [];
    prestationDuration = 0;
    total = 0;

    if (checkboxes.length > 0) {
        calendarSection.classList.remove("hidden");
        timeSlotsSection.classList.remove("hidden");
    } else {
        calendarSection.classList.add("hidden");
        timeSlotsSection.classList.add("hidden");
        buttonSection.classList.add("hidden");
        slotsTitle.textContent = `Choisissez une date`;
        slotsContainer.innerHTML = '';
        selectedDate = null;
        selectedTimeSlot = null;
        document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
    }

    if(selectedDate){
        displayTimeSlots();
    }

    checkboxes.forEach(checkbox => {
        const prestationId = checkbox.value;
        const prestationPrice = parseFloat(checkbox.dataset.price);
        const prestationDuree = parseFloat(checkbox.dataset.duree);
        const label = document.querySelector(`div[id="prestation-${prestationId}"]`);

        selectedPrestationId.push(parseFloat(prestationId));

        const div = document.createElement('div');
        div.className = 'recap-item';

        const spanName = document.createElement('span');
        spanName.textContent = label.querySelector('.prestation-name').textContent;

        const spanPrice = document.createElement('span');
        spanPrice.textContent = ` - ${prestationPrice.toFixed(2)} €`;

        div.appendChild(spanName);
        div.appendChild(spanPrice);
        recapList.appendChild(div);

        prestationDuration +=  prestationDuree;
        total += prestationPrice;
    });

    const durationHours = Math.floor(prestationDuration/60);
    const durationMinutes = prestationDuration%60;

    // Mettre à jour le total
    if(durationHours == 0){
        recapTemps.textContent = `Temps : ${durationMinutes} min`;
    }else{
        recapTemps.textContent = `Temps : ${durationHours} h ${durationMinutes} min`;
    }

    recapTotal.textContent = `Total : ${total.toFixed(2)} €`;

}

document.getElementById('submit-reservation').addEventListener('click', async () => {
    // Vérifier que tous les champs sont remplis
    if (selectedPrestationId == [] || !selectedDate || !selectedTimeSlot) {
        alert("Veuillez sélectionner une prestation, une date et une plage horaire.");
        return;
    }

    const checkboxes = document.querySelectorAll('#prestations-list input[type="checkbox"]:checked');

    const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(hours+1, minutes, 0, 0);

    const durationHours = Math.floor(prestationDuration/60);
    const durationMinutes = prestationDuration%60;

    const duration = `${durationHours}:${durationMinutes}`;

    const date = `${slotDateTime.toISOString().split('T')[0]} ${slotDateTime.toISOString().split('T')[1].split('.')[0]}`;

    try {
        const response = await fetch('/api/insertResa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify({
                id: userId,
                prestId: selectedPrestationId,
                date: date,
                duree: duration
            })
        });

        const result = await response.json();

        if (result.success) {
            alert("Réservation effectuée avec succès !");
            calendarSection.classList.add("hidden");
            timeSlotsSection.classList.add("hidden");
            buttonSection.classList.add("hidden");
            slotsTitle.textContent = `Choisissez une date`;
            slotsContainer.innerHTML = '';
            selectedDate = null;
            selectedTimeSlot = null;
            document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
            checkboxes.forEach(checkbox => {
            checkbox.checked = !checkbox.checked;
            });
            updateRecap();
        } else {
            alert("Erreur : " + result.message);
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi de la réservation :", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
    }
});

async function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const login = document.getElementById('login');
    const userGreeting = document.getElementById('user-greeting');
    const menuAccount = document.getElementById('menu-account');
    const userFirstname = document.getElementById('user-name');
    const userRole = document.getElementById('role');

    const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if (data.connected) {
         if(login){
            login.style.display = 'none';
            menuAccount.style.display = 'flex';
        }

        authLink.style.display = 'none';
        userGreeting.style.display = 'inline-block';
        userFirstname.textContent = `Bonjour, ${data.prenom} ▼`;

        if(data.role == 'admin'){
            userRole.href = '/admin';
        }
    } else {
        authLink.style.display = 'inline-block';
        userGreeting.style.display = 'none';

        if(login){
            login.style.display = 'inline-block';
            menuAccount.style.display = 'none';
        }
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
        <a href="/#contact">Contact</a>

        <div class="menu-connexion">
            <a id="login" href="/login">Connexion</a>
            <div id="menu-account" class="menu-account" style="display: none;">
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
window.addEventListener('DOMContentLoaded', loadPrestations);
