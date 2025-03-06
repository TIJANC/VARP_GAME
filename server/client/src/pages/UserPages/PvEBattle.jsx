// src/pages/GamePages/PvEBattle.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';
import { cardsData } from '../../assets/cardsData'; // Ensure this file exists and is correct

const PvEBattle = () => {
  const [playerDeck, setPlayerDeck] = useState(null);
  const [battleOutcome, setBattleOutcome] = useState("");
  const [battleLog, setBattleLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the player's deck from the backend.
  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/deck', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlayerDeck(response.data.deck || { vaccines: [], viruses: [] });
      } catch (err) {
        console.error("Error fetching player's deck:", err);
        // For testing purposes, simulate a deck:
        setPlayerDeck({
          vaccines: [1, 2, 3, 4],
          viruses: [101, 102, 103, 104],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, []);

  // Hardcoded computer deck for PvE battle.
  const computerDeck = {
    vaccines: [1, 2, 3, 4],
    viruses: [101, 102, 103, 104],
  };

  // Simulate the battle in two phases.
  const simulateBattle = (playerDeck, computerDeck) => {
    const computerAttackLog = [];
    const playerAttackLog = [];
    let computerAttackInfectsPlayer = false;
    let playerAttackInfectsComputer = false;

    // Computer attacks Player Phase
    computerDeck.viruses.forEach((virusId, idx) => {
      const virus = cardsData.find(card => card.id === virusId && card.type === 'virus');
      if (!virus) return;
      // Check if any vaccine in player's deck protects against this virus.
      let isProtected = false;
      for (const vaccineId of playerDeck.vaccines) {
        const vaccine = cardsData.find(card => card.id === vaccineId && card.type === 'vaccine');
        if (vaccine && vaccine.protectedViruses.includes(virusId)) {
          isProtected = true;
          break;
        }
      }
      const threshold = isProtected ? virus.deathProbabilityVaccinated : virus.deathProbability;
      const roll = Math.random();
      computerAttackLog.push({
        round: idx + 1,
        side: 'computer->player',
        virus: virus.name,
        roll: roll.toFixed(2),
        threshold,
        protected: isProtected,
      });
      if (roll < threshold) {
        computerAttackInfectsPlayer = true;
      }
    });

    // Player attacks Computer Phase
    playerDeck.viruses.forEach((virusId, idx) => {
      const virus = cardsData.find(card => card.id === virusId && card.type === 'virus');
      if (!virus) return;
      // Check if any vaccine in computer's deck protects against this virus.
      let isProtected = false;
      for (const vaccineId of computerDeck.vaccines) {
        const vaccine = cardsData.find(card => card.id === vaccineId && card.type === 'vaccine');
        if (vaccine && vaccine.protectedViruses.includes(virusId)) {
          isProtected = true;
          break;
        }
      }
      const threshold = isProtected ? virus.deathProbabilityVaccinated : virus.deathProbability;
      const roll = Math.random();
      playerAttackLog.push({
        round: idx + 1,
        side: 'player->computer',
        virus: virus.name,
        roll: roll.toFixed(2),
        threshold,
        protected: isProtected,
      });
      if (roll < threshold) {
        playerAttackInfectsComputer = true;
      }
    });

    // Merge logs for display.
    const log = [
      "=== Computer Attacks Player Phase ===",
      ...computerAttackLog.map(entry =>
        `Round ${entry.round}: ${entry.virus} (Player) - Roll: ${entry.roll}, Threshold: ${entry.threshold.toFixed(2)}, Protected: ${entry.protected}`
      ),
      "=== Player Attacks Computer Phase ===",
      ...playerAttackLog.map(entry =>
        `Round ${entry.round}: ${entry.virus} (Computer) - Roll: ${entry.roll}, Threshold: ${entry.threshold.toFixed(2)}, Protected: ${entry.protected}`
      ),
    ];
    setBattleLog(log);

    // Determine overall outcome.
    if (computerAttackInfectsPlayer && !playerAttackInfectsComputer) return "You lost the battle!";
    if (!computerAttackInfectsPlayer && playerAttackInfectsComputer) return "You won the battle!";
    if (computerAttackInfectsPlayer && playerAttackInfectsComputer) return "It's a draw!";
    return "No decisive outcome.";
  };

  const handleBattle = () => {
    if (!playerDeck || !playerDeck.vaccines || !playerDeck.viruses) {
      alert("Player deck not loaded yet or incomplete.");
      return;
    }
    const outcome = simulateBattle(playerDeck, computerDeck);
    setBattleOutcome(outcome);
  };

  if (loading)
    return (
      <div className="text-center mt-8 text-xl">
        Loading deck...
      </div>
    );
  if (error)
    return (
      <div className="text-center mt-8 text-red-500 text-xl">
        {error}
      </div>
    );

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6">PvE Battle</h1>
      
      {/* Display player's deck */}
      <div className="text-center mb-4">
        <p className="text-lg font-semibold">Your Deck:</p>
        <div className="flex flex-col md:flex-row justify-center items-center space-x-8 space-y-4 md:space-y-0">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold">Vaccines</h2>
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              {playerDeck.vaccines.map((vaccineId, i) => {
                const vaccine = cardsData.find(card => card.id === vaccineId && card.type === 'vaccine');
                return vaccine ? (
                  <img key={i} src={vaccine.image} alt={vaccine.name} className="w-16 h-16 object-cover rounded" />
                ) : null;
              })}
            </div>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold">Viruses</h2>
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              {playerDeck.viruses.map((virusId, i) => {
                const virus = cardsData.find(card => card.id === virusId && card.type === 'virus');
                return virus ? (
                  <img key={i} src={virus.image} alt={virus.name} className="w-16 h-16 object-cover rounded" />
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Battle button */}
      <div className="text-center">
        <button
          onClick={handleBattle}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
        >
          Start Battle
        </button>
      </div>

      {/* Outcome display */}
      {battleOutcome && (
        <div className={`mt-6 text-center text-2xl font-bold transition-transform ${battleOutcome.includes('won') ? 'text-green-600 animate-bounce' : 'text-red-600 animate-pulse'}`}>
          {battleOutcome}
        </div>
      )}

      {/* Battle log display */}
      {battleLog.length > 0 && (
        <div className="mt-8 p-4 bg-white shadow rounded space-y-4">
          <h2 className="text-lg font-bold mb-2">Battle Log</h2>
          {battleLog.map((entry, i) => (
            <div key={i} className="border-b pb-2">
              <p className="text-sm">{entry}</p>
            </div>
          ))}
        </div>
      )}

      <ActionNavbar />
    </div>
  );
};

export default PvEBattle;
