import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ActionNavbar from '../components/ActionNavbar';
import { FaMedal, FaCoins } from 'react-icons/fa';
import { GiUpgrade } from "react-icons/gi";
import ChestOpeningAnimation from './ChestAnimation';

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

  // State for free chest timer (in seconds)
  const [freeChestTimer, setFreeChestTimer] = useState(0);
  // New state to control the chest animation.
  const [showChestAnimation, setShowChestAnimation] = useState(false);

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

  // Handler to open a free chest.
  const openFreeChest = async () => {
    if (freeChestTimer > 0) return; // Prevent if timer hasn't reached zero.
    // Instead of calling API immediately, we trigger the chest animation.
    setShowChestAnimation(false);
  };

  // Callback triggered when chest animation completes.
  const handleChestAnimationComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/player/open-free-chest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChestMessage(res.data.message);
      setDrawnCard(res.data.card);
      // Reset the timer after a successful open to 5 minutes.
      setFreeChestTimer(300);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setChestMessage(err.response.data.error);
      } else {
        setChestMessage('An error occurred opening the free chest.');
      }
    }
    setShowChestAnimation(false);
  };

  // Handler to buy a premium chest remains unchanged.
  const buyPremiumChest = async () => {
    setChestMessage('');
    setDrawnCard(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/player/buy-premium-chest',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChestMessage(res.data.message);
      setDrawnCard(res.data.card);
      if (res.data.coinsRemaining !== undefined) {
        setUserData((prev) => ({ ...prev, coins: res.data.coinsRemaining }));
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setChestMessage(err.response.data.error);
      } else {
        setChestMessage('An error occurred buying the premium chest.');
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen p-4 overflow-y-auto bg-[#0B0C10]">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[url('/BG/bg4.jpg')] bg-cover bg-center bg-no-repeat opacity-50"></div>
      <div className="absolute inset-0 bg-[#0B0C10] opacity-80"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto bg-transparent shadow-md p-8 rounded-lg">
        {/* Top section with Horizontal Stats, Character Image and Username */}
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
                  style={{
                    width: `${(userData.exp / userData.nextLevelExp) * 100}%`,
                  }}
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

            {/* Chest Images for Free & Premium Chests */}
            <div className="flex justify-center my-6">
              <div className="mx-4 text-center">
                {/* Render ChestOpeningAnimation when ready */}
                {freeChestTimer === 0 ? (
                  showChestAnimation ? (
                    <ChestOpeningAnimation
                      closedChest="/Images/chest_simple.png"
                      openChest="/Images/chest_simple_open.png"
                      onOpenComplete={handleChestAnimationComplete}
                    />
                  ) : (
                    <img
                      src="/Images/chest_simple.png"
                      alt="Free Chest"
                      className="w-32 h-32 object-contain cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setShowChestAnimation(true)}
                    />
                  )
                ) : (
                  <span className="block mt-2 text-gray-300">
                    Available in: {formatTime(freeChestTimer)}
                  </span>
                )}
                {freeChestTimer === 0 && !showChestAnimation && (
                  <span className="block mt-2 text-gray-300">Open Free Chest</span>
                )}
              </div>
              <div className="mx-4 text-center">
                <img
                  src="/Images/chest_premium.png"
                  alt="Premium Chest"
                  className="cursor-pointer w-32 h-32 object-contain hover:scale-105 transition-transform"
                  onClick={buyPremiumChest}
                />
                <span className="block mt-2 text-gray-300">Premium Chest 50 coins</span>
              </div>
            </div>

            {chestMessage && (
              <div className="text-center mb-4">
                <p className="font-semibold text-[#66FCF1]">{chestMessage}</p>
              </div>
            )}
            {drawnCard && (
              <div className="text-center">
                <p className="text-gray-300">You received: {drawnCard.name}</p>
                <p className="text-gray-300">Rarity: {drawnCard.rarity}</p>
                <img
                  src={drawnCard.image}
                  alt={drawnCard.name}
                  className="h-24 mx-auto"
                />
              </div>
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
