import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionNavbar from '../../components/ActionNavbar';
import './Shop.css';

const Shop = () => {
  const [userInfo, setUserInfo] = useState({ coins: 0, profileCompleted: false });
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/player/shop', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Shop data fetched:', response.data); // Debugging log
        setUserInfo({
          coins: response.data.coins,
          profileCompleted: response.data.profileCompleted,
        });

        setCards(response.data.cards); // Ensure all cards are displayed
      } catch (error) {
        console.error('Error fetching shop data:', error);
        alert('Failed to fetch shop data. Please try again.');
      }
    };

    fetchShopData();
  }, []);

  const unlockCard = async (card) => {
    if (card.isUnlocked) {
      alert('This card is already unlocked!');
      return;
    }

    const token = localStorage.getItem('token');

    if (card.unlockMethod === 'coins') {
      if (userInfo.coins < card.price) {
        alert('Not enough coins to unlock this card!');
        return;
      }

      try {
        const response = await axios.post(
          '/api/player/unlock-card',
          { cardId: card.id, method: 'coins' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.message) {
          alert(`${card.name} unlocked!`);
          setUserInfo((prev) => ({
            ...prev,
            coins: response.data.coins, // Update remaining coins
          }));
          setCards((prev) =>
            prev.map((c) => (c.id === card.id ? { ...c, isUnlocked: true } : c))
          );
        }
      } catch (error) {
        console.error('Error unlocking card:', error);
        alert(
          error.response?.data?.error || 'An error occurred while unlocking the card.'
        );
      }
    } else if (card.unlockMethod === 'task') {
      if (card.task === 'Complete profile' && !userInfo.profileCompleted) {
        alert('Complete your profile to unlock this card!');
        return;
      }

      try {
        const response = await axios.post(
          '/api/player/unlock-card',
          { cardId: card.id, method: 'task' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.message) {
          alert(response.data.message);
          setCards((prev) =>
            prev.map((c) => (c.id === card.id ? { ...c, isUnlocked: true } : c))
          );
        }
      } catch (error) {
        console.error('Error unlocking card:', error);
        alert(
          error.response?.data?.error || 'An error occurred while unlocking the card.'
        );
      }
    } else {
      alert('Invalid unlock method!');
    }
  };

  return (
    <div>
      <h1>Card Shop</h1>
      <p>Coins: {userInfo.coins}</p>
      <div className="cards-container">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${card.isUnlocked ? 'unlocked' : 'locked'}`}
          >
            <h3>{card.name}</h3>
            {card.isUnlocked ? (
              <p className="status unlocked-status">Unlocked</p>
            ) : card.unlockMethod === 'coins' ? (
              <p className="status">Price: {card.price} coins</p>
            ) : (
              <p className="status">Task: {card.task}</p>
            )}
            {!card.isUnlocked && (
              <button onClick={() => unlockCard(card)}>Unlock</button>
            )}
          </div>
        ))}
      </div>

      {/* ActionNavbar */}
      <ActionNavbar
        coins={userInfo.coins}
        navigate={(route) => {
          const token = localStorage.getItem('token');
          if (token) {
            window.location.href = route;
          }
        }}
        options={[
          { label: 'Shop', route: '/shop', iconClass: 'la-store' },
          { label: 'Forum', route: '/forum', iconClass: 'la-comments' },
          { label: 'Home', route: '/home', iconClass: 'la-home' },
          { label: 'Profile', route: '/profile', iconClass: 'la-user' },
          { label: 'Map', route: '/map', iconClass: 'la-map' }, 
        ]}
      />
    </div>
  );
};

export default Shop;
