import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';
import { cardsData } from '../../assets/cardsData';
import { OutcomeAnimation } from './BattleAnimation/BattleAnimations';
import { AttackAnimation } from './BattleAnimation/AttackAnimation';
import { VscTools } from "react-icons/vsc";
import { FaUsers } from "react-icons/fa";

const PvEBattle = () => {
  const navigate = useNavigate();
  const [playerDeck, setPlayerDeck] = useState(null);
  const [attackEvents, setAttackEvents] = useState([]);
  const [battleOutcome, setBattleOutcome] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Additional states for battle animation sequencing.
  const [battleLog, setBattleLog] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [playerHits, setPlayerHits] = useState(0);
  const [computerHits, setComputerHits] = useState(0);


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
        // Fallback deck.
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

    setPlayerHits(playerHits);
    setComputerHits(computerHits);
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
  const stepDelays = [500, 1000, 1500, 2000, 1500];

  useEffect(() => {
    if (showOverlay && attackEvents.length > 0 && currentEventIndex < attackEvents.length) {
      if (currentStep < stepDelays.length - 1) {
        const timer = setTimeout(() => {
          setCurrentStep(currentStep + 1);
        }, stepDelays[currentStep]);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setCurrentStep(0);
          setCurrentEventIndex(currentEventIndex + 1);
        }, stepDelays[currentStep]);
        return () => clearTimeout(timer);
      }
    }
  }, [showOverlay, currentStep, currentEventIndex, attackEvents, stepDelays]);

  if (loading)
    return <div className="text-center mt-8 text-xl text-white">Loading deck...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500 text-xl">{error}</div>;

  return (
    <div className="relative p-8 space-y-8 min-h-screen bg-[#0B0C10]">
      {/* Background Overlays */}
      <div className="absolute inset-0 bg-[url('/BG/bg3.jpg')] bg-cover bg-center bg-no-repeat opacity-50"></div>
      <div className="absolute inset-0 opacity-80"></div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto bg-transparent shadow-md p-8 rounded-lg justify-items-center">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#66FCF1]">PvE Battle</h1>
        
        {/* Navigation Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate('/games/card-game')}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-all flex items-center gap-2"
          >
            Build Deck <VscTools className="text-2xl" />
          </button>
          
          <button
            onClick={() => navigate('/games/PvP-battle')}
            className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-all flex items-center gap-2"
          >
            PvP Battle <FaUsers className="text-xl" />
          </button>
        </div>

        {/* Display player's deck in a grid */}
        <div className="text-center mb-4">
          <p className="text-lg font-semibold text-white">Your Deck:</p>
          <div className="grid grid-cols-1 gap-4">
            {/* Vaccines */}
            <div className="p-4 bg-gray-800 bg-opacity-80 rounded">
              <h2 className="font-semibold text-white mb-2">Vaccines</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {playerDeck.vaccines.map((vaccineId, i) => {
                  const vaccine = cardsData.find(card => card.id === vaccineId && card.type === 'vaccine');
                  return vaccine ? (
                    <div 
                      key={i} 
                      className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => handleCardClick(vaccine)}
                    >
                      <img
                        src={vaccine.image}
                        alt={vaccine.name}
                        className="w-20 h-18 object-cover rounded"
                      />
                      <p className="mt-1 text-xs text-white">{vaccine.name}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            {/* Viruses */}
            <div className="p-4 bg-gray-800 bg-opacity-80 rounded">
              <h2 className="font-semibold text-white mb-2">Viruses</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 justify-self-center gap-3">
                {playerDeck.viruses.map((virusId, i) => {
                  const virus = cardsData.find(card => card.id === virusId && card.type === 'virus');
                  return virus ? (
                    <div key={i} className="flex flex-col items-center">
                      <img
                        src={virus.image}
                        alt={virus.name}
                        className="w-20 h-18 object-cover rounded"
                      />
                      <p className="mt-1 text-xs text-white">{virus.name}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Display computer's deck in a grid */}
        <div className="text-center mb-4">
          <p className="text-lg font-semibold text-white">Computer's Deck:</p>
          <div className="grid grid-cols-1 gap-4">
            {/* Vaccines */}
            <div className="p-4 bg-gray-800 bg-opacity-80 rounded">
              <h2 className="font-semibold text-white mb-2">Vaccines</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {computerDeck.vaccines.map((vaccineId, i) => {
                  const vaccine = cardsData.find(card => card.id === vaccineId && card.type === 'vaccine');
                  return vaccine ? (
                    <div 
                      key={i} 
                      className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => handleCardClick(vaccine)}
                    >
                      <img
                        src={vaccine.image}
                        alt={vaccine.name}
                        className="w-20 h-18 object-cover rounded"
                      />
                      <p className="mt-1 text-xs text-white">{vaccine.name}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            {/* Viruses */}
            <div className="p-4 bg-gray-800 bg-opacity-80 rounded">
              <h2 className="font-semibold text-white mb-2">Viruses</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {computerDeck.viruses.map((virusId, i) => {
                  const virus = cardsData.find(card => card.id === virusId && card.type === 'virus');
                  return virus ? (
                    <div key={i} className="flex flex-col items-center">
                      <img
                        src={virus.image}
                        alt={virus.name}
                        className="w-20 h-18 object-cover rounded"
                      />
                      <p className="mt-1 text-xs text-white">{virus.name}</p>
                    </div>
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

        {showOverlay && (
  <div className="fixed inset-0 z-50 bg-black/90 flex flex-col overflow-auto">
    <div className="p-8 flex-1 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-center mb-4 text-[#66FCF1]">
        Computer vs. Player 
      </h2>
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
          <div className="w-full h-72 flex items-center justify-center">
            {/* Optionally display a placeholder or clear state */}
          </div>
        )
      ) : (
        <>
        {battleOutcome && <OutcomeAnimation outcome={battleOutcome} />}
{battleOutcome && (
  <div className="text-center mt-4">
    <p className="text-xl text-white font-bold">
      {playerHits}:{computerHits}
    </p>
  </div>
)}
{battleLog.length > 0 && (
  <div className="mt-8 p-4 shadow rounded space-y-4">
    <h2 className="text-lg font-bold mb-2 text-[#66FCF1]">Battle Logs</h2>
    {battleLog.map((log, i) => (
      <div key={i} className="border-b border-gray-700 pb-2">
        <p className="text-sm text-gray-200">{log}</p>
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
      </div>

      <ActionNavbar />
    </div>
  );
};

export default PvEBattle;
