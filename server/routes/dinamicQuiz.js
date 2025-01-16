const express = require('express');
const router = express.Router();
const vaccineData = require('../utils/vaccineData');

// Endpoint to generate questions
router.get('/generate-questions', (req, res) => {
    try {
        const questions = vaccineData.map((vaccine) => {
            const questionType = getRandomQuestionType();
            let question = '';
            let correctAnswer = '';
            let distractors = [];

            if (questionType === 'disease') {
                question = `What disease does the ${vaccine.vaccineName} vaccine protect against?`;
                correctAnswer = vaccine.disease;
                distractors = generateDistractors('disease', vaccine.disease);
            } else if (questionType === 'doses') {
                question = `How many doses are required for the ${vaccine.vaccineName} vaccine?`;
                correctAnswer = String(vaccine.doses);
                distractors = generateDistractors('doses', vaccine.doses);
            } else if (questionType === 'manufacturer') {
                question = `Who manufactures the ${vaccine.vaccineName} vaccine?`;
                correctAnswer = vaccine.manufacturer;
                distractors = generateDistractors('manufacturer', vaccine.manufacturer);
            }

            const options = shuffleArray([correctAnswer, ...distractors]);

            return {
                question,
                options,
                correctAnswer,
            };
        });

        res.json({ questions });
    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ error: 'Failed to generate questions.' });
    }
});

// Utility to get a random question type
function getRandomQuestionType() {
    const types = ['disease', 'doses', 'manufacturer'];
    return types[Math.floor(Math.random() * types.length)];
}

// Generate distractors dynamically
function generateDistractors(type, correctAnswer) {
    const otherValues = vaccineData
        .map((vaccine) => {
            if (type === 'disease') return vaccine.disease;
            if (type === 'doses') return String(vaccine.doses);
            if (type === 'manufacturer') return vaccine.manufacturer;
            return null;
        })
        .filter((value) => value && value !== correctAnswer); // Exclude the correct answer

    return shuffleArray(otherValues).slice(0, 3); // Return up to 3 distractors
}

// Shuffle function
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

module.exports = router;
