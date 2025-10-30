// Fiók gomb kezelése
document.addEventListener('DOMContentLoaded', function() {
    const profileBtn = document.getElementById('profileBtn');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            window.location.href = 'profile/profile.html';
        });
    }
    
    // Nav gombok kezelése
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent;
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

// AI Buborék kezelése
document.addEventListener('DOMContentLoaded', function() {
    const aiBubble = document.getElementById('aiBubble');
    const aiContent = document.getElementById('aiContent');
    
    if (aiBubble) {
        aiBubble.addEventListener('click', function(e) {
            // Ne nyíljon ki ha a formra kattintanak
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
                return;
            }
            
            this.classList.toggle('open');
        });
        
        // Form submit
        const aiForm = aiContent.querySelector('form');
        if (aiForm) {
            aiForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('AI keresés indítva!');
                // Itt később lehet a keresés logikát implementálni
            });
        }
    }
});