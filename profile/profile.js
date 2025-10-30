// Profil oldal JavaScript - RÉGI STRUKTÚRA JAVÍTVA
document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 Profil oldal betöltődött - JavaScript aktív");
    
    // 1. Navigáció kezelése
    setupNavigation();
    
    // 2. Profil funkciók betöltése
    loadProfileFunctions();
    
    // 3. Posztok kezelése
    initializePosts();

    function setupNavigation() {
        // HOME gomb
        const homeBtn = document.querySelector('.nav-btn');
        if (homeBtn && homeBtn.textContent === 'Home') {
            homeBtn.addEventListener('click', function() {
                window.location.href = '/index.html';
            });
        }
        
        // PROFIL gomb (vissza a főoldalra)
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function() {
                window.location.href = '/index.html';
            });
        }
        
        // FELTÖLTÉS gomb
        const uploadPrompt = document.getElementById('uploadPrompt');
        if (uploadPrompt) {
            uploadPrompt.addEventListener('click', function() {
                window.location.href = '/index.html';
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

    // HIÁNYZÓ FÜGGVÉNYEK
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
        const noPosts = document.getElementById('noPosts');
        if (!noPosts) return;
        
        const title = noPosts.querySelector('h3');
        const description = noPosts.querySelector('p');
        
        if (tabType === 'posts') {
            title.textContent = 'Még nincsenek bejegyzések';
            description.textContent = 'Amint feltöltesz képeket, itt fognak megjelenni.';
        } else {
            title.textContent = 'Még nincsenek megjelölt bejegyzések';
            description.textContent = 'Amint megjelölnek egy képen, itt fog megjelenni.';
        }
        
        noPosts.style.display = 'block';
    }
});