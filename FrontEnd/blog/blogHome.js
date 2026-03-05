// API Configuration
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const userInfo = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const memberSince = document.getElementById('memberSince');
const postCount = document.getElementById('postCount');
const profileAvatar = document.getElementById('profileAvatar');
const createPostBtn = document.getElementById('createPostBtn');
const postsContainer = document.getElementById('postsContainer');

// Modal Elements
const postModal = document.getElementById('postModal');
const closeModal = document.getElementById('closeModal');
const postForm = document.getElementById('postForm');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');

// Form Elements
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const postCategory = document.getElementById('postCategory');
const titleError = document.getElementById('titleError');
const contentError = document.getElementById('contentError');

// Current User and Post
let currentUser = null;
let currentEditingPostId = null;
let userPosts = [];

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    setupEventListeners();
    loadUserPostsAndEdit();
});

// Load posts and handle edit from URL
function loadUserPostsAndEdit() {
    fetch(`${API_URL}/posts/user/${currentUser.id}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            userPosts = data.data;
            postCount.textContent = userPosts.length;
            displayPosts(userPosts);

            // Check if editing from URL
            const params = new URLSearchParams(window.location.search);
            if (params.has('edit')) {
                const editPostId = params.get('edit');
                editPostFromURL(editPostId);
                // Clear the edit parameter from URL
                window.history.replaceState({}, document.title, 'blogHome.html');
            }
        }
    })
    .catch(error => console.error('Error loading posts:', error));
}

// Load User Data from localStorage
function loadUserData() {
    const user = localStorage.getItem('user');
    
    if (!user) {
        // Redirect to login if no user data
        window.location.href = '../loginSignup/index.html';
        return;
    }

    currentUser = JSON.parse(user);
    
    // Update UI with user info
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    profileAvatar.textContent = initials;
    userName.textContent = currentUser.name;
    userEmail.textContent = currentUser.email;
    userInfo.textContent = `Hi, ${currentUser.name}`;

    // Format member since date
    const createdDate = new Date(currentUser.createdAt);
    const options = { year: 'numeric', month: 'short' };
    memberSince.textContent = `Member since ${createdDate.toLocaleDateString('en-US', options)}`;
}

// Setup Event Listeners
function setupEventListeners() {
    logoutBtn.addEventListener('click', handleLogout);
    createPostBtn.addEventListener('click', openCreatePostModal);
    closeModal.addEventListener('click', closeCreatePostModal);
    cancelBtn.addEventListener('click', closeCreatePostModal);
    postForm.addEventListener('submit', handlePostSubmit);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === postModal) {
            closeCreatePostModal();
        }
    });
}

// Logout Handler
function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    window.location.href = '../loginSignup/index.html';
}

// Open Create Post Modal
function openCreatePostModal() {
    currentEditingPostId = null;
    postForm.reset();
    modalTitle.textContent = 'Create New Post';
    titleError.textContent = '';
    contentError.textContent = '';
    postModal.classList.add('show');
}

// Close Create Post Modal
function closeCreatePostModal() {
    postModal.classList.remove('show');
    postForm.reset();
    titleError.textContent = '';
    contentError.textContent = '';
}

// Handle Post Form Submission
function handlePostSubmit(e) {
    e.preventDefault();

    // Clear errors
    titleError.textContent = '';
    contentError.textContent = '';

    // Validate
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    const category = postCategory.value;

    let isValid = true;

    if (!title) {
        titleError.textContent = 'Post title is required';
        isValid = false;
    }

    if (!content) {
        contentError.textContent = 'Post content is required';
        isValid = false;
    }

    if (!isValid) return;

    // Submit post
    const postData = {
        userId: currentUser.id,
        title: title,
        content: content,
        category: category
    };

    if (currentEditingPostId) {
        postData.postId = currentEditingPostId;
        updatePost(postData);
    } else {
        createPost(postData);
    }
}

// Create Post via AJAX
function createPost(postData) {
    const submitBtn = postForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publishing...';

    fetch(`${API_URL}/posts/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to view post page
            window.location.href = `../viewPost/viewPost.html?id=${data.data._id}`;
        } else {
            alert('Error creating post: ' + (data.message || 'Unknown error'));
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish Post';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error creating post: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Post';
    });
}

// Update Post via AJAX
function updatePost(postData) {
    const submitBtn = postForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    fetch(`${API_URL}/posts/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to view post page
            window.location.href = `../viewPost/viewPost.html?id=${postData.postId}`;
        } else {
            alert('Error updating post: ' + (data.message || 'Unknown error'));
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Post';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating post: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Post';
    });
}


// Display Posts
function displayPosts(posts) {
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts-message">
                <p>No posts yet. Create your first post to get started! 🚀</p>
            </div>
        `;
        return;
    }

    postsContainer.innerHTML = posts.map(post => `
        <div class="post-card" onclick="window.location.href='../viewPost/viewPost.html?id=${post._id}'">
            <div class="post-header">
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    <span class="category-badge">${post.category}</span>
                    <span class="post-date">${formatDate(post.createdAt)}</span>
                </div>
            </div>
            <div class="post-preview">
                ${escapeHtml(post.content.substring(0, 150))}...
            </div>
        </div>
    `).join('');
}

// Edit post from URL parameter
function editPostFromURL(postId) {
    const post = userPosts.find(p => p._id === postId);
    if (!post) return;

    currentEditingPostId = postId;
    postTitle.value = post.title;
    postContent.value = post.content;
    postCategory.value = post.category;

    modalTitle.textContent = 'Edit Post';
    postModal.classList.add('show');
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
