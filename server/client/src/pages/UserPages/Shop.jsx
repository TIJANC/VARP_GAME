import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';
import { Card, CardMedia, Typography, Button } from '@mui/material';
import { cardsData } from '../../assets/cardsData';

const Shop = () => {
  const [userInfo, setUserInfo] = useState({
    coins: 0,
    currentLevel: 'Noob',
    answeredQuestions: 0,
  });
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // NEW: handleSellCard function
  const handleSellCard = async (cardId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/player/sell-card',
        { cardId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      // Update coins
      setUserInfo((prev) => ({ ...prev, coins: response.data.coins }));
      // Update that card's quantity
      setCards((prev) =>
        prev.map((c) => {
          if (c.id === cardId) {
            return { ...c, quantity: response.data.updatedQuantity };
          }
          return c;
        })
      );

      // If we are in the modal with that card open, update its quantity too
      if (selectedCard && selectedCard.id === cardId) {
        setSelectedCard((prev) => ({
          ...prev,
          quantity: response.data.updatedQuantity,
        }));
      }
    } catch (error) {
      console.error('Error selling card:', error);
      alert(error.response?.data?.error || 'Failed to sell card.');
    }
  };

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/shop', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Shop data fetched:', response.data);
        setUserInfo({
          coins: response.data.coins,
          currentLevel: response.data.currentLevel || 'Noob',
          answeredQuestions: response.data.answeredQuestions || 0,
        });

        const mergedCards = cardsData.map((defaultCard) => {
          const userCard = response.data.cards.find(
            (card) => card.id === defaultCard.id
          );
          return {
            ...defaultCard,
            isUnlocked: userCard ? userCard.isUnlocked : false,
            quantity: userCard ? userCard.quantity : 0,
          };
        });

        setCards(mergedCards);
      } catch (error) {
        console.error('Error fetching shop data:', error);
        alert('Failed to fetch shop data. Please try again.');
      }
    };

    fetchShopData();
  }, []);

  // Separate unlocked vs locked
  const myCards = cards.filter((c) => c.isUnlocked);
  const lockedCards = cards.filter((c) => !c.isUnlocked);

  return (
    <div className="shop-section bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-4">Card Shop</h1>

      <p className="text-center text-lg mb-6">
        Coins: <strong>{userInfo.coins}</strong> | Level:{' '}
        <strong>{userInfo.currentLevel}</strong> | Answered Questions:{' '}
        <strong>{userInfo.answeredQuestions}</strong>
      </p>

      {/* ===================== 
          SECTION: My Cards 
      ===================== */}
      <h2 className="text-2xl font-bold text-center mb-4">My Cards</h2>
      {myCards.length === 0 ? (
        <p className="text-center mb-6">You haven't unlocked any cards yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-24 max-w-7xl mx-auto mb-8">
          {myCards.map((card) => (
            <Card key={card.id} className="h-32 shadow-xl border-2 w-40">
              <CardMedia
                component="img"
                image={card.image}
                className="h-40 object-center object-cover cursor-pointer"
                onClick={() => setSelectedCard(card)}
              />
              <div className="p-2 text-center">
                <Typography variant="body2">
                  Quantity: {card.quantity}
                </Typography>
                {card.quantity > 1 && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleSellCard(card.id)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Sell
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ===================== 
          SECTION: Locked Cards 
      ===================== */}
      <h2 className="text-2xl font-bold text-center mb-4">Locked Cards</h2>
      {lockedCards.length === 0 ? (
        <p className="text-center mb-6">All cards are unlocked!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-24 max-w-7xl mx-auto">
          {lockedCards.map((card) => (
            <Card key={card.id} className="h-32 shadow-xl border-2 w-40">
              <CardMedia
                component="img"
                image={card.image}
                className="h-32 object-center object-cover filter blur-sm cursor-pointer"
                onClick={() => setSelectedCard(card)}
              />
            </Card>
          ))}
        </div>
      )}

      {/* ===================== 
          MODAL: Selected Card 
      ===================== */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-lg flex justify-center items-center"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="p-6 rounded-lg max-w-sm w-full bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedCard.image}
              alt="Card"
              className={`w-full mb-4 ${
                !selectedCard.isUnlocked ? 'filter blur-sm' : ''
              }`}
            />
            <div>
              <Typography align="center" color="textSecondary" gutterBottom>
                {selectedCard.isUnlocked
                  ? `Unlocked (Quantity: ${selectedCard.quantity ?? 0})`
                  : 'This card is only obtainable from chests.'}
              </Typography>

              {/* If we want to allow selling from the modal, only show if quantity>1 */}
              {selectedCard.isUnlocked && selectedCard.quantity > 1 && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleSellCard(selectedCard.id)}
                  style={{ marginBottom: '1rem' }}
                >
                  Sell One Duplicate
                </Button>
              )}

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() => setSelectedCard(null)}
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

export default Shop;
