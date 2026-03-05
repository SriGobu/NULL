const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// Create Post
router.post('/create', async (req, res) => {
    try {
        const { userId, title, content, category } = req.body;

        if (!userId || !title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const newPost = new Post({
            userId: userId,
            title: title,
            content: content,
            category: category || 'Other'
        });

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
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

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
router.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;

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
router.put('/update', async (req, res) => {
    try {
        const { postId, userId, title, content, category } = req.body;

        if (!postId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID and User ID are required'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (post.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only edit your own posts'
            });
        }

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
router.delete('/delete', async (req, res) => {
    try {
        const { postId, userId } = req.body;

        if (!postId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID and User ID are required'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (post.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only delete your own posts'
            });
        }

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

module.exports = router;
