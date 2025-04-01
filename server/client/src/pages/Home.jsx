import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ActionNavbar from '../components/ActionNavbar';
import { FaMedal, FaCoins } from 'react-icons/fa';
import { GiUpgrade } from "react-icons/gi";
import ChestOpeningAnimation from './ChestAnimation';
import { motion, AnimatePresence, easeIn } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();

  // Existing user data
  const [userData, setUserData] = useState({
    coins: 0,
    exp: 0,
    currentLevel: 'noob',
    nextLevelExp: 100,
  });
  const [userInfo, setUserInfo] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);

  // States for chest messages and drawn card.
  const [chestMessage, setChestMessage] = useState('');
  const [drawnCard, setDrawnCard] = useState(null);

  // Timer state for free chest (in seconds)
  const [freeChestTimer, setFreeChestTimer] = useState(0);
  // State to control premium chest animation.
  const [showPremiumChestAnimation, setShowPremiumChestAnimation] = useState(false);

  // Add a state to store the card data temporarily
  const [storedCardData, setStoredCardData] = useState(null);

  const levelMap = {
    noob: 1,
    amateur: 2,
    senior: 3,
    veteran: 4,
    master: 5,
  };

  // Determine the character image.
  const getCharacterImage = () => {
    if (!userInfo.avatar || !userData.currentLevel) {
      return '/Images/default-avatar.png';
    }
    const levelNumber = levelMap[userData.currentLevel] || 1;
    return `/Characters/${userInfo.avatar}${levelNumber}.png`;
  };

  // Timer effect to count down every second.
  useEffect(() => {
    const interval = setInterval(() => {
      setFreeChestTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to format time as HH:MM:SS.
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/player/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user information:', error);
        alert('Error fetching user information. Please log in again.');
      }
    };

    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/player/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData({
          coins: response.data.coins || 0,
          exp: response.data.exp || 0,
          currentLevel: response.data.currentLevel || 'noob',
          nextLevelExp: response.data.nextLevelExp || 100,
        });

        if (response.data.lastFreeChestTime) {
          const lastTime = new Date(response.data.lastFreeChestTime);
          const elapsed = Date.now() - lastTime.getTime();
          const FIVE_MINUTES = 5 * 60; // in seconds.
          const remaining = Math.max(FIVE_MINUTES - Math.floor(elapsed / 1000), 0);
          setFreeChestTimer(remaining);
        } else {
          setFreeChestTimer(0);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          setError('Error fetching user data. Please try again later.');
        }
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/player/leaderboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchUserInfo();
    fetchUserData();
    fetchLeaderboard();
  }, [navigate]);

  // Premium chest purchase handler
  const buyPremiumChest = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/player/buy-premium-chest',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update user data first
      if (res.data.coinsRemaining !== undefined) {
        setUserData((prev) => ({ ...prev, coins: res.data.coinsRemaining }));
      }
      
      // Then show the animation
      setShowPremiumChestAnimation(true);
      
      // Store the card data to show after animation
      const cardData = {
        message: res.data.message,
        card: res.data.card
      };
      
      return cardData;
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || 'An error occurred buying the premium chest.';
      setChestMessage(errorMessage);
      return null;
    }
  };

  // Callback for premium chest animation completion
  const handlePremiumChestAnimationComplete = async () => {
    setShowPremiumChestAnimation(false);
    if (storedCardData) {
      setChestMessage(storedCardData.message);
      setDrawnCard(storedCardData.card);
      setStoredCardData(null);
    }
  };

  // Handle chest click
  const handleChestClick = async () => {
    if (userData.coins < 50) {
      alert("Not enough coins to buy the premium chest.");
      return;
    }
    
    // Clear previous messages and cards
    setChestMessage('');
    setDrawnCard(null);
    
    // Buy chest and get card data
    const cardData = await buyPremiumChest();
    if (cardData) {
      setStoredCardData(cardData);
    }
  };

  // Helper function to get glow style based on rarity.
  const getGlowStyle = (rarity) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return { boxShadow: '0 0 20px 4px #FFD700' };
      case 'epic':
        return { boxShadow: '0 0 15px 4px #9C27B0' };
      case 'rare':
        return { boxShadow: '0 0 15px 4px #2196F3' };
      case 'common':
      default:
        return { boxShadow: '0 0 10px 4px #9E9E9E' };
    }
  };

  // Modal opening animation variants.
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', ease: "easeIn", stiffness: 300, damping: 20 } },
    exit: { opacity: 0, scale: 0, transition: { duration: 1 } },
  };
  

  return (
    <div className="relative w-full min-h-screen p-4 overflow-y-auto bg-[#0B0C10]">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[url('/BG/bg4.jpg')] bg-cover bg-center bg-no-repeat opacity-50"></div>
      <div className="absolute inset-0 bg-[#0B0C10] opacity-80"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto bg-transparent shadow-md p-8 rounded-lg">
        {/* Top section with stats, character image, and username */}
        <div className="flex flex-col items-center">
          <div className="flex justify-around w-full mt-6">
            <div className="flex flex-col items-center">
              <GiUpgrade className="text-3xl text-[#66FCF1]" />
              <span className="text-lg text-gray-300">Level: {userData.currentLevel}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg text-gray-300">
                EXP: {userData.exp}/{userData.nextLevelExp}
              </span>
              <div className="w-32 bg-gray-800 rounded h-2 mt-1">
                <div
                  className="bg-[#66FCF1] h-2 rounded"
                  style={{ width: `${(userData.exp / userData.nextLevelExp) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <FaCoins className="text-3xl" style={{ color: '#FFD700' }} />
              <span className="text-lg text-gray-300">{userData.coins} Coins</span>
            </div>
          </div>
          <img
            src={getCharacterImage()}
            alt="User Avatar"
            className="w-40 h-40 object-cover mx-auto mt-6"
          />
          <strong className="block text-2xl mt-4 text-[#66FCF1]">
            {userInfo.username || 'Not provided'}
          </strong>
        </div>

        {error ? (
          <div className="text-red-500 mt-2 text-center">{error}</div>
        ) : (
          <>
            <div className="flex justify-center my-6">
              <button
                className="px-6 py-3 bg-[#45A29E] text-white font-bold rounded hover:bg-[#66FCF1] transition"
                onClick={() => navigate('/games/dinamic-quiz')}
              >
                Play Quiz
              </button>
            </div>

            {/* Premium Chest Section with Animation */}
            <div className="mx-4 justify-items-center">
              {showPremiumChestAnimation ? (
                <ChestOpeningAnimation
                  closedChest="/Images/chest_premium.png"
                  openChest="/Images/chest_premium_open.png"
                  onOpenComplete={handlePremiumChestAnimationComplete}
                />
              ) : (
                <div onClick={handleChestClick}>
                  <img
                    src="/Images/chest_premium.png"
                    alt="Premium Chest"
                    className="cursor-pointer w-32 h-32 object-contain"
                  />
                </div>
              )}
              <span className="block mt-2 text-gray-300">Chest 50 coins</span>
            </div>

            {chestMessage && (
              <div className="text-center mb-4">
                <p className="font-semibold text-[#66FCF1]">{chestMessage}</p>
              </div>
            )}
            {drawnCard && (
              <AnimatePresence>
                <motion.div
                  className="fixed inset-0 backdrop-blur-lg flex justify-center items-center p-4 z-50"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={modalVariants}
                  onClick={() => setDrawnCard(null)}
                >
                  <motion.div
                    className="p-4 rounded-lg max-w-xs w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={drawnCard.image}
                      alt={drawnCard.name}
                      className="w-full h-auto object-cover rounded"
                      style={getGlowStyle(drawnCard.rarity)}
                    />
                    <div className="mt-4">
                      <p className="text-center text-white font-bold">{drawnCard.name}</p>
                      <p className="text-center text-gray-300">Rarity: {drawnCard.rarity}</p>
                    </div>
                    <button
                      className="mt-4 w-full px-4 py-2 bg-[#66FCF1] text-[#0B0C10] rounded hover:bg-[#45A29E] transition"
                      onClick={() => setDrawnCard(null)}
                    >
                      Close
                    </button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            )}

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-center text-[#66FCF1]">
                Leaderboard
              </h2>
              <ul className="max-w-md mx-auto mt-4">
                {leaderboard.map((user, index) => (
                  <li
                    key={user._id}
                    className="flex justify-between items-center bg-gray-800 p-2 my-1 rounded"
                  >
                    <span className="font-bold text-[#66FCF1]">#{index + 1}</span>
                    <span className="text-gray-300">{user.username}</span>
                    <span className="text-gray-300">{user.exp} EXP</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <ActionNavbar />
    </div>
  );
};

export default Home;
