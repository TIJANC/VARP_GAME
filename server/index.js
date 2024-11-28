const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const path = require('path');
const playerProfileRoutes = require('./routes/playerProfile'); 

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Middleware to Distinguish API vs. Frontend Requests
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next(); // Proceed to API routes
  }
  next("route"); // Let other routes fall through
});

// Routes
app.use('/api/auth', authRoutes); // Ensure this line is correct
app.use('/api/player', playerProfileRoutes); // Use the route file with a base path

// Serve React Frontend
app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/dist/index.html"));
});

// Fallback for Unhandled API Routes
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  res.status(404).send("Not Found");
});

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
