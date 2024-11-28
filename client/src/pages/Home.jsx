import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css'

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    coins: 0,
    exp: 0,
    currentLevel: 'noob',
    nextLevelExp: 100,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    async function fetchUserData() {
      try {
        const response = await axios.get('/api/player/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Fetched User Data:', response.data);

        if (response.data) {
          setUserData({
            coins: response.data.coins || 0,
            exp: response.data.exp || 0,
            currentLevel: response.data.currentLevel || 'noob',
            nextLevelExp: response.data.nextLevelExp || 100,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);

        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            navigate('/login'); // Unauthorized
          } else {
            setError('Error fetching user data. Please try again later.');
          }
        } else {
          setError('Network error. Please check your connection.');
        }
      }
    }

    fetchUserData();
  }, [navigate]);

  return (
    <div>
      <h2>Welcome to Vaccine Awareness Platform!</h2>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {/* Level Display */}
          <div className="level-display">
            <h3>Current Level: {userData.currentLevel}</h3>
            <p>
              EXP: {userData.exp}/{userData.nextLevelExp} (Next Level)
            </p>
          </div>

          {/* Experience Bar */}
          <div className="exp-bar">
            <div
              className="exp-progress"
              style={{
                width: `${(userData.exp / userData.nextLevelExp) * 100}%`,
              }}
            ></div>
          </div>

          {/* Coin Display */}
          <div className="coins-display">
            <span>Coins: {userData.coins}</span>
          </div>

          {/* Game Dropdown */}
          <div>
            <label htmlFor="games">Choose a game: </label>
            <select
              id="games"
              onChange={(e) =>
                navigate(`/games/${e.target.value.toLowerCase()}`)
              }
            >
            <option value="memory">Memory Game</option>
            <option value="quiz">Quiz Game</option>
            <option value="word-scramble">Word Scramble Game</option>
            <option value="whack-a-virus">Whack-a-Virus Game</option> 
            <option value="build-vaccine">Build a Vaccine Game</option>
            <option value="trivia-bingo">Trivia Bingo</option>
            </select>
          </div>
        </>
      )}

      {/* Bottom Navbar */}
      <div className="bottom-navbar">
        <button onClick={() => navigate('/shop')}>Shop</button>
        <button onClick={() => navigate('/cardCollection')}>Cards</button>
        <button onClick={() => navigate('/home')}>Home</button>
        <button onClick={() => navigate('/profile')}>Profile</button>
      </div>
    </div>
  );
};

export default Home;
