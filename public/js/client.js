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

async function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');
    const userFirstname = document.getElementById('user-firstname');
    const userRole = document.getElementById('role');

    const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    userID = data.id

    if (data.connected) {
        authLink.style.display = 'none';
        userGreeting.style.display = 'inline';
        userFirstname.textContent = data.prenom;
        if(data.role == 'admin'){
            userRole.href = '/admin.html';
        }
    } else {
        authLink.style.display = 'inline-block';
        userGreeting.style.display = 'none';
    }
}

document.getElementById("logout").addEventListener("click", function (e) {
    const response = await fetch("/api/logout", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if(data.success){
        window.location.href = "/index.html";
    }
});

window.onload = updateAuthUI;
window.addEventListener('DOMContentLoaded', loadHistoric);