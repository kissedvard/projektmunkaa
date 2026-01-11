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

    // Wheat confetti effect for horse
    const horseImage = document.getElementById('horseImage');
    const confettiContainer = document.getElementById('confettiContainer');
    
    if (horseImage && confettiContainer) {
        let confettiTimeout;
        
        horseImage.addEventListener('mouseenter', function() {
            createConfetti();
        });
        
        horseImage.addEventListener('mouseleave', function() {
            // Clear any existing confetti after a delay
            if (confettiTimeout) {
                clearTimeout(confettiTimeout);
            }
            confettiTimeout = setTimeout(() => {
                confettiContainer.innerHTML = '';
            }, 10000);
        });
        
        function createConfetti() {
            // Clear previous confetti
            confettiContainer.innerHTML = '';
            
            // Create 15 wheat confetti pieces
            for (let i = 0; i < 15; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                
                // Random position around the horse
                const horseRect = horseImage.getBoundingClientRect();
                const containerRect = confettiContainer.getBoundingClientRect();
                
                const startX = ((horseRect.left - containerRect.left) + horseRect.width)-10;
                const startY = ((horseRect.top - containerRect.top) + horseRect.height/2)-50;
                
                // Random end position
                const angle = Math.random() * Math.PI * 2;
                const distance = 200 + Math.random() * 100;
                const endX = startX + Math.cos(angle) * distance;
                const endY = startY + Math.sin(angle) * distance;
                
                // Random rotation and scale
                const rotation = Math.random() * 360;
                const scale = 1.4 + Math.random() * 0.5;
                
                // Set initial position
                confetti.style.left = startX + 'px';
                confetti.style.top = startY + 'px';
                confetti.style.transform = `rotate(${rotation}deg) scale(${scale})`;
                
                // Animation
                const animation = confetti.animate([
                    { 
                        opacity: 0, 
                        transform: `rotate(${rotation}deg) scale(${scale}) translateY(0)` 
                    },
                    { 
                        opacity: 1, 
                        transform: `rotate(${rotation + 180}deg) scale(${scale}) translateY(-20px)` 
                    },
                    { 
                        opacity: 0, 
                        transform: `rotate(${rotation + 360}deg) scale(${scale}) translateX(${endX - startX}px) translateY(${endY - startY}px)` 
                    }
                ], {
                    duration: 700 + Math.random() * 500,
                    easing: 'cubic-bezier(0.2, 0, 0.8, 1)'
                });
                
                confettiContainer.appendChild(confetti);
                
                // Remove confetti after animation
                animation.onfinish = () => {
                    confetti.remove();
                };
            }
        }
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
// 🌙 Sötét mód váltás
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Ellenőrizzük, volt-e korábbi beállítás
if (localStorage.getItem('darkMode') === 'enabled') {
  body.classList.add('dark-mode');
  darkModeToggle.textContent = '☀️';
}

// Gomb kattintás esemény
darkModeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
    darkModeToggle.textContent = '☀️';
  } else {
    localStorage.setItem('darkMode', 'disabled');
    darkModeToggle.textContent = '🌙';
  }
});

// Dropdown login kezelése
document.addEventListener('DOMContentLoaded', function() {
    const loginDropdownBtn = document.getElementById('loginDropdownBtn');
    const loginDropdown = document.getElementById('loginDropdown');
    const dropdownForm = document.querySelector('.dropdown-form');
    
    if (sessionStorage.getItem('autoOpenLogin') === 'true') {
        openLoginDropdown(); // vagy ami a dropdown megnyitása
        sessionStorage.removeItem('autoOpenLogin');
    }

    if (loginDropdownBtn && loginDropdown) {
        // Dropdown megnyitása/bezárása
        loginDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            loginDropdown.classList.toggle('show');
        });
        
        // Form submit
        if (dropdownForm) {
            dropdownForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('dropdownEmail').value;
                const password = document.getElementById('dropdownPassword').value;
                
                console.log('Bejelentkezés:', { email, password });
                // Itt lesz a bejelentkezési logika
                
                // Sikeres bejelentkezés után bezárás
                loginDropdown.classList.remove('show');
            });
        }
        
        // Klikk a dokumentumon kívülre bezárja a dropdown-t
        document.addEventListener('click', function(e) {
            if (!loginDropdown.contains(e.target) && e.target !== loginDropdownBtn) {
                loginDropdown.classList.remove('show');
            }
        });
        
        // Escape billentyű is bezárja
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                loginDropdown.classList.remove('show');
            }
        });
    }
    
    // Elfelejtett jelszó
    const forgotPassword = document.querySelector('.dropdown-forgot');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Jelszó visszaállítási link elküldve!');
        });
    }       
});


function openLoginDropdown() {
    const loginDropdown = document.getElementById('loginDropdown');
    const loginDropdownBtn = document.getElementById('loginDropdownBtn');
    
    if (loginDropdown) {
        console.log('🎯 Automatikus login megnyitás');
        loginDropdown.classList.add('show');
        
        // Opcionális: görgetés a gombhoz
        if (loginDropdownBtn) {
            loginDropdownBtn.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById('loginForm');

    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); 

            const formData = new FormData(this);

            fetch('../login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("✅ Sikeres belépés");
                    
                    alert("Sikeres bejelentkezés! Üdv, " + data.user);
                    
                    
                    window.location.href = '../profile/index.html';
                } else {
                    alert("Hiba: " + data.message);
                }
            })
            .catch(error => {
                console.error('Hiba:', error);
            });
        });
    }
});