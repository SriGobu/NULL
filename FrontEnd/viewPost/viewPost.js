// API Configuration
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const postTitle = document.getElementById('postTitle');
const postCategory = document.getElementById('postCategory');
const postDate = document.getElementById('postDate');
const postContent = document.getElementById('postContent');
const userInfo = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');
const submitCommentBtn = document.getElementById('submitCommentBtn');
const commentInput = document.getElementById('commentInput');
const commentsList = document.getElementById('commentsList');
const commentCount = document.getElementById('commentCount');

// Current User and Post
let currentUser = null;
let currentPost = null;
let currentPostId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    getPostIdFromURL();
    loadPostDetails();
    setupEventListeners();
});

// Load User Data from localStorage
function loadUserData() {
    const user = localStorage.getItem('user');
    
    if (!user) {
        window.location.href = '../loginSignup/index.html';
        return;
    }

    currentUser = JSON.parse(user);
    userInfo.textContent = `Hi, ${currentUser.name}`;
}

// Get Post ID from URL
function getPostIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    currentPostId = params.get('id');

    if (!currentPostId) {
        window.location.href = '../blog/blogHome.html';
    }
}

// Load Post Details
function loadPostDetails() {
    fetch(`${API_URL}/posts/${currentPostId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentPost = data.data;
            displayPost(currentPost);
        } else {
            alert('Post not found');
            window.location.href = '../blog/blogHome.html';
        }
    })
    .catch(error => {
        console.error('Error loading post:', error);
        alert('Error loading post: ' + error.message);
        window.location.href = '../blog/blogHome.html';
    });
}

// Display Post
function displayPost(post) {
    postTitle.textContent = post.title;
    postCategory.textContent = post.category;
    postDate.textContent = formatDate(post.createdAt);
    postContent.textContent = post.content;

    // Update likes and comments
    likeCount.textContent = post.likes.length;
    commentCount.textContent = post.comments.length;

    // Check if current user already liked
    const userLiked = post.likes.some(like => like.userId === currentUser.id);
    if (userLiked) {
        likeBtn.classList.add('liked');
    }

    // Display comments
    displayComments(post.comments);
}

// Setup Event Listeners
function setupEventListeners() {
    logoutBtn.addEventListener('click', handleLogout);
    editBtn.addEventListener('click', handleEdit);
    deleteBtn.addEventListener('click', handleDelete);
    likeBtn.addEventListener('click', handleLike);
    submitCommentBtn.addEventListener('click', handleAddComment);
    
    // Allow Enter key to submit comment (Shift+Enter for new line)
    commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    });
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    window.location.href = '../loginSignup/index.html';
}

// Handle Edit
function handleEdit() {
    // Verify ownership
    if (currentPost.userId !== currentUser.id) {
        alert('You can only edit your own posts');
        return;
    }

    // Redirect to blog home with edit flag
    window.location.href = `../blog/blogHome.html?edit=${currentPostId}`;
}

// Handle Delete
function handleDelete() {
    // Verify ownership
    if (currentPost.userId !== currentUser.id) {
        alert('You can only delete your own posts');
        return;
    }

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    // Send delete request
    fetch(`${API_URL}/posts/delete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId: currentPostId,
            userId: currentUser.id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Post deleted successfully');
            window.location.href = '../blog/blogHome.html';
        } else {
            alert('Error deleting post: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting post: ' + error.message);
    });
}

// Handle Like
function handleLike() {
    fetch(`${API_URL}/posts/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId: currentPostId,
            userId: currentUser.id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update like count and button state
            likeCount.textContent = data.data.likes;
            likeBtn.classList.toggle('liked');
            
            // Reload post to get updated data
            loadPostDetails();
        } else {
            alert('Error liking post: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error liking post: ' + error.message);
    });
}

// Handle Add Comment
function handleAddComment() {
    const content = commentInput.value.trim();

    if (!content) {
        alert('Please write a comment');
        return;
    }

    const submitBtn = submitCommentBtn;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';

    fetch(`${API_URL}/posts/comment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId: currentPostId,
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            content: content
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            commentInput.value = '';
            loadPostDetails();
        } else {
            alert('Error adding comment: ' + (data.message || 'Unknown error'));
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Comment';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding comment: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Comment';
    });
}

// Display Comments
function displayComments(comments) {
    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
        return;
    }

    commentsList.innerHTML = comments.map((comment, index) => `
        <div class="comment-item">
            <div class="comment-header">
                <div>
                    <span class="comment-author">${escapeHtml(comment.userName)}</span>
                    <span class="comment-email">${comment.userEmail}</span>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <span class="comment-date">${formatDate(comment.createdAt)}</span>
                    ${comment.userId === currentUser.id ? `
                        <button class="comment-delete-btn" onclick="deleteComment(${index})">Delete</button>
                    ` : ''}
                </div>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
        </div>
    `).join('');
}

// Delete Comment
function deleteComment(commentIndex) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    fetch(`${API_URL}/posts/comment`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId: currentPostId,
            commentIndex: commentIndex,
            userId: currentUser.id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadPostDetails();
        } else {
            alert('Error deleting comment: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting comment: ' + error.message);
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
