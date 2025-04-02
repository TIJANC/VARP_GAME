import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';

const ActionNavbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { label: 'Home', route: '/home', iconClass: 'la-home', color: '#1A535C' },
    { label: 'Notifications', component: NotificationBell, color: '#E63946' },
    { label: 'Gallery', route: '/shop', iconClass: 'la-store', color: '#FF6B6B' },
    { label: 'Trade Center', route: '/trade-center', iconClass: 'la-exchange-alt', color: '#4ECDC4' },
    { label: 'CardGame', route: '/games', iconClass: 'la-gamepad', color: '#FFE66D' },
    { label: 'Forum', route: '/forum', iconClass: 'la-comments', color: '#FF9F1C' },
    { label: 'Profile', route: '/profile', iconClass: 'la-user', color: '#7209B7' },
  ];

  const toggleVariants = {
    closed: { 
      rotate: 0,
      scale: 1,
    },
    open: { 
      rotate: 180,
      scale: 1.2,
    },
  };

  const menuVariants = {
    closed: {
      scale: 0,
      opacity: 0,
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1,
      }
    },
    open: {
      scale: 1,
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    closed: { 
      x: -16,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300
      }
    },
    open: { 
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.9
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <motion.button
        className="p-4 text-3xl bg-[#0B0C10] shadow-lg rounded-full focus:outline-none text-[#66FCF1] border-2 border-[#66FCF1]"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close Navigation" : "Open Navigation"}
        variants={toggleVariants}
        animate={isOpen ? "open" : "closed"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className={`la ${isOpen ? 'la-times' : 'la-bars'}`} aria-hidden="true"></i>
      </motion.button>

      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-20 right-0 bg-[#0B0C10] rounded-lg shadow-xl p-4 border border-[#66FCF1]"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="flex flex-col space-y-3">
              {options.map((option, index) => (
                <motion.div
                  key={option.label}
                  className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-800 group"
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  custom={index}
                  onClick={() => {
                    if (option.route) {
                      navigate(option.route);
                      setIsOpen(false);
                    }
                  }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: option.color }}
                    variants={buttonVariants}
                  >
                    {option.component ? (
                      <option.component />
                    ) : (
                      <i className={`la ${option.iconClass} text-2xl text-white`} aria-hidden="true"></i>
                    )}
                  </motion.div>
                  <span className="text-[#66FCF1] font-medium">{option.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionNavbar;
