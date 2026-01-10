document.addEventListener('DOMContentLoaded', function() {
    console.log("📝 Register oldal betöltődött");

    // 1. "Jelentkezzen be" link kezelése
    const goToLoginLink = document.getElementById('goToLogin');
    if (goToLoginLink) {
        goToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("🎯 Register → Főoldal (login dropdown)");
            sessionStorage.setItem('autoOpenLogin', 'true');
            // Mivel a register mappában vagyunk, a főoldal egy szinttel feljebb van:
            window.location.href = '../index.html';
        });
    }

    // 2. Jelszó megjelenítés/elrejtés funkció
    document.getElementById('togglePassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? 'Mutasd' : 'Elrejt';
    });

    document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? 'Mutasd' : 'Elrejt';
    });

    // 3. Regisztrációs form validáció és KÜLDÉS
    const regForm = document.getElementById('registrationForm');
    
    regForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Hibaüzenetek elrejtése
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });

        let isValid = true;

        // --- VALIDÁCIÓK ---
        
        // Név
        const fullName = document.getElementById('fullName').value.trim();
        if (fullName.length < 2) {
            document.getElementById('nameError').style.display = 'block';
            isValid = false;
        }

        // Email
        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        }

        // Felhasználónév
        const username = document.getElementById('username').value.trim();
        if (username.length < 3) {
            document.getElementById('usernameError').style.display = 'block';
            isValid = false;
        }

        // Jelszó
        const password = document.getElementById('password').value;
        if (password.length < 6) {
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        }

        // Jelszó megerősítés
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        }

        // ÁSZF
        if (!document.getElementById('terms').checked) {
            document.getElementById('termsError').style.display = 'block';
            isValid = false;
        }

        if (isValid) {
            // Gomb letiltása
            const submitBtn = regForm.querySelector('.btn-register');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Regisztráció folyamatban...";

            // Adatok összekészítése
            const formData = new FormData(regForm);

            // FONTOS: Itt a javítás! 
            // Mivel a PHP is a 'register' mappában van, nem kell '../'
            fetch('register.php', { 
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("✅ Sikeres mentés adatbázisba");
                    alert(data.message); 
                    
                    // Átirányítás a főoldalra
                    sessionStorage.setItem('autoOpenLogin', 'true');
                    window.location.href = '../index.html';
                } else {
                    console.error("❌ Szerver hiba:", data.message);
                    alert("Hiba: " + data.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            })
            .catch(error => {
                console.error('Hálózati hiba:', error);
                alert("Hálózati hiba történt. Ellenőrizd, hogy fut-e a Docker!");
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
        }
    });

    // 4. Real-time jelszó egyezés
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const confirmPassword = this.value;
        const errorElement = document.getElementById('confirmPasswordError');
        
        if (confirmPassword && password !== confirmPassword) {
            errorElement.style.display = 'block';
        } else {
            errorElement.style.display = 'none';
        }
    });
});