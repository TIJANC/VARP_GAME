const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const sendPasswordResetEmail = require('../utils/sendPasswordResetEmail'); // Add this line

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Create and save new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate verification token
    const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send verification email
    try {
      sendVerificationEmail(email, verificationToken);
    } catch (err) {
      console.error('Error sending verification email:', err);
    }

    res.status(201).json({ message: 'User registered, please verify your email.' });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({ error: 'Validation failed', details: error.message });
    } else {
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  }
});

// Verify email route
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Update isVerified using findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { isVerified: true },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      console.log('User not found for ID:', decoded.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User successfully verified:', updatedUser);
    res.json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Error during email verification:', error.message);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});


// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Login request:', { email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ error: 'User not found' });
    }
    if (!user.isVerified) {
      console.log('User not verified');
      return res.status(400).json({ error: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password incorrect');
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});


// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    sendPasswordResetEmail(email, resetToken);
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reset link' });
  }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.resetToken !== token || user.resetTokenExpiration < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
