// routes/player.js (example name)
const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth.js');
const User = require('../models/User');
const { cardsData } = require('../utils/cardsData.js');
const nodemailer = require('nodemailer');
const { pickCard } = require('../utils/pickCard');
const rarityToPoints = require('../utils/rarityToPoints.js');
const Trade = require('../models/Trade')

require('dotenv').config();

// Fetch User Profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
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
      avatar: user.avatar,
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

    if (!gender || !age || !birthplace || !scholarity) {
      return res.status(400).json({ error: 'All fields are required to complete the profile.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.gender = gender;
    user.age = age;
    user.birthplace = birthplace;
    user.scholarity = scholarity;
    user.avatar = avatar;

    // Previously we had: user.taskProgress.profileCompleted = true;
    // Now removed, since taskProgress no longer exists.

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/home', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username avatar');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      username: user.username,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error('Error fetching user Username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /shop
router.get('/shop', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      'coins cards currentLevel answeredQuestions'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Merge the default card definitions from cardsData with the user's inventory
    const mergedCards = cardsData.map((defaultCard) => {
      const userCard = user.cards?.find((uc) => uc.id === defaultCard.id);
      const quantity = userCard ? userCard.quantity : 0;
      const isUnlocked = quantity > 0;

      return {
        ...defaultCard,
        quantity,
        isUnlocked,
      };
    });

    // Removed: profileCompleted from response
    res.json({
      coins: user.coins,
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
    correctAnswers = Number(correctAnswers) || 0;
    answeredQuestions = Number(answeredQuestions) || 0;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const levels = { noob: 100, amateur: 200, senior: 400, veteran: 800, master: 1600 };

    const expReward = correctAnswers * 5;
    const coinReward = correctAnswers * 2;

    user.exp += expReward;
    user.coins += coinReward;
    user.answeredQuestions += answeredQuestions;
    user.correctAnswers += correctAnswers;

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

// Mail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASS,
  },
});

// Route to post users deck
router.post('/deck', authenticateUser, async (req, res) => {
  try {
    const { vaccines, viruses } = req.body.deck;
    if (!Array.isArray(vaccines) || !Array.isArray(viruses)) {
      return res.status(400).json({ error: 'Invalid deck format' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.deck = { vaccines, viruses };
    await user.save();

    res.json({ message: 'Deck saved successfully!', deck: user.deck });
  } catch (error) {
    console.error('Error saving deck:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to retrieve the user's deck
router.get('/deck', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('deck');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ deck: user.deck });
  } catch (error) {
    console.error('Error retrieving deck:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

    console.log('Sending email to:', email);
    console.log('Invited by user:', user.username);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${user.username} invited you to join Vaccine Awareness Platform!`,
      text: `Hello!\n\n${user.username} has invited you to join the Vaccine Awareness Platform!\n\nClick the link below to sign up and start your journey:\n\n${process.env.CLIENT_URL}/signup\n\nBest regards,\nThe Vaccine Awareness Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Invitation email sent successfully');

    // Removed: user.taskProgress.friendsInvited

    await user.save();
    res.status(200).json({ message: 'Invitation sent successfully!' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation. Please try again later.' });
  }
});

// Leaderboard
router.get('/leaderboard', authenticateUser, async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('username exp currentLevel')
      .sort({ exp: -1 })
      .limit(10);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Free chest
router.get('/open-free-chest', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (user.lastFreeChestTime) {
      const elapsed = now - user.lastFreeChestTime.getTime();
      if (elapsed < FIVE_MINUTES) {
        const remainingTime = Math.ceil((FIVE_MINUTES - elapsed) / 1000); // in seconds
        return res.status(400).json({
          error: 'You must wait 5 minutes before opening another free chest.',
          remainingTime,
        });
      }
    }

    const drawnCard = pickCard(cardsData);

    const existingCard = user.cards.find((c) => c.id === drawnCard.id);
    if (existingCard) {
      existingCard.quantity += 1;
    } else {
      user.cards.push({ id: drawnCard.id, quantity: 1 });
    }

    user.lastFreeChestTime = new Date();
    await user.save();

    return res.json({
      message: 'Free chest opened!',
      card: drawnCard,
    });
  } catch (error) {
    console.error('Error opening free chest:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Premium chest
router.post('/buy-premium-chest', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const chestCost = 50;
    if (user.coins < chestCost) {
      return res.status(400).json({ error: 'Not enough coins to buy a premium chest.' });
    }

    user.coins -= chestCost;

    const drawnCard = pickCard(cardsData);

    const existingCard = user.cards.find((c) => c.id === drawnCard.id);
    if (existingCard) {
      existingCard.quantity += 1;
    } else {
      user.cards.push({ id: drawnCard.id, quantity: 1 });
    }

    await user.save();

    return res.json({
      message: 'Premium chest opened!',
      card: drawnCard,
      coinsRemaining: user.coins,
    });
  } catch (error) {
    console.error('Error buying premium chest:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/sell-card', authenticateUser, async (req, res) => {
  try {
    console.log('Sell-card request received:', req.body);
    const { cardId } = req.body;

    if (!cardId) {
      console.log('cardId is missing in request body');
      return res.status(400).json({ error: 'cardId is required' });
    }

    // 1) Find the user.
    const user = await User.findById(req.userId);
    if (!user) {
      console.log(`User with ID ${req.userId} not found.`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('User found:', user._id);

    // 2) Find the card in user.cards.
    const userCard = user.cards.find((c) => c.id === cardId);
    if (!userCard) {
      console.log(`User does not own card #${cardId}.`);
      return res.status(400).json({ error: 'You do not own this card.' });
    }
    if (userCard.quantity <= 1) {
      console.log(`Not enough duplicates to sell card #${cardId}. Quantity: ${userCard.quantity}`);
      return res.status(400).json({ error: 'You can only sell duplicates (quantity > 1)' });
    }
    console.log(`User card before selling: ${JSON.stringify(userCard)}`);

    // 3) Determine the card’s rarity.
    const defaultCard = cardsData.find((dc) => dc.id === cardId);
    if (!defaultCard) {
      console.log(`Card definition not found for card #${cardId}`);
      return res.status(400).json({ error: 'Card definition not found.' });
    }
    console.log('Default card found:', defaultCard);

    // Define a reward map based on rarity.
    const rarityToCoin = {
      common: 1,
      rare: 3,
      epic: 5,
      legendary: 10,
    };

    // Normalize the rarity string.
    const cardRarity = defaultCard.rarity ? defaultCard.rarity.toLowerCase() : 'common';
    const sellReward = rarityToCoin[cardRarity] || 1;
    console.log(`Card rarity: ${cardRarity}, Reward: ${sellReward}`);

    // 4) Reduce quantity by 1.
    userCard.quantity -= 1;
    console.log(`New card quantity: ${userCard.quantity}`);

    // 5) Add coins to the user.
    user.coins += sellReward;
    console.log(`User coins after selling: ${user.coins}`);

    await user.save();
    console.log('User data saved successfully.');

    return res.json({
      message: `Sold one duplicate of card #${cardId} for ${sellReward} coin(s).`,
      coins: user.coins,
      updatedQuantity: userCard.quantity,
    });
  } catch (error) {
    console.error('Error selling card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1) GET /active => list all open trades
router.get('/active', authenticateUser, async (req, res) => {
  try {
    const trades = await Trade.find({ status: 'open' })
      .sort({ createdAt: -1 }); // optional: newest first
    res.json({ trades });
  } catch (error) {
    console.error('Error fetching active trades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2) POST /create => create new trade listing
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const { cardId, quantity, requiredValue } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check user has enough duplicates to trade
    const userCard = user.cards.find((c) => c.id === cardId);
    if (!userCard || userCard.quantity < quantity + 1) {
      // If you want them to keep at least 1 copy, 
      // ensure userCard.quantity >= quantity + 1
      return res
        .status(400)
        .json({ error: 'Not enough duplicates to trade or cannot keep at least 1 copy.' });
    }

    // "Lock" those duplicates in the trade listing by removing from user inventory
    userCard.quantity -= quantity;
    await user.save();

    // Create a new trade doc
    const newTrade = await Trade.create({
      ownerId: user._id,
      offer: [{ cardId, quantity }],
      requiredValue,
      status: 'open',
    });

    return res.json({ message: 'Trade created', trade: newTrade });
  } catch (err) {
    console.error('Error creating trade:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /accept => accept trade
router.post('/accept', authenticateUser, async (req, res) => {
  try {
    const { tradeId, offeredCards } = req.body; 
    // offeredCards should be an array like: [ { cardId, quantity }, ... ]

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    if (trade.status !== 'open') {
      return res.status(400).json({ error: 'Trade is not open' });
    }

    // The user trying to accept is "user2"
    const user2 = await User.findById(req.userId);
    if (!user2) return res.status(404).json({ error: 'User not found' });

    // 1) Check user2 has these offeredCards in the correct quantities
    for (let oc of offeredCards) {
      const user2Card = user2.cards.find((c) => c.id === oc.cardId);
      if (!user2Card || user2Card.quantity < oc.quantity) {
        return res.status(400).json({
          error: `You do not have enough copies of card ID ${oc.cardId} to fulfill this trade.`,
        });
      }
    }

    // 2) Sum up the rarity points of the offeredCards
    let offeredValue = 0;
    for (let oc of offeredCards) {
      // find the card in cardsData
      const cardDef = cardsData.find((cd) => cd.id === oc.cardId);
      if (!cardDef) {
        return res.status(400).json({ error: `Card definition not found for ID ${oc.cardId}` });
      }
      // fallback to 'common' if no rarity
      const cardRarity = cardDef.rarity || 'common';
      const points = rarityToPoints[cardRarity] || 1;
      offeredValue += points * oc.quantity;
    }

    // 3) Compare to trade.requiredValue
    if (offeredValue < trade.requiredValue) {
      return res.status(400).json({
        error: `Not enough total value. Required = ${trade.requiredValue}, you offered = ${offeredValue}`,
      });
    }

    // 4) If valid, do the trade
    const owner = await User.findById(trade.ownerId);
    if (!owner) return res.status(404).json({ error: 'Trade owner not found' });

    // (a) user2 gets the trade’s offered card(s)
    trade.offer.forEach((offeredItem) => {
      const user2Card = user2.cards.find((c) => c.id === offeredItem.cardId);
      if (user2Card) {
        user2Card.quantity += offeredItem.quantity;
      } else {
        user2.cards.push({ id: offeredItem.cardId, quantity: offeredItem.quantity });
      }
    });

    // (b) owner gets user2’s offeredCards
    offeredCards.forEach((oc) => {
      const ownerCard = owner.cards.find((c) => c.id === oc.cardId);
      if (ownerCard) {
        ownerCard.quantity += oc.quantity;
      } else {
        owner.cards.push({ id: oc.cardId, quantity: oc.quantity });
      }
    });

    // (c) decrement user2’s inventory for the offeredCards
    offeredCards.forEach((oc) => {
      const user2Card = user2.cards.find((c) => c.id === oc.cardId);
      user2Card.quantity -= oc.quantity;
      // if (user2Card.quantity <= 0) remove it or keep it at 0 if that's your preference
    });

    // Mark trade as completed
    trade.status = 'completed';

    // Save everything
    await owner.save();
    await user2.save();
    await trade.save();

    return res.json({ message: 'Trade completed successfully!' });
  } catch (error) {
    console.error('Error accepting trade:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
