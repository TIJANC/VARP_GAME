import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { VscTools } from 'react-icons/vsc';
import { motion } from 'framer-motion';
import { cardsData } from '../../assets/cardsData';
import ActionNavbar from '../../components/ActionNavbar';

const PvPBattle = () => {
  const navigate = useNavigate();
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [playerDeck, setPlayerDeck] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [battleOutcome, setBattleOutcome] = useState(null);

  // Fetch player's deck and available players
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch player's deck
        const deckResponse = await axios.get('/api/player/deck', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlayerDeck(deckResponse.data.deck || { vaccines: [], viruses: [] });

        // Fetch available players with valid decks
        const playersResponse = await axios.get('/api/pvp/available-players', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailablePlayers(playersResponse.data.players || []);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err.response?.data?.message || "Failed to load data");
        // Set default empty arrays to prevent mapping errors
        setAvailablePlayers([]);
        setPlayerDeck({ vaccines: [], viruses: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Check if a deck is valid (has at least 4 vaccines and 4 viruses)
  const isDeckValid = (deck) => {
    if (!deck || !deck.vaccines || !deck.viruses) return false;
    return deck.vaccines.length >= 4 && deck.viruses.length >= 4;
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
          <p className="text-[#66FCF1]">
            {isDeckValid(playerDeck) 
              ? "✅ Your deck is ready for battle!" 
              : "❌ You need at least 4 vaccines and 4 viruses to battle"}
          </p>
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

      <ActionNavbar />
    </div>
  );
};

export default PvPBattle; 