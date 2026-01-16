document.addEventListener('DOMContentLoaded', function() {
    console.log("✏️ Profil szerkesztő oldal betöltődött");

    // --- 1. ELEMEK KIVÁLASZTÁSA (A HTML alapján) ---
    const elements = {
        fullName: document.getElementById('fullName'),
        username: document.getElementById('username'),
        email: document.getElementById('email'),
        bio: document.getElementById('bio'),
        website: document.getElementById('website'),
        location: document.getElementById('location'),
        privateProfile: document.getElementById('privateProfile'),
        emailNotifications: document.getElementById('emailNotifications'),
        bioCharCount: document.getElementById('bioCharCount'),
        avatarInput: document.getElementById('avatarInput'),
        avatarPreview: document.getElementById('avatarPreview'),
        saveBtn: document.getElementById('saveProfile'),
        profileBtn: document.getElementById('profileBtn'),
        removeAvatarBtn: document.getElementById('removeAvatar')
    };

    // --- 2. ADATOK BETÖLTÉSE (Fetch) ---
    fetch('../../get_user_data.php')
    .then(response => response.json())
    .then(response => {
        if (response.success) {
            const data = response.data;
            
            // Mezők kitöltése (Ha van adat, beírjuk, ha nincs, üres marad)
            if(elements.fullName) elements.fullName.value = data.teljes_nev || "";
            if(elements.username) elements.username.value = data.felhasznalonev || "";
            if(elements.email) elements.email.value = data.email || "";
            if(elements.bio) elements.bio.value = data.bemutatkozas || "";
            if(elements.website) elements.website.value = data.weboldal || "";
            if(elements.location) elements.location.value = data.lakhely || "";

            // Checkboxok beállítása (feltételezve, hogy 0 vagy 1 jön az adatbázisból)
            if(elements.privateProfile) elements.privateProfile.checked = (data.privat_profil == 1);
            if(elements.emailNotifications) elements.emailNotifications.checked = (data.ertesitesek == 1);

            // Karakterszámláló frissítése induláskor
            if(elements.bioCharCount && elements.bio) {
                elements.bioCharCount.textContent = elements.bio.value.length;
            }

            // Profilkép betöltése
            if (elements.avatarPreview && data.profil_kep) {
                
                // Megnézzük, hogy a kép neve az alapértelmezett-e (vagy a régi default, vagy az új fiok-ikon)
                const isDefault = (data.profil_kep === 'fiok-ikon.png' || data.profil_kep === 'default_avatar.jpg');
            
                const imgPath = isDefault
                    ? '../../images/fiok-ikon.png'        // Ha alapértelmezett -> images mappa
                    : `../../uploads/${data.profil_kep}`; // Ha egyedi feltöltés -> uploads mappa
            
                // HTML csere a képre
                elements.avatarPreview.innerHTML = `<img src="${imgPath}" alt="Profilkép" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
        } else {
            // Ha nincs bejelentkezve, visszaküldjük a főoldalra
            console.log("Nincs bejelentkezve, átirányítás...");
            window.location.href = '../../main/index.html';
        }
    })
    .catch(error => console.error('Hiba az adatok betöltésekor:', error));


    // --- 3. KARAKTERSZÁMLÁLÓ ---
    if (elements.bio && elements.bioCharCount) {
        elements.bio.addEventListener('input', function() {
            const length = this.value.length;
            elements.bioCharCount.textContent = length;
            
            // Színezés, ha közeledik a limit (150)
            if (length > 140) elements.bioCharCount.style.color = '#e74c3c'; // Piros
            else if (length > 120) elements.bioCharCount.style.color = '#f39c12'; // Narancs
            else elements.bioCharCount.style.color = '#666'; // Alap
        });
    }


    // --- 4. PROFILKÉP ELŐNÉZET ---
    if (elements.avatarInput && elements.avatarPreview) {
        elements.avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    elements.avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Új profilkép" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Kép eltávolítása gomb
    if (elements.removeAvatarBtn) {
        elements.removeAvatarBtn.addEventListener('click', function() {
            elements.avatarPreview.innerHTML = '<div class="current-avatar">E</div>'; // Visszaállítjuk a betűre vagy default képre
            elements.avatarInput.value = ''; // Töröljük a fájlt a bemenetről
        });
    }


    // --- 5. MENTÉS (SAVE) ---
    if (elements.saveBtn) {
        elements.saveBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Ne töltődjön újra az oldal hagyományosan

            // Adatok összegyűjtése FormData-ba
            const formData = new FormData();
            
            // Csak akkor adjuk hozzá, ha létezik az elem a HTML-ben
            if(elements.fullName) formData.append('fullName', elements.fullName.value);
            if(elements.username) formData.append('username', elements.username.value);
            if(elements.email) formData.append('email', elements.email.value);
            if(elements.bio) formData.append('bio', elements.bio.value);
            if(elements.website) formData.append('website', elements.website.value);
            if(elements.location) formData.append('location', elements.location.value);
            
            // Checkboxok (1 vagy 0 értéket küldünk)
            if(elements.privateProfile) formData.append('privateProfile', elements.privateProfile.checked ? 1 : 0);
            if(elements.emailNotifications) formData.append('emailNotifications', elements.emailNotifications.checked ? 1 : 0);
            
            // Kép hozzáadása (ha van kiválasztva új)
            if (elements.avatarInput && elements.avatarInput.files[0]) {
                formData.append('profileImage', elements.avatarInput.files[0]);
            }

            // Küldés a PHP-nek
            fetch('../../update_profile.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // --- LOCALSTORAGE FRISSÍTÉS ---
                    // Ez a legfontosabb rész, hogy a header azonnal frissüljön!
                    if (elements.fullName && elements.fullName.value) {
                        localStorage.setItem('username', elements.fullName.value);
                    }
                    
                    alert('✅ Profil sikeresen frissítve!');
                    
                    // Visszatérés a profil oldalra
                    window.location.href = '../profile.html';
                } else {
                    alert('Hiba történt: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Hiba:', error);
                alert('Hálózati hiba történt a mentés során.');
            });
        });
    }

    // --- 6. VISSZA GOMB ---
    if (elements.profileBtn) {
        elements.profileBtn.addEventListener('click', function() {
            window.location.href = '../profile.html';
        });
    }
});