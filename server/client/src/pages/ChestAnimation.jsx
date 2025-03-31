import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ChestOpeningAnimation = ({ closedChest, openChest, onOpenComplete }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Spring animation for transitioning chest from closed to open.
  const chestVariants = {
    closed: { scale: 1, rotate: 0 },
    open: { 
      scale: 1.2, 
      rotate: 10,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const handleClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      // After the chest opens, trigger the callback after a short delay.
      setTimeout(() => {
        onOpenComplete && onOpenComplete();
      }, 1000);
    }
  };

  return (
    <motion.img
      src={isOpen ? openChest : closedChest}
      alt="Chest"
      className="w-40 h-40 cursor-pointer"
      variants={chestVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      onClick={handleClick}
    />
  );
};

export default ChestOpeningAnimation;
