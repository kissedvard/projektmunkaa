// register/register.js - TELJES VERZIÓ

document.addEventListener('DOMContentLoaded', function() {
    console.log("📝 Register oldal betöltődött");

    // 1. "Jelentkezzen be" link kezelése
    const goToLoginLink = document.getElementById('goToLogin');
    if (goToLoginLink) {
        goToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("🎯 Register → Főoldal (login dropdown)");
            
            // SessionStorage beállítás
            sessionStorage.setItem('autoOpenLogin', 'true');
            
            // Átirányítás a főoldalra
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

    // 3. Regisztrációs form validáció
    document.getElementById('registrationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });

        let isValid = true;

        // Name validation
        const fullName = document.getElementById('fullName').value.trim();
        if (fullName.length < 2) {
            document.getElementById('nameError').style.display = 'block';
            isValid = false;
        }

        // Email validation
        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        }

        // Username validation
        const username = document.getElementById('username').value.trim();
        if (username.length < 3) {
            document.getElementById('usernameError').style.display = 'block';
            isValid = false;
        }

        // Password validation
        const password = document.getElementById('password').value;
        if (password.length < 6) {
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        }

        // Confirm password
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        }

        // Terms validation
        if (!document.getElementById('terms').checked) {
            document.getElementById('termsError').style.display = 'block';
            isValid = false;
        }

        if (isValid) {
            // Sikeres regisztráció
            console.log("✅ Sikeres regisztráció");
            alert('Sikeres regisztráció! Most már bejelentkezhet.');
            
            // Átirányítás a főoldalra login dropdownnal
            sessionStorage.setItem('autoOpenLogin', 'true');
            window.location.href = '../index.html';
        }
    });

    // 4. Real-time password confirmation check
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