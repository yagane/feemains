let userId = null;

async function updateAuthUI() {
    const response = await fetch('/php/check_auth.php');
    const data = await response.json();
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');
    const userFirstname = document.getElementById('user-firstname');
    const userRole = document.getElementById('role');

    if (data.connected) {
        authLink.style.display = 'none';
        userGreeting.style.display = 'inline-block';
        console.log(data)
        userFirstname.textContent = data.prenom;
        document.getElementById('user-fullname').textContent = data.prenom + ' ' + data.nom;
        document.getElementById('user-email').textContent = data.email;
        document.getElementById('user-phone').textContent = data.phone;
        userId = data.id;
        if(data.role == 'admin'){
            userRole.href = '/admin.html';
        }
    } else {
        alert(data.error);
        window.location.href = '/index.html';
        return;
    }
}

async function loadHistoric() {
    const historicDiv = document.querySelector(".historique-rdv");
    const reservationsList = document.getElementById('reservations-list');

    try {
        // Envoyer les données au serveur
        const response = await fetch('/php/client.php');
        const reservations = await response.json();

        reservations.forEach(reservation => {
            if(reservation.user_id == userId){
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

window.addEventListener('DOMContentLoaded', updateAuthUI);
window.addEventListener('DOMContentLoaded', loadHistoric);