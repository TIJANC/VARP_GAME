import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';
import { Card, CardMedia, CardContent, Typography, Button } from '@mui/material';

const Shop = () => {
  const [userInfo, setUserInfo] = useState({
    coins: 0,
    currentLevel: 'Noob',
    answeredQuestions: 0
  });
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

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
          answeredQuestions: response.data.answeredQuestions || 0
        });

        setCards(response.data.cards.map(card => ({
          ...card,
          image: getCardImage(card.id),
        })));
      } catch (error) {
        console.error('Error fetching shop data:', error);
        alert('Failed to fetch shop data. Please try again.');
      }
    };

    fetchShopData();
  }, []);

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

  const unlockCard = async (card) => {
    if (card.isUnlocked) {
      alert('This card is already unlocked!');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        '/api/player/unlock-card',
        { cardId: card.id, method: card.unlockMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message) {
        alert(`${card.name} unlocked!`);
        setUserInfo(prev => ({ ...prev, coins: response.data.coins }));
        setCards(prev =>
          prev.map(c => (c.id === card.id ? { ...c, isUnlocked: true } : c))
        );
        setSelectedCard(prev => prev ? { ...prev, isUnlocked: true } : prev);
      }
    } catch (error) {
      console.error('Error unlocking card:', error);
      alert(error.response?.data?.error || 'An error occurred while unlocking the card.');
    }
  };

  return (
    <div className="shop-section">
      <h1>Card Shop</h1>
      <p>Coins: <strong>{userInfo.coins}</strong> | Level: <strong>{userInfo.currentLevel}</strong> | Answered Questions: <strong>{userInfo.answeredQuestions}</strong></p>

      {/* Grid layout with separate horizontal and vertical gaps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-12 gap-y-20 mx-auto max-w-7xl">
        {cards.map((card) => (
          <Card key={card.id} className="shadow-xl border-2 cursor-pointer h-48" onClick={() => setSelectedCard(card)}>
            <CardMedia
              component="img"
              image={card.image}
              className="h-32 object-center object-cover"
            />
          </Card>
        ))}
      </div>

      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={() => setSelectedCard(null)}>
          <Card className="p-6 rounded-lg shadow-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            {selectedCard.isUnlocked ? (
              <CardMedia component="img" image={selectedCard.image} alt="Card" className="w-full" />
            ) : (
              <div className="w-full h-48 bg-black"></div>
            )}
            <CardContent>
              <Typography align="center" color="textSecondary">
                {selectedCard.isUnlocked ? 'Unlocked' : selectedCard.unlockMethod === 'coins' ? `Price: ${selectedCard.price} coins` :
                 selectedCard.unlockMethod === 'task' ? `Task Required: ${selectedCard.task}` :
                 selectedCard.unlockMethod === 'level' ? `Required Level: ${selectedCard.requiredLevel}` :
                 selectedCard.unlockMethod === 'questions' ? `Requires ${selectedCard.requiredQuestions} answered questions` :
                 ''}
              </Typography>
              {!selectedCard.isUnlocked && (
                <Button variant="contained" color="primary" fullWidth onClick={() => unlockCard(selectedCard)}>Unlock</Button>
              )}
              <Button variant="contained" color="secondary" fullWidth onClick={() => setSelectedCard(null)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}

      <ActionNavbar />
    </div>
  );
};

export default Shop;
