

document.addEventListener('DOMContentLoaded', function() {
    console.log("📝 Register oldal betöltődött");

    
    const goToLoginLink = document.getElementById('goToLogin');
    if (goToLoginLink) {
        goToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("🎯 Register → Főoldal (login dropdown)");
            sessionStorage.setItem('autoOpenLogin', 'true');
            
            window.location.href = '../main/index.html'; 
        });
    }

    
    const togglePassBtn = document.getElementById('togglePassword');
    if (togglePassBtn) {
        togglePassBtn.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? 'Mutasd' : 'Elrejt';
        });
    }

    const toggleConfirmBtn = document.getElementById('toggleConfirmPassword');
    if (toggleConfirmBtn) {
        toggleConfirmBtn.addEventListener('click', function() {
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? 'Mutasd' : 'Elrejt';
        });
    }

    
    const regForm = document.getElementById('registrationForm');
    
    
    if (regForm) {
        console.log("✅ Űrlap megtalálva, eseményfigyelő élesítve.");

        regForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Hibaüzenetek elrejtése alaphelyzetbe
            document.querySelectorAll('.error-message').forEach(error => {
                error.style.display = 'none';
            });

            let isValid = true;

            // --- VALIDÁCIÓK ---
            
            // Név
            const fullNameInput = document.getElementById('fullName');
            if (fullNameInput && fullNameInput.value.trim().length < 2) {
                document.getElementById('nameError').style.display = 'block';
                isValid = false;
            }

            // Email
            const emailInput = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput && !emailRegex.test(emailInput.value)) {
                document.getElementById('emailError').style.display = 'block';
                isValid = false;
            }

            // Felhasználónév
            const usernameInput = document.getElementById('username');
            if (usernameInput && usernameInput.value.trim().length < 3) {
                document.getElementById('usernameError').style.display = 'block';
                isValid = false;
            }

            // Jelszó
            const passwordInput = document.getElementById('password');
            if (passwordInput && passwordInput.value.length < 6) {
                document.getElementById('passwordError').style.display = 'block';
                isValid = false;
            }

            // Jelszó megerősítés
            const confirmPasswordInput = document.getElementById('confirmPassword');
            if (passwordInput && confirmPasswordInput && passwordInput.value !== confirmPasswordInput.value) {
                document.getElementById('confirmPasswordError').style.display = 'block';
                isValid = false;
            }

            // ÁSZF
            const termsInput = document.getElementById('terms');
            if (termsInput && !termsInput.checked) {
                document.getElementById('termsError').style.display = 'block';
                isValid = false;
            }

            // --- KÜLDÉS HA MINDEN OK ---
            if (isValid) {
                
                const submitBtn = regForm.querySelector('.btn-register');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = "Regisztráció folyamatban...";

                console.log("🚀 Adatok küldése a szervernek...");

                // Adatok összekészítése
                const formData = new FormData(regForm);

                fetch('register.php', { 
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    console.log("📩 Válasz:", data);
                    
                    if (data.success) {
                        alert(data.message); 
                        
                        // Átirányítás a főoldalra (Login ablak nyitásával)
                        sessionStorage.setItem('autoOpenLogin', 'true');
                        window.location.href = '../index.html';
                    } else {
                        // Szerver oldali hiba (pl. foglalt email)
                        alert("Hiba: " + data.message);
                        
                        // Gomb visszaállítása
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                })
                .catch(error => {
                    console.error('Hálózati hiba:', error);
                    alert("Hálózati hiba történt. Ellenőrizd a konzolt!");
                    
                    // Gomb visszaállítása
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                });
            }
        });
    } else {
        console.error("❌ HIBA: Nem találom a 'registrationForm' ID-t a HTML-ben!");
    }

    // 4. Real-time jelszó egyezés figyelés
    const confirmInput = document.getElementById('confirmPassword');
    if (confirmInput) {
        confirmInput.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            const confirmPassword = this.value;
            const errorElement = document.getElementById('confirmPasswordError');
            
            if (confirmPassword && password !== confirmPassword) {
                errorElement.style.display = 'block';
            } else {
                errorElement.style.display = 'none';
            }
        });
    }
});