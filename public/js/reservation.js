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

    // Récupérer les rendez-vous existants pour cette date
    const response = await fetch(`/php/check_appointment.php?date=${selectedDate.toISOString().split('T')[0]}`);
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
        const response = await fetch('./php/prestation.php');
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

        // Ajouter un écouteur d'événement pour mettre à jour le récapitulatif
        prestationsList.addEventListener('change', updateRecap);

        prestationsLoading.classList.add("hidden")

    }catch(error) {
        console.error("Erreur lors du chargement des prestations :", error);
    }
}

// Fonction pour mettre à jour le récapitulatif
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

    // Ajouter chaque prestation cochée au récapitulatif
    checkboxes.forEach(checkbox => {
        const prestationId = checkbox.value;
        const prestationPrice = parseFloat(checkbox.dataset.price);
        const prestationDuree = parseFloat(checkbox.dataset.duree);
        const label = document.querySelector(`div[id="prestation-${prestationId}"]`);

        selectedPrestationId.push(parseFloat(prestationId));

        const recapItem = document.createElement('div');
        recapItem.className = 'recap-item';

        const recapItemName = document.createElement('span');
        recapItemName.textContent = label.querySelector('.prestation-name').textContent;

        const recapItemPrice = document.createElement('span');
        recapItemPrice.textContent = ` - ${prestationPrice.toFixed(2)} €`;

        recapItem.appendChild(recapItemName);
        recapItem.appendChild(recapItemPrice);
        recapList.appendChild(recapItem);

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

async function updateAuthUI() {
    const response = await fetch('/php/check_auth.php');
    const data = await response.json();
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');
    const userFirstname = document.getElementById('user-firstname');
    const userRole = document.getElementById('role');

    if (data.connected) {
        // Utilisateur connecté : masquer le lien de connexion et afficher le menu déroulant
        authLink.style.display = 'none';
        userGreeting.style.display = 'inline';
        userFirstname.textContent = data.prenom;
        userId = data.id;
        if(data.role == 'admin'){
            userRole.href = '/admin.html';
        }
    } else {
        window.location.href = "/login.html";
    }
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
        // Envoyer les données au serveur
        const response = await fetch('/php/reservation.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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


// Appeler la fonction au chargement de la page
window.addEventListener('DOMContentLoaded', updateAuthUI);

// Charger les prestations au chargement de la page
window.addEventListener('DOMContentLoaded', loadPrestations);
