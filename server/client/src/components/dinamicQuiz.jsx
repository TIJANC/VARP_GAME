import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './dinamicQuiz.css';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [rewards, setRewards] = useState(null);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedExp, setEarnedExp] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('/api/dinamicQuiz/generate-questions');
        if (response.data.questions && response.data.questions.length > 0) {
          setQuestions(response.data.questions);
        } else {
          setError('No questions available.');
        }
      } catch (error) {
        setError('Failed to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswer = (selectedAnswer) => {
    setAnsweredQuestions((prev) => prev + 1);
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore((prev) => prev + 1);
    }
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      endQuiz();
    }
  };

  // End quiz function that calls rewards.
  const endQuiz = () => {
    setQuizCompleted(true);
    sendReward();
  };

  useEffect(() => {
    if (quizCompleted) {
      sendReward();
    }
  }, [quizCompleted]);

  const sendReward = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending rewards:', { correctAnswers: score, answeredQuestions });
      const response = await axios.post(
        '/api/player/reward',
        { correctAnswers: score, answeredQuestions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRewards(response.data);
      setEarnedCoins(score * 2); // 2 coins per correct answer
      setEarnedExp(score * 5); // 5 EXP per correct answer
    } catch (error) {
      console.error('Error sending reward:', error);
    }
  };

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="relative">
      {/* End Quiz Button outside quiz-container */}
      <button 
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all"
        onClick={endQuiz}
      >
        End Quiz
      </button>
      <div className="quiz-container">
        {!quizCompleted ? (
          questions.length > 0 && currentQuestion < questions.length ? (
            <div>
              <h3>{questions[currentQuestion].question}</h3>
              <div className="quiz-responses">
                {questions[currentQuestion].options.map((option, index) => (
                  <button key={index} onClick={() => handleAnswer(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : null
        ) : (
          <div className="quiz-over">
            <h2>Quiz Over! Your score is {score}/{currentQuestion}.</h2>
            {rewards && (
              <div className="reward-container">
                <h3>Rewards Earned:</h3>
                <p>Coins Earned: {earnedCoins}</p>
                <p>EXP Earned: {earnedExp}</p>
              </div>
            )}
            <button className="home-button" onClick={() => window.location.href = '/home'}>
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
