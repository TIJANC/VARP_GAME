import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InfectionChainBreaker.css';

const GRID_SIZE = 5;

const generateGrid = () => {
  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      isInfected: false,
      isVaccinated: false,
      isHealthy: true,
    }))
  );

  // Randomly infect 3 cells
  let infectedCount = 0;
  while (infectedCount < 3) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);

    if (!grid[row][col].isInfected) {
      grid[row][col].isInfected = true;
      grid[row][col].isHealthy = false; // Infected cells are not healthy
      infectedCount++;
    }
  }

  return grid;
};

const InfectionChainBreaker = () => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState(generateGrid());
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const vaccinateCell = (row, col) => {
    const cell = grid[row][col];
    if (!cell.isHealthy || cell.isVaccinated) return; // Only healthy cells can be vaccinated

    // Vaccinate the cell
    const newGrid = [...grid];
    newGrid[row][col].isVaccinated = true;
    setGrid(newGrid);
    setMoves((prevMoves) => prevMoves + 1);

    // Trigger infection spread
    spreadInfection(newGrid);
  };

  const spreadInfection = (currentGrid) => {
    const newGrid = [...currentGrid];
    const infectedCells = [];

    // Collect all infected cells
    newGrid.forEach((row, rowIndex) =>
      row.forEach((cell, colIndex) => {
        if (cell.isInfected) {
          infectedCells.push({ row: rowIndex, col: colIndex });
        }
      })
    );

    if (infectedCells.length === 0) return; // No infected cells left to spread

    // Randomly select one infected cell
    const randomInfectedCell = infectedCells[Math.floor(Math.random() * infectedCells.length)];
    const { row, col } = randomInfectedCell;

    // Attempt to infect an adjacent healthy cell
    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ];

    for (const [r, c] of neighbors) {
      if (
        r >= 0 &&
        r < GRID_SIZE &&
        c >= 0 &&
        c < GRID_SIZE &&
        newGrid[r][c].isHealthy &&
        !newGrid[r][c].isVaccinated
      ) {
        newGrid[r][c].isInfected = true;
        newGrid[r][c].isHealthy = false;
        break;
      }
    }

    setGrid(newGrid);
    checkGameOver(newGrid);
  };

  const checkWinCondition = () => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.isHealthy && !cell.isVaccinated) {
          const neighbors = [
            [row - 1, col],
            [row + 1, col],
            [row, col - 1],
            [row, col + 1],
          ];
          const adjacentToInfected = neighbors.some(
            ([r, c]) =>
              r >= 0 &&
              r < GRID_SIZE &&
              c >= 0 &&
              c < GRID_SIZE &&
              grid[r][c].isInfected
          );
          if (adjacentToInfected) {
            return false; // Still vulnerable cells remaining
          }
        }
      }
    }
    return true; // No more vulnerable cells
  };

  const checkGameOver = (currentGrid) => {
    if (checkWinCondition()) {
      setGameWon(true);
      setGameOver(true);
    } else {
      const allCells = currentGrid.flat();
      const healthyCellsRemaining = allCells.some(
        (cell) => cell.isHealthy && !cell.isVaccinated
      );
      const infectedCells = allCells.some((cell) => cell.isInfected);

      if (!healthyCellsRemaining || !infectedCells) {
        setGameOver(true);
      }
    }
  };

  const handleRestart = () => {
    setGrid(generateGrid());
    setMoves(0);
    setGameOver(false);
    setGameWon(false);
  };

  const handleFinish = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/player/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expReward: 20, coinReward: 10 }),
      });
      alert('You earned 20 EXP and 10 Coins!');
    } catch (error) {
      console.error('Error granting rewards:', error);
      alert('Failed to grant rewards.');
    }
    navigate('/home');
  };

  return (
    <div className="infection-chain-breaker">
      <h1>Infection Chain Breaker</h1>
      <p>Moves: {moves}</p>
      <div className="grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${
                cell.isVaccinated
                  ? 'vaccinated'
                  : cell.isInfected
                  ? 'infected'
                  : 'healthy'
              }`}
              onClick={() => vaccinateCell(rowIndex, colIndex)}
            ></div>
          ))
        )}
      </div>
      {gameOver && (
        <div className="game-over">
          {gameWon ? (
            <h2>Congratulations! You stopped the infection!</h2>
          ) : (
            <h2>Game Over! The infection spread too much!</h2>
          )}
          <p>Total Moves: {moves}</p>
          {gameWon && <button onClick={handleFinish}>Claim Reward and Exit</button>}
        </div>
      )}
      <button onClick={handleRestart} className="restart-button">
        Restart Game
      </button>
    </div>
  );
};

export default InfectionChainBreaker;
