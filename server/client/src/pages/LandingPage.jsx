import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCoins, FaMedal, FaPlay, FaQuestionCircle } from 'react-icons/fa';
import { GiCardPick } from 'react-icons/gi';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0A1F3B] to-[#152C4F] text-[#C5C6C7]">
      {/* Main wrapper with a dark, navy gradient background and light text */}

      {/* Sticky Navigation (dark navy with slight opacity) */}
      <motion.nav
        className="fixed top-0 left-0 w-full flex justify-between items-center p-4 shadow-lg bg-[#0A1F3B] bg-opacity-90 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-m sm:text-2xl md:text-3xl font-bold text-[#66FCF1]">Vaccine Quest</h1>
        <div className="flex space-x-4">
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-[#45A29E] text-white rounded hover:bg-[#66FCF1] hover:text-[#0A1F3B] transition"
            >
              Login
            </motion.button>
          </Link>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 border border-[#45A29E] text-[#45A29E] rounded hover:bg-[#66FCF1] hover:text-[#0A1F3B] transition"
            >
              Sign Up
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section with the new background image overlay */}
      <section className="relative flex flex-col items-center justify-center h-screen text-center px-6 pt-20 bg-[url('/BG/bg.jpg')] bg-cover bg-center bg-no-repeat">
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Hero content (positioned above overlay) */}
        <div className="relative z-10">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4 text-[#66FCF1]"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Embark on the Ultimate Vaccine Quest!
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 text-gray-200"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Earn XP, collect coins, and build your arsenal of vaccine and virus cards.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Link to="/signup">
              <button className="px-8 py-4 bg-[#45A29E] text-white rounded-full text-lg flex items-center justify-self-center space-x-3 hover:bg-[#66FCF1] hover:text-[#0A1F3B] transition">
                <FaPlay />
                <span>Start Adventure</span>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Gamified Features Section */}
      <section className="py-16 bg-[#0B0C10]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            className="text-4xl font-bold text-center text-[#66FCF1] mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Your Adventure Awaits
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dynamic Quiz */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-[#0A1F3B] to-[#152C4F] p-8 rounded-lg shadow-lg text-center"
            >
              <FaQuestionCircle className="text-6xl text-[#66FCF1] mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-2 text-[#66FCF1]">Dynamic Quiz</h3>
              <p className="mb-4 text-gray-200">Answer challenging questions to earn XP and coins!</p>
              <Link to="/signup">
                <button className="px-4 py-2 bg-[#45A29E] text-white rounded hover:bg-[#66FCF1] hover:text-[#0A1F3B] transition">
                  Play Now
                </button>
              </Link>
            </motion.div>
            {/* Card Collection */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-[#0A1F3B] to-[#152C4F] p-8 rounded-lg shadow-lg text-center"
            >
              <GiCardPick className="text-6xl text-[#45A29E] mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-2 text-[#66FCF1]">Card Collection</h3>
              <p className="mb-4 text-gray-200">Collect stunning vaccine and virus cards to power up your deck.</p>
              <Link to="/signup">
                <button className="px-4 py-2 bg-[#45A29E] text-white rounded hover:bg-[#66FCF1] hover:text-[#0A1F3B] transition">
                  Explore Collection
                </button>
              </Link>
            </motion.div>
            {/* Battle Friends */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-[#0A1F3B] to-[#152C4F] p-8 rounded-lg shadow-lg text-center"
            >
              <FaMedal className="text-6xl text-[#66FCF1] mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-2 text-[#66FCF1]">Battle Friends</h3>
              <p className="mb-4 text-gray-200">Challenge friends in epic card battles and climb the leaderboards!</p>
              <Link to="/signup">
                <button className="px-4 py-2 bg-[#45A29E] text-white rounded hover:bg-[#66FCF1] hover:text-[#0A1F3B] transition">
                  Battle Now
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call-To-Action Section */}
      <section className="py-16 bg-gradient-to-r from-[#152C4F] to-[#0A1F3B] text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2
            className="text-4xl font-bold text-[#66FCF1] mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Join the Adventure Today!
          </motion.h2>
          <motion.p
            className="text-xl mb-8 text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Sign up now and become a Vaccine Champion.
          </motion.p>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-4 bg-[#45A29E] text-white rounded-full text-lg hover:bg-[#66FCF1] hover:text-[#0A1F3B] transition"
            >
              Sign Up Now
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#0B0C10] text-center">
        <p className="text-gray-500">
          &copy; {new Date().getFullYear()} VirtHuLab. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
