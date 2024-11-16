const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth'); 
const path = require('path')

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use client app
app.use(express.static(path.join(__dirname,'/client/dist')));

// Render client for any path
app.get('*', (req, res)=> res.sendFile(path.join(__dirname,'/client/dist/index.html')));

// Database connection
mongoose.connect(process.env.MONGO_URI, {
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes); // Ensure this line is correct

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
