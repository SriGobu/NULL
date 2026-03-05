const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// Like/Unlike Post
router.post('/like', async (req, res) => {
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

        const alreadyLiked = post.likes.some(like => like.userId.toString() === userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(like => like.userId.toString() !== userId);
        } else {
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
router.post('/comment', async (req, res) => {
    try {
        const { postId, userId, userName, userEmail, content } = req.body;

        if (!postId || !userId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Post ID, User ID, and comment content are required'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

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
router.delete('/comment', async (req, res) => {
    try {
        const { postId, commentIndex, userId } = req.body;

        if (!postId || commentIndex === undefined || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID, Comment Index, and User ID are required'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (commentIndex < 0 || commentIndex >= post.comments.length) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const comment = post.comments[commentIndex];
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only delete your own comments'
            });
        }

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

module.exports = router;
