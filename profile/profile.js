document.addEventListener('DOMContentLoaded', function() {
    let currentUserPosts = [];

    initializeNavigation();
    initializeUploadModal();
    initializeLightbox();
    fetchProfileData();
    fetchUserPosts();

    // --- ADATOK LEKÉRÉSE ---
    function fetchProfileData() {
        fetch('../../get_user_data.php')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(response => {
            if (response.success) {
                updateProfileUI(response.data);
            }
        })
        .catch(console.error);
    }

    function fetchUserPosts() {
        fetch('../../get_user_posts.php') 
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(response => {
            if (response.success && response.posts.length > 0) {
                currentUserPosts = response.posts;
                renderPostsToGrid(currentUserPosts);
                setDisplay('noPostsPosts', 'none');
            } else {
                setDisplay('noPostsPosts', 'block');
            }
        })
        .catch(console.error);
    }

    // --- MEGJELENÍTÉS ---
    function updateProfileUI(data) {
        setText('profileName', data.teljes_nev);
        setText('username', "@" + data.felhasznalo);
        setText('bio', data.bemutatkozas || "");
        setText('postCount', data.posts_count || 0);
        setText('followerCount', data.followers_count || 0);
        setText('followingCount', data.following_count || 0);

        // --- PROFILKÉP JAVÍTÁS ---
        const imgElement = document.getElementById('profileImage');
        if (imgElement) {
            // Ha nincs kép beállítva, vagy az alapértelmezett név van, akkor a fix elérési utat használjuk
            if (!data.profil_kep || data.profil_kep === 'fiok-ikon.png') {
                imgElement.src = '../../images/fiok-ikon.png';
            } else {
                imgElement.src = `../../uploads/${data.profil_kep}`;
            }
            
            // Hibakezelés: ha véletlenül nem töltődne be a kép, tegye vissza az alapértelmezettet
            imgElement.onerror = function() {
                this.src = '../../images/fiok-ikon.png';
            };
        }
    }

    function renderPostsToGrid(posts) {
        const postsGrid = document.getElementById('postsGrid');
        if (!postsGrid) return;
        postsGrid.innerHTML = ''; 
        posts.forEach(post => postsGrid.appendChild(createPostElement(post)));
    }

    function createPostElement(post) {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.setAttribute('data-post-id', post.id);
        
        const imagePath = post.image_url.startsWith('http') ? post.image_url : `../../uploads/${post.image_url}`;

        postItem.innerHTML = `
            <img src="${imagePath}" class="post-image" loading="lazy">
            <button class="delete-post-btn" title="Törlés" onclick="deletePost(${post.id}, event)">🗑️</button>
            <div class="post-overlay">
                <div class="post-stats"><span>❤️ ${post.likes_count}</span></div>
            </div>`;
        return postItem;
    }

    // --- LIGHTBOX FUNKCIÓK ---
    function initializeLightbox() {
        const modal = document.getElementById('lightboxModal');
        const img = document.getElementById('lightboxImage');
        const closeBtn = document.querySelector('.lightbox-close');
        
        if (!modal) return;

        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-post-btn')) return;

            const postItem = e.target.closest('.post-item');
            if (postItem) {
                const postId = postItem.getAttribute('data-post-id');
                const index = currentUserPosts.findIndex(p => p.id == postId);
                if (index !== -1) openLightbox(currentUserPosts[index]);
            }
        });

        function openLightbox(post) {
            const imagePath = post.image_url.startsWith('http') ? post.image_url : `../../uploads/${post.image_url}`;
            
            // Kép beállítása
            document.getElementById('lightboxImage').src = imagePath;
            
            // 1. Felhasználónév betöltése (a profil oldalról vesszük)
            const currentUserName = document.getElementById('profileName').textContent;
            document.getElementById('lightboxUsername').textContent = currentUserName;

            // 2. Leírás betöltése
            document.getElementById('lightboxCaption').textContent = post.caption || '';

            // 3. Tagek betöltése (Ha van, elé teszünk egy # jelet, ha nincs benne)
            let tagsText = post.tags || '';
            // Opcionális: Szépítés, ha csak vesszővel vannak elválasztva
            if(tagsText && !tagsText.includes('#')) {
                 tagsText = '#' + tagsText.replace(/,/g, ' #');
            }
            document.getElementById('lightboxTags').textContent = tagsText;

            document.getElementById('lightboxModal').classList.add('show');
        }

        if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('show'));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
    }

    // --- FELTÖLTÉS (Változatlan, csak a rövidítés miatt) ---
    function initializeUploadModal() {
        const modal = document.getElementById('uploadModal');
        const uploadForm = document.getElementById('uploadForm');
        const fileInput = document.getElementById('fileInput');
        const placeholder = document.querySelector('.upload-placeholder');
        
        if(!modal || !uploadForm) return;

        const resetUploadState = () => {
            uploadForm.reset(); 
            if (fileInput) fileInput.value = '';
            if (placeholder) {
                placeholder.style.border = '2px dashed #ccc'; 
                placeholder.innerHTML = `<div class="folder-icon" style="font-size: 40px; margin-bottom: 10px;">📁</div><p>Kattints ide</p>`;
            }
            const submitBtn = uploadForm.querySelector('.btn-upload');
            if (submitBtn) { submitBtn.textContent = 'Feltöltés'; submitBtn.disabled = true; }
        };

        const btns = document.querySelectorAll('#uploadButton, #addNewPostBtn');
        btns.forEach(b => { if(b) b.addEventListener('click', (e) => { e.preventDefault(); resetUploadState(); modal.style.display='flex'; setTimeout(()=>modal.classList.add('show'),10); })});
        
        const close = document.querySelector('.close-modal');
        const cancel = document.querySelector('.cancel-btn');
        const closeFunc = () => { modal.classList.remove('show'); setTimeout(()=>modal.style.display='none', 300); };
        
        if(close) close.addEventListener('click', closeFunc);
        if(cancel) cancel.addEventListener('click', (e) => { e.preventDefault(); closeFunc(); });
        modal.addEventListener('click', (e) => { if (e.target === modal) closeFunc(); });

        if(placeholder && fileInput) placeholder.addEventListener('click', (e) => { if(e.target.id !== 'dynamicRemoveBtn') fileInput.click(); });
        
        if(fileInput) {
            fileInput.addEventListener('change', (e) => {
                 const f = e.target.files[0];
                 const submitBtn = uploadForm.querySelector('.btn-upload');
                 if(f && placeholder) {
                     if(submitBtn) submitBtn.disabled = false;
                     const r = new FileReader();
                     r.onload = (ev) => {
                         placeholder.style.border='none';
                         placeholder.innerHTML = `<div style="position:relative;display:flex;justify-content:center;"><button type="button" id="dynamicRemoveBtn" style="position:absolute;top:-10px;right:-10px;background:red;color:white;border:none;border-radius:50%;width:25px;height:25px;cursor:pointer;">&times;</button><img src="${ev.target.result}" style="max-height:250px;max-width:100%;border-radius:8px;"></div>`;
                         document.getElementById('dynamicRemoveBtn').addEventListener('click', (ev2) => { ev2.stopPropagation(); fileInput.value=''; if(submitBtn) submitBtn.disabled = true; placeholder.innerHTML='<div class="folder-icon">📁</div><p>Kattints ide</p>'; placeholder.style.border='2px dashed #ccc'; });
                     };
                     r.readAsDataURL(f);
                 }
            });
        }

        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fd = new FormData(this);
            const fi = document.getElementById('fileInput');
            if(fi && fi.files.length > 0) fd.set('file', fi.files[0]); else { alert('Válassz képet!'); return; }

            const submitBtn = this.querySelector('.btn-upload');
            if(submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Feltöltés...'; }

            fetch('../../upload_post.php', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(d => {
                if(d.success) { closeFunc(); location.reload(); } else { alert('Hiba: ' + d.message); if(submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Feltöltés'; } }
            })
            .catch(e => { console.error(e); alert('Hiba történt.'); if(submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Feltöltés'; } });
        });
    }

    // --- NAVIGATION ---
    function initializeNavigation() {
        const homeBtns = document.querySelectorAll('#homeBtn, #profileBtn, #uploadPrompt');
        homeBtns.forEach(btn => { if (btn) btn.addEventListener('click', () => window.location.href = '../../main/index.html'); });
        
        const pTab = document.getElementById('postsTab');
        const tTab = document.getElementById('taggedTab');
        if(pTab && tTab) {
             pTab.addEventListener('click', () => { 
                 pTab.classList.add('active'); tTab.classList.remove('active'); 
                 setDisplay('postsGrid', 'grid'); setDisplay('noPostsTagged', 'none');
                 if(currentUserPosts.length === 0) setDisplay('noPostsPosts', 'block');
             });
             tTab.addEventListener('click', () => { 
                 tTab.classList.add('active'); pTab.classList.remove('active'); 
                 setDisplay('postsGrid', 'none'); setDisplay('noPostsPosts', 'none'); setDisplay('noPostsTagged', 'block');
             });
        }
    }

    // Segédfüggvények
    function setText(id, text) { const el = document.getElementById(id); if(el) el.textContent = text; }
    function setDisplay(id, val) { const el = document.getElementById(id); if(el) el.style.display = val; }
});

// --- GLOBAL DELETE ---
window.deletePost = function(postId, event) {
    event.stopPropagation();
    if(!confirm("Biztosan törölni szeretnéd ezt a bejegyzést?")) return;
    fetch('../../delete_post.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({post_id: postId}) })
    .then(r=>r.json()).then(d => { if(d.success) location.reload(); else alert(d.message); })
    .catch(e => { console.error(e); alert("Hiba."); });
};

// --- LOGOUT ---
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.clear();
            fetch('../../logout.php').then(() => window.location.href = '../../main/index.html').catch(() => window.location.href = '../../main/index.html');
        });
    }
});