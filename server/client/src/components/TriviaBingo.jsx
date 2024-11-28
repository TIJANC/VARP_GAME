import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TriviaBingo.css';

const TriviaBingo = () => {
  const [bingoCard, setBingoCard] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const navigate = useNavigate();

  const questions = [
    { id: 1, question: 'What is the capital of France?', answer: 'Paris' },
    { id: 2, question: 'What is 5 + 7?', answer: '12' },
    { id: 3, question: 'Who wrote "Hamlet"?', answer: 'Shakespeare' },
    { id: 4, question: 'What planet is known as the Red Planet?', answer: 'Mars' },
    { id: 5, question: 'What is the largest ocean on Earth?', answer: 'Pacific' },
    { id: 6, question: 'What is the chemical symbol for water?', answer: 'H2O' },
    { id: 7, question: 'Who painted the Mona Lisa?', answer: 'Da Vinci' },
    { id: 8, question: 'What year did World War II end?', answer: '1945' },
    { id: 9, question: 'How many continents are there?', answer: '7' },
  ];

  useEffect(() => {
    generateBingoCard();
  }, []);

  const generateBingoCard = () => {
    const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
    setBingoCard(
      shuffledQuestions.slice(0, 9).map((q, index) => ({
        ...q,
        isMarked: false,
        position: index,
      }))
    );
  };

  const checkBingo = async () => {
    const rows = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ];
    const cols = [
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
    ];
    const diagonals = [
      [0, 4, 8],
      [2, 4, 6],
    ];

    const isBingo = [...rows, ...cols, ...diagonals].some((pattern) =>
      pattern.every((pos) => bingoCard[pos].isMarked)
    );

    if (isBingo) {
      setMessage('🎉 Bingo! You won!');
      setGameWon(true);
      await grantRewards(); // Grant rewards upon winning
    }
  };

  const handleSquareClick = (square) => {
    if (square.isMarked) return; // Skip marked squares
    setSelectedSquare(square);
    setMessage('');
  };

  const handleSubmitAnswer = () => {
    if (!selectedSquare) return;

    if (answer.trim().toLowerCase() === selectedSquare.answer.toLowerCase()) {
      setBingoCard((prev) =>
        prev.map((sq) =>
          sq.id === selectedSquare.id ? { ...sq, isMarked: true } : sq
        )
      );
      setMessage('Correct! Square marked.');
      checkBingo();
    } else {
      setMessage('Wrong answer. Try again!');
    }

    setAnswer('');
    setSelectedSquare(null);
  };

  const grantRewards = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/player/reward',
        { expReward: 20, coinReward: 10 }, // Customize rewards as needed
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Congratulations! You earned 20 EXP and 10 Coins!');
      setTimeout(() => {
        navigate('/home'); // Redirect to the home page
      }, 2000); // Delay before redirection
    } catch (error) {
      console.error('Error granting rewards:', error);
      alert('Failed to grant rewards. Redirecting to the home page.');
      navigate('/home'); // Redirect even if there's an error
    }
  };

  return (
    <div className="trivia-bingo">
      <h1>Trivia Bingo</h1>
      <div className="bingo-grid">
        {bingoCard.map((square) => (
          <div
            key={square.id}
            className={`bingo-square ${square.isMarked ? 'marked' : ''}`}
            onClick={() => handleSquareClick(square)}
          >
            <p>{square.isMarked ? '✔️' : square.question}</p>
          </div>
        ))}
      </div>

      {selectedSquare && !gameWon && (
        <div className="answer-box">
          <h3>Question: {selectedSquare.question}</h3>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer"
          />
          <button onClick={handleSubmitAnswer}>Submit</button>
        </div>
      )}

      {message && <p className="message">{message}</p>}
      <button onClick={generateBingoCard} className="restart-btn">
        Restart Game
      </button>
    </div>
  );
};

export default TriviaBingo;
