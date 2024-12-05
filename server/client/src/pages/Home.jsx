import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import ActionNavbar from '../components/ActionNavbar';

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    coins: 0,
    exp: 0,
    currentLevel: 'noob',
    nextLevelExp: 100,
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/player/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    <div>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="level-display">
            <h3>Current Level: {userData.currentLevel}</h3>
            <p>
              EXP: {userData.exp}/{userData.nextLevelExp} (Next Level)
            </p>
          </div>

          <div className="exp-bar">
            <div
              className="exp-progress"
              style={{
                width: `${(userData.exp / userData.nextLevelExp) * 100}%`,
              }}
            ></div>
          </div>

          <div className="coins-display">
            <span>Coins: {userData.coins}</span>
          </div>

          <div>
            <label htmlFor="games">Choose a game: </label>
            <select
              id="games"
              onChange={(e) =>
                navigate(`/games/${e.target.value.toLowerCase()}`)
              }
            >
              <option value="">Select a Game</option>
              <option value="memory">Memory Game</option>
              <option value="quiz">Quiz Game</option>
              <option value="word-scramble">Word Scramble Game</option>
              <option value="whack-a-virus">Whack-a-Virus Game</option>
              <option value="build-vaccine">Build a Vaccine Game</option>
              <option value="trivia-bingo">Trivia Bingo</option>
              <option value="infection-chain-breaker">
                Infection Chain Breaker
              </option>
              <option value="antibody-catch">Antibody Catch</option>
            </select>
          </div>

          <div className="leaderboard">
            <h2>Leaderboard</h2>
            <ul>
              {leaderboard.map((user, index) => (
                <li key={user._id} className="leaderboard-item">
                  <span className="leaderboard-rank">#{index + 1}</span>
                  <span className="leaderboard-username">{user.username}</span>
                  <span className="leaderboard-exp">{user.exp} EXP</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <ActionNavbar
        navigate={navigate}
        options={[
          { label: 'Shop', route: '/shop', iconClass: 'la-store' },
          { label: 'Cards', route: '/cardCollection', iconClass: 'la-id-card' },
          { label: 'Home', route: '/home', iconClass: 'la-home' },
          { label: 'Profile', route: '/profile', iconClass: 'la-user' },
          { label: 'Map', route: '/map', iconClass: 'la-map' },
        ]}
      />
    </div>
  );
};

export default Home;
