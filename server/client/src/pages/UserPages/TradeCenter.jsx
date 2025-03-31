import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';

export default function TradeCenter() {
  const [myCards, setMyCards] = useState([]);
  const [openTrades, setOpenTrades] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [quantityToTrade, setQuantityToTrade] = useState(1);
  const [requiredValue, setRequiredValue] = useState(10);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchUserProfile();  // so we know user._id
    fetchMyCards();
    fetchOpenTrades();
  }, []);

  // Fetch the logged-in user’s profile to get their _id
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

  // Fetch the user’s cards (with duplicates)
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

        {/* Open Trades Section */}
        <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-[#66FCF1] mb-4">Open Trades</h2>
          {openTrades.length === 0 ? (
            <p className="text-gray-300">No open trades at the moment.</p>
          ) : (
            openTrades.map((trade) => (
              <div key={trade._id} className="border border-gray-700 p-4 my-2 rounded">
                <p className="text-gray-200">
                  <strong>Trade #{trade._id.slice(-5)}</strong>
                  <br />
                  Owner ID: {trade.ownerId}
                  <br />
                  Offering:{" "}
                  {trade.offer
                    .map((off) => `Card #${off.cardId} x${off.quantity}`)
                    .join(", ")}
                  <br />
                  Required Value: {trade.requiredValue}
                </p>
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
            ))
          )}
        </div>
      </div>
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

  const duplicatesOrAll = myCards.filter((c) => c.quantity > 0);

  return (
    <div className="mt-2">
      <p className="text-sm text-gray-200">
        Pick which cards you're offering to meet or exceed {trade.requiredValue} points.
      </p>
      <div className="flex items-center space-x-2 mt-2">
        <select
          value={selectedCard || ''}
          onChange={(e) => setSelectedCard(Number(e.target.value))}
          className="p-2 rounded bg-gray-700 text-gray-200"
        >
          <option value="">--Select a Card--</option>
          {duplicatesOrAll.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name} (Qty: {card.quantity})
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={offerQuantity}
          onChange={(e) => setOfferQuantity(Number(e.target.value))}
          className="w-16 p-2 rounded bg-gray-700 text-gray-200"
        />
        <button onClick={handleAddOffer} className="px-3 py-1 bg-blue-500 text-white rounded">
          Add to Offer
        </button>
      </div>

      <div className="mt-2">
        <h4 className="text-gray-200 text-sm">My Offer:</h4>
        {selectedOffers.length === 0 && <p className="text-gray-400 text-xs">No cards added yet</p>}
        {selectedOffers.map((off) => (
          <p key={off.cardId} className="text-gray-300 text-xs">
            Card #{off.cardId} x {off.quantity}
          </p>
        ))}
      </div>

      <button onClick={handleAcceptClick} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">
        Accept Trade
      </button>
    </div>
  );
}
