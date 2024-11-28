import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WhackAVirus.css';

const WhackAVirus = () => {
  const [grid, setGrid] = useState(Array(9).fill(false)); // 9 holes
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds
  const navigate = useNavigate();

  useEffect(() => {
    const gameInterval = setInterval(() => {
      const newGrid = Array(9).fill(false);
      const randomIndex = Math.floor(Math.random() * 9);
      newGrid[randomIndex] = true;
      setGrid(newGrid);
    }, 800); // Virus appears every 800ms

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000); // Countdown timer

    return () => {
      clearInterval(gameInterval);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft]);

  const handleWhack = (index) => {
    if (grid[index]) {
      setScore((prev) => prev + 1);
      setGrid((prev) => {
        const newGrid = [...prev];
        newGrid[index] = false;
        return newGrid;
      });
    }
  };

  const endGame = async () => {
    alert(`Game over! Your score: ${score}`);
    try {
      const token = localStorage.getItem('token');
      const expReward = score * 2; // 2 EXP per virus
      const coinReward = Math.floor(score / 2); // 1 coin per 2 viruses
      await axios.post(
        '/api/player/reward',
        { expReward, coinReward },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`You earned ${expReward} EXP and ${coinReward} coins!`);
    } catch (error) {
      console.error('Error granting rewards:', error);
      alert('Failed to grant rewards. Please try again.');
    }
    navigate('/home'); // Redirect to home page
  };

  return (
    <div className="whack-a-virus">
      <h1>Whack-a-Virus</h1>
      <p>Time Left: {timeLeft}s</p>
      <p>Score: {score}</p>
      <div className="grid">
        {grid.map((virus, index) => (
          <div
            key={index}
            className={`hole ${virus ? 'virus' : ''}`}
            onClick={() => handleWhack(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default WhackAVirus;
