const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Card schema
const cardSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  price: { type: Number },
  task: { type: String },
  isUnlocked: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  gender: { type: String, required: false },
  age: { type: Number, required: false },
  birthplace: { type: String, required: false },
  scholarity: { type: String, required: false },
  avatar: { type: String, required: false },
  accessories: { type: [String], default: [] }, // Array for multiple accessories
  coins: { type: Number, default: 0 }, // Use Number for numeric values
  exp: { type: Number, default: 0 },
  currentLevel: { type: String, default: 'noob' }, // Default level
  nextLevelExp: { type: Number, default: 100 }, // EXP needed for next level
  status: { type: String, required: false },
  cards: { type: [cardSchema], default: [] }, // Cards array
  resetToken: String,
  resetTokenExpiration: Date,
  // New task progress tracking fields
  taskProgress: {
    profileCompleted: { type: Boolean, default: false }, // For "Complete profile" task
    gamesPlayed: { type: Number, default: 0 }, // For "Play 5 games" task
    gamesWon: { type: Number, default: 0 }, // For "Win 3 games" task
    friendsInvited: { type: Number, default: 0 }, // For "Invite a friend" task
  },
  answeredQuestions: { type: Number, default: 0 }, // Tracks total answered questions
  correctAnswers: { type: Number, default: 0 }, // Tracks total correct answers
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);
