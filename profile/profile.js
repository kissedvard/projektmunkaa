// Egy poszt elem létrehozása
function createPostElement(post) {
    const postItem = document.createElement('div');
    postItem.className = 'post-item';
    postItem.setAttribute('data-post-id', post.id);
    
    postItem.innerHTML = `
        <img src="${post.image_url}" alt="${post.caption}" class="post-image" loading="lazy">
        <div class="post-overlay">
            <div class="post-stats">
                <span>❤️ ${post.likes_count}</span>
                <span>💬 ${post.comments_count}</span>
            </div>
        </div>
    `;
    
    return postItem;
}

// 🆕 Segédfüggvény - Összes poszt lekérése (lightbox-hoz)
function getAllPosts() {
    return generateDemoPosts();
}

// 🆕 ÚJ FUNKCIÓ - Demo posztok betöltése
function loadDemoPosts() {
    console.log("🎨 Demo posztok betöltése...");
    
    // Posztok renderelése a grid-be
    renderPostsToGrid();
    
    console.log("✅ Demo profil kész!");
}

// Posztok renderelése a grid-be
function renderPostsToGrid() {
    const postsGrid = document.getElementById('postsGrid');
    const noPostsElement = document.getElementById('noPostsPosts');
    
    if (!postsGrid) return;

    const demoPosts = generateDemoPosts();
    
    if (demoPosts.length === 0) {
        // Nincsenek posztok - mutatjuk az üzenetet
        if (noPostsElement) noPostsElement.style.display = 'block';
        postsGrid.innerHTML = '';
        return;
    }

    // Elrejtjük az üzenetet
    if (noPostsElement) noPostsElement.style.display = 'none';
    
    // Posztok generálása
    postsGrid.innerHTML = '';
    
    demoPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsGrid.appendChild(postElement);
    });
    
    console.log(`✅ ${demoPosts.length} demo poszt betöltve`);
}


function generateDemoPosts() {
    const demoPosts = [
        {
            id: 1,
            image_url: '../images/vices_lo_xd.jpg',
            caption: 'Csicska lovam megint bolondozik 🐎❤️ #lovasélet #diló',
            likes_count: 67,
            comments_count: 12,
            created_at: '2024-01-15T10:30:00Z'
        },
        {
            id: 2,
            image_url: '../images/HorseImage.png', 
            caption: 'Reggeli lovaglás a hajnali ködben 🌅 #reggelilovaglás #természet',
            likes_count: 89,
            comments_count: 7,
            created_at: '2024-01-14T08:15:00Z'
        }
    ];

    return demoPosts;
}

// profile.js - LIGHTBOX JAVÍTOTT VERZIÓ

function initializeLightbox() {
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxLike = document.querySelector('.lightbox-like');
    const lightboxDownload = document.querySelector('.lightbox-download');

    let currentPosts = [];
    let currentIndex = 0;

    // 🔽 JAVÍTOTT: Delegált eseménykezelő a post-item-ekre
    document.addEventListener('click', (e) => {
        const postItem = e.target.closest('.post-item');
        if (postItem) {
            const postId = parseInt(postItem.getAttribute('data-post-id'));
            console.log("🖼️ Kattintás posztra, ID:", postId);
            openLightbox(postId);
        }
    });

    // Lightbox megnyitása
    function openLightbox(postId) {
        console.log("🎯 Lightbox megnyitása post ID:", postId);
        
        currentPosts = getAllPosts();
        currentIndex = currentPosts.findIndex(post => post.id === postId);
        
        console.log("📊 Talált posztok:", currentPosts.length, "Aktuális index:", currentIndex);
        
        if (currentIndex !== -1) {
            loadLightboxImage(currentPosts[currentIndex]);
            lightboxModal.classList.add('show');
            
            // Keyboard event listeners
            document.addEventListener('keydown', handleKeyboardNavigation);
        } else {
            console.log("❌ Poszt nem található ID-vel:", postId);
        }
    }

    // Lightbox bezárása
    function closeLightbox() {
        lightboxModal.classList.remove('show');
        document.removeEventListener('keydown', handleKeyboardNavigation);
    }

    // Kép betöltése a lightbox-ba
    function loadLightboxImage(post) {
        console.log("🖼️ Kép betöltése:", post.image_url);
        
        lightboxImage.src = post.image_url;
        lightboxImage.alt = post.caption;
        
        // Caption frissítése
        document.getElementById('lightboxUsername').textContent = 'Kiss Edvárd';
        document.getElementById('lightboxCaption').textContent = post.caption;
        
        // Statisztikák frissítése
        document.querySelector('.lightbox-like span').textContent = post.likes_count || 0;
        document.querySelector('.lightbox-comment span').textContent = post.comments_count || 0;
        
        // Loading state
        lightboxImage.onload = () => {
            console.log("✅ Kép betöltve");
            lightboxImage.style.opacity = '1';
        };
        
        lightboxImage.onerror = () => {
            console.log("❌ Kép betöltési hiba:", post.image_url);
            lightboxImage.style.opacity = '1';
        };
        
        lightboxImage.style.opacity = '0.5'; // Loading state
    }

    // Navigáció
    function showNextImage() {
        if (currentPosts.length > 0) {
            currentIndex = (currentIndex + 1) % currentPosts.length;
            console.log("➡️ Következő kép:", currentIndex);
            loadLightboxImage(currentPosts[currentIndex]);
        }
    }

    function showPrevImage() {
        if (currentPosts.length > 0) {
            currentIndex = (currentIndex - 1 + currentPosts.length) % currentPosts.length;
            console.log("⬅️ Előző kép:", currentIndex);
            loadLightboxImage(currentPosts[currentIndex]);
        }
    }

    // Keyboard navigáció
    function handleKeyboardNavigation(e) {
        console.log("⌨️ Billentyű:", e.key);
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    }

    // Like funkció
    function toggleLike() {
        lightboxLike.classList.toggle('liked');
        const likeCount = lightboxLike.querySelector('span');
        const currentLikes = parseInt(likeCount.textContent);
        
        if (lightboxLike.classList.contains('liked')) {
            likeCount.textContent = currentLikes + 1;
        } else {
            likeCount.textContent = Math.max(0, currentLikes - 1);
        }
    }

    // Kép letöltése
    function downloadImage() {
        const link = document.createElement('a');
        link.href = lightboxImage.src;
        link.download = `dilo-image-${Date.now()}.jpg`;
        link.click();
        
        console.log("📥 Kép letöltése:", lightboxImage.src);
    }

    // Event listeners
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);
    if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
    if (lightboxLike) lightboxLike.addEventListener('click', toggleLike);
    if (lightboxDownload) lightboxDownload.addEventListener('click', downloadImage);

    // Kattintás a backdrop-ra
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    console.log("✅ Lightbox inicializálva");
}

function getAllPosts() {
    return generateDemoPosts();
}

// Segédfüggvények
function getAllPosts() {
    // Mock adatok - később a localStorage-ből vagy API-ból
    return [
        {
            id: 1,
            image_url: '../images/vices_lo_xd.jpg',
            caption: 'Csicska lovam megint bolondozik 🐎❤️',
            likes_count: 67,
            comments_count: 12
        },
        {
            id: 2, 
            image_url: '../images/HorseImage.png',
            caption: 'Reggeli lovaglás a hajnali ködben 🌅',
            likes_count: 89,
            comments_count: 7
        }
    ];
}

function showNotification(message, type = 'info') {
    // Egyszerű notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'info' ? '#3498db' : '#2ecc71'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}



function initializeUploadModal() {
    const uploadButton = document.getElementById('uploadButton');
    const uploadModal = document.getElementById('uploadModal');
    const closeModal = document.querySelector('.close-modal');
    const cancelButton = document.querySelector('.btn-cancel');
    const uploadForm = document.getElementById('uploadForm');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const imageCaption = document.getElementById('imageCaption');
    const charCount = document.getElementById('charCount');
    const uploadButtonElem = document.querySelector('.btn-upload');

    let selectedFiles = [];

    // Modal megnyitása
    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            console.log("📸 Upload modal megnyitása");
            uploadModal.classList.add('show');
        });
    }

    // Modal bezárása
    function closeUploadModal() {
        uploadModal.classList.remove('show');
        resetForm();
    }

    if (closeModal) closeModal.addEventListener('click', closeUploadModal);
    if (cancelButton) cancelButton.addEventListener('click', closeUploadModal);

    // Kattintás a modal backdrop-ra
    uploadModal.addEventListener('click', function(e) {
        if (e.target === uploadModal) {
            closeUploadModal();
        }
    });

    // Drag & Drop funkció
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // File input változás
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });

    // Karakterszám számláló
    imageCaption.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        if (count > 200) {
            charCount.classList.add('warning');
        } else {
            charCount.classList.remove('warning');
        }
        
        updateUploadButton();
    });

    // Form submit
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        uploadFiles();
    });

    // File kezelés
    function handleFiles(files) {
        if (files.length > 0) {
            selectedFiles = Array.from(files);
            showFilePreview(selectedFiles[0]);
            updateUploadButton();
        }
    }

    // File előnézet
    function showFilePreview(file) {
        const placeholder = uploadArea.querySelector('.upload-placeholder');
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                placeholder.innerHTML = `
                    <div class="file-preview">
                        <img src="${e.target.result}" alt="Előnézet">
                        <div class="file-info">${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</div>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    // Feltöltés gomb állapota
    function updateUploadButton() {
        const hasFiles = selectedFiles.length > 0;
        const hasCaption = imageCaption.value.trim().length > 0;
        uploadButtonElem.disabled = !(hasFiles && hasCaption);
    }

    // Feltöltés
    function uploadFiles() {
        if (selectedFiles.length === 0) return;

        console.log("🚀 Fájlok feltöltése:", selectedFiles);
        console.log("📝 Leírás:", imageCaption.value);
        console("🏷️ Címkék:", document.getElementById('imageTags').value);

        // Loading state
        uploadButtonElem.textContent = 'Feltöltés...';
        uploadButtonElem.disabled = true;

        // Szimulált feltöltés
        setTimeout(() => {
            alert('✅ Kép sikeresen feltöltve!');
            closeUploadModal();
            
            // Itt később lesz a valós feltöltés
            // await postService.uploadPost(selectedFiles[0], imageCaption.value);
        }, 2000);
    }

    // Form reset
    function resetForm() {
        selectedFiles = [];
        fileInput.value = '';
        imageCaption.value = '';
        document.getElementById('imageTags').value = '';
        charCount.textContent = '0';
        charCount.classList.remove('warning');
        
        const placeholder = uploadArea.querySelector('.upload-placeholder');
        placeholder.innerHTML = `
            <div class="upload-icon">📁</div>
            <p>Kattints ide vagy húzd ide a képet</p>
            <small>Formátumok: JPG, PNG, GIF (max. 10MB)</small>
        `;
        
        uploadButtonElem.disabled = true;
        uploadButtonElem.textContent = 'Feltöltés';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 Profil oldal betöltődött - JavaScript aktív");
    initializeUploadModal(); 
    initializeLightbox(); 
    
    // Debug info
    console.log("Upload button:", document.getElementById('uploadButton'));
    console.log("File input:", document.getElementById('fileInput'));
    
    // 1. Navigáció kezelése
    setupNavigation();
    
    // 2. Profil funkciók betöltése
    loadProfileFunctions();
    
    // 3. Posztok kezelése
    initializePosts();
    
    // 4. FELTÖLTÉS RENDSZER - ÚJ
    initializeUploadModal();

    // 5. Lightbox inicializálása
    initializeLightbox();
    
    // 🆕 6. DEMO POSZTOK BETÖLTÉSE
    loadDemoPosts();

    function setupNavigation() {
        // HOME gomb
        const homeBtn = document.querySelector('.nav-btn');
        if (homeBtn && homeBtn.textContent === 'Home') {
            homeBtn.addEventListener('click', function() {
                window.location.href = '../main/index.html';
            });
        }
        
        // PROFIL gomb (vissza a főoldalra)
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function() {
                window.location.href = '../main/index.html';
            });
        }
        
        // FELTÖLTÉS gomb (a régi, amit átirányít)
        const uploadPrompt = document.getElementById('uploadPrompt');
        if (uploadPrompt) {
            uploadPrompt.addEventListener('click', function() {
                window.location.href = '../main/index.html';
            });
        }
    }

    function loadProfileFunctions() {
        // Profil szerkesztés gomb
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', function() {
                alert('Profil szerkesztése modal megnyílik!');
            });
        }
    }

    function initializePosts() {
        const postsGrid = document.getElementById('postsGrid');
        const noPosts = document.getElementById('noPosts');
        const postsTab = document.getElementById('postsTab');
        const taggedTab = document.getElementById('taggedTab');
        
        // Alapértelmezetten mutatjuk az üzenetet
        showNoPostsMessage('posts');
        
        // Tab-ok eseménykezelői
        if (postsTab && taggedTab) {
            postsTab.addEventListener('click', function() {
                setActiveTab('posts');
                showNoPostsMessage('posts');
            });
            
            taggedTab.addEventListener('click', function() {
                setActiveTab('tagged');
                showNoPostsMessage('tagged');
            });
        }
    }

    function setActiveTab(activeTabName) {
        const postsTab = document.getElementById('postsTab');
        const taggedTab = document.getElementById('taggedTab');
        
        if (postsTab) postsTab.classList.remove('active');
        if (taggedTab) taggedTab.classList.remove('active');
        
        if (activeTabName === 'posts' && postsTab) {
            postsTab.classList.add('active');
        } else if (activeTabName === 'tagged' && taggedTab) {
            taggedTab.classList.add('active');
        }
    }

    function showNoPostsMessage(tabType) {
        const noPostsPosts = document.getElementById('noPostsPosts');
        const noPostsTagged = document.getElementById('noPostsTagged');
        
        if (tabType === 'posts') {
            if (noPostsPosts) noPostsPosts.style.display = 'block';
            if (noPostsTagged) noPostsTagged.style.display = 'none';
        } else {
            if (noPostsPosts) noPostsPosts.style.display = 'none';
            if (noPostsTagged) noPostsTagged.style.display = 'block';
        }
    }
});