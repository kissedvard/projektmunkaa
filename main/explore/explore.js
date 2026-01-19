// explore.js - Like és Komment adatbázis integrációval

document.addEventListener('DOMContentLoaded', function() {
  const feedContainer = document.querySelector('.feed-container');

  fetchFeedPosts();

  // ESEMÉNYKEZELÉS (Delegálás)
  feedContainer.addEventListener('click', function(e) {
    const target = e.target;
    
    // LIKE GOMB
    const likeBtn = target.closest('.like-btn');
    if (likeBtn) {
      const post = likeBtn.closest('.post');
      const postId = post.getAttribute('data-post-id');
      handleLikeDatabase(likeBtn, postId, post);
      return;
    }

    // MENTÉS GOMB (Ez maradhat lokális, vagy később bekötheted)
    const saveBtn = target.closest('.save-btn');
    if (saveBtn) {
      saveBtn.classList.toggle('active');
      animateButton(saveBtn);
      return;
    }

    // KOMMENT KÜLDÉS GOMB
    const commentBtn = target.closest('.post-comment-btn');
    if (commentBtn) {
      const post = commentBtn.closest('.post');
      const postId = post.getAttribute('data-post-id');
      const input = post.querySelector('.add-comment input');
      const commentText = input.value.trim();
      
      if (commentText) {
        addCommentDatabase(post, postId, commentText, input);
      }
      return;
    }
    
    // AI GOMB
    const aiBtn = target.closest('.ai-btn');
    if (aiBtn) {
        handleAIAnalysis(aiBtn);
        return;
    }
  });

  // Enter a kommenthez
  feedContainer.addEventListener('keypress', function(e) {
    if (e.target.tagName === 'INPUT' && e.target.closest('.add-comment') && e.key === 'Enter') {
      const post = e.target.closest('.post');
      const postId = post.getAttribute('data-post-id');
      const text = e.target.value.trim();
      if(text) {
        addCommentDatabase(post, postId, text, e.target);
      }
    }
  });

  // --- FÜGGVÉNYEK ---

  function fetchFeedPosts() {
    fetch('../../get_all_posts.php')
      .then(response => response.json())
      .then(data => {
        if (data.success && data.posts.length > 0) {
          data.posts.forEach(post => {
            const postHTML = createPostHTML(post);
            feedContainer.insertAdjacentHTML('beforeend', postHTML);
          });
        }
      })
      .catch(err => console.error('Hiba:', err));
  }

  function createPostHTML(post) {
    const avatarPath = (!post.profil_kep || post.profil_kep === 'fiok-ikon.png') ? '../../images/fiok-ikon.png' : `../../uploads/${post.profil_kep}`;
    const imagePath = post.image_url.startsWith('http') ? post.image_url : `../../uploads/${post.image_url}`;
    const date = new Date(post.created_at);
    const timeString = date.toLocaleDateString();

    // Tagek
    let captionContent = `<span class="caption-username">${escapeHtml(post.username)}</span> `;
    captionContent += `<span class="caption-text">${escapeHtml(post.caption || '')}</span>`;
    if(post.tags) {
       captionContent += `<br><span class="caption-text" style="color:#8ba978; font-size:0.9em;">#${escapeHtml(post.tags).replace(/,/g, ' #')}</span>`;
    }

    // Like gomb állapota (ha 1, akkor active)
    const likeActiveClass = post.is_liked == 1 ? 'active' : '';
    // SVG kitöltése, ha active
    const heartFill = post.is_liked == 1 ? '#e74c3c' : 'none';
    const heartStroke = post.is_liked == 1 ? '#e74c3c' : 'currentColor';

    // Kommentek generálása (ha jött az adatbázisból)
    let commentsHTML = '';
    if(post.latest_comments && post.latest_comments.length > 0) {
        post.latest_comments.forEach(c => {
            commentsHTML += `
                <div class="comment">
                    <span class="comment-username">${escapeHtml(c.felhasznalo)}</span>
                    <span class="comment-text">${escapeHtml(c.comment_text)}</span>
                </div>
            `;
        });
    }

    return `
      <div class="post" data-post-id="${post.id}">
        <div class="post-header">
          <div class="user-info">
            <div class="avatar"><img src="${avatarPath}"></div>
            <div class="username">${escapeHtml(post.username)}</div>
          </div>
          <button class="more-btn">⋯</button>
        </div>
        
        <div class="post-image"><img src="${imagePath}" loading="lazy"></div>
        
        <div class="post-actions">
          <button class="action-btn like-btn ${likeActiveClass}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="${heartFill}" stroke="${heartStroke}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button class="action-btn comment-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </button>
          <button class="action-btn ai-btn">AI</button>
        </div>
        
        <div class="ai-description" style="display:none;"><p>AI: <span class="ai-text">...</span></p></div>

        <div class="post-likes"><strong>${post.likes_count || 0} kedvelés</strong></div>
        
        <div class="post-caption">${captionContent}</div>
        
        <div class="post-comments">
          ${commentsHTML}
          <div class="view-all-comments"><a href="#">Összes hozzászólás (${post.comments_count || 0})</a></div>
        </div>
        
        <div class="post-time">${timeString}</div>
        
        <div class="add-comment">
          <input type="text" placeholder="Szólj hozzá...">
          <button class="post-comment-btn">Küldés</button>
        </div>
      </div>
    `;
  }

  // --- ADATBÁZIS MŰVELETEK ---

  function handleLikeDatabase(btn, postId, post) {
    // Optimista UI frissítés (azonnal átváltjuk, hogy gyorsnak tűnjön)
    const isNowActive = !btn.classList.contains('active');
    btn.classList.toggle('active');
    animateButton(btn);
    
    // Szín és ikon frissítés azonnal
    const svg = btn.querySelector('svg');
    svg.setAttribute('fill', isNowActive ? '#e74c3c' : 'none');
    svg.setAttribute('stroke', isNowActive ? '#e74c3c' : 'currentColor');

    // Kérés küldése a szervernek
    fetch('../../toggle_like.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            // Frissítjük a számot a szerver válasza alapján
            const likesElement = post.querySelector('.post-likes strong');
            likesElement.textContent = data.new_count + ' kedvelés';
            if (data.action === 'liked') createConfetti(btn);
        } else {
            // Ha hiba volt, állítsuk vissza
            btn.classList.toggle('active');
        }
    })
    .catch(err => console.error(err));
  }

  function addCommentDatabase(post, postId, text, inputField) {
    const btn = post.querySelector('.post-comment-btn');
    btn.disabled = true;

    fetch('../../add_comment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, comment_text: text })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            // Sikeres mentés -> Hozzáadjuk a listához
            renderNewComment(post, data.username, text);
            inputField.value = '';
        } else {
            alert('Hiba: ' + data.message);
        }
    })
    .catch(err => console.error(err))
    .finally(() => btn.disabled = false);
  }

  function renderNewComment(postElement, username, text) {
    const commentsContainer = postElement.querySelector('.post-comments');
    const viewAllComments = commentsContainer.querySelector('.view-all-comments');
    
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    newComment.innerHTML = `<span class="comment-username">${escapeHtml(username)}</span> <span class="comment-text">${escapeHtml(text)}</span>`;
    
    commentsContainer.insertBefore(newComment, viewAllComments);
    
    // Számláló növelése a "View all" linkben
    const countLink = viewAllComments.querySelector('a');
    const currentCount = parseInt(countLink.textContent.match(/\d+/)[0]) || 0;
    countLink.textContent = `Összes hozzászólás megtekintése (${currentCount + 1})`;
  }

  // (A többi segédfüggvény: animateButton, escapeHtml, createConfetti, handleAIAnalysis ugyanaz marad...)
  function animateButton(btn) { btn.style.transform = 'scale(1.2)'; setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200); }
  function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text || ''; return div.innerHTML; }
  
  function createConfetti(button) { /* ... confetti kód a régiből ... */ 
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;pointer-events:none;width:100px;height:100px;left:50%;top:50%;transform:translate(-50%,-50%)';
    button.parentElement.style.position = 'relative';
    button.parentElement.appendChild(container);
    for (let i = 0; i < 5; i++) {
      const c = document.createElement('div'); c.innerHTML = '❤️';
      c.style.cssText = 'position:absolute;font-size:16px;left:50%;top:50%;opacity:1;transition:all 1s ease-out';
      container.appendChild(c);
      const angle = Math.random() * Math.PI * 2; const dist = 30 + Math.random() * 40;
      setTimeout(() => { c.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`; c.style.opacity = '0'; }, 10);
    }
    setTimeout(() => container.remove(), 1000);
  }

  async function handleAIAnalysis(btn) { /* ... AI kód a régiből ... */ }
});