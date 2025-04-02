import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';
import { cardsData } from '../../assets/cardsData';

export default function TradeCenter() {
  const [myCards, setMyCards] = useState([]);
  const [openTrades, setOpenTrades] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [quantityToTrade, setQuantityToTrade] = useState(1);
  const [requiredValue, setRequiredValue] = useState(10);
  const [userId, setUserId] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();  // so we know user._id
    fetchMyCards();
    fetchOpenTrades();
  }, []);

  // Fetch the logged-in user's profile to get their _id
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/player/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming the response returns the user _id
      setUserId(res.data._id);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Fetch the user's cards (with duplicates)
  const fetchMyCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/player/shop', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyCards(res.data.cards || []);
    } catch (err) {
      console.error('Error fetching my cards:', err);
      alert('Error fetching cards');
    }
  };

  // Fetch all open trades from the server
  const fetchOpenTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      // Adjust the route if necessary.
      const res = await axios.get('/api/player/active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenTrades(res.data.trades || []);
    } catch (err) {
      console.error('Error fetching open trades:', err);
      alert('Error fetching open trades');
    }
  };

  // Create a trade listing.
  const handleCreateTrade = async () => {
    try {
      const token = localStorage.getItem('token');
      const body = { cardId: selectedCardId, quantity: quantityToTrade, requiredValue };
      const res = await axios.post('/api/player/create', body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || 'Trade created!');
      fetchMyCards();
      fetchOpenTrades();
    } catch (err) {
      console.error('Error creating trade:', err);
      alert(err.response?.data?.error || 'Failed to create trade');
    }
  };

  // Accept a trade.
  const handleAcceptTrade = async (tradeId, offeredCards) => {
    try {
      const token = localStorage.getItem('token');
      const body = { tradeId, offeredCards };
      const res = await axios.post('/api/player/accept', body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || 'Trade accepted!');
      fetchMyCards();
      fetchOpenTrades();
    } catch (err) {
      console.error('Error accepting trade:', err);
      alert(err.response?.data?.error || 'Failed to accept trade');
    }
  };

  // Helper function to get card details
  const getCardDetails = (cardId) => {
    return cardsData.find(card => card.id === cardId) || { name: 'Unknown Card', type: 'unknown' };
  };

  // Add this function to handle card clicks
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen p-4 bg-[#0B0C10]">
      {/* Background Overlays */}
      <div className="absolute inset-0 bg-[url('/BG/bg.jpg')] bg-cover bg-center bg-no-repeat opacity-50"></div>
      <div className="absolute inset-0 bg-[#0B0C10] opacity-80"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center text-[#66FCF1] mb-6">
          Global Trade Center
        </h1>

        {/* Create Trade Section */}
        <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold text-[#66FCF1] mb-4">Create a Trade</h2>
          <div className="mb-2">
            <label className="block text-gray-300 mb-1">Choose a Duplicate Card</label>
            <select
              value={selectedCardId || ''}
              onChange={(e) => setSelectedCardId(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 text-gray-200"
            >
              <option value="">--Select a Card--</option>
              {myCards
                .filter((c) => c.quantity > 1)
                .map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} (Qty: {card.quantity})
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-gray-300 mb-1">Quantity to Trade:</label>
            <input
              type="number"
              value={quantityToTrade}
              onChange={(e) => setQuantityToTrade(Number(e.target.value))}
              min={1}
              className="w-full p-2 rounded bg-gray-700 text-gray-200"
            />
          </div>

          <div className="mb-2">
            <label className="block text-gray-300 mb-1">Required Value (points):</label>
            <input
              type="number"
              value={requiredValue}
              onChange={(e) => setRequiredValue(Number(e.target.value))}
              min={1}
              className="w-full p-2 rounded bg-gray-700 text-gray-200"
            />
          </div>

          <button
            onClick={handleCreateTrade}
            className="mt-2 px-4 py-2 bg-[#45A29E] text-white rounded hover:bg-[#66FCF1] transition"
          >
            Create Trade
          </button>
        </div>

        {/* Open Trades Section - Updated */}
        <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-[#66FCF1] mb-4">Open Trades</h2>
          {openTrades.length === 0 ? (
            <p className="text-gray-300">No open trades at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openTrades.map((trade) => (
                <div key={trade._id} className="border border-gray-700 p-4 rounded-lg bg-gray-900 bg-opacity-50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-[#66FCF1] font-bold">
                      Trade #{trade._id.slice(-5)}
                    </h3>
                    <span className="text-sm text-gray-400">
                      Value: {trade.requiredValue} points
                    </span>
                  </div>

                  {/* Offered Cards Section */}
                  <div className="mb-4">
                    <h4 className="text-gray-300 font-semibold mb-2">Offered Cards:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {trade.offer.map((off, idx) => {
                        const card = getCardDetails(off.cardId);
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center p-2 rounded-lg ${
                              card.type === 'virus' ? 'bg-red-900' : 'bg-blue-900'
                            } bg-opacity-30`}
                          >
                            <div className="flex-1">
                              <span className="text-white font-medium">{card.name}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${
                                  card.type === 'virus' ? 'text-red-300' : 'text-blue-300'
                                }`}>
                                  {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
                                </span>
                                <span className="text-gray-300 text-sm">
                                  × {off.quantity}
                                </span>
                              </div>
                            </div>
                            {card.image && (
                              <img 
                                src={card.image} 
                                alt={card.name}
                                className="w-12 h-12 object-contain rounded cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => handleCardClick(card)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {String(trade.ownerId) === String(userId) ? (
                    <p className="text-red-500 mt-2">
                      This is your own trade. You cannot accept it.
                    </p>
                  ) : (
                    <AcceptTradeForm
                      trade={trade}
                      myCards={myCards}
                      onAccept={(offeredCards) => handleAcceptTrade(trade._id, offeredCards)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add the modal component */}
      <CardModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ActionNavbar />
    </div>
  );
}

/**
 * AcceptTradeForm:
 *  - Allows the user to select cards and quantities to meet or exceed the required value.
 */
function AcceptTradeForm({ trade, myCards, onAccept }) {
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [offerQuantity, setOfferQuantity] = useState(1);
  const [selectedModalCard, setSelectedModalCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddOffer = () => {
    if (!selectedCard) return;
    const existingIndex = selectedOffers.findIndex(o => o.cardId === selectedCard);
    if (existingIndex > -1) {
      const updated = [...selectedOffers];
      updated[existingIndex].quantity += offerQuantity;
      setSelectedOffers(updated);
    } else {
      setSelectedOffers([...selectedOffers, { cardId: selectedCard, quantity: offerQuantity }]);
    }
    setSelectedCard(null);
    setOfferQuantity(1);
  };

  const handleAcceptClick = () => {
    onAccept(selectedOffers);
    setSelectedOffers([]);
  };

  const getCardDetails = (cardId) => {
    return cardsData.find(card => card.id === cardId) || { name: 'Unknown Card', type: 'unknown' };
  };

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <p className="text-sm text-gray-200 mb-3">
        Pick cards to meet or exceed {trade.requiredValue} points
      </p>
      
      {/* Card Selection */}
      <div className="flex flex-col gap-2">
        <select
          value={selectedCard || ''}
          onChange={(e) => setSelectedCard(Number(e.target.value))}
          className="p-2 rounded bg-gray-700 text-gray-200"
        >
          <option value="">--Select a Card--</option>
          {myCards.filter(c => c.quantity > 0).map((card) => {
            const cardDetails = getCardDetails(card.id);
            return (
              <option key={card.id} value={card.id}>
                {cardDetails.name} ({cardDetails.type}) - Qty: {card.quantity}
              </option>
            );
          })}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={offerQuantity}
            onChange={(e) => setOfferQuantity(Number(e.target.value))}
            className="w-20 p-2 rounded bg-gray-700 text-gray-200"
          />
          <button 
            onClick={handleAddOffer}
            className="px-4 py-2 bg-[#45A29E] text-white rounded hover:bg-[#66FCF1] transition"
          >
            Add to Offer
          </button>
        </div>
      </div>

      {/* Selected Cards Display */}
      <div className="mt-4">
        <h4 className="text-gray-200 font-semibold mb-2">My Offer:</h4>
        <div className="space-y-2">
          {selectedOffers.length === 0 && (
            <p className="text-gray-400 text-sm">No cards added yet</p>
          )}
          {selectedOffers.map((off) => {
            const cardDetails = getCardDetails(off.cardId);
            return (
              <div 
                key={off.cardId}
                className={`flex items-center justify-between p-2 rounded ${
                  cardDetails.type === 'virus' ? 'bg-red-900' : 'bg-blue-900'
                } bg-opacity-30`}
              >
                <div className="flex-1">
                  <span className="text-white font-medium">{cardDetails.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      cardDetails.type === 'virus' ? 'text-red-300' : 'text-blue-300'
                    }`}>
                      {cardDetails.type.charAt(0).toUpperCase() + cardDetails.type.slice(1)}
                    </span>
                    <span className="text-gray-300 text-sm">
                      × {off.quantity}
                    </span>
                  </div>
                </div>
                {cardDetails.image && (
                  <img 
                    src={cardDetails.image} 
                    alt={cardDetails.name}
                    className="w-12 h-12 object-contain rounded cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => {
                      setSelectedModalCard(cardDetails);
                      setIsModalOpen(true);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add the modal component */}
      <CardModal
        card={selectedModalCard}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <button 
        onClick={handleAcceptClick}
        className="mt-4 w-full px-4 py-2 bg-[#45A29E] text-white rounded hover:bg-[#66FCF1] transition"
      >
        Accept Trade
      </button>
    </div>
  );
}

// Update the CardModal component with Shop.jsx styling
function CardModal({ card, isOpen, onClose }) {
  if (!isOpen || !card) return null;

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

  return (
    <div
      className="fixed inset-0 bg-transparent backdrop-blur-lg flex justify-center items-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="p-4 rounded-lg max-w-xs w-full bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={card.image}
          alt={card.name}
          className="w-full mb-4 object-cover rounded"
          style={getGlowStyle(card.rarity)}
        />
        <div>
          <div className="text-center text-[#C5C6C7] mb-2">
            <h3 className="text-xl font-bold mb-1">{card.name}</h3>
            <p className={`text-sm ${
              card.type === 'virus' ? 'text-red-300' : 'text-blue-300'
            }`}>
              {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
            </p>
            {card.rarity && (
              <p className="text-sm text-gray-400">
                Rarity: {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#66FCF1] text-[#0B0C10] rounded hover:bg-[#45A29E] transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
