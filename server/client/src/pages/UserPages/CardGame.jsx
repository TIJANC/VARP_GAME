import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';

const DeckBuilder = () => {
  const [unlockedCards, setUnlockedCards] = useState([]);
  const [selectedVaccines, setSelectedVaccines] = useState([]);
  const [selectedViruses, setSelectedViruses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shop data and filter unlocked cards
  useEffect(() => {
    const fetchUnlockedCards = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/shop', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter to only include cards that are unlocked
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

  // Reuse the same getCardImage function from your shop page
  const getCardImage = (cardId) => {
    const cardImages = {
      1: '/VaccineCards/Hexacima.png',
      2: '/VaccineCards/Hexyon.png',
      3: '/VaccineCards/Infanrix.png',
      4: '/VaccineCards/Vaxelis.png',
      5: '/VaccineCards/PolioBoostrix.png',
      6: '/VaccineCards/PolioInfanrix.png',
      7: '/VaccineCards/Tetravac.png',
      8: '/VaccineCards/TriaxisPolio.png',
      9: '/VaccineCards/Boostrix.png',
      10: '/VaccineCards/Triaxis.png',
      11: '/VaccineCards/Tribaccine.png',
      12: '/VaccineCards/Diftetall.png',
    };
    return cardImages[cardId] || '/images/default-card.png';
  };

  // For this example, assume vaccine cards have IDs < 100 and virus cards have IDs >= 100.
  const isVaccine = (card) => card.id < 100;
  const isVirus = (card) => card.id >= 100;

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

  const handleSubmitDeck = () => {
    if (selectedVaccines.length !== 5 || selectedViruses.length !== 10) {
      alert('Please select exactly 5 vaccine cards and 10 virus cards.');
      return;
    }
    
    const deck = {
      vaccines: selectedVaccines.map(card => card.id),
      viruses: selectedViruses.map(card => card.id),
    };
    
    console.log('Deck submitted:', deck);
    // Call your backend API to submit the deck for a battle, if needed.
  };

  if (loading) return <div>Loading unlocked cards...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Deck Builder</h1>
      
      <section>
        <h2>Select 5 Vaccine Cards</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {unlockedCards.filter(isVaccine).map(card => (
            <div
              key={card.id}
              style={{
                border: selectedVaccines.find(c => c.id === card.id) ? '2px solid green' : '1px solid #ccc',
                padding: '10px',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onClick={() => toggleSelection(card)}
            >
              <img
                src={card.image || getCardImage(card.id)}
                alt={card.name}
                style={{ width: '100px', height: 'auto' }}
              />
              <p>{card.name}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section style={{ marginTop: '20px' }}>
        <h2>Select 10 Virus Cards</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {unlockedCards.filter(isVirus).map(card => (
            <div
              key={card.id}
              style={{
                border: selectedViruses.find(c => c.id === card.id) ? '2px solid green' : '1px solid #ccc',
                padding: '10px',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onClick={() => toggleSelection(card)}
            >
              <img
                src={card.image || getCardImage(card.id)}
                alt={card.name}
                style={{ width: '100px', height: 'auto' }}
              />
              <p>{card.name}</p>
            </div>
          ))}
        </div>
      </section>
      
      <div style={{ marginTop: '30px' }}>
        <button onClick={handleSubmitDeck} style={{ padding: '10px 20px', fontSize: '1rem' }}>
          Submit Deck
        </button>
      </div>
      <ActionNavbar/>
    </div>
  );
};

export default DeckBuilder;
