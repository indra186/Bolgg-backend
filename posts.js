const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Create post
router.post('/', auth, async (req, res) => {
    const { title, content, tags } = req.body;
    try {
        const post = new Post({ title, content, tags, author: req.user.id });
        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Read all posts (with author populated)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author','username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Read single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author','username');
        if(!post) return res.status(404).json({ message: 'Post not found' });
        const comments = await Comment.find({ post: post._id }).populate('author','username').sort({ createdAt: 1 });
        res.json({ post, comments });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update post
router.put('/:id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ message: 'Post not found' });
        if(post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const { title, content, tags } = req.body;
        post.title = title; post.content = content; post.tags = tags;
        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ message: 'Post not found' });
        if(post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
        await post.remove();
        res.json({ message: 'Post removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ message: 'Post not found' });

        const comment = new Comment({ post: post._id, author: req.user.id, content: req.body.content });
        await comment.save();
        const populated = await comment.populate('author','username');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete comment
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if(!comment) return res.status(404).json({ message: 'Comment not found' });
        if(comment.author.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
        await comment.remove();
        res.json({ message: 'Comment removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
