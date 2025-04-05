import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoMdExit } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';

const DinamicQuiz = () => {
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
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

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

  // Typing animation effect
  useEffect(() => {
    if (questions.length > 0 && currentQuestion < questions.length) {
      setIsTypingComplete(false);
      setShowAnswers(false);
      setSelectedAnswer(null);
      setDisplayedText('');
      
      const text = questions[currentQuestion].question;
      let currentChar = 0;
      
      const typingInterval = setInterval(() => {
        if (currentChar <= text.length - 1) {
          setDisplayedText(text.substring(0, currentChar + 1));
          currentChar++;
        } else {
          clearInterval(typingInterval);
          setIsTypingComplete(true);
          setTimeout(() => setShowAnswers(true), 500);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [currentQuestion, questions]);

  const handleAnswer = async (selectedAnswer) => {
    setSelectedAnswer(selectedAnswer);
    setAnsweredQuestions((prev) => prev + 1);
    
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore((prev) => prev + 1);
    }

    // Wait to show correct answer
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Reset states before moving to next question
    setShowAnswers(false);
    setSelectedAnswer(null);
    setDisplayedText('');
    setIsTypingComplete(false);

    // Then move to next question or end quiz
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      endQuiz();
    }
  };

  const endQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      // Calculate rewards based on correct answers (1 coin and 1 exp per correct answer)
      const coinsEarned = score; // 1 coin per correct answer
      const expEarned = score;   // 1 exp per correct answer

      const response = await axios.post('/api/player/reward', {
        correctAnswers: score,
        answeredQuestions: answeredQuestions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRewards(response.data);
      setEarnedCoins(coinsEarned); // Set the coins earned during this quiz
      setEarnedExp(expEarned);     // Set the exp earned during this quiz
      setQuizCompleted(true);
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-2xl text-white">
      Loading questions...
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-2xl text-red-500">
      {error}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#0B0C10] text-gray-200 p-4">
      <div className="absolute inset-0 bg-[url('/BG/bg1.jpg')] bg-cover bg-center bg-no-repeat opacity-100"></div>

      <div className="relative z-10 max-w-3xl mx-auto p-8 rounded-lg">
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
              <h3 className="text-2xl font-bold text-[#66FCF1] mb-4 min-h-[3rem]">
                {displayedText}
                {!isTypingComplete && <span className="animate-pulse">|</span>}
              </h3>

              <AnimatePresence mode="wait">
                {showAnswers && (
                  <div className={`grid gap-3 ${
                    questions[currentQuestion].questionType === 'obbligatorietà' 
                      ? 'grid-cols-2' 
                      : 'grid-cols-1'
                  }`}>
                    {questions[currentQuestion].options.map((option, index) => (
                      <motion.button 
                        key={`${currentQuestion}-${index}`}
                        onClick={() => !selectedAnswer && handleAnswer(option)}
                        className={`px-4 py-2 text-white rounded transition-colors duration-300
                          ${selectedAnswer 
                            ? option === questions[currentQuestion].correctAnswer
                              ? 'bg-green-500'
                              : option === selectedAnswer
                                ? 'bg-red-500'
                                : 'bg-[#45A29E]'
                            : 'bg-[#45A29E] hover:bg-[#66FCF1]'
                          }
                          ${questions[currentQuestion].questionType === 'obbligatorietà' 
                            ? 'text-xl font-bold' 
                            : ''
                          }`}
                        variants={buttonVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        whileHover={!selectedAnswer ? "hover" : {}}
                        whileTap={!selectedAnswer ? "tap" : {}}
                        transition={{ delay: index * 0.2 }}
                        disabled={selectedAnswer !== null}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          ) : null
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-[#66FCF1]">
              Quiz Over! Your score is {score}/{answeredQuestions}
            </h2>
            {rewards && (
              <div className="p-4 bg-gray-800 bg-opacity-80 rounded shadow">
                <h3 className="text-xl font-bold text-[#66FCF1] mb-2">Rewards Earned:</h3>
                <p className="text-lg">Coins Earned: +{earnedCoins} coins</p>
                <p className="text-lg">EXP Earned: +{earnedExp} exp</p>
                <p className="text-lg mt-2">Total Balance:</p>
                <p className="text-lg">Coins: {rewards.coins}</p>
                <p className="text-lg">EXP: {rewards.exp}</p>
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

export default DinamicQuiz;