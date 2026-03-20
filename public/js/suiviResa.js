const options = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false // Pour afficher en format 24h
};

let connected = null;
let role = null;

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
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.whiteSpace = 'pre';
    tempSpan.style.position = 'absolute';
    tempSpan.style.fontSize = window.getComputedStyle(this).fontSize;
    tempSpan.style.fontFamily = window.getComputedStyle(this).fontFamily;
    tempSpan.style.fontWeight = window.getComputedStyle(this).fontWeight;
    tempSpan.style.padding = window.getComputedStyle(this).padding;
    tempSpan.style.border = window.getComputedStyle(this).border;
    tempSpan.textContent = this.value || this.placeholder || '';

    document.body.appendChild(tempSpan);

    const width = tempSpan.offsetWidth;
    this.style.width = `${width}px`;

    document.body.removeChild(tempSpan);
}

async function loadPrestations(prestation_noms) {
    const prestationsOngle = document.getElementById('prestations-ongle');
    const prestationsSupp = document.getElementById('prestations-supp');
    const prestationsSourcil = document.getElementById('prestations-sourcil');
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
            checkbox.dataset.nom = prestation.nom;

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

            if (prestation.details == 'ongle'){
                prestationsOngle.appendChild(prestationItem);
            }else if(prestation.details == 'supplement'){
                prestationsSupp.appendChild(prestationItem);
            }else{
                prestationsSourcil.appendChild(prestationItem);
            }

            if (prestation_noms.includes(prestation.nom)){
                checkbox.checked = !checkbox.checked;
            }

            // Ajouter un écouteur d'événement pour cocher la checkbox en cliquant sur la div
            prestationItem.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    updateChecked();
                }
            });
        });

        prestationsOngle.addEventListener('change', updateChecked);
        prestationsSupp.addEventListener('change', updateChecked);
        prestationsSourcil.addEventListener('change', updateChecked);

        prestationsLoading.classList.add("hidden")

    }catch(error) {
        console.error("Erreur lors du chargement des prestations :", error);
    }
}

function updateChecked() {
    const checkboxes = document.querySelectorAll('.prestations-list input[type="checkbox"]:checked');

    selectedPrestationId = [];
    prestationDuration = 0;
    total = 0;

    checkboxes.forEach(checkbox => {
        const prestationPrice = parseFloat(checkbox.dataset.price);
        const prestationDuree = parseFloat(checkbox.dataset.duree);

        selectedPrestationId.push(checkbox.value);

        prestationDuration +=  prestationDuree;
        total += prestationPrice;
    });
}

async function loadHistoric() {
    const historicDiv = document.querySelector(".historique-rdv");
    const reservationsList = document.getElementById('reservations-list');

    try {
        // Envoyer les données au serveur
        const response = await fetch("/api/resaAll", {
            method: "GET",
            credentials: "include"
        });

        const reservations = await response.json();

        reservations.reverse();

        reservations.forEach(appointment => {
            const row = document.createElement('tr');

            const date = new Date(appointment.date_reservation);
            const formattedDate = date.toLocaleString('fr-FR', options);

            // Créer les cellules du tableau
            row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${appointment.prenom} ${appointment.nom}</td>
            <td class="actions" id=${appointment.id}>
                <button class="resume-button">Resumé</button>
                <button class="cancel-button">Annuler</button>
            </td>`;

            reservationsList.appendChild(row);

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

            const id = appointment.id;
            const date_reservation = new Date(appointment.date_reservation);
            const localDate = date_reservation.toLocaleDateString().split(' ')[0];

            const resumeButton = document.querySelectorAll('.resume-button');

            const button = resumeButton[resumeButton.length - 1];

            button.addEventListener('click', async function(event) {
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
                                <h3>Reservation du ${localDate}</h3>
                                <h3>${startTime} - ${endTime}</h3>
                            </div>
                            <div class="modal-info">
                                <div class='user-info'>
                                    <span>${appointment.prenom} ${appointment.nom}</span>
                                </div>
                                <div class="resume-prestation">
                                </div>
                                <div class="resume-total">
                                    <div id="total-duree">
                                    </div>
                                    <div id="total-prix">
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button class="cancel-button">Annuler</button>
                            </div>
                        </div>
                    </div>
                `;

                mainFooter.appendChild(modal);

                const cancelButton = document.querySelectorAll('.cancel-button');

                cancelButton.forEach(button => {
                    button.addEventListener('click', async function(event) {
                        const response = await fetch("/api/deleteResa", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({ id })
                        });

                        const data = await response.json();

                        if(data.success){
                            const modal = document.querySelector('.modal-backdrop');
                            loadHistoric()
                            modal.remove();
                        }
                    });
                });

                const userInfo = document.querySelector('.user-info');

                userInfo.addEventListener('click', async function(event) {
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
                                    <h3>Information client</h3>
                                </div>
                                <div class="modal-info">
                                    <div class='user-info'>
                                        <div class="user-info-div">
                                            <span>Nom :</span>
                                            <span>${appointment.prenom} ${appointment.nom}</span>
                                        </div>
                                        <div class="user-info-div">
                                            <span>Email :</span>
                                            <input id="email-input" class="input-client" placeholder="Entrez un email" value=${appointment.email}>
                                        </div>
                                        <div class="user-info-div">
                                            <span>Téléphone :</span>
                                            <input id="phone-input" class="input-client" placeholder="Entrez un numéro" value=${appointment.phone}>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    mainFooter.appendChild(modal);

                    const inputEmail = document.getElementById('email-input');
                    const inputPhone = document.getElementById('phone-input');

                    const user_id = appointment.user_id

                    inputEmail.addEventListener('input', function(e) {
                        resizeInput.call(this);
                    });

                    inputEmail.addEventListener('change', async function(e) {
                        const response = await fetch("/api/updateEmailClient", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                id: user_id,
                                email: this.value
                            })
                        });

                        appointment.email = this.value;
                    });

                    resizeInput.call(inputEmail);

                    inputPhone.addEventListener('input', function(e) {
                        this.value = this.value.replace(/[^0-9]/g, '');
                        resizeInput.call(this);
                    });

                    inputPhone.addEventListener('change', async function(e) {
                        const response = await fetch("/api/updatePhoneClient", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                id: user_id,
                                phone: this.value
                            })
                        });

                        appointment.phone = this.value;
                    });

                    resizeInput.call(inputPhone);

                    const elements = document.querySelectorAll('.close-button');

                    const closeBtn = elements[elements.length - 1];

                    closeBtn.addEventListener('click', (event) => {
                        const modals = document.querySelectorAll('.modal-backdrop');

                        const modal = modals[modals.length - 1];
                        modal.remove();
                    });
                });

                const resumePresta = document.querySelector('.resume-prestation');

                let prestation_noms = appointment.prestation_noms.split(', ');
                let prestation_prix = appointment.prestation_prix.split(', ');
                let prestation_duree = appointment.prestation_duree.split(', ');

                for (let i = 0; i < prestation_noms.length; i++){

                    const durationHours = Math.floor(parseInt(prestation_duree[i])/60);
                    const durationMinutes = parseInt(prestation_duree[i])%60;
                    let prestationDurationStr = '';

                    // Mettre à jour le total
                    if(durationHours == 0){
                        prestationDurationStr = `${durationMinutes} min`;
                    }else{
                        prestationDurationStr = `${durationHours} h ${durationMinutes} min`;
                    }

                    const div = document.createElement('div');

                    div.innerHTML = `
                        <span class="prestation-name">${prestation_noms[i]}</span>
                        <div class="prestation-prixduree">
                            <span>${prestationDurationStr}</span>
                            <span class="prestation-price">${prestation_prix[i]} €</span>
                        </div>
                    `;

                    resumePresta.appendChild(div);
                }

                const spanPrix = document.createElement('span');
                const spanPrix2 = document.createElement('span');
                const spanDuree = document.createElement('span');

                const inputPrix = document.createElement('input');
                const inputDuree = document.createElement('input');

                inputDuree.value = `${parseInt(appointment.duree_reservation.split(':')[0])} h ${parseInt(appointment.duree_reservation.split(':')[1])} min`;
                inputDuree.className = 'input-resa';
                inputDuree.id = "inputDuree";

                inputPrix.value = `${appointment.prix}`;
                inputPrix.className = 'input-resa';

                inputPrix.addEventListener('input', function(e) {
                    this.value = this.value.replace(/[^0-9]/g, '');
                    resizeInput.call(inputPrix);
                });

                inputPrix.addEventListener('change', async function(e) {
                    const response = await fetch("/api/updatePrixResa", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            id: id,
                            prix: inputPrix.value
                        })
                    });

                    const data = await response.json();

                    if(data.success){
                        loadHistoric()
                    }
                });

                resizeInput.call(inputPrix);

                spanPrix.textContent = 'Prix : ';
                spanPrix2.textContent = ' €';
                spanDuree.textContent = 'Duree : ';

                const totalDuree = document.getElementById('total-duree');
                const totalPrix = document.getElementById('total-prix');

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
                    controls: true,
                    rows: 1,
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

                    const duree = `${inputPicker.value.split(' h ')[0]}:${inputPicker.value.split(' h ')[1].split(' min')[0]}`;

                    const response = await fetch("/api/updateDureeResa", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            id: id,
                            duree: duree
                        })
                    });

                    const data = await response.json();

                    if(data.success){
                        loadHistoric()
                    }
                });

                resizeInput.call(inputPicker);

                resumePresta.addEventListener('click', async function(event) {
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
                                    <h3>Choix prestations</h3>
                                </div>
                                <div class="modal-info">
                                    <section class="prestations-section">
                                        <h2>Nos Prestations</h2>
                                        <div id="prestations-loading">Chargement des prestations...</div>
                                        <h3>Ongle</h3>
                                        <div id="prestations-ongle" class="prestations-list"></div>
                                        <h3>Supplément</h3>
                                        <div id="prestations-supp" class="prestations-list"></div>
                                        <h3>Sourcil et épilation</h3>
                                        <div id="prestations-sourcil" class="prestations-list"></div>
                                    </section>
                                </div>
                                <div class="modal-footer">
                                    <button class="cancel-button">Confirmer</button>
                                </div>
                            </div>
                        </div>
                    `;

                    mainFooter.appendChild(modal);

                    loadPrestations(prestation_noms);

                    const cancelElements = document.querySelectorAll('.cancel-button');

                    const cancelBtn = cancelElements[cancelElements.length - 1];

                    cancelBtn.addEventListener('click', async (event) => {

                        const durationHours = Math.floor(prestationDuration/60);
                        const durationMinutes = prestationDuration%60;

                        const duree = `${durationHours}:${durationMinutes}`;

                        const response = await fetch("/api/updateResa", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                id: id,
                                duree: duree,
                                prix: total,
                                prestId: selectedPrestationId
                            })
                        });

                        const data = await response.json();

                        inputDuree.value = `${durationHours} h ${durationMinutes} min`;
                        inputPrix.value = `${total}`;

                        resizeInput.call(inputDuree);
                        resizeInput.call(inputPrix);

                        resumePresta.innerHTML = '';

                        prestation_noms = [];
                        prestation_prix = [];
                        prestation_duree = [];

                         const checkboxes = document.querySelectorAll('.prestations-list input[type="checkbox"]:checked');

                        checkboxes.forEach(checkbox => {
                            const prestationPrice = parseFloat(checkbox.dataset.price).toFixed(2);
                            const prestationDuree = parseFloat(checkbox.dataset.duree);
                            const prestationNom = checkbox.dataset.nom;

                            prestation_noms.push(prestationNom);
                            prestation_prix.push(prestationPrice);
                            prestation_duree.push(prestationDuree);
                        });

                        for (let i = 0; i < prestation_noms.length; i++){

                            const durationHours = Math.floor(parseInt(prestation_duree[i])/60);
                            const durationMinutes = parseInt(prestation_duree[i])%60;
                            let prestationDurationStr = '';

                            // Mettre à jour le total
                            if(durationHours == 0){
                                prestationDurationStr = `${durationMinutes} min`;
                            }else{
                                prestationDurationStr = `${durationHours} h ${durationMinutes} min`;
                            }

                            const div = document.createElement('div');

                            div.innerHTML = `
                                <span class="prestation-name">${prestation_noms[i]}</span>
                                <div class="prestation-prixduree">
                                    <span>${prestationDurationStr}</span>
                                    <span class="prestation-price">${prestation_prix[i]} €</span>
                                </div>
                            `;

                            resumePresta.appendChild(div);
                        }

                        if(data.success){
                            loadHistoric()
                        }

                        const modals = document.querySelectorAll('.modal-backdrop');

                        const modal = modals[modals.length - 1];
                        modal.remove();
                    });

                    const elements = document.querySelectorAll('.close-button');

                    const closeBtn = elements[elements.length - 1];

                    closeBtn.addEventListener('click', (event) => {
                        const modals = document.querySelectorAll('.modal-backdrop');

                        const modal = modals[modals.length - 1];
                        modal.remove();
                    });
                });

                const closeBtn = document.querySelector('.close-button');

                closeBtn.addEventListener('click', (event) => {
                    const modal = document.querySelector('.modal-backdrop');
                    modal.remove();
                });
            });
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
                    body: JSON.stringify({ id : reservationId })
                });

                const data = await response.json();

                if(data.success){
                    window.location.href = "/suiviResa";
                }
            });
        });



    } catch (error) {

    }
}

async function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');
    const drop1 = document.getElementById('drop1');
    const drop2 = document.getElementById('drop2');

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

        if(data.role == 'admin'){
            drop1.href = '/admin';
            drop1.textContent = 'Agenda';
            drop2.href = '/stat';
            drop2.textContent = 'Statistique';
        }
    } else {
        authLink.classList.remove("hidden");
        userGreeting.classList.add("hidden");
    }

    loadHistoric();
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
                    <a href="/suiviResa">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Suivi reservations
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