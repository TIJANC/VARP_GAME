const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth.js'); // Import the middleware
const User = require('../models/User'); // Ensure the User model path is correct
const nodemailer = require('nodemailer');
require('dotenv').config();

// Fetch User Profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    // Fetch user data with the required fields
    const user = await User.findById(req.userId).select(
      'username email gender age birthplace scholarity coins exp currentLevel nextLevelExp'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Return the combined data
    res.json({
      username: user.username,
      email: user.email,
      gender: user.gender,
      age: user.age,
      birthplace: user.birthplace,
      scholarity: user.scholarity,
      coins: user.coins,
      exp: user.exp,
      currentLevel: user.currentLevel, // Add current level
      nextLevelExp: user.nextLevelExp, // Add next level EXP
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update User Profile
router.post('/update-profile', authenticateUser, async (req, res) => {
  try {
    const { gender, age, birthplace, scholarity, avatar } = req.body;

    // Validate inputs (if required)
    if (!gender || !age || !birthplace || !scholarity) {
      return res.status(400).json({ error: 'All fields are required to complete the profile.' });
    }

    // Update the user's profile
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        gender,
        age,
        birthplace,
        scholarity,
        avatar, // Allow updating avatar
      },
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user); // Return the updated user
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/avatar-options', authenticateUser, async (req, res) => {
  try {
    // Static list of avatar options
    const avatars = [
      'https://example.com/avatar1.png',
      'https://example.com/avatar2.png',
      'https://example.com/avatar3.png',
      'https://example.com/avatar4.png',
    ];
    res.json({ avatars });
  } catch (error) {
    console.error('Error fetching avatar options:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/unlock-card', authenticateUser, async (req, res) => {
  try {
    const { cardId, method } = req.body;
    console.log('Unlock request received:', { cardId, method }); // Debugging log

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Initialize cards if missing
    if (!user.cards || !Array.isArray(user.cards)) {
      user.cards = [];
    }

    // Check if card exists in user's collection or initialize it
    let card = user.cards.find((c) => c.id === cardId);
    if (!card) {
      const defaultCards = [
        { id: 1, price: 10, isUnlocked: false },
        { id: 2, task: 'Complete profile', isUnlocked: false },
        { id: 3, price: 15, isUnlocked: false },
        { id: 4, task: 'Win 3 games', isUnlocked: false },
        { id: 5, price: 20, isUnlocked: false },
        { id: 6, task: 'Play 5 games', isUnlocked: false },
        { id: 7, price: 25, isUnlocked: false },
        { id: 8, task: 'Invite a friend', isUnlocked: false },
        { id: 9, price: 30, isUnlocked: false },
        { id: 10, task: 'Complete all tasks', isUnlocked: false },
      ];

      card = defaultCards.find((c) => c.id === cardId);
      if (!card) {
        console.error('Invalid card ID:', cardId);
        return res.status(400).json({ error: 'Invalid card ID' });
      }

      user.cards.push(card);
    }

    if (card.isUnlocked) {
      console.log('Card already unlocked:', cardId);
      return res.status(400).json({ error: 'Card already unlocked' });
    }

    if (method === 'coins') {
      if (user.coins < card.price) {
        console.error('Not enough coins to unlock:', { userCoins: user.coins, cardPrice: card.price });
        return res.status(400).json({ error: 'Not enough coins' });
      }
      user.coins -= card.price;
    } else if (method === 'task') {
      // Add specific task validation logic
      const taskRequirements = {
        'Complete profile': user.taskProgress.profileCompleted, // Ensure this is checked
        'Win 3 games': user.taskProgress.gamesWon >= 3,
        'Play 5 games': user.taskProgress.gamesPlayed >= 5,
        'Invite a friend': user.taskProgress.friendsInvited >= 1,
        'Complete all tasks':
          user.taskProgress.profileCompleted &&
          user.taskProgress.gamesWon >= 3 &&
          user.taskProgress.gamesPlayed >= 5 &&
          user.taskProgress.friendsInvited >= 1,
      };

      const taskCompleted = taskRequirements[card.task];
      if (!taskCompleted) {
        return res.status(400).json({ error: `You must complete the task: ${card.task}` });
      }
    } else {
      console.error('Invalid unlock method:', method);
      return res.status(400).json({ error: 'Invalid unlock method' });
    }

    card.isUnlocked = true;

    await user.save();
    res.json({ message: `${card.task ? `Task "${card.task}" completed!` : ''} Card unlocked successfully!`, coins: user.coins });
  } catch (error) {
    console.error('Error unlocking card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/shop', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('coins taskProgress cards');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const defaultCards = [
      { id: 1, name: 'Card 1', unlockMethod: 'coins', price: 10, isUnlocked: false },
      { id: 2, name: 'Card 2', unlockMethod: 'task', task: 'Complete profile', isUnlocked: false },
      { id: 3, name: 'Card 3', unlockMethod: 'coins', price: 15, isUnlocked: false },
      { id: 4, name: 'Card 4', unlockMethod: 'task', task: 'Win 3 games', isUnlocked: false },
      { id: 5, name: 'Card 5', unlockMethod: 'coins', price: 20, isUnlocked: false },
      { id: 6, name: 'Card 6', unlockMethod: 'task', task: 'Play 5 games', isUnlocked: false },
      { id: 7, name: 'Card 7', unlockMethod: 'coins', price: 25, isUnlocked: false },
      { id: 8, name: 'Card 8', unlockMethod: 'task', task: 'Invite a friend', isUnlocked: false },
      { id: 9, name: 'Card 9', unlockMethod: 'coins', price: 30, isUnlocked: false },
      { id: 10, name: 'Card 10', unlockMethod: 'task', task: 'Complete all tasks', isUnlocked: false },
    ];

    // Merge user's cards with default cards
    const mergedCards = defaultCards.map((defaultCard) => {
      const userCard = user.cards?.find((card) => card.id === defaultCard.id);
      return userCard
        ? { ...defaultCard, isUnlocked: userCard.isUnlocked } // Use user's isUnlocked status
        : defaultCard;
    });

    res.json({
      coins: user.coins,
      profileCompleted: user.taskProgress.profileCompleted, // Use the correct field
      cards: mergedCards,
    });
  } catch (error) {
    console.error('Error fetching shop data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reward', authenticateUser, async (req, res) => {
  try {
    const { expReward, coinReward } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Define level progression
    const levels = {
      noob: 100,
      amateur: 200,
      senior: 400,
      veteran: 800,
      master: 1600,
    };

    // Update EXP and Coins
    user.exp += expReward;
    user.coins += coinReward;

    // Determine current level and next level EXP
    let currentLevel = 'noob';
    let nextLevelExp = levels['amateur']; // Start with the second level threshold

    for (const [levelName, expThreshold] of Object.entries(levels)) {
      if (user.exp >= expThreshold) {
        currentLevel = levelName;
      } else {
        nextLevelExp = expThreshold;
        break;
      }
    }

    user.currentLevel = currentLevel;
    user.nextLevelExp = nextLevelExp;

    await user.save();

    res.json({
      message: 'Rewards granted successfully!',
      coins: user.coins,
      exp: user.exp,
      currentLevel: user.currentLevel,
      nextLevelExp: user.nextLevelExp,
    });
  } catch (error) {
    console.error('Error granting rewards:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email provider's service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.APP_PASS,   // App-specific password
  },
});

// Invite route
router.post('/invite', authenticateUser, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Log email details
    console.log('Sending email to:', email);
    console.log('Invited by user:', user.username);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${user.username} invited you to join Vaccine Awareness Platform!`,
      text: `Hello!\n\n${user.username} has invited you to join the Vaccine Awareness Platform!\n\nClick the link below to sign up and start your journey:\n\n${process.env.CLIENT_URL}/signup\n\nBest regards,\nThe Vaccine Awareness Team`,
    };

    console.log('Email options:', mailOptions);

    // Send email
    await transporter.sendMail(mailOptions);

    // Log email success
    console.log('Invitation email sent successfully');

    // Update inviter's task progress
    user.taskProgress.friendsInvited = (user.taskProgress.friendsInvited || 0) + 1;
    await user.save();

    res.status(200).json({ message: 'Invitation sent successfully!' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation. Please try again later.' });
  }
});

  
module.exports = router;
