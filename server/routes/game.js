// In your game routes file (e.g., gameRoutes.js)
router.post('/resolve', authenticateUser, async (req, res) => {
    try {
      const { deckA, deckB } = req.body; // Each deck: { vaccines: [...], viruses: [...] }
      
      // Simulate battles between decks:
      // For each virus in deckA, check if deckB has a matching vaccine.
      let infectionsA = 0, infectionsB = 0;
      
      deckA.viruses.forEach(virus => {
        const matchingVaccines = deckB.vaccines.filter(vaccine =>
          vaccine.protectsAgainst.includes(virus.name)
        );
        
        // For simplicity, if no matching vaccine, count as infection.
        if (matchingVaccines.length === 0) {
          infectionsB++;
        } else {
          // Otherwise, simulate probability outcome:
          matchingVaccines.forEach(vaccine => {
            if (Math.random() > vaccine.protectionProb * (1 - virus.infectionProb)) {
              infectionsB++;
            }
          });
        }
      });
      
      // Repeat for deckB's viruses against deckA's vaccines:
      deckB.viruses.forEach(virus => {
        const matchingVaccines = deckA.vaccines.filter(vaccine =>
          vaccine.protectsAgainst.includes(virus.name)
        );
        
        if (matchingVaccines.length === 0) {
          infectionsA++;
        } else {
          matchingVaccines.forEach(vaccine => {
            if (Math.random() > vaccine.protectionProb * (1 - virus.infectionProb)) {
              infectionsA++;
            }
          });
        }
      });
      
      // Decide winner based on infections; lower infections win
      let winner = '';
      if (infectionsA < infectionsB) winner = 'Player A';
      else if (infectionsB < infectionsA) winner = 'Player B';
      else winner = 'Draw';
  
      res.json({ winner, infections: { playerA: infectionsA, playerB: infectionsB } });
    } catch (error) {
      console.error('Error resolving battle:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  