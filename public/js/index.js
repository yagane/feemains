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
        authLink.style.display = 'none';
        login.style.display = 'none';
        userGreeting.style.display = 'inline';
        menuAccount.style.display = 'flex';
        userFirstname.textContent = `Bonjour, ${data.prenom} ▼`;
        if(data.role == 'admin'){
            userRole.href = '/admin';
        }
    } else {
        authLink.style.display = 'inline-block';
        login.style.display = 'inline-block';
        userGreeting.style.display = 'none';
        menuAccount.style.display = 'none';
    }
}

document.getElementById("logout").addEventListener("click", async function (e) {
    const response = await fetch("/api/logout", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if(data.success){
        window.location.href = "/index";
    }
});

document.getElementById("logout1").addEventListener("click", async function (e) {
    const response = await fetch("/api/logout", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if(data.success){
        window.location.href = "/index";
    }
});

const navPhone = document.querySelector('.nav-phone');
const menuContainer = document.querySelector('.nav-div');

let dynamicMenu = null;


function createDynamicMenu() {
    const menu = document.createElement('div');
    menu.className = 'phone-dropdown-menu';

    menu.innerHTML = `
        <a href="/#prestation">Prestations</a>
        <a href="/reservation">Reservation</a>
        <a href="/#contact">Contact</a>

        <div class="menu-account">
            <a id="login" href="/login">Connexion</a>
            <div id="menu-account" class="menu-account" style="display: none;">
                <a id="role1" href="/client">Mon compte</a>
                <span id="logout1">Se déconnecter</span>
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