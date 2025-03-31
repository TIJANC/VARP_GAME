import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', { username, email, password });
      alert('Signup successful, please check your email to verify your account');
    } catch (error) {
      alert('Signup failed: ' + error.response.data.error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center p-6">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-[url('/BG/bg2.jpg')] bg-cover bg-center bg-no-repeat opacity-50"></div>
      <div className="absolute inset-0 bg-[#0B0C10] opacity-80"></div>

      {/* Main content */}
      <div className="relative z-10 w-full">
        {/* Header */}
        <header className="w-full flex justify-between items-center py-4 px-6">
          <h1 className="text-4xl font-bold text-[#66FCF1]">Vaccine Quest</h1>
          <div className="flex space-x-4">
            <Link to="/login">
              <button className="border-2 border-[#45A29E] text-[#45A29E] px-6 py-2 rounded-lg shadow-md hover:bg-[#66FCF1] hover:text-white transition">
                Login
              </button>
            </Link>
          </div>
        </header>

        {/* Signup Form Container */}
        <motion.div 
          className="max-w-md w-full bg-gradient-to-br from-[#0A1F3B] to-[#152C4F] p-8 rounded-lg shadow-lg mt-12 mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-center text-[#66FCF1] mb-6">Sign Up</h2>
          <form onSubmit={handleSignup} className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 rounded bg-[#0B0C10] text-white border border-[#45A29E] focus:outline-none focus:ring-2 focus:ring-[#66FCF1]"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded bg-[#0B0C10] text-white border border-[#45A29E] focus:outline-none focus:ring-2 focus:ring-[#66FCF1]"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded bg-[#0B0C10] text-white border border-[#45A29E] focus:outline-none focus:ring-2 focus:ring-[#66FCF1]"
            />
            <button 
              type="submit" 
              className="bg-[#45A29E] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#66FCF1] transition"
            >
              Sign Up
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
