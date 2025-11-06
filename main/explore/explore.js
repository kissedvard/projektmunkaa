// Explore oldal interakciói
document.addEventListener('DOMContentLoaded', function() {
  // Like gomb funkcionalitás
  const likeButtons = document.querySelectorAll('.like-btn');
  
  likeButtons.forEach(button => {
    button.addEventListener('click', function() {
      this.classList.toggle('active');
      
      // Számláló frissítése (egyszerűsített változat)
      const likesElement = this.closest('.post').querySelector('.post-likes strong');
      const currentLikes = parseInt(likesElement.textContent);
      
      if (this.classList.contains('active')) {
        likesElement.textContent = (currentLikes + 1) + ' kedvelés';
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
    });
  });
  
  // Hozzászólás küldése
  const commentForms = document.querySelectorAll('.add-comment');
  
  commentForms.forEach(form => {
    const input = form.querySelector('input');
    const button = form.querySelector('.post-comment-btn');
    
    button.addEventListener('click', function() {
      const commentText = input.value.trim();
      
      if (commentText) {
        addComment(form.closest('.post'), commentText);
        input.value = '';
      }
    });
    
    // Enter billentyűvel is küldhető
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const commentText = input.value.trim();
        
        if (commentText) {
          addComment(form.closest('.post'), commentText);
          input.value = '';
        }
      }
    });
  });
  
  // Új hozzászólás hozzáadása
  function addComment(postElement, commentText) {
    const commentsContainer = postElement.querySelector('.post-comments');
    const viewAllComments = commentsContainer.querySelector('.view-all-comments');
    
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    
    newComment.innerHTML = `
      <span class="comment-username">te</span>
      <span class="comment-text">${commentText}</span>
    `;
    
    // Az "Összes hozzászólás" előtt helyezzük el
    commentsContainer.insertBefore(newComment, viewAllComments);
    
    // Hozzászólások számának frissítése
    const allCommentsLink = viewAllComments.querySelector('a');
    const currentCount = parseInt(allCommentsLink.textContent.match(/\d+/)[0]);
    allCommentsLink.textContent = `Összes hozzászólás megtekintése (${currentCount + 1})`;
  }
  
  // További interakciók...
});