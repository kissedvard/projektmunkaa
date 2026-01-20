document.addEventListener('DOMContentLoaded', function() {
    console.log("✏️ Profil szerkesztő oldal betöltődött");

    // --- 1. ELEMEK KIVÁLASZTÁSA ---
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

    // --- 2. ADATOK BETÖLTÉSE 
    fetch(`../../get_user_data.php?t=${new Date().getTime()}`)
    .then(response => response.json())
    .then(response => {
        if (response.success) {
            const data = response.data;
            
            if(elements.fullName) elements.fullName.value = data.teljes_nev || "";
            if(elements.username) elements.username.value = data.felhasznalonev || ""; 
            if(elements.email) elements.email.value = data.email || "";
            if(elements.bio) elements.bio.value = data.bemutatkozas || "";
            if(elements.website) elements.website.value = data.weboldal || "";
            if(elements.location) elements.location.value = data.lakhely || "";

            if(elements.privateProfile) elements.privateProfile.checked = (data.privat_profil == 1);
            if(elements.emailNotifications) elements.emailNotifications.checked = (data.ertesitesek == 1);

            if(elements.bioCharCount && elements.bio) {
                elements.bioCharCount.textContent = elements.bio.value.length;
            }

            // Profilkép betöltése
            if (elements.avatarPreview && data.profil_kep) {
                const timestamp = new Date().getTime();
                const isDefault = (data.profil_kep === 'fiok-ikon.png' || data.profil_kep === 'default_avatar.jpg');
                const imgPath = isDefault
                    ? `../../images/fiok-ikon.png?v=${timestamp}`
                    : `../../uploads/${data.profil_kep}?v=${timestamp}`;
            
                elements.avatarPreview.innerHTML = `<img src="${imgPath}" alt="Profilkép" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                
                const img = elements.avatarPreview.querySelector('img');
                if(img) {
                    img.onerror = function() {
                        this.src = `../../images/fiok-ikon.png?v=${timestamp}`;
                    };
                }
            }
        } else {
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
            
            if (length > 140) elements.bioCharCount.style.color = '#e74c3c';
            else if (length > 120) elements.bioCharCount.style.color = '#f39c12';
            else elements.bioCharCount.style.color = '#666';
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
            const deleteInput = document.getElementById('deletePicture');
            if (deleteInput) {
                deleteInput.value = '1'; // Beállítjuk a törlési jelet
            }

            if (elements.avatarInput) {
                elements.avatarInput.value = ''; 
            }

            // Azonnali vizuális visszajelzés
            if (elements.avatarPreview) {
                elements.avatarPreview.innerHTML = '<img src="../../images/fiok-ikon.png" alt="Alapértelmezett kép" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">';
            }
        });
    }


    // --- 5. MENTÉS (SAVE) ---
    if (elements.saveBtn) {
        elements.saveBtn.addEventListener('click', function(e) {
            e.preventDefault(); 

            const formData = new FormData();
            
            if(elements.fullName) formData.append('fullName', elements.fullName.value);
            if(elements.username) formData.append('username', elements.username.value);
            if(elements.email) formData.append('email', elements.email.value);
            if(elements.bio) formData.append('bio', elements.bio.value);
            if(elements.website) formData.append('website', elements.website.value);
            if(elements.location) formData.append('location', elements.location.value);
            
            if(elements.privateProfile) formData.append('privateProfile', elements.privateProfile.checked ? 1 : 0);
            if(elements.emailNotifications) formData.append('emailNotifications', elements.emailNotifications.checked ? 1 : 0);
            
            
            const deleteInput = document.getElementById('deletePicture');
            if (deleteInput && deleteInput.value === '1') {
                formData.append('delete_picture', '1');
            }

            if (elements.avatarInput && elements.avatarInput.files[0]) {
                formData.append('profileImage', elements.avatarInput.files[0]);
            }

            
            fetch('../../update_profile.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    
                    
                    let newImageName = null;

                    if (deleteInput && deleteInput.value === '1') {
                        // Ha töröltük, akkor default
                        newImageName = 'fiok-ikon.png';
                    } else if (data.new_profile_image) {
                        
                        newImageName = data.new_profile_image;
                    }

                    
                    if (newImageName) {
                        localStorage.setItem('profil_kep', newImageName);
                        localStorage.setItem('profile_image', newImageName);
                        localStorage.setItem('user_avatar', newImageName);

                        
                        const storedUser = localStorage.getItem('user_data');
                        if (storedUser) {
                            try {
                                let userObj = JSON.parse(storedUser);
                                userObj.profil_kep = newImageName;
                                localStorage.setItem('user_data', JSON.stringify(userObj));
                            } catch (e) { console.error("JSON hiba", e); }
                        }
                    }
                    

                    alert('✅ Profil sikeresen frissítve!');
                    
                    
                    window.location.href = `../profile.html?t=${Date.now()}`;

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
            // Itt is érdemes időbélyeget használni
            window.location.href = `../profile.html?t=${Date.now()}`;
        });
    }
});