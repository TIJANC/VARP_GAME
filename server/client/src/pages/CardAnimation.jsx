import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CardPopAnimation = ({ card, isVisible, onAnimationComplete }) => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -15 },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }
    },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence>
      {isVisible && card && (
        <motion.div
          className="mx-auto"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onAnimationComplete={onAnimationComplete}
        >
          <img
            src={card.image}
            alt={card.name}
            className="w-32 h-32 object-cover rounded"
          />
          <p className="mt-2 text-center text-sm text-white">{card.name}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CardPopAnimation;
