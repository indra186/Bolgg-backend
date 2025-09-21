const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const User = require('../models/User');
const Post = require('../models/Post');

// Get profile by id
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if(!user) return res.status(404).json({ message: 'User not found' });
        const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });
        res.json({ user, posts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update profile (bio)
router.put('/:id', auth, async (req, res) => {
    try {
        if(req.user.id !== req.params.id) return res.status(403).json({ message: 'Not authorized' });
        const user = await User.findById(req.params.id);
        user.bio = req.body.bio || user.bio;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
