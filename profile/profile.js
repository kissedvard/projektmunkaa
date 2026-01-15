// profile/script.js - TELJES, TISZTA, VALÓDI ADATOKKAL DOLGOZÓ VERZIÓ

document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 Profil oldal betöltődött - Valós adatok mód");

    // Globális változó a posztok tárolására (a Lightboxhoz kell)
    let currentUserPosts = [];

    // --- 1. KEZDETI BETÖLTÉSEK ---
    initializeNavigation();
    initializeUploadModal();
    initializeLightbox();
    
    // Adatok lekérése
    fetchProfileData(); // Profil infók (név, kép, statisztika)
    fetchUserPosts();   // Posztok (KÉPEK)

    // --- 2. ADATLEKÉRŐ FÜGGVÉNYEK ---

    // A: Profil adatok lekérése
    function fetchProfileData() {
        fetch('../get_user_data.php')
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                updateProfileUI(response.data);
            } else {
                console.log("Nincs belépve, átirányítás...");
                window.location.href = '../main/index.html';
            }
        })
        .catch(error => console.error('Profil hiba:', error));
    }

    // B: Posztok lekérése (EZ AZ ÚJ RÉSZ A DEMO HELYETT)
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
        const homeBtns = document.querySelectorAll('.nav-btn, #profileBtn, #uploadPrompt');
        homeBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', () => window.location.href = '../main/index.html');
        });
    }

    // --- 5. FELTÖLTÉS MODAL (JAVÍTOTT) ---
    
    function initializeUploadModal() {
        const uploadButton = document.getElementById('uploadButton');
        const uploadModal = document.getElementById('uploadModal');
        const closeModal = document.querySelector('.close-modal');
        const cancelButton = document.querySelector('.btn-cancel');
        const uploadForm = document.getElementById('uploadForm');
        const fileInput = document.getElementById('fileInput');
        
        if (!uploadButton || !uploadModal) return;

        // Megnyitás
        uploadButton.addEventListener('click', () => uploadModal.classList.add('show'));
        
        // Bezárás
        const closeFunc = () => uploadModal.classList.remove('show');
        if (closeModal) closeModal.addEventListener('click', closeFunc);
        if (cancelButton) cancelButton.addEventListener('click', closeFunc);
        uploadModal.addEventListener('click', (e) => { if (e.target === uploadModal) closeFunc(); });

        // Valós feltöltés kezelése
        if (uploadForm) {
            uploadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const submitBtn = this.querySelector('.btn-upload');
                const originalText = submitBtn.textContent;
                
                submitBtn.disabled = true;
                submitBtn.textContent = 'Feltöltés...';

                // Itt küldjük a szervernek (upload_post.php)
                fetch('../upload_post.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('✅ Sikeres feltöltés!');
                        closeFunc();
                        this.reset();
                        fetchUserPosts(); // Frissítjük a listát, hogy azonnal megjelenjen!
                    } else {
                        alert('Hiba: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Hiba:', error);
                    alert('Hiba történt a feltöltés során.');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                });
            });
        }
        
        // Fájl kiválasztás előnézet (egyszerűsítve)
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const placeholder = document.querySelector('.upload-placeholder');
                        placeholder.innerHTML = `<img src="${e.target.result}" style="max-height: 200px; max-width: 100%;">`;
                        document.querySelector('.btn-upload').disabled = false;
                    }
                    reader.readAsDataURL(file);
                }
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