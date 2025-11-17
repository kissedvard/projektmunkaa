// profile.js - ADD EZT A RÉSZT

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
    initializeUploadSystem();

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