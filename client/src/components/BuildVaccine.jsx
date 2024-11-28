import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuildVaccine.css';

const BuildVaccine = () => {
  // Fisher-Yates Shuffle Algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initialComponents = shuffleArray([
    { id: 1, name: 'Antigen', type: 'antigen' },
    { id: 2, name: 'Adjuvant', type: 'adjuvant' },
    { id: 3, name: 'Stabilizer', type: 'stabilizer' },
    { id: 4, name: 'Preservative', type: 'preservative' },
  ]);

  const [components, setComponents] = useState(initialComponents);
  const [builder, setBuilder] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const correctOrder = ['antigen', 'adjuvant', 'stabilizer', 'preservative'];

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

    // Calculate rewards
    const expReward = 50;
    const coinReward = 20;

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
      navigate('/home'); // Redirect to home page
    } catch (error) {
      console.error('Error granting rewards:', error);
      alert('Failed to grant rewards. Please try again.');
    }
  };

  const handleReset = () => {
    setComponents(shuffleArray(initialComponents)); // Shuffle components on reset
    setBuilder([]);
    setError('');
  };

  return (
    <div className="build-vaccine">
      <h1>Build a Vaccine</h1>
      <p>Drag and drop the components into the Vaccine Builder in the correct order.</p>
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
      <div className="game-buttons">
        <button onClick={handleSubmit} disabled={builder.length !== correctOrder.length}>
          Submit
        </button>
        <button onClick={handleReset}>Reset Game</button>
      </div>
    </div>
  );
};

export default BuildVaccine;
