import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuildVaccine.css';

const BuildVaccine = () => {
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initialComponents = shuffleArray([
    { id: 1, name: 'Antigen', type: 'antigen', hint: 'The main ingredient to target the virus.' },
    { id: 2, name: 'Adjuvant', type: 'adjuvant', hint: 'Boosts the immune response.' },
    { id: 3, name: 'Stabilizer', type: 'stabilizer', hint: 'Keeps the vaccine effective over time.' },
    { id: 4, name: 'Preservative', type: 'preservative', hint: 'Prevents contamination.' },
  ]);

  const [components, setComponents] = useState(initialComponents);
  const [builder, setBuilder] = useState([]);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60); // 60-second timer
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  const correctOrder = ['antigen', 'adjuvant', 'stabilizer', 'preservative'];

  useEffect(() => {
    if (timer === 0) {
      setGameOver(true);
    }
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleDragStart = (e, component) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedComponent = JSON.parse(e.dataTransfer.getData('component'));
    setError(''); // Clear previous errors
    setBuilder((prev) => [...prev, droppedComponent]);
    setComponents((prev) => prev.filter((c) => c.id !== droppedComponent.id));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const validateBuilder = () => {
    const order = builder.map((item) => item.type);
    if (JSON.stringify(order) === JSON.stringify(correctOrder)) {
      return true;
    }
    setError('Incorrect order! Please try again.');
    return false;
  };

  const handleSubmit = async () => {
    if (!validateBuilder()) return;

    const expReward = timer > 30 ? 50 : 30; // Higher rewards for faster completion
    const coinReward = timer > 30 ? 20 : 10;

    alert('Vaccine successfully built!');
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/player/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expReward, coinReward }),
      });

      alert(`You earned ${expReward} EXP and ${coinReward} coins!`);
      navigate('/home');
    } catch (error) {
      console.error('Error granting rewards:', error);
      alert('Failed to grant rewards. Please try again.');
    }
  };

  const handleReset = () => {
    setComponents(shuffleArray(initialComponents));
    setBuilder([]);
    setError('');
    setTimer(60); // Reset the timer
    setGameOver(false);
  };

  const getHint = () => {
    const nextComponent = builder.length < correctOrder.length
      ? correctOrder[builder.length]
      : null;

    if (nextComponent) {
      const hint = initialComponents.find((c) => c.type === nextComponent)?.hint;
      alert(`Hint: ${hint}`);
    }
  };

  return (
    <div className="build-vaccine">
      <h1>Build a Vaccine</h1>
      <p>Drag and drop the components into the Vaccine Builder in the correct order.</p>
      <p className="timer">Time Left: {timer} seconds</p>
      <div className="game-container">
        <div className="components-container">
          <h3>Components</h3>
          {components.map((component) => (
            <div
              key={component.id}
              className="component"
              draggable
              onDragStart={(e) => handleDragStart(e, component)}
            >
              {component.name}
            </div>
          ))}
        </div>

        <div
          className="vaccine-builder"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <h3>Vaccine Builder</h3>
          {builder.map((item, index) => (
            <div key={index} className="builder-item">
              {item.name}
            </div>
          ))}
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {gameOver && (
        <p className="error">Time’s up! Click Reset to try again.</p>
      )}
      <div className="game-buttons">
        <button
          onClick={handleSubmit}
          disabled={builder.length !== correctOrder.length || gameOver}
        >
          Submit
        </button>
        <button onClick={handleReset}>Reset Game</button>
        <button onClick={getHint} disabled={builder.length >= correctOrder.length || gameOver}>
          Hint
        </button>
      </div>
    </div>
  );
};

export default BuildVaccine;
