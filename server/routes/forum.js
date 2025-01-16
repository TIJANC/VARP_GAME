const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const ForumPost = require('../models/ForumPost'); // Create a model for forum posts

// Create a new forum post
router.post('/create-post', authenticateUser, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newPost = new ForumPost({
      user: req.userId,
      title,
      content,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all forum posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await ForumPost.find().populate('user', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a comment to a post
router.post('/posts/:id/comment', authenticateUser, async (req, res) => {
  try {
    const { comment } = req.body;
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({ user: req.userId, comment });
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
