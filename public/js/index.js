async function updateAuthUI() {
    const response = await fetch('https://php.fee-mains.com/check_auth.php');
    const data = await response.json();
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');
    const userFirstname = document.getElementById('user-firstname');
    const userRole = document.getElementById('role');

    console.log(data.connected);

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

window.addEventListener('DOMContentLoaded', updateAuthUI);