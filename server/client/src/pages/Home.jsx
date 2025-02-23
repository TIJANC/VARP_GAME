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
  const [userInfo, setUserInfo] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    <div className="home-wrapper">
      <div className="home-container">
        <img
          style={{
            backgroundImage: `url(${userInfo.avatar || ''})`,
          }}
          className={`immagine ${
            userInfo.avatar?.endsWith('Run.png')
              ? 'sprite-ru'
              : userInfo.avatar?.endsWith('Attack1.png')
              ? 'sprite-attac'
              : 'sprite-disguis'
          }`}
        />
        <strong>{userInfo.username || 'Not provided'}</strong>
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

            {/* Play Quiz Button Instead of Dropdown */}
            <div className="play-quiz-container">
              <button className="play-quiz-button" onClick={() => navigate('/games/dinamic-quiz')}>
                Play Quiz
              </button>
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

        <ActionNavbar/>
      </div>
    </div>
  );
};

export default Home;
