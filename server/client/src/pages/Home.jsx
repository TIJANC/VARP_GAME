import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ActionNavbar from '../components/ActionNavbar';

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

  // New states for chest messages and drawn card
  const [chestMessage, setChestMessage] = useState('');
  const [drawnCard, setDrawnCard] = useState(null);

  // Mapping from level name to image number.
  const levelMap = {
    noob: 1,
    amateur: 2,
    senior: 3,
    veteran: 4,
    master: 5,
  };

  // Determine the character image based on user's avatar + level
  const getCharacterImage = () => {
    if (!userInfo.avatar || !userData.currentLevel) {
      return '/Images/default-avatar.png';
    }
    const levelNumber = levelMap[userData.currentLevel] || 1;
    return `/Characters/${userInfo.avatar}${levelNumber}.png`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user info (username, avatar, etc.)
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

    // Fetch user stats (coins, exp, etc.)
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
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          setError('Error fetching user data. Please try again later.');
        }
      }
    };

    // Fetch leaderboard
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

  // ---- NEW: Handler to open a free chest ----
  const openFreeChest = async () => {
    setChestMessage('');
    setDrawnCard(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/player/open-free-chest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChestMessage(res.data.message);
      setDrawnCard(res.data.card);

      // Optionally update user's coins if your free chest also gives coins
      // or if the user gets updated in any other way
      // e.g., fetchUserData() again or setUserData with the new data

    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setChestMessage(err.response.data.error);
      } else {
        setChestMessage('An error occurred opening the free chest.');
      }
    }
  };

  // ---- NEW: Handler to buy a premium chest ----
  const buyPremiumChest = async () => {
    setChestMessage('');
    setDrawnCard(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/player/buy-premium-chest', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChestMessage(res.data.message);
      setDrawnCard(res.data.card);

      // Update user's coins
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
    <div className="w-full min-h-screen bg-gray-100 p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto bg-white shadow-md p-8">
        <img
          src={getCharacterImage()}
          alt="User Avatar"
          className="w-40 h-40 object-cover mx-auto"
        />
        <strong className="block text-xl mt-4">
          {userInfo.username || 'Not provided'}
        </strong>

        {error ? (
          <div className="text-red-500 mt-2">{error}</div>
        ) : (
          <>
            <div className="text-center mt-4">
              <h3 className="text-2xl font-semibold">
                Current Level: {userData.currentLevel}
              </h3>
              <p className="mt-2">
                EXP: {userData.exp}/{userData.nextLevelExp} (Next Level)
              </p>
            </div>

            <div className="w-full bg-gray-200 rounded h-4 my-4">
              <div
                className="bg-blue-500 h-4 rounded"
                style={{ width: `${(userData.exp / userData.nextLevelExp) * 100}%` }}
              ></div>
            </div>

            <div className="text-center text-lg">
              <span>Coins: {userData.coins}</span>
            </div>

            {/* Button to go to dynamic quiz */}
            <div className="flex justify-center my-6">
              <button
                className="px-6 py-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
                onClick={() => navigate('/games/dinamic-quiz')}
              >
                Play Quiz
              </button>
            </div>

            {/* NEW: Free chest + Premium chest buttons */}
            <div className="flex justify-center my-6">
              <button
                onClick={openFreeChest}
                className="mr-4 px-6 py-3 bg-green-500 text-white font-bold rounded hover:bg-green-600"
              >
                Open Free Chest
              </button>
              <button
                onClick={buyPremiumChest}
                className="px-6 py-3 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600"
              >
                Buy Premium Chest (50 coins)
              </button>
            </div>

            {/* Show message / card draw results */}
            {chestMessage && (
              <div className="text-center mb-4">
                <p className="font-semibold">{chestMessage}</p>
              </div>
            )}
            {drawnCard && (
              <div className="text-center">
                <p>You received: {drawnCard.name}</p>
                <p>Rarity: {drawnCard.rarity}</p>
                <img
                  src={drawnCard.image}
                  alt={drawnCard.name}
                  style={{ height: '100px', margin: '0 auto' }}
                />
              </div>
            )}

            {/* Leaderboard Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-center">Leaderboard</h2>
              <ul className="max-w-md mx-auto mt-4">
                {leaderboard.map((user, index) => (
                  <li
                    key={user._id}
                    className="flex justify-between items-center bg-gray-100 p-2 my-1 rounded"
                  >
                    <span className="font-bold">#{index + 1}</span>
                    <span>{user.username}</span>
                    <span>{user.exp} EXP</span>
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
