// Fiók gomb kezelése
document.addEventListener('DOMContentLoaded', function() {
    const profileBtn = document.getElementById('profileBtn');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
    
    // Nav gombok kezelése
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent;
            alert(buttonText + ' gomb megnyomva!');
            // Itt később lehet navigációt implementálni
        });
    });
    
    // Regisztráció gomb
    const registerBtn = document.querySelector('.register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            alert('Regisztráció modal megnyílik!');
        });
    }
});