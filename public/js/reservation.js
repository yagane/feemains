const monthYear = document.getElementById("month-year");
const calendarGrid = document.getElementById("calendar-grid");
const slotsContainer = document.getElementById("slots");
const slotsTitle = document.getElementById("slots-title");
const calendarSection = document.querySelector(".calendar");
const timeSlotsSection = document.querySelector(".time-slots");
const buttonSection = document.querySelector(".button-section");
const buttonResa = document.querySelector(".button-resa");

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
let prestationDurationStr =''
let total = 0;

let connected = null;
let role = null;
let prenom = null;
let destinataire = null;

function toLocalISOString(date) {
  const pad = (n) => n.toString().padStart(2, '0');

  return (
    date.getFullYear() + '-' +
    pad(date.getMonth() + 1) + '-' +
    pad(date.getDate()) + 'T' +
    pad(date.getHours()) + ':' +
    pad(date.getMinutes()) + ':' +
    pad(date.getSeconds())
  );
}

function resizeInput() {
    let width = 0;

    for(let i = 0; i < this.value.length; i++){
        if(this.value[i] == '1' || this.value[i] == 'i'){
            width += 0.5;
        }else if(this.value[i] == ' '){
            width += 0.6;
        }else{
            width += 1;
        }
    }

    this.style.width = width + "ch";
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

    for (let i = 1; i < firstDay; i++) {
        calendarGrid.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const div = document.createElement("div");
        div.className = "day";
        div.textContent = day;

        const dateObj = new Date(year, month, day);

        const isSunday = dateObj.getDay() === 0;

        if ((dateObj < today || isSunday || dateObj > stopDay) && role != 'admin') {
            if (isSunday) div.classList.add("sunday");
            else div.classList.add("past");
        } else {
            div.onclick = () => {
                document.querySelectorAll(".day").forEach(el => el.classList.remove("selected"));
                document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));

                buttonSection.classList.add("hidden");

                div.classList.add("selected");

                selectedDate = dateObj;
                selectedTimeSlot = null;
                slotsTitle.textContent = `Disponibilités le ${dateObj.toLocaleString().split(' ')[0]}`;
                displayTimeSlots();
            };
        }

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

function generateTimeSlots(startHour, endHour) {
    const slots = [];

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

function checkTimeSlotAvailability(timeSlot, reservations, conges) {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(hours, minutes, 0, 0);

    const prestationEndTime = new Date(slotDateTime.getTime() + prestationDuration * 60000);

    if(selectedDate.getDay() == 3){
        if (prestationEndTime.getHours() == 18 && prestationEndTime.getMinutes() > 0) {
            return false;
        }
    }else{
        if (prestationEndTime.getHours() == 20 && prestationEndTime.getMinutes() > 0) {
            return false;
        }
    }

    let flag = true;

    reservations.forEach(reservation => {
        const reservationStart = new Date(reservation.date_reservation);
        const reservationEnd = ajouterDureeADate(reservationStart, reservation.duree_reservation);

        if (!(prestationEndTime <= reservationStart || reservationEnd <= slotDateTime)) {
            flag = false;
        }
    });

    conges.forEach(conge => {
        const congeDebut = new Date(conge.date_debut);
        const congeFin = new Date(conge.date_fin);

        if((congeDebut <= prestationEndTime && prestationEndTime <= congeFin) || (congeDebut <= slotDateTime && slotDateTime <= congeFin)) {
            flag = false;
        }
    });

    return flag;
}

async function displayTimeSlots() {
    slotsContainer.innerHTML = '';

    const date = toLocalISOString(selectedDate).split('T')[0];

    const response_resa = await fetch("/api/resaTimeDurationByDate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ date })
    });

    const data_resa = await response_resa.json();

    const reservations = data_resa.reservations;

    const response_conge = await fetch("/api/congeAll", {
        method: "GET",
        credentials: "include"
    });

    const conges = await response_conge.json();

    let allSlots = null;

    // Générer les tranches horaires
    if(selectedDate.getDay() == 3){
        allSlots = generateTimeSlots(10, 18);
    }else{
        allSlots = generateTimeSlots(10, 20);
    }

    // Vérifier la disponibilité de chaque tranche
    for (const slot of allSlots) {
        const isAvailable = await checkTimeSlotAvailability(slot, reservations, conges);

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

            if (prestation.nom == 'Nail art'){
                priceSpan.textContent = 'Sur devis';
            }

            const divPrixDuree = document.createElement('div');
            divPrixDuree.className = 'prestation-prixduree'

            divPrixDuree.appendChild(dureeSpan);
            divPrixDuree.appendChild(priceSpan);

            divPrestation.appendChild(nameSpan);
            divPrestation.appendChild(divPrixDuree);

            prestationItem.appendChild(checkbox);
            prestationItem.appendChild(divPrestation);
            prestationsList.appendChild(prestationItem);


            // Ajouter un écouteur d'événement pour cocher la checkbox en cliquant sur la div
            prestationItem.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    updateChecked();
                }
            });
        });

        prestationsList.addEventListener('change', updateChecked);

        prestationsLoading.classList.add("hidden")

    }catch(error) {
        console.error("Erreur lors du chargement des prestations :", error);
    }
}

async function loadClients() {
    const main = document.querySelector('.main');
    const section = document.createElement('section');
    const select = document.createElement('select');

    section.className = "section-client";
    select.className = "select-client";

    try {
        const response = await fetch("/api/getAllClients", {
            method: "GET",
            credentials: "include"
        });

        const clients = await response.json();

        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = `${client.id}`;
            option.textContent = `${client.prenom} ${client.nom}`;

            select.appendChild(option);
        });

        section.appendChild(select);
        main.prepend(section);

        const selectClient = document.querySelector('.select-client');

        const choices = new Choices(selectClient, {
            placeholder: true,
            placeholderValue: 'Sélectionnez un client',
        });

        selectClient.addEventListener('change', function() {
            userId = selectClient.value;
        });

    }catch(error) {
        console.error("Erreur lors du chargement des clients :", error);
    }
}

function updateChecked() {
    const checkboxes = document.querySelectorAll('#prestations-list input[type="checkbox"]:checked');

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
        const prestationPrice = parseFloat(checkbox.dataset.price);
        const prestationDuree = parseFloat(checkbox.dataset.duree);

        selectedPrestationId.push(checkbox.value);

        prestationDuration +=  prestationDuree;
        total += prestationPrice;
    });

    const durationHours = Math.floor(prestationDuration/60);
    const durationMinutes = prestationDuration%60;

    prestationDurationStr = `${durationHours} h ${durationMinutes} min`;
}

document.getElementById('resume-reservation').addEventListener('click', (event) => {
    const formattedDate = new Date(selectedDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const parts = formattedDate.split(' ');
    const capitalizedDate = `${capitalize(parts[0])} ${parts[1]} ${capitalize(parts[2])} ${parts[3]}`;

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
                    <h2>Récapitulatif</h2>
                </div>
                <div class="modal-info">
                    <div class="resume-date">
                        <span>${capitalizedDate} à ${selectedTimeSlot}</span>
                    </div>
                    <div class="resume-prestation">
                    </div>
                    <div class="resume-total">
                        <div id="total-duree">
                            <span>Durée : ${prestationDurationStr}</span>
                        </div>
                        <div id="total-prix">
                            <span>Prix : ${total} €</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-button" id="submit-reservation">Confirmer</button>
                </div>
            </div>
        </div>
    `;

    mainFooter.appendChild(modal);

    const resumePresta = document.querySelector('.resume-prestation');

    for (let i = 0; i < selectedPrestationId.length; i++) {
        const div = document.getElementById(`prestation-${selectedPrestationId[i]}`)

        const divClone = div.cloneNode(true);

        resumePresta.appendChild(divClone)
    }

    if (role == 'admin') {
        const totalDuree = document.getElementById('total-duree');
        const totalPrix = document.getElementById('total-prix');

        totalDuree.innerHTML = '';
        totalPrix.innerHTML = '';

        const spanPrix = document.createElement('span');
        const spanPrix2 = document.createElement('span');
        const spanDuree = document.createElement('span');

        const inputPrix = document.createElement('input');
        const inputDuree = document.createElement('input');

        inputDuree.value = `${prestationDurationStr}`;
        inputDuree.className = 'input-duree';
        inputDuree.id = "inputDuree";

        inputPrix.value = `${total}`;
        inputPrix.className = 'input-prix';

        inputPrix.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            resizeInput.call(inputPrix);
        });

        inputPrix.addEventListener('change', async function(e) {
            total = inputPrix.value;
        });

        resizeInput.call(inputPrix);

        spanPrix.textContent = 'Prix : ';
        spanPrix2.textContent = ' €';
        spanDuree.textContent = 'Duree : ';

        totalPrix.appendChild(spanPrix);
        totalPrix.appendChild(inputPrix);
        totalPrix.appendChild(spanPrix2);
        totalDuree.appendChild(spanDuree);
        totalDuree.appendChild(inputDuree);

        const inputPicker = document.getElementById('inputDuree');
        const pickerDebut = new Picker(inputPicker, {
            format: 'H h m min',
            increment: {
                minute: 5
            },
            text: {
                title: "Choisisez l'heure",
                cancel: 'Cancel',
                confirm: 'OK',
                year: 'Year',
                month: 'Month',
                day: 'Day',
                hour: 'Hour',
                minute: 'Minute',
                second: 'Second',
                millisecond: 'Millisecond'
            }
        });

        const cancelBtn = document.querySelectorAll('.picker-cancel');

        cancelBtn.forEach(button => {
            button.remove();
        });

        const picker = document.querySelectorAll('.picker');

        picker.forEach(button => {
            button.dataset.pickerAction = "pick";
        });

        const closePicker = document.querySelectorAll('.picker-close');

        closePicker.forEach(button => {
            button.dataset.pickerAction = "pick";
        });

        inputPicker.addEventListener('change', async function(e) {
            resizeInput.call(inputPicker);

            prestationDurationStr = inputPicker.value;

            if(data.success){
                loadTimeSlots(selectedDate);
            }
        });

        resizeInput.call(inputPicker);
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
        slotDateTime.setHours(hours, minutes, 0, 0);

        const durationHours = Math.floor(prestationDuration/60);
        const durationMinutes = prestationDuration%60;

        const duration = `${prestationDurationStr.split(' h ')[0]}:${prestationDurationStr.split(' h ')[1].split(' min')[0]}`;

        const date = `${toLocalISOString(slotDateTime).split('T')[0]} ${toLocalISOString(slotDateTime).split('T')[1].split('.')[0]}`;

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
                    duree: duration,
                    prix: total
                })
            });

            const result = await response.json();

            if (result.success) {

                if (destinataire != '') {
                    const response = await fetch("/api/resaConfirmation", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            destinataire: destinataire,
                            nom: prenom,
                            date: capitalizedDate,
                            heure: selectedTimeSlot
                        })
                    });

                    const result = await response.json();
                }

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
                updateChecked();
                modal.remove();
            } else {
                alert("Erreur : " + result.message);
            }

        } catch (error) {

        }
    });

    const closeBtn = document.querySelector('.close-button');

    closeBtn.addEventListener('click', (event) => {
        modal.remove();
    });
});

async function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');
    const userFirstname = document.getElementById('user-name');
    const drop1 = document.getElementById('drop1');
    const drop2 = document.getElementById('drop2');

    const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    connected = data.connected;
    role = data.role;
    prenom = data.prenom;
    destinataire = data.email;

    renderCalendar();

    if (data.connected) {
        authLink.classList.add("hidden");
        userGreeting.classList.remove("hidden");
        userFirstname.textContent = `Bonjour, ${data.prenom} ▼`;

        if(data.role == 'admin'){
            drop1.href = '/admin';
            drop1.textContent = 'Agenda';
            drop2.href = '/stat';
            drop2.textContent = 'Statistique';
            loadClients();
            destinataire = '';
        }else{
            userId = data.id
        }
    } else {
        authLink.classList.remove("hidden");
        userGreeting.classList.add("hidden");

        window.location.href = "/login";
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
                            <path d="M8 21 v-4 a4 4 0 0 0 -4 -2 H5 a4 4 2 0 0 -4 2 v4"></path>
                            <path d="M15 21 v-12 a4 4 0 0 0 -4 -2 H12 a4 4 2 0 0 -4 2 v12"></path>
                            <path d="M22 21 v-8 a4 4 0 0 0 -4 -2 H19 a4 4 2 0 0 -4 2 v8"></path>
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
                    <a href="/registerInvite">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Ajout client
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
                    <a href="/client">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Mon compte
                    </a>
                    <a href="/historique">
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
window.addEventListener('DOMContentLoaded', loadPrestations);
