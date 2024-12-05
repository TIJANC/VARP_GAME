import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AntibodyCatch.css';

const GRID_SIZE = 10;
const INTERVAL = 500;

const generateRandomPosition = () => ({
  row: Math.floor(Math.random() * GRID_SIZE),
  col: Math.floor(Math.random() * GRID_SIZE),
});

const AntibodyCatch = () => {
  const [antibodyPosition, setAntibodyPosition] = useState({ row: 5, col: 5 });
  const [virusPosition, setVirusPosition] = useState(generateRandomPosition());
  const [toxins, setToxins] = useState([generateRandomPosition()]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const navigate = useNavigate();

  const moveAntibody = (direction) => {
    if (gameOver) return;

    setAntibodyPosition((prevPosition) => {
      let { row, col } = prevPosition;

      if (direction === 'up' && row > 0) row--;
      if (direction === 'down' && row < GRID_SIZE - 1) row++;
      if (direction === 'left' && col > 0) col--;
      if (direction === 'right' && col < GRID_SIZE - 1) col++;

      return { row, col };
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowUp') moveAntibody('up');
    if (e.key === 'ArrowDown') moveAntibody('down');
    if (e.key === 'ArrowLeft') moveAntibody('left');
    if (e.key === 'ArrowRight') moveAntibody('right');
  };

  const moveToxins = () => {
    setToxins((prevToxins) =>
      prevToxins.map((toxin) => {
        const directions = [
          { row: -1, col: 0 },
          { row: 1, col: 0 },
          { row: 0, col: -1 },
          { row: 0, col: 1 },
        ];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];

        let newRow = toxin.row + randomDirection.row;
        let newCol = toxin.col + randomDirection.col;

        // Ensure toxin stays within grid bounds
        if (newRow < 0) newRow = 0;
        if (newRow >= GRID_SIZE) newRow = GRID_SIZE - 1;
        if (newCol < 0) newCol = 0;
        if (newCol >= GRID_SIZE) newCol = GRID_SIZE - 1;

        return { row: newRow, col: newCol };
      })
    );
  };

  const checkCollision = () => {
    // Check if antibody collects the virus
    if (
      antibodyPosition.row === virusPosition.row &&
      antibodyPosition.col === virusPosition.col
    ) {
      setScore((prevScore) => prevScore + 1);
      setVirusPosition(generateRandomPosition());

      // Add a new toxin for every multiple of 10 in the score
      if ((score + 1) % 10 === 0) {
        setToxins((prevToxins) => [...prevToxins, generateRandomPosition()]);
      }
    }

    // Check if antibody hits any toxin
    for (let toxin of toxins) {
      if (antibodyPosition.row === toxin.row && antibodyPosition.col === toxin.col) {
        setGameOver(true);
      }
    }
  };

  const sendReward = async () => {
    try {
      const token = localStorage.getItem('token');
      const reward = Math.floor(score / 2); // Example: 1 coin for every 2 points scored

      const response = await fetch('/api/player/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expReward: reward * 2, // Double the coins for EXP
          coinReward: reward,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`You earned ${reward * 2} EXP and ${reward} Coins!`);
      } else {
        console.error('Failed to grant rewards:', data.error);
        alert('Failed to grant rewards. Please try again later.');
      }
    } catch (error) {
      console.error('Error granting rewards:', error);
      alert('Failed to grant rewards.');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    const gameLoop = setInterval(() => {
      moveToxins();
      checkCollision();
    }, INTERVAL);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      clearInterval(gameLoop);
    };
  }, [antibodyPosition, virusPosition, toxins]);

  const restartGame = () => {
    sendReward(); // Send rewards on game restart
    setAntibodyPosition({ row: 5, col: 5 });
    setVirusPosition(generateRandomPosition());
    setToxins([generateRandomPosition()]);
    setScore(0);
    setGameOver(false);
  };

  const endGame = () => {
    sendReward(); // Send rewards on ending the game
    navigate('/home'); // Navigate back to the home page
  };

  return (
    <div className="antibody-catch-game">
      <h1>Antibody Catch</h1>
      <p>Score: {score}</p>
      <div className="grid">
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const isAntibody = row === antibodyPosition.row && col === antibodyPosition.col;
            const isVirus = row === virusPosition.row && col === virusPosition.col;
            const isToxin = toxins.some((toxin) => toxin.row === row && toxin.col === col);

            return (
              <div
                key={`${row}-${col}`}
                className={`cell ${
                  isAntibody
                    ? 'antibody'
                    : isVirus
                    ? 'virus'
                    : isToxin
                    ? 'toxin'
                    : 'healthy'
                }`}
              ></div>
            );
          })
        )}
      </div>
      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <button onClick={restartGame}>Restart</button>
          <button onClick={endGame}>End Game</button>
        </div>
      )}
    </div>
  );
};

export default AntibodyCatch;
