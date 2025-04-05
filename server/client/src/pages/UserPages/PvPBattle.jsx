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
  const [currentPlayerHits, setCurrentPlayerHits] = useState(0);
  const [currentOpponentHits, setCurrentOpponentHits] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const baseStepDelays = [500, 1000, 1500, 2000, 1500]; // Original delays

  // Update the stepDelays calculation to use the speed multiplier
  const stepDelays = baseStepDelays.map(delay => delay / animationSpeed);

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
  const simulateBattle = (playerDeck, opponentDeck) => {
    const events = [];
    let opponentHits = 0;
    let playerHits = 0;

    const maxRounds = Math.max(playerDeck.viruses.length, opponentDeck.viruses.length);

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
            side: 'computer->player', // Changed to match AttackAnimation expected format
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
            side: 'player->computer', // Changed to match AttackAnimation expected format
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
      // Keep the log arrows consistent with the visual direction
      const direction = event.side === 'computer->player' ? '→' : '←';
      return `Round ${event.round} (${event.turn}'s turn): ${event.attacker.name} attacks ${direction} with roll ${event.roll} | Threshold: ${event.threshold} | ${protectionInfo} | Outcome: ${event.outcome}.`;
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
      // Calculate current scores up to this event
      const currentScores = attackEvents.slice(0, currentEventIndex + 1).reduce((scores, event) => {
        if (event.outcome === "HIT") {
          if (event.turn === 'player') {
            scores.player++;
          } else {
            scores.opponent++;
          }
        }
        return scores;
      }, { player: 0, opponent: 0 });

      setCurrentPlayerHits(currentScores.player);
      setCurrentOpponentHits(currentScores.opponent);

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

  // Add handler functions for the buttons
  const handleSkipAnimation = () => {
    setCurrentEventIndex(attackEvents.length);
    setCurrentPlayerHits(playerHits);
    setCurrentOpponentHits(opponentHits);
  };

  const toggleSpeed = () => {
    setAnimationSpeed(current => current === 1 ? 2 : 1);
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
    <div className="relative min-h-screen bg-[#0B0C10] overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/BG/bg3.jpg')] bg-cover bg-center bg-no-repeat opacity-50" />
      
      {/* Main Content Container with fixed height and scrollable sections */}
      <div className="relative z-10 max-w-7xl mx-auto h-screen p-8 flex flex-col">
        {/* Header Section - Fixed at top */}
        <div className="flex-none mb-6">
          <h1 className="text-4xl font-bold text-center text-[#66FCF1] mb-4">PvP Battle Arena</h1>
          <motion.button
            onClick={() => navigate('/games/card-game')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <VscTools className="text-xl" />
            Build Your Deck
          </motion.button>
        </div>

        {/* Main Content Area - Fixed height with grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-250px)]">
          {/* Left Column - Deck Status (Fixed height) */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 h-full">
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
                Your Deck Status
              </h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  isDeckValid(playerDeck) ? 'bg-green-900/50' : 'bg-red-900/50'
                }`}>
                  <div className="text-lg text-white mb-2">
                    {isDeckValid(playerDeck) 
                      ? "✅ Ready for Battle!" 
                      : "❌ Deck Requirements Not Met"
                    }
                  </div>
                  <div className="text-sm text-gray-300">
                    Current Deck:
                    <ul className="mt-2 space-y-1">
                      <li>Vaccines: {playerDeck?.vaccines?.length || 0}/4 required</li>
                      <li>Viruses: {playerDeck?.viruses?.length || 0}/4 required</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Available Players (Scrollable) */}
          <div className="lg:col-span-2 h-full">
            <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2 flex-none">
                Available Players
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {availablePlayers.length > 0 ? (
                  <div className="grid gap-4">
                    {availablePlayers.map((player) => (
                      <motion.div
                        key={player._id}
                        className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between hover:bg-gray-600/50 transition-all"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-[#66FCF1] rounded-full p-2 w-12 h-12 flex items-center justify-center">
                            <span className="text-[#0B0C10] font-bold">
                              {player.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{player.username}</h3>
                            <p className="text-sm text-gray-300">Level: {player.level}</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => handleBattleStart(player)}
                          disabled={!isDeckValid(playerDeck)}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            isDeckValid(playerDeck)
                              ? 'bg-[#66FCF1] text-[#0B0C10] hover:bg-[#45A29E]'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                          whileHover={isDeckValid(playerDeck) ? { scale: 1.05 } : {}}
                          whileTap={isDeckValid(playerDeck) ? { scale: 0.95 } : {}}
                        >
                          Battle
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-700/30 rounded-lg">
                    <p className="text-gray-400 text-lg">
                      No players available for battle at the moment
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Check back later for new opponents
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Animation Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col overflow-auto">
          <div className="p-8 flex-1 flex flex-col items-center justify-center">
            {/* Header with control buttons */}
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-center text-[#66FCF1]">
                {selectedOpponent?.username} vs. You
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={toggleSpeed}
                  className={`px-3 py-1 rounded ${
                    animationSpeed === 2 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white transition-colors`}
                >
                  {animationSpeed === 2 ? '1x Speed' : '2x Speed'}
                </button>
                <button
                  onClick={handleSkipAnimation}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  Skip Animation
                </button>
              </div>
            </div>

            {currentEventIndex < attackEvents.length ? (
              currentStep < stepDelays.length - 1 ? (
                <>
                  <AttackAnimation
                    round={attackEvents[currentEventIndex].round}
                    attacker={attackEvents[currentEventIndex].attacker}
                    defender={attackEvents[currentEventIndex].defender}
                    isProtected={attackEvents[currentEventIndex].isProtected}
                    roll={attackEvents[currentEventIndex].roll}
                    threshold={attackEvents[currentEventIndex].threshold}
                    outcome={attackEvents[currentEventIndex].outcome}
                    side={attackEvents[currentEventIndex].side}
                    animationSpeed={animationSpeed}
                  />
                  {/* Battle description */}
                  <div className="mt-4 text-center text-lg text-[#66FCF1]">
                    {attackEvents[currentEventIndex].turn === 'player' ? (
                      <p>
                        You attacked {selectedOpponent?.username} with {attackEvents[currentEventIndex].attacker.name}
                        {attackEvents[currentEventIndex].isProtected && 
                          ` but they were protected by ${attackEvents[currentEventIndex].defender.name}`}
                      </p>
                    ) : (
                      <p>
                        {selectedOpponent?.username} attacked you with {attackEvents[currentEventIndex].attacker.name}
                        {attackEvents[currentEventIndex].isProtected && 
                          ` but you were protected by ${attackEvents[currentEventIndex].defender.name}`}
                      </p>
                    )}
                    <p className="mt-2 text-base">
                      {attackEvents[currentEventIndex].outcome === "HIT" ? (
                        <span className="text-red-500 font-bold">Attack successful!</span>
                      ) : (
                        <span className="text-green-500 font-bold">Attack blocked!</span>
                      )}
                    </p>
                  </div>
                  
                  {/* Live Score Section */}
                  <div className="mt-6 bg-gray-800 bg-opacity-60 rounded-lg p-4 min-w-[200px]">
                    <h3 className="text-[#66FCF1] text-xl font-bold mb-2 text-center">Current Score</h3>
                    <div className="flex justify-center items-center gap-4">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">{selectedOpponent?.username}</p>
                        <p className="text-2xl font-bold text-white">{currentOpponentHits}</p>
                      </div>
                      <div className="text-2xl font-bold text-[#66FCF1]">-</div>
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">You</p>
                        <p className="text-2xl font-bold text-white">{currentPlayerHits}</p>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-2">
                      Round {attackEvents[currentEventIndex].round} of {attackEvents.length / 2}
                    </p>
                  </div>
                </>
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
 