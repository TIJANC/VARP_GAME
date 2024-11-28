import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuizGame.css';

const questions = [
  {
    id: 1,
    question: 'What is the purpose of vaccines?',
    options: [
      'To boost immunity against diseases',
      'To cure diseases after infection',
      'To increase blood pressure',
      'To prevent headaches',
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: 'Which of the following is a myth about vaccines?',
    options: [
      'Vaccines can cause autism',
      'Vaccines prevent diseases',
      'Vaccines help achieve herd immunity',
      'Vaccines are tested for safety',
    ],
    correctAnswer: 0,
  },
  {
    id: 3,
    question: 'What is herd immunity?',
    options: [
      'When everyone is vaccinated',
      'When most people are immune, protecting others',
      'When no one gets vaccinated',
      'A type of vaccination method',
    ],
    correctAnswer: 1,
  },
];

const QuizGame = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (selectedOption) => {
    const correctOption = questions[currentQuestion].correctAnswer;

    if (selectedOption === correctOption) {
      setScore((prevScore) => prevScore + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinish = async () => {
    // Reward the player
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/player/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expReward: 10, coinReward: 5 }),
      });
      alert('You earned 10 EXP and 5 Coins!');
    } catch (error) {
      console.error('Error granting rewards:', error);
      alert('Failed to grant rewards.');
    }

    navigate('/home'); // Redirect to home page
  };

  if (isFinished) {
    return (
      <div className="quiz-game">
        <h1>Quiz Complete!</h1>
        <p>Your Score: {score}/{questions.length}</p>
        <button onClick={handleFinish}>Claim Reward and Exit</button>
      </div>
    );
  }

  return (
    <div className="quiz-game">
      <h1>Quiz Game</h1>
      <p>Question {currentQuestion + 1} of {questions.length}</p>
      <h2>{questions[currentQuestion].question}</h2>
      <div className="options">
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className="option-button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizGame;
