const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth.js'); // Import the middleware
const User = require('../models/User'); // Ensure the User model path is correct
const nodemailer = require('nodemailer');
require('dotenv').config();

// Fetch User Profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    // Include the avatar field in the selected fields
    const user = await User.findById(req.userId).select(
      'username email gender age birthplace scholarity coins exp avatar currentLevel nextLevelExp'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      username: user.username,
      email: user.email,
      gender: user.gender,
      age: user.age,
      birthplace: user.birthplace,
      scholarity: user.scholarity,
      coins: user.coins,
      exp: user.exp,
      avatar: user.avatar, // Ensure avatar is part of the response
      currentLevel: user.currentLevel,
      nextLevelExp: user.nextLevelExp,
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

    // Validate inputs
    if (!gender || !age || !birthplace || !scholarity) {
      return res.status(400).json({ error: 'All fields are required to complete the profile.' });
    }

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update profile fields
    user.gender = gender;
    user.age = age;
    user.birthplace = birthplace;
    user.scholarity = scholarity;
    user.avatar = avatar;

    // Mark profileCompleted task as true
    user.taskProgress.profileCompleted = true;

    // Save updated user
    await user.save();

    res.json(user); // Return the updated user
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/home', authenticateUser, async (req, res) => {
  try {
    // Include the avatar field in the selected fields
    const user = await User.findById(req.userId).select(
      'username'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      username: user.username,
      avatar: user.avatar, // Ensure avatar is part of the response
    });
  } catch (error) {
    console.error('Error fetching user Username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// unlock-card route
router.post('/unlock-card', authenticateUser, async (req, res) => {
  try {
    const { cardId, method } = req.body;
    console.log('Unlock request received:', { cardId, method });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!Array.isArray(user.cards)) {
      user.cards = [];
    }

    let card = user.cards.find((c) => c.id === cardId);

    const defaultCards = [
      { id: 1, name: 'Card 1', unlockMethod: 'coins', price: 10 },
      { id: 2, name: 'Card 2', unlockMethod: 'task', task: 'Complete profile' },
      { id: 3, name: 'Card 3', unlockMethod: 'coins', price: 15 },
      { id: 4, name: 'Card 4', unlockMethod: 'coins', price: 15 },
      { id: 5, name: 'Card 5', unlockMethod: 'coins', price: 20 },
      { id: 6, name: 'Card 6', unlockMethod: 'coins', price: 20 },
      { id: 7, name: 'Card 7', unlockMethod: 'coins', price: 25 },
      { id: 8, name: 'Card 8', unlockMethod: 'task', task: 'Invite a friend' },
      { id: 9, name: 'Card 9', unlockMethod: 'coins', price: 30 },
      { id: 10, name: 'Card 10', unlockMethod: 'level', requiredLevel: 'noob' },
      { id: 11, name: 'Card 11', unlockMethod: 'level', requiredLevel: 'senior' },
      { id: 12, name: 'Card 12', unlockMethod: 'questions', requiredQuestions: 50 },

      { id: 13, name: 'Card 13', unlockMethod: 'coins', price: 10 },
      { id: 14, name: 'Card 14', unlockMethod: 'task', task: 'Complete profile' },
      { id: 15, name: 'Card 15', unlockMethod: 'coins', price: 15 },
      { id: 16, name: 'Card 16', unlockMethod: 'coins', price: 15 },
      { id: 17, name: 'Card 17', unlockMethod: 'coins', price: 20 },
      { id: 18, name: 'Card 18', unlockMethod: 'coins', price: 20 },
      { id: 19, name: 'Card 19', unlockMethod: 'coins', price: 25 },
      { id: 20, name: 'Card 20', unlockMethod: 'task', task: 'Invite a friend' },
      { id: 21, name: 'Card 21', unlockMethod: 'coins', price: 30 },
      { id: 22, name: 'Card 22', unlockMethod: 'level', requiredLevel: 'senior' },
      { id: 23, name: 'Card 23', unlockMethod: 'level', requiredLevel: 'senior' },
      { id: 24, name: 'Card 24', unlockMethod: 'questions', requiredQuestions: 50 },

    ];

    const defaultCard = defaultCards.find((c) => c.id === cardId);
    if (!defaultCard) {
      return res.status(400).json({ error: 'Invalid card ID' });
    }

    if (!card) {
      // Create a new card entry and add it to the user’s collection
      card = { id: cardId, isUnlocked: false, ...defaultCard };
      user.cards.push(card);
    }

    // **Ensure card is actually locked before unlocking it**
    if (card.isUnlocked) {
      return res.status(400).json({ error: 'Card already unlocked' });
    }

    // 🔹🔹🔹 Validate unlock conditions BEFORE unlocking 🔹🔹🔹

    if (method === 'coins') {
      if (user.coins < defaultCard.price) {
        return res.status(400).json({ error: 'Not enough coins' });
      }
      user.coins -= defaultCard.price;
    } 
    else if (method === 'task') {
      const taskCompleted = {
        'Complete profile': user.taskProgress.profileCompleted,
        'Invite a friend': user.taskProgress.friendsInvited >= 1,
      }[defaultCard.task];

      if (!taskCompleted) {
        return res.status(400).json({ error: `You must complete the task: ${defaultCard.task}` });
      }
    } 
    else if (method === 'level') {
      if (!defaultCard.requiredLevel || user.currentLevel !== defaultCard.requiredLevel) {
        return res.status(400).json({ error: `You need to be level ${defaultCard.requiredLevel} to unlock this card.` });
      }
    } 
    else if (method === 'questions') {
      if (!defaultCard.requiredQuestions || user.answeredQuestions < defaultCard.requiredQuestions) {
        return res.status(400).json({ error: `You need to answer at least ${defaultCard.requiredQuestions} questions to unlock this card.` });
      }
    } 
    else {
      return res.status(400).json({ error: 'Invalid unlock method' });
    }

    // ✅ After passing the unlock condition, unlock the card
    card.isUnlocked = true;
    user.markModified('cards'); // Ensure MongoDB updates the array
    await user.save();

    res.json({ message: 'Card unlocked successfully!', coins: user.coins });
    
  } catch (error) {
    console.error('Error unlocking card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/shop', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('coins taskProgress cards currentLevel answeredQuestions');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const defaultCards = [
      { id: 1, name: 'Card 1', unlockMethod: 'coins', price: 10 },
      { id: 2, name: 'Card 2', unlockMethod: 'task', task: 'Complete profile' },
      { id: 3, name: 'Card 3', unlockMethod: 'coins', price: 15 },
      { id: 4, name: 'Card 4', unlockMethod: 'coins', price: 15 },
      { id: 5, name: 'Card 5', unlockMethod: 'coins', price: 20 },
      { id: 6, name: 'Card 6', unlockMethod: 'coins', price: 20 },
      { id: 7, name: 'Card 7', unlockMethod: 'coins', price: 25 },
      { id: 8, name: 'Card 8', unlockMethod: 'task', task: 'Invite a friend' },
      { id: 9, name: 'Card 9', unlockMethod: 'coins', price: 30 },
      { id: 10, name: 'Card 10', unlockMethod: 'level', requiredLevel: 'noob' },
      { id: 11, name: 'Card 11', unlockMethod: 'level', requiredLevel: 'senior' },
      { id: 12, name: 'Card 12', unlockMethod: 'questions', requiredQuestions: 50 },

      { id: 13, name: 'Card 13', unlockMethod: 'coins', price: 10 },
      { id: 14, name: 'Card 14', unlockMethod: 'task', task: 'Complete profile' },
      { id: 15, name: 'Card 15', unlockMethod: 'coins', price: 15 },
      { id: 16, name: 'Card 16', unlockMethod: 'coins', price: 15 },
      { id: 17, name: 'Card 17', unlockMethod: 'coins', price: 20 },
      { id: 18, name: 'Card 18', unlockMethod: 'coins', price: 20 },
      { id: 19, name: 'Card 19', unlockMethod: 'coins', price: 25 },
      { id: 20, name: 'Card 20', unlockMethod: 'task', task: 'Invite a friend' },
      { id: 21, name: 'Card 21', unlockMethod: 'coins', price: 30 },
      { id: 22, name: 'Card 22', unlockMethod: 'level', requiredLevel: 'senior' },
      { id: 23, name: 'Card 23', unlockMethod: 'level', requiredLevel: 'senior' },
      { id: 24, name: 'Card 24', unlockMethod: 'questions', requiredQuestions: 50 },

    ];

    // Create a merged list of cards with the user's unlock status
    const mergedCards = defaultCards.map((defaultCard) => {
      const userCard = user.cards?.find((card) => card.id === defaultCard.id);
      return {
        ...defaultCard,
        isUnlocked: userCard?.isUnlocked || false, // Ensure proper unlock state
      };
    });    

    res.json({
      coins: user.coins,
      profileCompleted: user.taskProgress.profileCompleted,
      currentLevel: user.currentLevel,
      answeredQuestions: user.answeredQuestions,
      cards: mergedCards,
    });
  } catch (error) {
    console.error('Error fetching shop data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reward', authenticateUser, async (req, res) => {
  try {
    let { correctAnswers, answeredQuestions } = req.body;

    console.log('Received data:', { correctAnswers, answeredQuestions });

    // Ensure values are numbers, default to 0 if missing
    correctAnswers = Number(correctAnswers) || 0;
    answeredQuestions = Number(answeredQuestions) || 0;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Define level progression
    const levels = { noob: 100, amateur: 200, senior: 400, veteran: 800, master: 1600 };

    // Calculate rewards
    const expReward = correctAnswers * 5;
    const coinReward = correctAnswers * 2;

    // Update user stats
    user.exp += expReward;
    user.coins += coinReward;
    user.answeredQuestions += answeredQuestions;
    user.correctAnswers += correctAnswers;

    // Determine level progression
    let currentLevel = 'noob';
    let nextLevelExp = levels['amateur'];

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
      answeredQuestions: user.answeredQuestions,
      correctAnswers: user.correctAnswers,
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

router.get('/leaderboard', authenticateUser, async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('username exp currentLevel') // Include relevant fields
      .sort({ exp: -1 }) // Sort by `exp` in descending order
      .limit(10); // Optionally limit to top 10 users

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  
module.exports = router;
