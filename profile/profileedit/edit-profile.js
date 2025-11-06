// Profil szerkesztő JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log("✏️ Profil szerkesztő oldal betöltődött");
    
    // Karakterszám számláló
    const bioTextarea = document.getElementById('bio');
    const charCount = document.getElementById('bioCharCount');
    
    if (bioTextarea && charCount) {
        // Kezdeti érték beállítása
        charCount.textContent = bioTextarea.value.length;
        
        // Karakterszám frissítése
        bioTextarea.addEventListener('input', function() {
            charCount.textContent = this.value.length;
            
            // Szín változtatás ha közeledik a limit
            if (this.value.length > 130) {
                charCount.style.color = '#e74c3c';
            } else if (this.value.length > 100) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = '#666';
            }
        });
    }
    
    // Profilkép feltöltés
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const removeAvatarBtn = document.getElementById('removeAvatar');
    
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Profilkép">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', function() {
            avatarPreview.innerHTML = '<div class="current-avatar">E</div>';
            avatarInput.value = '';
        });
    }
    
    // Profil mentése
    const saveBtn = document.getElementById('saveProfile');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            // Adatok összegyűjtése
            const profileData = {
                fullName: document.getElementById('fullName').value,
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                bio: document.getElementById('bio').value,
                website: document.getElementById('website').value,
                location: document.getElementById('location').value,
                privateProfile: document.getElementById('privateProfile').checked,
                emailNotifications: document.getElementById('emailNotifications').checked
            };
            
            // Mentés localStorage-ba
            localStorage.setItem('userProfile', JSON.stringify(profileData));
            
            // Sikeres mentés üzenet
            alert('Profil adataid sikeresen elmentve!');
            
            // Vissza a profil oldalra
            window.location.href = '../profile.html';
        });
    }
    
    // Navigáció
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            window.location.href = '../profile.html';
        });
    }
    
    // Mentett adatok betöltése (ha vannak)
    loadSavedProfile();
    
    function loadSavedProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            const profileData = JSON.parse(savedProfile);
            
            // Mezők kitöltése
            document.getElementById('fullName').value = profileData.fullName || '';
            document.getElementById('username').value = profileData.username || '';
            document.getElementById('email').value = profileData.email || '';
            document.getElementById('bio').value = profileData.bio || '';
            document.getElementById('website').value = profileData.website || '';
            document.getElementById('location').value = profileData.location || '';
            document.getElementById('privateProfile').checked = profileData.privateProfile || false;
            document.getElementById('emailNotifications').checked = profileData.emailNotifications || false;
            
            // Karakterszám frissítése
            if (charCount) {
                charCount.textContent = profileData.bio?.length || 0;
            }
        }
    }
});