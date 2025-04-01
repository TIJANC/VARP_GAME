import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';
import { Card, CardMedia, Typography, Button } from '@mui/material';
import { cardsData } from '../../assets/cardsData';
import { FaMedal, FaCoins, FaQuestionCircle } from 'react-icons/fa';
import { GiUpgrade } from "react-icons/gi";

const Shop = () => {
  const [userInfo, setUserInfo] = useState({
    coins: 0,
    currentLevel: 'Noob',
    answeredQuestions: 0,
  });
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // Function to handle selling a card.
  const handleSellCard = async (cardId) => {
    try {
      console.log('Attempting to sell card with ID:', cardId);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/player/sell-card',
        { cardId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Sell card response:', response.data);
      alert(response.data.message);
      setUserInfo((prev) => ({ ...prev, coins: response.data.coins }));
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, quantity: response.data.updatedQuantity } : c))
      );
      if (selectedCard && selectedCard.id === cardId) {
        setSelectedCard((prev) => ({ ...prev, quantity: response.data.updatedQuantity }));
      }
    } catch (error) {
      console.error('Error selling card:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        alert(error.response.data.error || 'Failed to sell card.');
      } else {
        alert('Failed to sell card.');
      }
    }
  };
  
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/shop', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo({
          coins: response.data.coins,
          currentLevel: response.data.currentLevel || 'Noob',
          answeredQuestions: response.data.answeredQuestions || 0,
        });
        const mergedCards = cardsData.map((defaultCard) => {
          const userCard = response.data.cards.find((card) => card.id === defaultCard.id);
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

  // Separate unlocked vs locked cards.
  const myCards = cards.filter((c) => c.isUnlocked);
  const lockedCards = cards.filter((c) => !c.isUnlocked);

  // Helper function to get glow style based on rarity.
  const getGlowStyle = (rarity) => {
    switch (rarity.toLowerCase()) {
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
    <div className="shop-section relative min-h-screen p-4 overflow-y-auto bg-[#0B0C10]">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[url('/BG/bg1.jpg')] bg-cover bg-center bg-no-repeat opacity-80"></div>
      <div className="absolute inset-0 bg-[#0B0C10] opacity-80"></div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-7xl mx-auto bg-transparent bg-opacity-50 shadow-md p-6 sm:p-8 rounded-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-[#66FCF1]">
          Card Collection
        </h1>

        {/* Horizontal Stats Row */}
        <div className="flex justify-around w-full mt-6">
          <div className="flex flex-col items-center">
            <GiUpgrade className="text-3xl text-[#66FCF1]" />
            <span className="text-lg text-gray-300">Level: {userInfo.currentLevel}</span>
          </div>
          <div className="flex flex-col items-center">
            <FaQuestionCircle className="text-3xl text-[#66FCF1]" />
            <span className="text-lg text-gray-300">Answered: {userInfo.answeredQuestions}</span>
          </div>
          <div className="flex flex-col items-center">
            <FaCoins className="text-3xl" style={{ color: '#FFD700' }} />
            <span className="text-lg text-gray-300">{userInfo.coins} Coins</span>
          </div>
        </div>

        {/* My Cards Section */}
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-[#66FCF1]">
          My Cards
        </h2>
        {myCards.length === 0 ? (
          <p className="text-center mb-6 text-gray-300">
            You haven't unlocked any cards yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 max-w-7xl mx-auto mb-8">
            {myCards.map((card) => (
              <div key={card.id} className="relative">
                <Card
                  style={getGlowStyle(card.rarity)}
                  className="w-32 sm:w-40 h-32 shadow-xl border-2 border-[#66FCF1] bg-[#0A1F3B] bg-opacity-70"
                >
                  <CardMedia
                    component="img"
                    image={card.image}
                    className="h-32 sm:h-40 object-center object-cover cursor-pointer"
                    onClick={() => setSelectedCard(card)}
                  />
                  <div className="p-1 sm:p-2 text-center">
                    {card.quantity > 1 && (
                      <Button
                        variant="contained"
                        style={{
                          backgroundColor: '#45A29E',
                          color: '#FFFFFF',
                          marginTop: '0.25rem',
                          fontSize: '0.7rem',
                        }}
                        onClick={() => handleSellCard(card.id)}
                      >
                        Sell
                      </Button>
                    )}
                  </div>
                </Card>
                {/* Quantity indicator */}
                <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {card.quantity}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Locked Cards Section */}
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-[#66FCF1]">
          Locked Cards
        </h2>
        {lockedCards.length === 0 ? (
          <p className="text-center mb-6 text-gray-300">All cards are unlocked!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {lockedCards.map((card) => (
              <Card
                key={card.id}
                className="w-32 sm:w-40 h-32 shadow-xl border-2 border-[#66FCF1] bg-[#0A1F3B] bg-opacity-70"
              >
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

        {/* Modal: Enlarged Card with Glow */}
        {selectedCard && (
          <div
            className="fixed inset-0 bg-transparent backdrop-blur-lg flex justify-center items-center p-4"
            onClick={() => setSelectedCard(null)}
          >
            <div
              className="p-4 rounded-lg max-w-xs w-full bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedCard.image}
                alt="Card"
                className={`w-full mb-4 object-cover rounded ${selectedCard.isUnlocked ? '' : 'filter blur-sm'}`}
                style={selectedCard.isUnlocked ? getGlowStyle(selectedCard.rarity) : {}}
              />
              <div>
                <Typography align="center" style={{ color: '#C5C6C7' }} gutterBottom>
                  {selectedCard.isUnlocked
                    ? `Unlocked (Quantity: ${selectedCard.quantity ?? 0})`
                    : 'This card is only obtainable from chests.'}
                </Typography>
                {selectedCard.isUnlocked && selectedCard.quantity > 1 && (
                  <Button
                    variant="contained"
                    style={{ backgroundColor: '#45A29E', color: '#FFFFFF', marginBottom: '1rem', fontSize: '0.8rem' }}
                    fullWidth
                    onClick={() => handleSellCard(selectedCard.id)}
                  >
                    Sell One Duplicate
                  </Button>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setSelectedCard(null)}
                  style={{ backgroundColor: '#66FCF1', color: '#0B0C10', fontSize: '0.8rem' }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ActionNavbar />
    </div>
  );
};

export default Shop;
