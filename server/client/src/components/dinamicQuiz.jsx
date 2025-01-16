import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Quiz = () => {
    const [questions, setQuestions] = useState([]); // Initialize as an empty array
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true); // Track loading state
    const [error, setError] = useState(null); // Track error state

    // Fetch questions from the backend
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get('/api/dinamicQuiz/generate-questions');
                console.log('Response data:', response.data); // Log the entire response
                if (response.data.questions && response.data.questions.length > 0) {
                    console.log('Fetched questions:', response.data.questions); // Log fetched questions
                    setQuestions(response.data.questions); // Set the questions array
                } else {
                    console.warn('No questions available'); // Log warning if no questions
                    setError('No questions available.'); // Handle empty questions
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
                setError('Failed to load questions. Please try again later.');
            } finally {
                setLoading(false); // Stop loading regardless of outcome
            }
        };
        fetchQuestions();
    }, []);

    const handleAnswer = (selectedAnswer) => {
        console.log('Selected answer:', selectedAnswer); // Log the selected answer
        if (selectedAnswer === questions[currentQuestion].correctAnswer) {
            console.log('Correct answer selected'); // Log if the answer is correct
            setScore((prev) => prev + 1);
        } else {
            console.log('Incorrect answer selected'); // Log if the answer is incorrect
        }
        setCurrentQuestion((prev) => prev + 1);
    };

    // Display loading or error messages
    if (loading) {
        console.log('Loading questions...');
        return <div>Loading questions...</div>;
    }

    if (error) {
        console.log('Error encountered:', error);
        return <div>{error}</div>;
    }

    // Render quiz or "Quiz Over!" message
    return (
        <div>
            {questions.length > 0 && currentQuestion < questions.length ? (
                <div>
                    <h3>{questions[currentQuestion].question}</h3>
                    {questions[currentQuestion].options.map((option, index) => (
                        <button key={index} onClick={() => handleAnswer(option)}>
                            {option}
                        </button>
                    ))}
                </div>
            ) : (
                <h2>Quiz Over! Your score is {score}/{questions.length}.</h2>
            )}
        </div>
    );
};

export default Quiz;
