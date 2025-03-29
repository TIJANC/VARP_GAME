import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ActionNavbar from '../../components/ActionNavbar';
import { cardsData } from '../../assets/cardsData';

const DeckBuilder = () => {
  const navigate = useNavigate();
  const [unlockedCards, setUnlockedCards] = useState([]);
  const [currentDeck, setCurrentDeck] = useState({ vaccines: [], viruses: [] });
  const [selectedVaccines, setSelectedVaccines] = useState([]);
  const [selectedViruses, setSelectedViruses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          // Ensure deck exists
          const deck = response.data.deck || { vaccines: [], viruses: [] };
          setCurrentDeck(deck);
          // Map the saved IDs to the actual card objects from unlockedCards.
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
      // Update the current deck state after saving.
      setCurrentDeck(deck);
    } catch (error) {
      console.error('Error saving deck:', error);
      alert(error.response?.data?.error || 'Failed to save deck.');
    }
  };

  // Battle Now navigates to the PvE battle page if the deck is not completely empty.
  const handleBattleNow = () => {
    if (selectedVaccines.length === 0 && selectedViruses.length === 0) {
      alert('Your deck is empty. Please select some cards.');
      return;
    }
    navigate('/games/PvE-battle');
  };

  if (loading)
    return (
      <div className="text-center mt-8 text-xl">
        Loading unlocked cards...
      </div>
    );
  if (error)
    return (
      <div className="text-center mt-8 text-red-500 text-xl">{error}</div>
    );

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6">Deck Builder</h1>

      {/* Display current deck */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Current Deck</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="p-4 bg-white shadow rounded">
            <h3 className="font-semibold">Vaccines</h3>
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
          <div className="p-4 bg-white shadow rounded">
            <h3 className="font-semibold">Viruses</h3>
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
      <div className="text-center mt-8 space-x-4">
        <button
          onClick={handleSaveDeck}
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Deck
        </button>
        <button
          onClick={handleBattleNow}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Battle Now
        </button>
      </div>

      {/* Section to modify the deck */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Select up to 5 Vaccine Cards</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {unlockedCards.filter(isVaccine).map(card => (
            <div
              key={card.id}
              className={`border p-4 rounded cursor-pointer text-center transition-all hover:shadow-lg ${
                selectedVaccines.find(c => c.id === card.id)
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
              onClick={() => toggleSelection(card)}
            >
              <img
                src={card.image}
                alt={card.name}
                className="w-24 h-auto mx-auto"
              />
              <p className="mt-2 text-sm">{card.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Select up to 10 Virus Cards</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {unlockedCards.filter(isVirus).map(card => (
            <div
              key={card.id}
              className={`border p-4 rounded cursor-pointer text-center transition-all hover:shadow-lg ${
                selectedViruses.find(c => c.id === card.id)
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
              onClick={() => toggleSelection(card)}
            >
              <img
                src={card.image}
                alt={card.name}
                className="w-24 h-auto mx-auto"
              />
              <p className="mt-2 text-sm">{card.name}</p>
            </div>
          ))}
        </div>
      </section>

      <ActionNavbar />
    </div>
  );
};

export default DeckBuilder;
