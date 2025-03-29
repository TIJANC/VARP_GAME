import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';

export default function TradeCenter() {
  const [myCards, setMyCards] = useState([]);
  const [openTrades, setOpenTrades] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [quantityToTrade, setQuantityToTrade] = useState(1);
  const [requiredValue, setRequiredValue] = useState(10);

  // NEW: store the logged-in user’s ID so we know if they own a trade
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
      // Suppose the response includes { _id: "...", username, etc. }
      // or maybe { userId: "...", ... } if that’s how your profile route is structured
      // We'll assume it returns { ... , userId: 'someObjectId' }

      // If your actual route returns { username, email, ... } but not userId,
      // you may need to embed userId in it or use res.data._id, etc.
      // Let's assume res.data has userId or _id:
      setUserId(res.data._id); // or res.data.userId
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // 1) Fetch the user’s cards (with duplicates)
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

  // 2) Fetch all open trades from the server
  const fetchOpenTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      // NOTE: if your route is actually /api/trade/active, adjust accordingly:
      const res = await axios.get('/api/player/active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenTrades(res.data.trades || []);
    } catch (err) {
      console.error('Error fetching open trades:', err);
      alert('Error fetching open trades');
    }
  };

  // 3) Create a trade listing
  const handleCreateTrade = async () => {
    try {
      const token = localStorage.getItem('token');
      // NOTE: if your route is actually /api/trade/create, adjust path accordingly
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

  // 4) Accept a trade
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
    <div className="p-4">
      <h1>Global Trade Center</h1>

      {/* Section A: Create a new trade */}
      <div className="create-trade-section">
      <ActionNavbar/>
        <h2>Create a Trade</h2>
        <div>
          <label>Choose a Duplicate Card</label>
          <select
            value={selectedCardId || ''}
            onChange={(e) => setSelectedCardId(Number(e.target.value))}
          >
            <option value="">--Select a Card--</option>
            {myCards
              .filter((c) => c.quantity > 1) // only duplicates
              .map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} (Qty: {card.quantity})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label>Quantity to Trade:</label>
          <input
            type="number"
            value={quantityToTrade}
            onChange={(e) => setQuantityToTrade(Number(e.target.value))}
            min={1}
          />
        </div>

        <div>
          <label>Required Value (points):</label>
          <input
            type="number"
            value={requiredValue}
            onChange={(e) => setRequiredValue(Number(e.target.value))}
            min={1}
          />
        </div>

        <button onClick={handleCreateTrade}>Create Trade</button>
      </div>

      {/* Section B: List open trades */}
      <div className="open-trades-section mt-6">
        <h2>Open Trades</h2>
        {openTrades.map((trade) => (
          <div key={trade._id} className="border p-2 my-2">
            <p>
              <strong>Trade #{trade._id.slice(-5)}</strong> <br />
              Owner ID: {trade.ownerId} <br />
              Offering:{" "}
              {trade.offer
                .map((off) => `Card #${off.cardId} x${off.quantity}`)
                .join(", ")}
              <br />
              Required Value: {trade.requiredValue}
            </p>
            {/* If trade.ownerId === userId, hide or disable "Accept" */}
            {String(trade.ownerId) === String(userId) ? (
              <p className="text-red-500">
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
    </div>
  );
}

/**
 * AcceptTradeForm:
 *  - Let user select any number of cards (and quantities) from their duplicates
 *    to meet or exceed the requiredValue. 
 *  - We store those picks in `selectedOffers` as an array of { cardId, quantity }.
 *  - Then the user clicks "Accept Trade" to finalize.
 */
function AcceptTradeForm({ trade, myCards, onAccept }) {
  const [selectedOffers, setSelectedOffers] = useState([]);
  
  // For picking a single card and quantity at a time
  const [selectedCard, setSelectedCard] = useState(null);
  const [offerQuantity, setOfferQuantity] = useState(1);

  // Handle adding a single { cardId, quantity } to the "selectedOffers" array
  const handleAddOffer = () => {
    if (!selectedCard) return;
    // Check if we already have that card in the array
    const existingIndex = selectedOffers.findIndex(o => o.cardId === selectedCard);
    if (existingIndex > -1) {
      // update quantity
      const updated = [...selectedOffers];
      updated[existingIndex].quantity += offerQuantity;
      setSelectedOffers(updated);
    } else {
      // push a new one
      setSelectedOffers([...selectedOffers, { cardId: selectedCard, quantity: offerQuantity }]);
    }
    // reset local picks
    setSelectedCard(null);
    setOfferQuantity(1);
  };

  const handleAcceptClick = () => {
    onAccept(selectedOffers);
    setSelectedOffers([]); // clear after sending
  };

  // Filter myCards to only those with quantity > 0
  // so the user doesn't pick a card they don't have
  const duplicatesOrAll = myCards.filter((c) => c.quantity > 0);

  return (
    <div className="mt-2">
      <p className="text-sm">
        Pick which cards you're offering to meet or exceed {trade.requiredValue} points.
      </p>
      {/* Card selection */}
      <div className="flex items-center space-x-2">
        <select
          value={selectedCard || ''}
          onChange={(e) => setSelectedCard(Number(e.target.value))}
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
          style={{ width: '60px' }}
        />
        <button onClick={handleAddOffer}>Add to Offer</button>
      </div>

      {/* Show the current selectedOffers */}
      <div className="mt-2">
        <h4>My Offer:</h4>
        {selectedOffers.length === 0 && <p>No cards added yet</p>}
        {selectedOffers.map((off) => (
          <p key={off.cardId}>
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
