import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ActionNavbar from '../../components/ActionNavbar';
import { cardsData } from '../../assets/cardsData';
import { FaInfoCircle } from 'react-icons/fa';
import { Card, CardMedia, Typography, Button } from '@mui/material';

const DeckBuilder = () => {
  const navigate = useNavigate();
  const [unlockedCards, setUnlockedCards] = useState([]);
  const [currentDeck, setCurrentDeck] = useState({ vaccines: [], viruses: [] });
  const [selectedVaccines, setSelectedVaccines] = useState([]);
  const [selectedViruses, setSelectedViruses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewCard, setPreviewCard] = useState(null);

  // Fetch unlocked cards from the shop endpoint.
  useEffect(() => {
    const fetchUnlockedCards = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/shop', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter to only include cards that are unlocked.
        const unlocked = response.data.cards.filter(card => card.isUnlocked);
        setUnlockedCards(unlocked);
      } catch (err) {
        console.error('Error fetching shop data:', err);
        setError('Failed to load unlocked cards.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockedCards();
  }, []);

  // Once unlockedCards are loaded, fetch the current deck.
  useEffect(() => {
    if (unlockedCards.length > 0) {
      const fetchDeck = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('/api/player/deck', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const deck = response.data.deck || { vaccines: [], viruses: [] };
          setCurrentDeck(deck);
          const selectedVaccinesCards = deck.vaccines
            .map(id => unlockedCards.find(card => card.id === id))
            .filter(card => card);
          const selectedVirusesCards = deck.viruses
            .map(id => unlockedCards.find(card => card.id === id))
            .filter(card => card);
          setSelectedVaccines(selectedVaccinesCards);
          setSelectedViruses(selectedVirusesCards);
        } catch (err) {
          console.error("Error fetching current deck:", err);
        }
      };
      fetchDeck();
    }
  }, [unlockedCards]);

  // Filter functions for vaccine and virus cards.
  const isVaccine = (card) => card.type === 'vaccine';
  const isVirus = (card) => card.type === 'virus';

  const toggleSelection = (card) => {
    if (isVaccine(card)) {
      if (selectedVaccines.find(c => c.id === card.id)) {
        setSelectedVaccines(selectedVaccines.filter(c => c.id !== card.id));
      } else {
        if (selectedVaccines.length < 5) {
          setSelectedVaccines([...selectedVaccines, card]);
        } else {
          alert('You can only select 5 vaccine cards.');
        }
      }
    } else if (isVirus(card)) {
      if (selectedViruses.find(c => c.id === card.id)) {
        setSelectedViruses(selectedViruses.filter(c => c.id !== card.id));
      } else {
        if (selectedViruses.length < 10) {
          setSelectedViruses([...selectedViruses, card]);
        } else {
          alert('You can only select 10 virus cards.');
        }
      }
    }
  };

  // Create deck object from selected cards.
  const createDeck = () => ({
    vaccines: selectedVaccines.map(card => card.id),
    viruses: selectedViruses.map(card => card.id),
  });

  // Save the deck to the backend.
  const handleSaveDeck = async () => {
    const deck = createDeck();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/player/deck',
        { deck },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      setCurrentDeck(deck);
      navigate('/games');
    } catch (error) {
      console.error('Error saving deck:', error);
      alert(error.response?.data?.error || 'Failed to save deck.');
    }
  };

  const handleInfoClick = (e, card) => {
    e.stopPropagation();
    setPreviewCard(card);
  };

    // Helper function to get glow style based on rarity
    const getGlowStyle = (rarity) => {
      switch (rarity?.toLowerCase()) {
        case 'legendary':
          return { boxShadow: '0 0 20px 4px #FFD700' }; // Gold glow
        case 'epic':
          return { boxShadow: '0 0 15px 4px #9C27B0' }; // Purple glow
        case 'rare':
          return { boxShadow: '0 0 15px 4px #2196F3' }; // Blue glow
        case 'common':
        default:
          return { boxShadow: '0 0 8px 2px #9E9E9E' }; // Subtle gray glow
      }
    };  

  if (loading)
    return (
      <div className="text-center mt-8 text-xl text-white">
        Loading unlocked cards...
      </div>
    );
  if (error)
    return (
      <div className="text-center mt-8 text-red-500 text-xl">{error}</div>
    );

  return (
    <div className="relative min-h-screen p-8 bg-[#0B0C10]">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[url('/BG/bg4.jpg')] bg-cover bg-center bg-no-repeat opacity-50"></div>
      <div className="absolute inset-0 bg-[#0B0C10] opacity-80"></div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto bg-transparent shadow-md p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-center text-[#66FCF1] mb-6">Deck Builder</h1>

        {/* Display Current Deck */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Your Current Deck</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="p-4 bg-gray-800 bg-opacity-80 rounded shadow">
              <h3 className="font-semibold text-white">Vaccines</h3>
              <div className="flex gap-2 flex-wrap justify-center mt-2">
                {selectedVaccines.length > 0 ? (
                  selectedVaccines.map((card, i) => (
                    <img
                      key={i}
                      src={card.image}
                      alt={card.name}
                      className="w-20 h-18 object-cover rounded"
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No vaccine cards selected</p>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-800 bg-opacity-80 rounded shadow">
              <h3 className="font-semibold text-white">Viruses</h3>
              <div className="flex gap-2 flex-wrap justify-center mt-2">
                {selectedViruses.length > 0 ? (
                  selectedViruses.map((card, i) => (
                    <img
                      key={i}
                      src={card.image}
                      alt={card.name}
                      className="w-20 h-18 object-cover rounded"
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No virus cards selected</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="text-center mt-8">
          <button
            onClick={handleSaveDeck}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Save Deck
          </button>
        </div>

        {/* Section to modify the deck */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Select up to 5 Vaccine Cards</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {unlockedCards.filter(isVaccine).map(card => (
              <div
                key={card.id}
                className={`relative p-1 border-4 rounded cursor-pointer text-center transition-all hover:shadow-lg ${
                  selectedVaccines.find(c => c.id === card.id)
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
                onClick={() => toggleSelection(card)}
              >
                <button
                  className="absolute top-1 right-1 text-white hover:text-[#66FCF1] transition-colors"
                  onClick={(e) => handleInfoClick(e, card)}
                >
                  <FaInfoCircle size={20} />
                </button>
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-20 h-18 mx-auto"
                />
                <p className="mt-2 text-sm text-white">{card.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Select up to 10 Virus Cards</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {unlockedCards.filter(isVirus).map(card => (
              <div
                key={card.id}
                className={`relative border p-4 rounded cursor-pointer text-center transition-all hover:shadow-lg ${
                  selectedViruses.find(c => c.id === card.id)
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
                onClick={() => toggleSelection(card)}
              >
                <button
                  className="absolute top-1 right-1 text-white hover:text-[#66FCF1] transition-colors"
                  onClick={(e) => handleInfoClick(e, card)}
                >
                  <FaInfoCircle size={20} />
                </button>
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-20 h-18 mx-auto"
                />
                <p className="mt-2 text-sm text-white">{card.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {previewCard && (
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-lg flex justify-center items-center p-4 z-50"
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="p-4 rounded-lg max-w-xs w-full bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewCard.image}
              alt={previewCard.name}
              className="w-full mb-4 object-cover rounded"
              style={getGlowStyle(previewCard.rarity)}
            />
            <div>
              <Typography align="center" style={{ color: '#C5C6C7' }} gutterBottom>
                {previewCard.name}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setPreviewCard(null)}
                style={{ backgroundColor: '#66FCF1', color: '#0B0C10', fontSize: '0.8rem' }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <ActionNavbar />
    </div>
  );
};

export default DeckBuilder;
