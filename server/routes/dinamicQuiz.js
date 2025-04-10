// routes/dinamicQuiz.js
const express = require('express');
const router = express.Router();
const vaccineData = require('../utils/vaccineData');

// Endpoint to generate questions dynamically
router.get('/generate-questions', (req, res) => {
  try {
    const questions = vaccineData.map((vaccine) => {
      const questionType = getRandomQuestionType();
      let question = '';
      let correctAnswer = '';

      // Build question based on type.
      switch (questionType) {
        case 'antigene':
          question = `L'antigene del vaccino ${vaccine.vaccineName} è ...`;
          correctAnswer = vaccine.antigene;
          break;
        case 'baseTecnologica':
          question = `Qual'è la base tecnologica del vaccino ${vaccine.vaccineName}?`;
          correctAnswer = vaccine.baseTecnologicaVaccino;
          break;
        case 'dataAutorizzazione':
          question = `Il vaccino ${vaccine.vaccineName} è stato autorizzato nel ...`;
          correctAnswer = String(vaccine.dataAutorizzazione);
          break;
        case 'sviluppatori':
          question = `Chi sono gli sviluppatori del vaccino ${vaccine.vaccineName}?`;
          correctAnswer = vaccine.sviluppatori;
          break;
        case 'patologia':
          question = `Da quali malattie protegge il vaccino ${vaccine.vaccineName}?`;
          correctAnswer = vaccine.patologiaDiInteresse;
          break;
        case 'calendarioVaccinale':
          question = `Quando è consigliata la somministrazione del vaccino ${vaccine.vaccineName}?`;
          correctAnswer = vaccine.calendarioVaccinale;
          break;
        case 'obbligatorietà':
          question = `Il vaccino ${vaccine.vaccineName} è obbligatorio?`;
          correctAnswer = vaccine.obbligatorietà;
          break;
        case 'posologia':
          question = `Quante dosi sono necessarie per il vaccino ${vaccine.vaccineName}?`;
          correctAnswer = vaccine.posologia;
          break;
        case 'somministrazione':
          question = `Il vaccino ${vaccine.vaccineName} viene somministrato mediante ...`;
          correctAnswer = vaccine.somministrazione;
          break;
      }

      // Generate appropriate number of distractors based on question type
      const numberOfDistractors = questionType === 'obbligatorietà' ? 1 : 3;
      const distractors = generateUniqueDistractors(questionType, correctAnswer, numberOfDistractors);

      // Shuffle options including the correct answer
      const options = shuffleArray([correctAnswer, ...distractors]);

      return {
        question,
        options,
        correctAnswer,
        questionType, // Added to help frontend handle different question types
      };
    });

    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions.' });
  }
});

// Utility to randomly choose one of the question types
function getRandomQuestionType() {
  const types = [
    'antigene', 'baseTecnologica',
    'dataAutorizzazione', 'sviluppatori', 'patologia', 'calendarioVaccinale',
    'obbligatorietà', 'posologia', 'somministrazione'
  ];
  return types[Math.floor(Math.random() * types.length)];
}

// Generate unique distractors
function generateUniqueDistractors(type, correctAnswer, count) {
  // Special case for obbligatorietà (yes/no questions)
  if (type === 'obbligatorietà') {
    // Return only one distractor that's the opposite of the correct answer
    return [correctAnswer === 'Si' ? 'No' : 'Si'];
  }

  // For all other question types, continue with multiple choice logic
  const allValues = vaccineData
    .map(vaccine => {
      switch (type) {
        case 'antigene':
          return vaccine.antigene;
        case 'baseTecnologica':
          return vaccine.baseTecnologicaVaccino;
        case 'dataAutorizzazione':
          return String(vaccine.dataAutorizzazione);
        case 'sviluppatori':
          return vaccine.sviluppatori;
        case 'patologia':
          return vaccine.patologiaDiInteresse;
        case 'calendarioVaccinale':
          return vaccine.calendarioVaccinale;
        case 'posologia':
          return vaccine.posologia;
        case 'somministrazione':
          return vaccine.somministrazione;
      }
    })
    .filter(value => value && value !== correctAnswer);

  // Remove duplicates
  const uniqueValues = [...new Set(allValues)];

  // If we don't have enough unique values, generate some variations
  if (uniqueValues.length < count && type !== 'obbligatorietà') {
    switch (type) {
      case 'dataAutorizzazione':
        const year = parseInt(correctAnswer);
        for (let i = 1; i <= 5; i++) {
          uniqueValues.push(String(year + i));
          uniqueValues.push(String(year - i));
        }
        break;
      case 'posologia':
        const doses = parseInt(correctAnswer.split(' ')[0]);
        for (let i = 1; i <= 5; i++) {
          uniqueValues.push(`${doses + i} dosi`);
          if (doses - i > 0) uniqueValues.push(`${doses - i} dosi`);
        }
        break;
      // Add more cases for other types if needed
    }
  }

  // For obbligatorietà, return only one distractor
  // For other types, return the requested number of distractors
  const numberOfDistractors = type === 'obbligatorietà' ? 1 : count;

  return shuffleArray(uniqueValues)
    .slice(0, numberOfDistractors)
    .filter(Boolean);
}

// Simple shuffle function
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

module.exports = router;
