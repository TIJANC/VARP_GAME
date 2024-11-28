import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WordScramble.css'

const WordScramble = () => {
  const [scrambledWord, setScrambledWord] = useState('');
  const [originalWord, setOriginalWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Word List
  const wordList = ['vaccine', 'awareness', 'education', 'health', 'medicine'];

  // Scramble the word
  const scrambleWord = (word) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Select and scramble a word on mount
  useEffect(() => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    setOriginalWord(randomWord);
    setScrambledWord(scrambleWord(randomWord));
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userInput.toLowerCase() === originalWord) {
      setMessage('Correct! You unscrambled the word! 🎉');

      // Reward the user
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          '/api/player/reward',
          { expReward: 10, coinReward: 5 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Reward response:', response.data);
        alert(`You earned 10 EXP and 5 coins!`);
        navigate('/home'); // Redirect to home page
      } catch (error) {
        console.error('Error granting rewards:', error);
        setError('Failed to grant rewards. Please try again.');
      }
    } else {
      setMessage('Incorrect. Try again!');
    }
    setUserInput('');
  };

  return (
    <div className="word-scramble">
      <h1>Word Scramble Game</h1>
      <p>Unscramble the word below:</p>
      <h2>{scrambledWord}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Enter your answer"
        />
        <button type="submit">Check</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default WordScramble;
