document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 Profil oldal betöltődött - JavaScript aktív");
    
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

    function initializeUploadSystem() {
        const uploadButton = document.getElementById('uploadButton');
        const fileInput = document.getElementById('fileInput');
        
        console.log("🎯 Feltöltés rendszer inicializálása...");
        console.log("Upload button elem:", uploadButton);
        console.log("File input elem:", fileInput);
        
        // MINDIG ellenőrizzük, hogy az elemek léteznek-e
        if (!uploadButton) {
            console.error("❌ uploadButton nem található - ellenőrizd az ID-t a HTML-ben");
            return;
        }
        
        if (!fileInput) {
            console.error("❌ fileInput nem található - ellenőrizd az ID-t a HTML-ben");
            return;
        }
        
        // Accessibility javítás
        uploadButton.setAttribute('aria-label', 'Képek feltöltése');
        fileInput.setAttribute('aria-label', 'Képek kiválasztása');
        
        // Eseménykezelők
        uploadButton.addEventListener('click', function() {
            console.log("🎯 Feltöltés gomb megnyomva");
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function(e) {
            console.log("📁 File input változott");
            const files = e.target.files;
            if (files.length > 0) {
                alert(`${files.length} kép kiválasztva!`);
                console.log('Kiválasztott fájlok:', files);
                fileInput.value = '';
            } else {
                console.log("❌ Nincs fájl kiválasztva");
            }
        });
        
        console.log("✅ Feltöltés rendszer inicializálva");
    }
});