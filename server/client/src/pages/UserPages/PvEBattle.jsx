// src/pages/GamePages/PvEBattle.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';
import { cardsData } from '../../assets/cardsData';
import { OutcomeAnimation } from './BattleAnimation/BattleAnimations';
import { AttackAnimation } from './BattleAnimation/AttackAnimation';

const PvEBattle = () => {
  const [playerDeck, setPlayerDeck] = useState(null);
  const [attackEvents, setAttackEvents] = useState([]);
  const [battleLog, setBattleLog] = useState([]);
  const [battleOutcome, setBattleOutcome] = useState("");
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch player's deck.
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

  // Hardcoded computer deck.
  const computerDeck = {
    vaccines: [1, 52, 3, 4],
    viruses: [101, 71, 103, 104],
  };

  // Simulation function.
  const simulateBattle = (playerDeck, computerDeck) => {
    const events = [];
    let computerHits = 0;
    let playerHits = 0;

    // --- Computer attacks Player Phase ---
    computerDeck.viruses.forEach((virusId, idx) => {
      const virus = cardsData.find(card => card.id === virusId && card.type === 'virus');
      if (!virus) return;
      const protectingVaccines = [];
      for (const vaccineId of playerDeck.vaccines) {
        const vaccine = cardsData.find(card => card.id === vaccineId && card.type === 'vaccine');
        if (vaccine && vaccine.protectedViruses.includes(virusId)) {
          protectingVaccines.push(vaccine);
        }
      }
      const effectiveThreshold = protectingVaccines.length > 0
        ? virus.deathProbability * protectingVaccines.reduce((acc, v) => acc * (1 - v.protectionMap[virus.id]), 1)
        : virus.deathProbability;
      const rollValue = Math.random();
      const eventOutcome = rollValue < effectiveThreshold ? "HIT" : "MISS";
      if (eventOutcome === "HIT") { computerHits++; }
      events.push({
        round: idx + 1,
        side: 'computer->player',
        attacker: virus,
        isProtected: protectingVaccines.length > 0,
        defender: protectingVaccines[0] || null,
        protectors: protectingVaccines.map(v => v.name),
        roll: rollValue.toFixed(2),
        threshold: effectiveThreshold.toFixed(2),
        outcome: eventOutcome,
      });
    });

    // --- Player attacks Computer Phase ---
    playerDeck.viruses.forEach((virusId, idx) => {
      const virus = cardsData.find(card => card.id === virusId && card.type === 'virus');
      if (!virus) return;
      const protectingVaccines = [];
      for (const vaccineId of computerDeck.vaccines) {
        const vaccine = cardsData.find(card => card.id === vaccineId && card.type === 'vaccine');
        if (vaccine && vaccine.protectedViruses.includes(virusId)) {
          protectingVaccines.push(vaccine);
        }
      }
      const effectiveThreshold = protectingVaccines.length > 0
        ? virus.deathProbability * protectingVaccines.reduce((acc, v) => acc * (1 - v.protectionMap[virus.id]), 1)
        : virus.deathProbability;
      const rollValue = Math.random();
      const eventOutcome = rollValue < effectiveThreshold ? "HIT" : "MISS";
      if (eventOutcome === "HIT") { playerHits++; }
      events.push({
        round: idx + 1,
        side: 'player->computer',
        attacker: virus,
        isProtected: protectingVaccines.length > 0,
        defender: protectingVaccines[0] || null,
        protectors: protectingVaccines.map(v => v.name),
        roll: rollValue.toFixed(2),
        threshold: effectiveThreshold.toFixed(2),
        outcome: eventOutcome,
      });
    });

    setAttackEvents(events);

    const logs = events.map(event => {
      const protectionInfo = event.isProtected
        ? `Protected by [${event.protectors.join(', ')}]`
        : "Not Protected";
      return `Round ${event.round} (${event.side}): ${event.attacker.name} attacks with roll ${event.roll} | Threshold: ${event.threshold} | ${protectionInfo} | Outcome: ${event.outcome}.`;
    });
    setBattleLog(logs);

    if (playerHits > computerHits) return "You won the battle!";
    if (playerHits < computerHits) return "You lost the battle!";
    return "It's a draw!";
  };

  const handleBattle = () => {
    if (!playerDeck || !playerDeck.vaccines || !playerDeck.viruses) {
      alert("Player deck not loaded yet or incomplete.");
      return;
    }
    const outcome = simulateBattle(playerDeck, computerDeck);
    setBattleOutcome(outcome);
    setCurrentEventIndex(0);
    setCurrentStep(0);
    setShowOverlay(true);
  };

  // Define delays for each step (in milliseconds).
  // Steps: 0 - Round indicator, 1 - Display images, 2 - Display roll, 3 - Impact animation, 4 - Clear
  // We now reduce the clear step duration to 1500 ms instead of 3000 ms.
  const stepDelays = [500, 1000, 1500, 2000, 1500];

  // Effect to sequence through event steps.
  useEffect(() => {
    if (showOverlay && attackEvents.length > 0 && currentEventIndex < attackEvents.length) {
      if (currentStep < stepDelays.length - 1) {
        const timer = setTimeout(() => {
          setCurrentStep(currentStep + 1);
        }, stepDelays[currentStep]);
        return () => clearTimeout(timer);
      } else {
        // Clear display step before moving to the next event.
        const timer = setTimeout(() => {
          setCurrentStep(0);
          setCurrentEventIndex(currentEventIndex + 1);
        }, stepDelays[currentStep]);
        return () => clearTimeout(timer);
      }
    }
  }, [showOverlay, currentStep, currentEventIndex, attackEvents, stepDelays]);

  if (loading)
    return <div className="text-center mt-8 text-xl">Loading deck...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500 text-xl">{error}</div>;

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
                  <img key={i} src={vaccine.image} alt={vaccine.name} className="w-20 h-20 object-cover rounded" />
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
                  <img key={i} src={virus.image} alt={virus.name} className="w-20 h-20 object-cover rounded" />
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Display computer's deck */}
      <div className="text-center mb-4">
        <p className="text-lg font-semibold">Computer's Deck:</p>
        <div className="flex flex-col md:flex-row justify-center items-center space-x-8 space-y-4 md:space-y-0">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold">Vaccines</h2>
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              {computerDeck.vaccines.map((vaccineId, i) => {
                const vaccine = cardsData.find(card => card.id === vaccineId && card.type === 'vaccine');
                return vaccine ? (
                  <img key={i} src={vaccine.image} alt={vaccine.name} className="w-20 h-20 object-cover rounded" />
                ) : null;
              })}
            </div>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold">Viruses</h2>
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              {computerDeck.viruses.map((virusId, i) => {
                const virus = cardsData.find(card => card.id === virusId && card.type === 'virus');
                return virus ? (
                  <img key={i} src={virus.image} alt={virus.name} className="w-20 h-20 object-cover rounded" />
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

      {/* Full-screen overlay for sequential battle animations */}
      {showOverlay && (
        <div className="fixed inset-0 bg-white/95 z-50 flex flex-col overflow-auto">
          <div className="p-8 flex-1 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-center mb-4">Battle Animations</h2>
            {currentEventIndex < attackEvents.length ? (
              currentStep < stepDelays.length - 1 ? (
                <AttackAnimation
                  round={attackEvents[currentEventIndex].round}
                  attacker={attackEvents[currentEventIndex].attacker}
                  defender={attackEvents[currentEventIndex].defender}
                  isProtected={attackEvents[currentEventIndex].isProtected}
                  roll={attackEvents[currentEventIndex].roll}
                  threshold={attackEvents[currentEventIndex].threshold}
                  outcome={attackEvents[currentEventIndex].outcome}
                  side={attackEvents[currentEventIndex].side}
                />
              ) : (
                // Clear display step.
                <div className="w-full h-72 flex items-center justify-center bg-gray-100"></div>
              )
            ) : (
              <>
                {battleOutcome && <OutcomeAnimation outcome={battleOutcome} />}
                {battleLog.length > 0 && (
                  <div className="mt-8 p-4 bg-white shadow rounded space-y-4">
                    <h2 className="text-lg font-bold mb-2">Battle Logs</h2>
                    {battleLog.map((log, i) => (
                      <div key={i} className="border-b pb-2">
                        <p className="text-sm">{log}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="p-4 text-center">
            <button
              onClick={() => setShowOverlay(false)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
            >
              Close Battle View
            </button>
          </div>
        </div>
      )}

      <ActionNavbar />
    </div>
  );
};

export default PvEBattle;
