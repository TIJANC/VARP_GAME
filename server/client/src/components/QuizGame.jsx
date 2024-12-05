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
    hint: 'Vaccines help the immune system recognize and fight diseases.',
    expertAdvice: 'Think about what vaccines do before you get sick.',
  },
  {
    id: 2,
    question: 'Which disease was eradicated worldwide through vaccination?',
    options: [
      'Measles',
      'Polio',
      'Smallpox',
      'Malaria',
    ],
    correctAnswer: 2,
    hint: 'This disease was officially eradicated in 1980.',
    expertAdvice: 'It’s considered one of the greatest medical achievements.',
  },
  {
    id: 3,
    question: 'What type of pathogen do vaccines typically protect against?',
    options: [
      'Viruses and bacteria',
      'Plants',
      'Metals',
      'Fungi only',
    ],
    correctAnswer: 0,
    hint: 'Vaccines target organisms that cause infections.',
    expertAdvice: 'Think about what causes diseases like the flu or tetanus.',
  },
  {
    id: 4,
    question: 'What is herd immunity?',
    options: [
      'When everyone is vaccinated',
      'When most people are immune, protecting others',
      'When no one gets vaccinated',
      'A type of vaccination method',
    ],
    correctAnswer: 1,
    hint: 'It’s about community protection.',
    expertAdvice: 'Focus on how immunity in many can protect the few.',
  },
  {
    id: 5,
    question: 'Which vaccine protects against cervical cancer?',
    options: [
      'Hepatitis B',
      'HPV',
      'Influenza',
      'Measles',
    ],
    correctAnswer: 1,
    hint: 'This vaccine targets a virus linked to cervical cancer.',
    expertAdvice: 'Think about human papillomavirus.',
  },
  {
    id: 6,
    question: 'Which organization oversees global vaccination efforts?',
    options: [
      'CDC',
      'WHO',
      'UNICEF',
      'FDA',
    ],
    correctAnswer: 1,
    hint: 'This organization is a specialized UN agency.',
    expertAdvice: 'It leads international health initiatives.',
  },
  {
    id: 7,
    question: 'What is the interval between two doses of the Pfizer COVID-19 vaccine?',
    options: [
      '1 week',
      '3 weeks',
      '1 month',
      '2 months',
    ],
    correctAnswer: 1,
    hint: 'The recommended schedule ensures effectiveness.',
    expertAdvice: 'This was widely publicized during the pandemic.',
  },
  {
    id: 8,
    question: 'Which country developed the first COVID-19 vaccine?',
    options: [
      'United States',
      'China',
      'Russia',
      'Germany',
    ],
    correctAnswer: 2,
    hint: 'It was named Sputnik V.',
    expertAdvice: 'Think about the first satellite’s name.',
  },
  {
    id: 9,
    question: 'What does "live attenuated vaccine" mean?',
    options: [
      'A vaccine made from weakened pathogens',
      'A vaccine made from dead pathogens',
      'A vaccine with no pathogens',
      'A vaccine for plants',
    ],
    correctAnswer: 0,
    hint: 'It uses a milder form of the virus.',
    expertAdvice: 'It’s "alive" but won’t make you sick.',
  },
  {
    id: 10,
    question: 'Which vaccine is administered orally?',
    options: [
      'Polio',
      'MMR',
      'Hepatitis B',
      'Rabies',
    ],
    correctAnswer: 0,
    hint: 'It’s famous for its drops.',
    expertAdvice: 'Think about childhood vaccination campaigns.',
  },
  {
    id: 11,
    question: 'What age group is prioritized for the influenza vaccine annually?',
    options: [
      'Infants only',
      'Elderly and high-risk groups',
      'Teenagers',
      'Athletes',
    ],
    correctAnswer: 1,
    hint: 'It targets vulnerable populations.',
    expertAdvice: 'Focus on age and health risk.',
  },
  {
    id: 12,
    question: 'Who discovered the first vaccine?',
    options: [
      'Edward Jenner',
      'Louis Pasteur',
      'Alexander Fleming',
      'Marie Curie',
    ],
    correctAnswer: 0,
    hint: 'It was for smallpox.',
    expertAdvice: 'The term "vaccine" comes from Latin for "cow."',
  },
  {
    id: 13,
    question: 'Which of these is NOT a vaccine-preventable disease?',
    options: [
      'Measles',
      'Malaria',
      'Hepatitis B',
      'Polio',
    ],
    correctAnswer: 1,
    hint: 'A vaccine is in development for this disease.',
    expertAdvice: 'It’s mosquito-transmitted.',
  },
  {
    id: 14,
    question: 'What does the acronym "MMR" stand for?',
    options: [
      'Measles, Mumps, Rubella',
      'Malaria, Measles, Rhinovirus',
      'Meningitis, Malaria, Rabies',
      'Monkeypox, Mumps, Rhinovirus',
    ],
    correctAnswer: 0,
    hint: 'It’s a combination vaccine for three diseases.',
    expertAdvice: 'Two of these affect the respiratory system.',
  },
  {
    id: 15,
    question: 'What year was the polio vaccine introduced?',
    options: [
      '1935',
      '1955',
      '1965',
      '1975',
    ],
    correctAnswer: 1,
    hint: 'It was developed by Dr. Jonas Salk.',
    expertAdvice: 'Think post-World War II.',
  },
];
const QuizGame = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [jokers, setJokers] = useState({
    fiftyFifty: true,
    hint: true,
    expert: true,
  });
  const [availableOptions, setAvailableOptions] = useState(
    questions[currentQuestion].options
  );

  const handleAnswer = (selectedOption) => {
    const correctOption = questions[currentQuestion].correctAnswer;

    if (selectedOption === correctOption) {
      setScore((prevScore) => prevScore + 1);
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setAvailableOptions(questions[nextQuestion].options);
      } else {
        handleWin();
      }
    } else {
      handleLose();
    }
  };

  const useFiftyFifty = () => {
    if (!jokers.fiftyFifty) return;
    const correctOption = questions[currentQuestion].correctAnswer;
    const incorrectOptions = availableOptions
      .map((option, index) => (index !== correctOption ? index : null))
      .filter((index) => index !== null);

    const randomIndex = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
    const newOptions = availableOptions.map((option, index) =>
      index === correctOption || index === randomIndex ? option : ''
    );
    setAvailableOptions(newOptions);
    setJokers((prev) => ({ ...prev, fiftyFifty: false }));
  };

  const useHint = () => {
    if (!jokers.hint) return;
    alert(`Hint: ${questions[currentQuestion].hint}`);
    setJokers((prev) => ({ ...prev, hint: false }));
  };

  const useExpertAdvice = () => {
    if (!jokers.expert) return;
    alert(`Expert Advice: ${questions[currentQuestion].expertAdvice}`);
    setJokers((prev) => ({ ...prev, expert: false }));
  };

  const handleWin = async () => {
    setIsGameOver(true);
    alert('Congratulations! You answered all questions correctly!');
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/player/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expReward: 50, coinReward: 25 }),
      });
      alert('You earned 50 EXP and 25 Coins!');
    } catch (error) {
      console.error('Error granting rewards:', error);
      alert('Failed to grant rewards.');
    }
    navigate('/home');
  };

  const handleLose = () => {
    setIsGameOver(true);
    alert('Incorrect answer. Game over!');
    navigate('/home');
  };

  if (isGameOver) {
    return (
      <div className="quiz-game">
        <h1>Game Over</h1>
        <p>Your Final Score: {score}</p>
        <button onClick={() => navigate('/home')}>Go to Home</button>
      </div>
    );
  }

  return (
    <div className="quiz-game">
      <h1>Who Wants to Be a Millionaire?</h1>
      <p>Question {currentQuestion + 1} of {questions.length}</p>
      <h2>{questions[currentQuestion].question}</h2>
      <div className="options">
        {availableOptions.map((option, index) => (
          option && (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="option-button"
            >
              {option}
            </button>
          )
        ))}
      </div>
      <div className="jokers">
        <button
          onClick={useFiftyFifty}
          disabled={!jokers.fiftyFifty}
          className="joker-button"
        >
          50/50
        </button>
        <button
          onClick={useHint}
          disabled={!jokers.hint}
          className="joker-button"
        >
          Hint
        </button>
        <button
          onClick={useExpertAdvice}
          disabled={!jokers.expert}
          className="joker-button"
        >
          Ask the Expert
        </button>
      </div>
    </div>
  );
};

export default QuizGame;