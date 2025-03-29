// routes/dinamicQuiz.js
const express = require('express');
const router = express.Router();
const vaccineData = require('../utils/vaccineData');

// Endpoint to generate questions dynamically
router.get('/generate-questions', (req, res) => {
  try {
    const questions = vaccineData.map((vaccine) => {
      // Get a random question type from our extended list
      const questionType = getRandomQuestionType();
      let question = '';
      let correctAnswer = '';
      let distractors = [];

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

      // Generate distractors for the selected question type.
      distractors = generateDistractors(questionType, correctAnswer);

      // Finalize options ensuring no duplicate of the correct answer.
      const options = shuffleArray([correctAnswer, ...distractors.filter(d => d !== correctAnswer)]);

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

// Utility to randomly choose one of the question types
function getRandomQuestionType() {
  const types = [
    'antigene', 'baseTecnologica',
    'dataAutorizzazione', 'sviluppatori', 'patologia', 'calendarioVaccinale',
    'obbligatorietà', 'posologia', 'somministrazione'
  ];
  return types[Math.floor(Math.random() * types.length)];
}

// Generate distractors for a given type.
// It maps over vaccineData, extracts the field based on the type, and filters out the correct answer.
function generateDistractors(type, correctAnswer) {
  const otherValues = vaccineData
    .map((vaccine) => {
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
        case 'obbligatorietà':
          return vaccine.obbligatorietà;
        case 'posologia':
          return vaccine.posologia;
        case 'somministrazione':
          return vaccine.somministrazione;
      }
    })
    .filter(value => value && value !== correctAnswer);
  return shuffleArray(otherValues).slice(0, 3); // return up to 3 distractors
}

// Simple shuffle function
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

module.exports = router;
