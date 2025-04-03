import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { VscTools } from 'react-icons/vsc';
import { motion } from 'framer-motion';
import { cardsData } from '../../assets/cardsData';
import ActionNavbar from '../../components/ActionNavbar';
import { OutcomeAnimation } from './BattleAnimation/BattleAnimations';
import { AttackAnimation } from './BattleAnimation/AttackAnimation';

const PvPBattle = () => {
  const navigate = useNavigate();
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [playerDeck, setPlayerDeck] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Battle animation states
  const [attackEvents, setAttackEvents] = useState([]);
  const [battleOutcome, setBattleOutcome] = useState("");
  const [battleLog, setBattleLog] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [playerHits, setPlayerHits] = useState(0);
  const [opponentHits, setOpponentHits] = useState(0);

  // Define delays for each step (in milliseconds)
  const stepDelays = [500, 1000, 1500, 2000, 1500];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch player's deck
        const deckResponse = await axios.get('/api/player/deck', {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (deckResponse.data && deckResponse.data.deck) {
          setPlayerDeck(deckResponse.data.deck);
        } else {
          setPlayerDeck({ vaccines: [], viruses: [] });
        }

        // Fetch available players
        const playersResponse = await axios.get('/api/pvp/available-players', {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });

        if (playersResponse.data && Array.isArray(playersResponse.data.players)) {
          setAvailablePlayers(playersResponse.data.players);
        } else {
          setAvailablePlayers([]);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Battle simulation function
// ... rest of the imports and code ...

const simulateBattle = (playerDeck, opponentDeck) => {
    const events = [];
    let opponentHits = 0;
    let playerHits = 0;
  
    // Get the maximum number of rounds based on the deck with more viruses
    const maxRounds = Math.max(playerDeck.viruses.length, opponentDeck.viruses.length);
  
    // Simulate turns for each round
    for (let round = 0; round < maxRounds; round++) {
      // Opponent's turn (if they have a virus for this round)
      if (round < opponentDeck.viruses.length) {
        const virusId = opponentDeck.viruses[round];
        const virus = cardsData.find(card => card.id === virusId && card.type === 'virus');
        
        if (virus) {
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
          if (eventOutcome === "HIT") { opponentHits++; }
  
          events.push({
            round: round + 1,
            turn: 'opponent',
            side: 'opponent->player',
            attacker: virus,
            isProtected: protectingVaccines.length > 0,
            defender: protectingVaccines[0] || null,
            protectors: protectingVaccines.map(v => v.name),
            roll: rollValue.toFixed(2),
            threshold: effectiveThreshold.toFixed(2),
            outcome: eventOutcome,
          });
        }
      }
  
      // Player's turn (if they have a virus for this round)
      if (round < playerDeck.viruses.length) {
        const virusId = playerDeck.viruses[round];
        const virus = cardsData.find(card => card.id === virusId && card.type === 'virus');
        
        if (virus) {
          const protectingVaccines = [];
          for (const vaccineId of opponentDeck.vaccines) {
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
            round: round + 1,
            turn: 'player',
            side: 'player->opponent',
            attacker: virus,
            isProtected: protectingVaccines.length > 0,
            defender: protectingVaccines[0] || null,
            protectors: protectingVaccines.map(v => v.name),
            roll: rollValue.toFixed(2),
            threshold: effectiveThreshold.toFixed(2),
            outcome: eventOutcome,
          });
        }
      }
    }
  
    setAttackEvents(events);
    setPlayerHits(playerHits);
    setOpponentHits(opponentHits);
  
    const logs = events.map(event => {
      const protectionInfo = event.isProtected
        ? `Protected by [${event.protectors.join(', ')}]`
        : "Not Protected";
      return `Round ${event.round} (${event.turn}'s turn): ${event.attacker.name} attacks with roll ${event.roll} | Threshold: ${event.threshold} | ${protectionInfo} | Outcome: ${event.outcome}.`;
    });
    setBattleLog(logs);
  
    return {
      outcome: playerHits > opponentHits ? "You won the battle!" : 
               playerHits < opponentHits ? "You lost the battle!" : 
               "It's a draw!",
      playerHits,
      opponentHits
    };
  };
  
  const handleBattleStart = async (opponent) => {
    if (!playerDeck || !isDeckValid(playerDeck)) {
      alert("Your deck is not valid for battle!");
      return;
    }

    setSelectedOpponent(opponent);
    const battleResult = simulateBattle(playerDeck, opponent.deck);
    setBattleOutcome(battleResult.outcome);
    setCurrentEventIndex(0);
    setCurrentStep(0);
    setShowOverlay(true);

    // Send battle result to server
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/pvp/battle-result', {
        opponentId: opponent._id,
        outcome: battleResult.outcome,
        battleDetails: {
          playerHits: battleResult.playerHits,
          opponentHits: battleResult.opponentHits,
          timestamp: new Date()
        }
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Error saving battle result:', err);
    }
  };

  // Animation step effect
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
  }, [showOverlay, currentStep, currentEventIndex, attackEvents]);

  // Check if a deck is valid
  const isDeckValid = (deck) => {
    
    if (!deck || typeof deck !== 'object') {
      return false;
    }

    const hasValidVaccines = Array.isArray(deck.vaccines);
    const hasValidViruses = Array.isArray(deck.viruses);

    if (!hasValidVaccines || !hasValidViruses) {
      return false;
    }

    const vaccineCount = deck.vaccines.filter(card => card != null).length;
    const virusCount = deck.viruses.filter(card => card != null).length;


    return vaccineCount >= 4 && virusCount >= 4;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <div className="text-[#66FCF1] text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0B0C10] p-8">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/BG/bg3.jpg')] bg-cover bg-center bg-no-repeat opacity-50" />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#66FCF1]">PvP Battle</h1>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mb-8">
          <motion.button
            onClick={() => navigate('/games/card-game')}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Build Deck <VscTools className="text-2xl" />
          </motion.button>
        </div>

        {/* Deck Status */}
        <div className="mb-8 p-4 bg-gray-800 bg-opacity-80 rounded">
          <h2 className="text-xl font-semibold text-white mb-2">Your Deck Status</h2>
          <div className="text-[#66FCF1]">
            {isDeckValid(playerDeck) 
              ? "✅ Your deck is ready for battle!" 
              : (
                <div>
                  <p>❌ You need at least 4 vaccines and 4 viruses to battle</p>
                  <p className="text-sm mt-2">
                    Current deck: {playerDeck?.vaccines?.length || 0} vaccines, {playerDeck?.viruses?.length || 0} viruses
                  </p>
                </div>
              )
            }
          </div>
        </div>

        {/* Available Players List */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Available Players</h2>
          {availablePlayers.length > 0 ? (
            <div className="grid gap-4">
              {availablePlayers.map((player) => (
                <motion.div
                  key={player._id}
                  className="bg-gray-800 bg-opacity-80 p-4 rounded-lg flex items-center justify-between"
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">{player.username}</h3>
                    <p className="text-sm text-gray-300">Level: {player.level}</p>
                  </div>
                  <motion.button
                    onClick={() => handleBattleStart(player)}
                    disabled={!isDeckValid(playerDeck)}
                    className={`px-4 py-2 rounded ${
                      isDeckValid(playerDeck)
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-600 cursor-not-allowed'
                    } text-white`}
                    whileHover={isDeckValid(playerDeck) ? { scale: 1.05 } : {}}
                    whileTap={isDeckValid(playerDeck) ? { scale: 0.95 } : {}}
                  >
                    Battle
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No players available for battle at the moment
            </div>
          )}
        </div>
      </div>

      {/* Battle Animation Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col overflow-auto">
          <div className="p-8 flex-1 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-center mb-4 text-[#66FCF1]">
              {selectedOpponent?.username} vs. You
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
                  {/* Animation transition state */}
                </div>
              )
            ) : (
              <>
                {battleOutcome && <OutcomeAnimation outcome={battleOutcome} />}
                {battleOutcome && (
                  <div className="text-center mt-4">
                    <p className="text-xl text-white font-bold">
                      {playerHits}:{opponentHits}
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

      <ActionNavbar />
    </div>
  );
};

export default PvPBattle; 