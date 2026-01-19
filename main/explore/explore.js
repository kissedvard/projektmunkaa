// explore.js - Dynamic Feed Version

document.addEventListener('DOMContentLoaded', function() {
  const feedContainer = document.querySelector('.feed-container');

  // 1. Dinamikus posztok betöltése
  fetchFeedPosts();

  // 2. ESEMÉNYDELEGÁLÁS (Ez kezeli a gombokat a régi és új posztokon is)
  feedContainer.addEventListener('click', function(e) {
    const target = e.target;
    
    // --- LIKE GOMB ---
    const likeBtn = target.closest('.like-btn');
    if (likeBtn) {
      const post = likeBtn.closest('.post');
      handleLike(likeBtn, post);
      return;
    }

    // --- MENTÉS GOMB ---
    const saveBtn = target.closest('.save-btn');
    if (saveBtn) {
      saveBtn.classList.toggle('active');
      animateButton(saveBtn);
      return;
    }

    // --- KOMMENT KÜLDÉS GOMB ---
    const commentBtn = target.closest('.post-comment-btn');
    if (commentBtn) {
      const post = commentBtn.closest('.post');
      const input = post.querySelector('.add-comment input');
      const commentText = input.value.trim();
      
      if (commentText) {
        addComment(post, commentText);
        input.value = '';
      }
      return;
    }
    
    // --- AI GOMB ---
    const aiBtn = target.closest('.ai-btn');
    if (aiBtn) {
        handleAIAnalysis(aiBtn);
        return;
    }
  });

  // Enter leütés figyelése a komment mezőkben
  feedContainer.addEventListener('keypress', function(e) {
    if (e.target.tagName === 'INPUT' && e.target.closest('.add-comment') && e.key === 'Enter') {
      const post = e.target.closest('.post');
      const text = e.target.value.trim();
      if(text) {
        addComment(post, text);
        e.target.value = '';
      }
    }
  });


  // --- FÜGGVÉNYEK ---

  function fetchFeedPosts() {
    // Két szinttel feljebb van a PHP fájl
    fetch('../../get_all_posts.php')
      .then(response => response.json())
      .then(data => {
        if (data.success && data.posts.length > 0) {
          data.posts.forEach(post => {
            // A konstans posztok UTÁN fűzzük be őket
            const postHTML = createPostHTML(post);
            feedContainer.insertAdjacentHTML('beforeend', postHTML);
          });
        }
      })
      .catch(err => console.error('Hiba a feed betöltésekor:', err));
  }

  function createPostHTML(post) {
    // Útvonalak kezelése
    const avatarPath = (!post.profil_kep || post.profil_kep === 'fiok-ikon.png') 
                       ? '../../images/fiok-ikon.png' 
                       : `../../uploads/${post.profil_kep}`;
    
    // Képkezelés (ha külső link vagy feltöltött)
    const imagePath = post.image_url.startsWith('http') 
                      ? post.image_url 
                      : `../../uploads/${post.image_url}`;

    // Időformázás (egyszerűsített)
    const date = new Date(post.created_at);
    const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0,5);

    // Tagek formázása
    let captionContent = `<span class="caption-username">${escapeHtml(post.username)}</span> `;
    captionContent += `<span class="caption-text">${escapeHtml(post.caption || '')}</span>`;
    if(post.tags) {
       captionContent += `<br><span class="caption-text" style="color:#8ba978; font-size:0.9em;">#${escapeHtml(post.tags).replace(/,/g, ' #')}</span>`;
    }

    // Template String - Pontosan a te HTML szerkezeted
    return `
      <div class="post" data-post-id="${post.id}">
        <div class="post-header">
          <div class="user-info">
            <div class="avatar">
              <img src="${avatarPath}" alt="${escapeHtml(post.username)}">
            </div>
            <div class="username">${escapeHtml(post.username)}</div>
          </div>
          <button class="more-btn">⋯</button>
        </div>
        
        <div class="post-image">
          <img src="${imagePath}" alt="Poszt kép" loading="lazy">
        </div>
        
        <div class="post-actions">
          <button class="action-btn like-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button class="action-btn comment-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z"></path>
            </svg>
          </button>
          <button class="action-btn ai-btn">AI</button>
        </div>

        <div class="ai-description" style="display: none;">
          <p>AI Analysis: <span class="ai-text">Loading...</span></p>
        </div>
        
        <div class="post-likes">
          <strong>${post.likes_count || 0} kedvelés</strong>
        </div>
        
        <div class="post-caption">
          ${captionContent}
        </div>
        
        <div class="post-comments">
          <div class="view-all-comments">
            <a href="#">Összes hozzászólás megtekintése (${post.comments_count || 0})</a>
          </div>
        </div>
        
        <div class="post-time">
          ${timeString}
        </div>
        
        <div class="add-comment">
          <input type="text" placeholder="Szólj hozzá...">
          <button class="post-comment-btn">Küldés</button>
        </div>
      </div>
    `;
  }

  // --- Segédfunkciók ---

  function handleLike(btn, post) {
    const wasActive = btn.classList.contains('active');
    btn.classList.toggle('active');
    animateButton(btn);

    const likesElement = post.querySelector('.post-likes strong');
    const currentText = likesElement.textContent;
    const currentLikes = parseInt(currentText) || 0;

    if (!wasActive) {
      likesElement.textContent = (currentLikes + 1) + ' kedvelés';
      createConfetti(btn);
    } else {
      likesElement.textContent = (currentLikes - 1) + ' kedvelés';
    }
  }

  function addComment(postElement, commentText) {
    const commentsContainer = postElement.querySelector('.post-comments');
    const viewAllComments = commentsContainer.querySelector('.view-all-comments');
    
    // Lekérjük a bejelentkezett felhasználó nevét (vagy "te"-t használunk, ha nincs tárolva)
    const storedUser = localStorage.getItem('username') || 'te';

    const newComment = document.createElement('div');
    newComment.className = 'comment';
    newComment.style.opacity = '0';
    newComment.style.transform = 'translateY(-10px)';
    
    newComment.innerHTML = `
      <span class="comment-username">${escapeHtml(storedUser)}</span>
      <span class="comment-text">${escapeHtml(commentText)}</span>
    `;
    
    commentsContainer.insertBefore(newComment, viewAllComments);
    
    setTimeout(() => {
      newComment.style.transition = 'all 0.3s ease';
      newComment.style.opacity = '1';
      newComment.style.transform = 'translateY(0)';
    }, 10);
  }

  async function handleAIAnalysis(btn) {
      const post = btn.closest('.post');
      const img = post.querySelector('.post-image img');
      // Ha abszolút útvonalat használunk, néha gond lehet a backendnek, 
      // de itt most a src attribútumot küldjük el.
      const imageUrl = img.src; 
      
      const aiDesc = post.querySelector('.ai-description');
      const aiText = aiDesc.querySelector('.ai-text');

      aiDesc.style.display = 'block';
      aiText.textContent = 'Analyzing...';

      // Itt a backend hívás (mivel PHP, a gyökérben keressük)
      // Megjegyzés: A te provided kódodban /analyze_image.php volt, 
      // de a struktúra szerint ../../analyze_image.php kellhet
      try {
        const response = await fetch('../../analyze_image.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl })
        });

        const data = await response.json();
        if (data.success) {
          aiText.textContent = data.description;
        } else {
          aiText.textContent = 'Nem sikerült az elemzés.';
        }
      } catch (error) {
        console.error(error);
        aiText.textContent = 'Hiba történt.';
      }
  }

  function animateButton(btn) {
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Confetti effekt (maradt a régiből)
  function createConfetti(button) {
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;pointer-events:none;width:100px;height:100px;left:50%;top:50%;transform:translate(-50%,-50%)';
    button.parentElement.style.position = 'relative';
    button.parentElement.appendChild(container);
    
    for (let i = 0; i < 5; i++) {
      const c = document.createElement('div');
      c.innerHTML = '❤️';
      c.style.cssText = 'position:absolute;font-size:16px;left:50%;top:50%;opacity:1;transition:all 1s ease-out';
      container.appendChild(c);
      
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 40;
      
      setTimeout(() => {
        c.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`;
        c.style.opacity = '0';
      }, 10);
    }
    setTimeout(() => container.remove(), 1000);
  }

  // Végtelen görgetés (Infinite Scroll)
  let isLoading = false;
  window.addEventListener('scroll', function() {
    if (isLoading) return;
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
      // Itt lehetne betölteni a következő adagot, ha a backend támogatja a lapozást
      // Most csak logolunk, hogy ne fusson feleslegesen
      // console.log('Load more...');
    }
  });

});