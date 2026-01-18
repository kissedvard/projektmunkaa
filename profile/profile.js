// profile/script.js - TELJES, TISZTA, VALÓDI ADATOKKAL DOLGOZÓ VERZIÓ

document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 Profil oldal betöltődött - Valós adatok mód");

    let currentUserPosts = [];

    // --- 1. KEZDETI BETÖLTÉSEK ---
    initializeNavigation();
    initializeUploadModal();
    initializeLightbox();
    
    // Adatok lekérése
    fetchProfileData(); 
    fetchUserPosts();   

    
    // --- 2. ADATOK LEKÉRÉSE ---
    function fetchProfileData() {
        fetch('../get_user_data.php')
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                updateProfileUI(response.data);
            } else {
                console.log("Nincs belépve, átirányítás...");
                alert("Nem vagy bejelentkezve!\nA profil oldal megtekintéséhez kérlek, jelentkezz be.");
                window.location.href = '../main/index.html';
            }
        })
        .catch(error => console.error('Profil hiba:', error));
    }

    function fetchUserPosts() {
        const postsGrid = document.getElementById('postsGrid');
        const noPostsElement = document.getElementById('noPostsPosts');
        
        // Töltésjelző (opcionális)
        if(postsGrid) postsGrid.innerHTML = '<div class="loading">Posztok betöltése...</div>';

        // Itt hívjuk meg a PHP-t, ami az adatbázisból szedi a képeket
        // FONTOS: Ehhez kell majd egy get_user_posts.php fájl!
        fetch('../get_user_posts.php') 
        .then(response => response.json())
        .then(response => {
            if (response.success && response.posts.length > 0) {
                // Vannak posztok -> Mentsük el és jelenítsük meg
                currentUserPosts = response.posts;
                renderPostsToGrid(currentUserPosts);
                
                if (noPostsElement) noPostsElement.style.display = 'none';
            } else {
                // Nincsenek posztok
                currentUserPosts = [];
                if(postsGrid) postsGrid.innerHTML = '';
                if (noPostsElement) noPostsElement.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Poszt lekérési hiba:', error);
            if(postsGrid) postsGrid.innerHTML = '';
            if (noPostsElement) noPostsElement.style.display = 'block';
        });
    }

    // --- 3. MEGJELENÍTÉS (RENDER) ---

    function updateProfileUI(data) {
        // Név
        if(document.getElementById('profileName')) 
            document.getElementById('profileName').textContent = data.teljes_nev;
        
        // Felhasználónév
        if(document.getElementById('username')) 
            document.getElementById('username').textContent = "@" + data.felhasznalo;
        
        // Bemutatkozás
        const bioElem = document.getElementById('bio');
        if(bioElem) bioElem.textContent = data.bemutatkozas || "Nincs még bemutatkozás.";

        // Statisztikák
        if(document.getElementById('postCount'))
            document.getElementById('postCount').textContent = data.posts_count || 0;
        
        if(document.getElementById('followerCount'))
            document.getElementById('followerCount').textContent = data.followers_count || 0;
        
        if(document.getElementById('followingCount'))
            document.getElementById('followingCount').textContent = data.following_count || 0;

        // Profilkép kezelés (Javított logika)
        const imgElement = document.getElementById('profileImage');
        if (imgElement) {
            let imgPath;
            // Ha nincs kép, vagy az alapértelmezett nevek valamelyike
            if (!data.profil_kep || data.profil_kep === 'fiok-ikon.png' || data.profil_kep === 'default_avatar.jpg') {
                imgPath = '../images/fiok-ikon.png'; // Alapértelmezett a gyökér images mappában
            } else {
                imgPath = `../uploads/${data.profil_kep}`; // Feltöltött kép az uploads mappában
            }
            imgElement.src = imgPath;
        }
    }

    function renderPostsToGrid(posts) {
        const postsGrid = document.getElementById('postsGrid');
        if (!postsGrid) return;

        postsGrid.innerHTML = ''; // Töröljük a "betöltés..." szöveget

        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsGrid.appendChild(postElement);
        });
    }

    function createPostElement(post) {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.setAttribute('data-post-id', post.id); // Fontos a Lightboxhoz
        
        // Feltételezzük, hogy a poszt képek is az 'uploads' mappában vannak
        // Ha teljes URL-t ad vissza a PHP, akkor nem kell a prefix
        const imagePath = post.image_url.startsWith('http') || post.image_url.startsWith('..') 
                          ? post.image_url 
                          : `../uploads/${post.image_url}`;

        postItem.innerHTML = `
            <img src="${imagePath}" alt="${post.caption || 'Poszt'}" class="post-image" loading="lazy">
            <div class="post-overlay">
                <div class="post-stats">
                    <span>❤️ ${post.likes_count || 0}</span>
                    <span>💬 ${post.comments_count || 0}</span>
                </div>
            </div>
        `;
        
        return postItem;
    }

    // --- 4. NAVIGÁCIÓ KEZELÉSE ---

    function initializeNavigation() {
        // Tabok kezelése (Posztok vs Megjelölések)
        const postsTab = document.getElementById('postsTab');
        const taggedTab = document.getElementById('taggedTab');
        const noPostsPosts = document.getElementById('noPostsPosts');
        const noPostsTagged = document.getElementById('noPostsTagged');

        if (postsTab && taggedTab) {
            postsTab.addEventListener('click', () => {
                postsTab.classList.add('active');
                taggedTab.classList.remove('active');
                if(noPostsPosts) noPostsPosts.style.display = currentUserPosts.length ? 'none' : 'block';
                if(noPostsTagged) noPostsTagged.style.display = 'none';
                document.getElementById('postsGrid').style.display = 'grid';
            });

            taggedTab.addEventListener('click', () => {
                taggedTab.classList.add('active');
                postsTab.classList.remove('active');
                if(noPostsPosts) noPostsPosts.style.display = 'none';
                // Itt lehetne betölteni a megjelölt képeket, most csak üzenetet mutatunk
                if(noPostsTagged) noPostsTagged.style.display = 'block';
                document.getElementById('postsGrid').style.display = 'none';
            });
        }

        // Vissza gombok
        const homeBtns = document.querySelectorAll('#homeBtn, #profileBtn, #uploadPrompt');
        homeBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', () => window.location.href = '../main/index.html');
        });
    }

    // --- 5. FELTÖLTÉS MODAL KEZELÉSE ---

    
    function initializeUploadModal() {
        const uploadButton = document.getElementById('uploadButton');
        const uploadModal = document.getElementById('uploadModal');
        const closeModal = document.querySelector('.close-modal');
        const cancelButton = document.querySelector('.cancel-btn');
        const uploadForm = document.getElementById('uploadForm');
        const fileInput = document.getElementById('fileInput');
        const placeholder = document.querySelector('.upload-placeholder');
        
        if (!uploadButton || !uploadModal) return;

        // --- 1. EZ MARADT KI A MÚLTKOR: A KATTINTÁS FIGYELÉSE! ---
        // Ha a dobozra (placeholder) kattintasz, nyíljon meg a fájlkezelő
        if (placeholder && fileInput) {
            placeholder.addEventListener('click', function() {
                fileInput.click(); // Ez nyitja meg az ablakot!
            });
        }
        // -----------------------------------------------

        // 2. RESETELŐ FÜGGVÉNY (Visszaállítja a mappa ikont)
        const resetUploadState = () => {
            if (fileInput) fileInput.value = '';

            if (placeholder) {
                placeholder.innerHTML = `
                    <div class="folder-icon" style="font-size: 40px; margin-bottom: 10px;">📁</div>
                    <p>Kattints ide vagy húzd ide a képet</p>
                    <small style="color: #666;">Formátumok: JPG, PNG, GIF (max. 10MB)</small>
                `;
                // Visszatesszük a szaggatott keretet az üres állapothoz
                placeholder.style.border = '2px dashed #ccc'; 
            }

            const submitBtn = document.querySelector('.btn-upload');
            if (submitBtn) {
                submitBtn.textContent = 'Feltöltés';
                submitBtn.disabled = false;
            }
        };

        // 3. BEZÁRÁS
        const closeFunc = () => {
            uploadModal.classList.remove('show');
            uploadModal.style.display = 'none'; 
            resetUploadState(); 
        };

        // 4. NYITÁS
        uploadButton.addEventListener('click', (e) => {
            e.preventDefault();
            resetUploadState(); 
            uploadModal.style.display = 'flex'; 
            setTimeout(() => {
                uploadModal.classList.add('show');
            }, 10);
        });

        // 5. BEZÁRÓ GOMBOK
        if (closeModal) closeModal.addEventListener('click', closeFunc);
        if (cancelButton) {
            cancelButton.addEventListener('click', function(e) {
                e.preventDefault(); 
                closeFunc();
            });
    }

        uploadModal.addEventListener('click', (e) => { 
            if (e.target === uploadModal) closeFunc(); 
        });

        // 6. ELŐNÉZET + X GOMB KEZELÉSE (ITT A JAVÍTÁS!)
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();

                    reader.onload = function(e) {
                        if(placeholder) {
                            // 1. JAVÍTÁS: Levesszük a szaggatott keretet, hogy ne legyen dupla
                            placeholder.style.border = 'none';

                            // 2. JAVÍTÁS: A HTML-ből kivettem a feliratot
                            placeholder.innerHTML = `
                                <div style="position: relative; width: 100%; height: 100%;">
                                    <button type="button" id="dynamicRemoveBtn" style="
                                        position: absolute; top: 5px; right: 5px; 
                                        background: rgba(255,0,0,0.8); color: white; border: none; 
                                        border-radius: 50%; width: 25px; height: 25px; cursor: pointer; z-index: 100;">
                                        &times;
                                    </button>

                                    <img src="${e.target.result}" style="max-height: 250px; max-width: 100%; border-radius: 8px; display: block; margin: 0 auto;">

                                    </div>
                            `;

                            // X Gomb esemény
                            const xBtn = document.getElementById('dynamicRemoveBtn');
                            if (xBtn) {
                                xBtn.addEventListener('click', function(evt) {
                                    evt.preventDefault();
                                    evt.stopPropagation(); // Ezért nem nyílik meg újra a fájlkezelő
                                    resetUploadState();    
                                });
                            }
                        }
                    }
                    reader.readAsDataURL(file);
                }
            });
        }

        // 7. BEKÜLDÉS
        if (uploadForm) {
            uploadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(this);
                const submitBtn = this.querySelector('.btn-upload');
                const originalText = submitBtn ? submitBtn.textContent : 'Feltöltés';

                if(submitBtn) { 
                    submitBtn.disabled = true; 
                    submitBtn.textContent = 'Feltöltés...'; 
                }

                fetch('../upload_post.php', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        alert('✅ Sikeres feltöltés!');
                        closeFunc(); 
                        this.reset();
                        if (typeof fetchUserPosts === 'function') fetchUserPosts(); 
                        else location.reload();
                    } else {
                        alert('Hiba: ' + (data.message || 'Ismeretlen hiba'));
                    }
                })
                .catch(err => { 
                    console.error(err); 
                    alert('Hiba történt a feltöltés során.'); 
                })
                .finally(() => { 
                    if(submitBtn) { 
                        submitBtn.disabled = false; 
                        submitBtn.textContent = originalText; 
                    }
                });
            });
        }
    }

    // --- 6. LIGHTBOX (KÉP NAGYÍTÁS) ---

    function initializeLightbox() {
        const lightboxModal = document.getElementById('lightboxModal');
        const lightboxImage = document.getElementById('lightboxImage');
        const closeBtn = document.querySelector('.lightbox-close');
        
        if (!lightboxModal) return;

        let currentIndex = 0;

        // Eseménydelegálás a képekre kattintáshoz
        document.addEventListener('click', (e) => {
            const postItem = e.target.closest('.post-item');
            if (postItem) {
                const postId = postItem.getAttribute('data-post-id');
                // Megkeressük a kattintott posztot a globális tömbben
                const index = currentUserPosts.findIndex(p => p.id == postId);
                
                if (index !== -1) {
                    currentIndex = index;
                    openLightbox(currentUserPosts[index]);
                }
            }
        });

        function openLightbox(post) {
            // Útvonal javítása itt is
            const imagePath = post.image_url.startsWith('http') || post.image_url.startsWith('..') 
                          ? post.image_url 
                          : `../uploads/${post.image_url}`;

            lightboxImage.src = imagePath;
            
            // Adatok kitöltése a lightboxban
            if(document.getElementById('lightboxCaption')) 
                document.getElementById('lightboxCaption').textContent = post.caption || '';
            
            lightboxModal.classList.add('show');
        }

        // Bezárás
        if (closeBtn) closeBtn.addEventListener('click', () => lightboxModal.classList.remove('show'));
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) lightboxModal.classList.remove('show');
        });

        
    }
});

document.addEventListener('DOMContentLoaded', function() {
    
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('Kijelentkezés folyamatban...');
            
            localStorage.removeItem('username');
            localStorage.removeItem('loggedInUser'); 

            
            fetch('../logout.php')
            .then(response => response.json())
            .then(data => {
                localStorage.clear();
                console.log('Kijelentkezés sikeres:', data);
                window.location.href = '../main/index.html';
            })
            .catch(error => {
                console.error('Hiba kijelentkezéskor:', error);
                // Ha hiba van, akkor is visszadobjuk a főoldalra
                window.location.href = '../index.html';
            });
        });
    }
});

