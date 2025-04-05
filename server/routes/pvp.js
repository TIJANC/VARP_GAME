const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get available players with valid decks
router.get('/available-players', auth, async (req, res) => {
  try {

    if (!req.userId) {
      console.error('No authenticated user ID found');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find players with decks, using req.userId instead of req.user._id
    const players = await User.find({
      _id: { $ne: req.userId } // Changed from req.user._id to req.userId
    })
    .select('username level deck')
    .lean();


    // Filter players with valid decks
    const validPlayers = players.filter(player => {
      const hasValidDeck = player && 
                          player.deck && 
                          Array.isArray(player.deck.vaccines) && 
                          Array.isArray(player.deck.viruses) && 
                          player.deck.vaccines.length >= 4 && 
                          player.deck.viruses.length >= 4;
      
      return hasValidDeck;
    });

    
    return res.json({ players: validPlayers });
  } catch (err) {
    console.error('Error in available-players:', err);
    return res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
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
    
    // Get the username of the current user
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create notification with the updated schema
    await Notification.create({
      userId: opponentId,
      type: 'battle_result',
      title: 'New Battle Result',
      content: `You were challenged by ${currentUser.username}`,
      battleData: {
        opponentName: currentUser.username,
        playerHits: battleDetails.opponentHits,
        opponentHits: battleDetails.playerHits,
        outcome: outcome,
        timestamp: new Date()
      },
      read: false
    });

    res.json({ message: 'Battle result saved' });
  } catch (err) {
    console.error('Error saving battle result:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route before the GET /notifications route
router.post('/notifications', auth, async (req, res) => {
  try {
    const { userId, type, title, content, tradeData, battleData } = req.body;
    
    const notification = await Notification.create({
      userId,
      type,
      title,
      content,
      tradeData,    // For trade notifications
      battleData,   // For battle notifications (if needed in the future)
      read: false
    });

    res.json(notification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/notifications/:id', auth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 