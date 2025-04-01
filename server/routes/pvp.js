const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get available players with valid decks
router.get('/available-players', auth, async (req, res) => {
  try {
    const players = await User.find({
      _id: { $ne: req.user.id },
      'deck.vaccines': { $exists: true, $size: { $gte: 4 } },
      'deck.viruses': { $exists: true, $size: { $gte: 4 } }
    })
    .select('username level deck');
    
    res.json({ players });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Initiate battle with opponent
router.post('/initiate-battle', auth, async (req, res) => {
  try {
    const { opponentId } = req.body;
    const opponent = await User.findById(opponentId);
    
    if (!opponent) {
      return res.status(404).json({ message: 'Opponent not found' });
    }

    res.json({ message: 'Battle initiated', opponentDeck: opponent.deck });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save battle result and send notification
router.post('/battle-result', auth, async (req, res) => {
  try {
    const { opponentId, outcome, battleDetails } = req.body;
    
    // Create notification for opponent
    await Notification.create({
      userId: opponentId,
      type: 'battle_result',
      content: `You were challenged by ${req.user.username}. Battle outcome: ${outcome}`,
      data: battleDetails
    });

    res.json({ message: 'Battle result saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 