import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChestOpeningAnimation = ({ closedChest, openChest, onOpenComplete }) => {
  const [animationPhase, setAnimationPhase] = useState('shaking');
  const [showGlow, setShowGlow] = useState(false);

  // Start animation sequence immediately when component mounts
  useEffect(() => {
    // Start with shaking, then transition to opening
    setTimeout(() => {
      setAnimationPhase('opening');
      setShowGlow(true);
      
      // Then transition to opened state
      setTimeout(() => {
        setAnimationPhase('opened');
        
        // Finally trigger completion callback
        setTimeout(() => {
          onOpenComplete && onOpenComplete();
        }, 500);
      }, 400);
    }, 600); // Shake for 600ms before opening
  }, [onOpenComplete]);

  const chestVariants = {
    shaking: {
      rotate: [-2, 2, -2],
      x: [-2, 2, -2],
      transition: {
        duration: 0.2,
        repeat: 3,
        ease: "easeInOut"
      }
    },
    opening: {
      rotate: [-2, 5],
      y: [0, -20],
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    opened: {
      rotate: 5,
      y: -20,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  const glowVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.2
    },
    visible: { 
      opacity: 1,
      scale: 2,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {showGlow && (
          <motion.div
            className="absolute w-full h-full rounded-full bg-yellow-400"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={glowVariants}
            style={{
              filter: "blur(30px)",
              opacity: 0.4
            }}
          />
        )}
      </AnimatePresence>

      <motion.div className="relative z-10">
        <motion.img
          src={animationPhase === 'opened' ? openChest : closedChest}
          alt="Chest"
          className="w-40 h-40"
          variants={chestVariants}
          initial="shaking"
          animate={animationPhase}
        />
      </motion.div>
    </div>
  );
};

export default ChestOpeningAnimation;
