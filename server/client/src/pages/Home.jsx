import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ActionNavbar from '../components/ActionNavbar';

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    coins: 0,
    exp: 0,
    currentLevel: 'noob',
    nextLevelExp: 100,
  });
  const [userInfo, setUserInfo] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user information:', error);
        alert('Error fetching user information. Please log in again.');
      }
    };

    fetchUserInfo();

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

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

    fetchUserData();
    fetchLeaderboard();
  }, [navigate]);

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto bg-white shadow-md p-8">
        {/* Centered avatar image without border */}
        <img
          src={userInfo.avatar || 'default-avatar.png'}
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

            {/* Play Quiz Button */}
            <div className="flex justify-center my-6">
              <button
                className="px-6 py-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
                onClick={() => navigate('/games/dinamic-quiz')}
              >
                Play Quiz
              </button>
            </div>

            {/* Leaderboard */}
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
