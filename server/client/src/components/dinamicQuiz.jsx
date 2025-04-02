import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoMdExit } from "react-icons/io";
import { motion } from 'framer-motion';

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

  // Animation variants
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-white">
        Loading questions...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-red-500">
        {error}
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#0B0C10] text-gray-200 p-4">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-[url('/BG/bg1.jpg')] bg-cover bg-center bg-no-repeat opacity-100"></div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-3xl mx-auto  p-8 rounded-lg">
        {/* End Quiz Button */}
        <motion.button 
          className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={endQuiz}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <IoMdExit className='sm:text-2xl lg:text-3xl'/>
        </motion.button>
        
        {!quizCompleted ? (
          questions.length > 0 && currentQuestion < questions.length ? (
            <div>
              <h3 className="text-2xl font-bold text-[#66FCF1] mb-4">
                {questions[currentQuestion].question}
              </h3>
              <div className={`grid gap-3 ${questions[currentQuestion].questionType === 'obbligatorietà' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.button 
                    key={index} 
                    onClick={() => handleAnswer(option)}
                    className={`px-4 py-2 bg-[#45A29E] text-white rounded 
                      ${questions[currentQuestion].questionType === 'obbligatorietà' 
                        ? 'text-xl font-bold' 
                        : ''}`}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : null
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-[#66FCF1]">
              Quiz Over! Your score is {score}/{answeredQuestions}.
            </h2>
            {rewards && (
              <div className="p-4 bg-gray-800 bg-opacity-80 rounded shadow">
                <h3 className="text-xl font-bold text-[#66FCF1] mb-2">Rewards Earned:</h3>
                <p className="text-lg">Coins Earned: {earnedCoins}</p>
                <p className="text-lg">EXP Earned: {earnedExp}</p>
              </div>
            )}
            <motion.button 
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded"
              onClick={() => window.location.href = '/home'}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Return to Home
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
