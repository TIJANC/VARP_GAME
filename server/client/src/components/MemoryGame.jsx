import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MemoryGame.css';

// Custom images
const images = [
  { id: 1, src: '/Images/virus1.png' },
  { id: 2, src: '/Images/Virus2.png' },
  { id: 3, src: '/Images/Doctor1.png' },
  { id: 4, src: '/Images/Hospital.png' },
  { id: 5, src: '/Images/Mask1.png' },
  { id: 6, src: '/Images/Vaccine1.png' },
];

const MemoryGame = () => {
    const navigate = useNavigate(); // React Router's navigation hook
    const [cards, setCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [turns, setTurns] = useState(0);
    const [gameWon, setGameWon] = useState(false);
  
    // Initialize shuffled cards
    useEffect(() => {
      const shuffledCards = [...images, ...images]
        .sort(() => Math.random() - 0.5)
        .map((card) => ({ ...card, isFlipped: false }));
      setCards(shuffledCards);
    }, []);
  
    // Handle card click
    const handleCardClick = (index) => {
      if (selectedCards.length === 2 || matchedCards.includes(cards[index].id)) return;
  
      const newCards = [...cards];
      newCards[index].isFlipped = true;
      setCards(newCards);
      setSelectedCards((prev) => [...prev, { ...newCards[index], index }]);
    };
  
    // Check for a match
    useEffect(() => {
      if (selectedCards.length === 2) {
        const [first, second] = selectedCards;
        if (first.id === second.id) {
          setMatchedCards((prev) => [...prev, first.id]);
        } else {
          setTimeout(() => {
            const newCards = [...cards];
            newCards[first.index].isFlipped = false;
            newCards[second.index].isFlipped = false;
            setCards(newCards);
          }, 1000);
        }
        setTurns((prev) => prev + 1);
        setSelectedCards([]);
      }
    }, [selectedCards, cards]);
  
    // Check if game is won
    useEffect(() => {
      if (matchedCards.length === images.length) {
        setGameWon(true);
        grantRewards();
      }
    }, [matchedCards]);
  
    // Reward the user and redirect
    const grantRewards = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          '/api/player/reward',
          { expReward: 10, coinReward: 5 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert('Congratulations! You won 10 EXP and 5 Coins!');
        setTimeout(() => {
          navigate('/home'); // Redirect to the home page
        }, 2000); // Add a delay before redirection
      } catch (error) {
        console.error('Error granting rewards:', error);
        alert('Failed to grant rewards. Redirecting to the home page.');
        navigate('/home'); // Redirect even if there's an error
      }
    };
  
    return (
      <div className="memory-game">
        <h1>Memory Game</h1>
        <p>Turns: {turns}</p>
        {gameWon && <p className="victory-message">You won the game!</p>}
        <div className="grid">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`card ${card.isFlipped ? 'flipped' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              {card.isFlipped || matchedCards.includes(card.id) ? (
                <img src={card.src} alt="card" />
              ) : (
                <div className="card-back" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default MemoryGame;