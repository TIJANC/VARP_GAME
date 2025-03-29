import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ActionNavbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { label: 'Shop', route: '/shop', iconClass: 'la-store' },
    { label: 'Trade Center', route: '/trade-center', iconClass: 'la-exchange-alt' },
    { label: 'CardGame', route: '/games/card-game', iconClass: 'la-gamepad' },
    { label: 'Home', route: '/home', iconClass: 'la-home' },
    { label: 'Forum', route: '/forum', iconClass: 'la-comments' },
    { label: 'Profile', route: '/profile', iconClass: 'la-user' },
  ];

  // Variants for the toggle button rotation.
  const toggleVariants = {
    closed: { rotate: 0 },
    open: { rotate: 90 },
  };

  // Variants for the dropdown container.
  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  // Variants for each menu item.
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <motion.button
        className="p-2 text-3xl bg-white shadow rounded-full focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close Navigation" : "Open Navigation"}
        animate={isOpen ? "open" : "closed"}
        variants={toggleVariants}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? (
          <i className="la la-times" aria-hidden="true"></i>
        ) : (
          <i className="la la-bars" aria-hidden="true"></i>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mt-2 bg-white rounded shadow p-2 flex flex-col space-y-2"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            transition={{ duration: 0.3 }}
          >
            {options.map(({ label, route, iconClass }, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  navigate(route);
                  setIsOpen(false);
                }}
                title={label}
                className="flex items-center space-x-2 text-2xl focus:outline-none"
                variants={itemVariants}
                whileHover={{ scale: 1.05, color: "#3b82f6" }}
                transition={{ duration: 0.2 }}
              >
                <i className={`la ${iconClass}`} aria-hidden="true"></i>
                <span className="text-base">{label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionNavbar;
