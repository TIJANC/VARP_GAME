import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('/api/pvp/notifications', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(Array.isArray(response.data) ? response.data : []);
      setUnreadCount(
        Array.isArray(response.data) 
          ? response.data.filter(n => !n.read).length 
          : 0
      );
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Remove notification from UI immediately
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n._id !== notificationId)
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));

      // Then make the API call
      await axios.put(`/api/pvp/notifications/${notificationId}/read`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

    } catch (err) {
      console.error('Error marking notification as read:', err);
      // If there's an error, revert the changes
      fetchNotifications();
    }
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'battle_result':
        return (
          <div>
            <p className="text-gray-300 text-sm">{notification.content}</p>
            {notification.battleData && (
              <div className="mt-2 text-sm text-gray-400">
                <p>VS {notification.battleData.opponentName}</p>
                <p>Score: {notification.battleData.playerHits} - {notification.battleData.opponentHits}</p>
              </div>
            )}
          </div>
        );
      case 'trade_accepted':
        return (
          <div>
            <p className="text-gray-300 text-sm">{notification.content}</p>
            {notification.tradeData && (
              <div className="mt-2 text-sm text-gray-400">
                <p>Received cards:</p>
                {notification.tradeData.offeredCards.map((card, index) => (
                  <p key={index} className={`text-sm ${
                    card.type === 'virus' ? 'text-red-300' : 'text-blue-300'
                  }`}>
                    {card.name} × {card.quantity}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return <p className="text-gray-300 text-sm">{notification.content}</p>;
    }
  };

  return (
    <div className="relative">
      <motion.button
        className="relative p-2"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <FaBell className="text-[#66FCF1] text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    className={`p-4 border-b border-gray-700 ${
                      !notification.read ? 'bg-gray-700' : ''
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[#66FCF1] font-semibold">
                          {notification.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {notification.content}
                        </p>
                        {notification.battleData && (
                          <div className="mt-2 text-sm text-gray-400">
                            <p>VS {notification.battleData.opponentName}</p>
                            <p>Score: {notification.battleData.playerHits} - {notification.battleData.opponentHits}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="mt-2 text-xs text-[#66FCF1] hover:text-[#45A29E]"
                      >
                        Mark as read
                      </button>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No notifications
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell; 