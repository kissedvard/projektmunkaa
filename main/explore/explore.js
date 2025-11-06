// explore.js - Improved version

document.addEventListener('DOMContentLoaded', function() {
  // Like gomb funkcionalitás - improved
  const likeButtons = document.querySelectorAll('.like-btn');
  
  likeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const wasActive = this.classList.contains('active');
      this.classList.toggle('active');
      
      // Animáció
      this.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
      
      // Számláló frissítése
      const likesElement = this.closest('.post').querySelector('.post-likes strong');
      const currentText = likesElement.textContent;
      const currentLikes = parseInt(currentText) || 0;
      
      if (!wasActive) {
        likesElement.textContent = (currentLikes + 1) + ' kedvelés';
        createConfetti(this);
      } else {
        likesElement.textContent = (currentLikes - 1) + ' kedvelés';
      }
    });
  });
  
  // Mentés gomb funkcionalitás
  const saveButtons = document.querySelectorAll('.save-btn');
  
  saveButtons.forEach(button => {
    button.addEventListener('click', function() {
      this.classList.toggle('active');
      
      // Animáció
      this.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
    });
  });
  
  // Hozzászólás küldése - improved
  const commentForms = document.querySelectorAll('.add-comment');
  
  commentForms.forEach(form => {
    const input = form.querySelector('input');
    const button = form.querySelector('.post-comment-btn');
    
    // Input validáció
    input.addEventListener('input', function() {
      button.disabled = !this.value.trim();
    });
    
    button.addEventListener('click', function() {
      const commentText = input.value.trim();
      
      if (commentText) {
        addComment(form.closest('.post'), commentText);
        input.value = '';
        button.disabled = true;
      }
    });
    
    // Enter billentyű
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const commentText = input.value.trim();
        
        if (commentText) {
          addComment(form.closest('.post'), commentText);
          input.value = '';
          button.disabled = true;
        }
      }
    });
  });
  
  // More button funkcionalitás
  const moreButtons = document.querySelectorAll('.more-btn');
  
  moreButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Egyszerű dropdown helyett konzol log
      console.log('More options clicked for post');
      // Itt később lehet dropdown menüt implementálni
    });
  });
  
  // Új hozzászólás hozzáadása - improved
  function addComment(postElement, commentText) {
    const commentsContainer = postElement.querySelector('.post-comments');
    const viewAllComments = commentsContainer.querySelector('.view-all-comments');
    
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    newComment.style.opacity = '0';
    newComment.style.transform = 'translateY(-10px)';
    
    newComment.innerHTML = `
      <span class="comment-username">te</span>
      <span class="comment-text">${escapeHtml(commentText)}</span>
    `;
    
    commentsContainer.insertBefore(newComment, viewAllComments);
    
    // Animáció
    setTimeout(() => {
      newComment.style.transition = 'all 0.3s ease';
      newComment.style.opacity = '1';
      newComment.style.transform = 'translateY(0)';
    }, 10);
    
    // Hozzászólások számának frissítése
    updateCommentCount(viewAllComments, 1);
  }
  
  // Hozzászólások számának frissítése
  function updateCommentCount(viewAllComments, change) {
    const allCommentsLink = viewAllComments.querySelector('a');
    const match = allCommentsLink.textContent.match(/\d+/);
    
    if (match) {
      const currentCount = parseInt(match[0]);
      const newCount = currentCount + change;
      allCommentsLink.textContent = `Összes hozzászólás megtekintése (${newCount})`;
    }
  }
  
  // Confetti effekt like-hoz
  function createConfetti(button) {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.position = 'absolute';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.width = '100px';
    confettiContainer.style.height = '100px';
    confettiContainer.style.left = '50%';
    confettiContainer.style.top = '50%';
    confettiContainer.style.transform = 'translate(-50%, -50%)';
    
    button.parentElement.style.position = 'relative';
    button.parentElement.appendChild(confettiContainer);
    
    for (let i = 0; i < 5; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.innerHTML = '❤️';
      confetti.style.position = 'absolute';
      confetti.style.fontSize = '16px';
      confetti.style.left = '50%';
      confetti.style.top = '50%';
      confetti.style.opacity = '1';
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 40;
      const duration = 0.8 + Math.random() * 0.4;
      
      confetti.style.transition = `all ${duration}s ease-out`;
      
      confettiContainer.appendChild(confetti);
      
      setTimeout(() => {
        confetti.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        confetti.style.opacity = '0';
      }, 10);
      
      setTimeout(() => {
        confetti.remove();
      }, duration * 1000);
    }
    
    setTimeout(() => {
      confettiContainer.remove();
    }, 1000);
  }
  
  // HTML escape function
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Infinite scroll functionality (basic)
  let isLoading = false;
  
  window.addEventListener('scroll', function() {
    if (isLoading) return;
    
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 100) {
      loadMorePosts();
    }
  });
  
  function loadMorePosts() {
    if (isLoading) return;
    
    isLoading = true;
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Töltés...';
    loadingIndicator.style.textAlign = 'center';
    loadingIndicator.style.padding = '2rem';
    loadingIndicator.style.color = '#8ba978';
    loadingIndicator.style.fontFamily = 'Exo 2, sans-serif';
    
    document.querySelector('.feed-container').appendChild(loadingIndicator);
    
    // Szimulált betöltés
    setTimeout(() => {
      loadingIndicator.remove();
      // Itt később lehet valós adatbetöltést implementálni
      console.log('További posztok betöltése...');
      isLoading = false;
    }, 1500);
  }
});