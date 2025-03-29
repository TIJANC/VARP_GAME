// models/Trade.js
const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offer: [
    {
      cardId: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  requiredValue: { type: Number, default: 0 }, // how many "points" needed
  status: { type: String, default: 'open', enum: ['open', 'completed', 'canceled'] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trade', tradeSchema);
