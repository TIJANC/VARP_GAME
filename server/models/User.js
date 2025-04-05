const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Card schema
const cardSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  price: { type: Number },
  task: { type: String },
  quantity: { type: Number, default: 0 },
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
  coins: { type: Number, default: 0 }, // Use Number for numeric values
  exp: { type: Number, default: 0 },
  currentLevel: { type: String, default: 'noob' },
  nextLevelExp: { type: Number, default: 5000 },
  status: { type: String, required: false },
  cards: { type: [cardSchema], default: [] }, // Cards array
  deck: {
    vaccines: { type: [Number], default: [] }, // storing vaccine card IDs
    viruses: { type: [Number], default: [] }    // storing virus card IDs
  },
  resetToken: String,
  resetTokenExpiration: Date,
  answeredQuestions: { type: Number, default: 0 }, // Tracks total answered questions
  correctAnswers: { type: Number, default: 0 }, // Tracks total correct answers
  lastFreeChestTime: { type: Date, default: null },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);
