const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// MongoDB Connection
const mongoURL = process.env.MONGODB_URL;

mongoose.connect(mongoURL,).then(() => {
    console.log('Connected to MongoDB successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(password) {
    return await bcryptjs.compare(password, this.password);
};

// Create User Model
const User = mongoose.model('User', userSchema);

// Routes

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Blog Login Server is running' });
});

// Signup Route
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Create new user
        const newUser = new User({
            name: name,
            email: email.toLowerCase(),
            password: password
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle duplicate email error from MongoDB
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Error registering user: ' + error.message 
        });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Compare passwords
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error logging in: ' + error.message 
        });
    }
});

// Get all users (for testing only - remove in production)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ 
            success: true, 
            data: users 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users: ' + error.message 
        });
    }
});

// Blog Post Schema
const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Technology', 'Travel', 'Food', 'Lifestyle', 'Business', 'Other'],
        default: 'Other'
    },
    likes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userName: String,
        userEmail: String,
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create Post Model
const Post = mongoose.model('Post', postSchema);

// Blog Routes

// Create Post
app.post('/api/posts/create', async (req, res) => {
    try {
        const { userId, title, content, category } = req.body;

        // Validation
        if (!userId || !title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create new post
        const newPost = new Post({
            userId: userId,
            title: title,
            content: content,
            category: category || 'Other'
        });

        // Save post
        await newPost.save();

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: newPost
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating post: ' + error.message
        });
    }
});

// Get User Posts
app.get('/api/posts/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get all posts for user
        const posts = await Post.find({ userId: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: posts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts: ' + error.message
        });
    }
});

// Get Single Post
app.get('/api/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params;

        // Find post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching post: ' + error.message
        });
    }
});

// Update Post
app.put('/api/posts/update', async (req, res) => {
    try {
        const { postId, userId, title, content, category } = req.body;

        // Validation
        if (!postId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID and User ID are required'
            });
        }

        // Find post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Verify ownership
        if (post.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only edit your own posts'
            });
        }

        // Update post
        post.title = title || post.title;
        post.content = content || post.content;
        post.category = category || post.category;
        post.updatedAt = new Date();

        await post.save();

        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
            data: post
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating post: ' + error.message
        });
    }
});

// Delete Post
app.delete('/api/posts/delete', async (req, res) => {
    try {
        const { postId, userId } = req.body;

        // Validation
        if (!postId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID and User ID are required'
            });
        }

        // Find post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Verify ownership
        if (post.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only delete your own posts'
            });
        }

        // Delete post
        await Post.findByIdAndDelete(postId);

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting post: ' + error.message
        });
    }
});

// Like/Unlike Post
app.post('/api/posts/like', async (req, res) => {
    try {
        const { postId, userId } = req.body;

        // Validation
        if (!postId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID and User ID are required'
            });
        }

        // Find post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user already liked
        const alreadyLiked = post.likes.some(like => like.userId.toString() === userId);

        if (alreadyLiked) {
            // Remove like
            post.likes = post.likes.filter(like => like.userId.toString() !== userId);
        } else {
            // Add like
            post.likes.push({ userId: userId });
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: alreadyLiked ? 'Like removed' : 'Post liked',
            data: {
                likes: post.likes.length,
                isLiked: !alreadyLiked
            }
        });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({
            success: false,
            message: 'Error liking post: ' + error.message
        });
    }
});

// Add Comment
app.post('/api/posts/comment', async (req, res) => {
    try {
        const { postId, userId, userName, userEmail, content } = req.body;

        // Validation
        if (!postId || !userId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Post ID, User ID, and comment content are required'
            });
        }

        // Find post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Add comment
        const newComment = {
            userId: userId,
            userName: userName,
            userEmail: userEmail,
            content: content,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: newComment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment: ' + error.message
        });
    }
});

// Delete Comment
app.delete('/api/posts/comment', async (req, res) => {
    try {
        const { postId, commentIndex, userId } = req.body;

        // Validation
        if (!postId || commentIndex === undefined || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID, Comment Index, and User ID are required'
            });
        }

        // Find post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if comment exists
        if (commentIndex < 0 || commentIndex >= post.comments.length) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Verify ownership
        const comment = post.comments[commentIndex];
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only delete your own comments'
            });
        }

        // Delete comment
        post.comments.splice(commentIndex, 1);
        await post.save();

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment: ' + error.message
        });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server is running on http://localhost:3000`);
});
