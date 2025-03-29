import React from 'react';
import { motion } from 'framer-motion';

export const AttackAnimation = ({ 
  attacker, 
  defender, 
  isProtected, 
  roll, 
  threshold, 
  outcome, 
  side,
  round
}) => {
  // Variant for the round indicator.
  const roundIndicatorVariants = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
  };

  // Variants for the attacker card: slide in, then pulse and rotate on impact.
  const attackerVariants = {
    initial: { x: side === 'computer->player' ? -300 : 300, opacity: 0, scale: 0.8 },
    animate: { 
      x: 0, 
      opacity: 1, 
      scale: [1.0, 1.1, 1.0],
      rotate: [0, side === 'computer->player' ? -15 : 15, 0],
    }
  };

  // Shake variant for when the attack misses.
  const shakeVariant = {
    animate: { 
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.8, ease: "easeInOut" },
    }
  };

  // Variants for the defender card: slide in and then bounce slightly.
  const defenderVariants = {
    initial: { x: side === 'computer->player' ? 300 : -300, opacity: 0, scale: 0.8 },
    animate: { 
      x: 0, 
      opacity: 1, 
      scale: [1.0, 1.05, 1.0],
    }
  };

  // Variant for the roll display with a pulse effect.
  const rollVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: [1, 1.2, 1],
    }
  };

  // Variant for a flash effect for MISS.
  const flashVariants = {
    initial: { opacity: 0 },
    animate: { opacity: [0.8, 0], scale: [1, 2] },
  };

  // Variant for a slice (slash) effect for HIT.
  const sliceVariant2 = {
    initial: { opacity: 0, scaleX: 0, rotate: side === 'computer->player' ? -45 : 45 },
    animate: { opacity: 1, scaleX: 1 },
    exit: { opacity: 0, scaleX: 0 },
  };

    // Outcome text variant for HIT.
  const outcomeTextHitVariants = {
    initial: { opacity: 0, y: -20, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: [1, 1.3, 1] },
  };

  // Outcome text variant for MISS.
  const outcomeTextMissVariants = {
    initial: { opacity: 0, y: -20, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: [1, 0.8, 1] },
  };

  return (
    <div className="relative w-full h-72 flex flex-col items-center justify-center bg-gray-100">
      {/* Round indicator */}
      {round && (
        <motion.div
          className="absolute top-4 text-3xl font-bold text-blue-500"
          variants={roundIndicatorVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8 }}
        >
          Round {round}
        </motion.div>
      )}

      {/* Container for the animated cards */}
      <div className="relative w-full h-48 flex items-center justify-center">
        {/* Attacker card */}
        { outcome === "MISS" ? (
          <motion.div 
            variants={shakeVariant}
            animate="animate"
          >
            <motion.img
              src={attacker.image}
              alt={attacker.name}
              className={`w-20 h-20 object-cover rounded absolute ${side === 'computer->player' ? 'left-0' : 'right-0'}`}
              variants={attackerVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 1.2 }}
            />
          </motion.div>
        ) : (
          <motion.img
            src={attacker.image}
            alt={attacker.name}
            className={`w-20 h-20 object-cover rounded absolute ${side === 'computer->player' ? 'left-0' : 'right-0'}`}
            variants={attackerVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 1.2 }}
          />
        )}

        {isProtected ? (
          // Always display defender if available.
          <motion.img
            src={defender.image}
            alt={defender.name}
            className={`w-20 h-20 object-cover rounded absolute ${side === 'computer->player' ? 'right-0' : 'left-0'}`}
            variants={defenderVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 1.2, delay: 0.4 }}
          />
        ) : (
          // If not protected, display the roll value with a pulse animation.
          <motion.div
            className="absolute"
            variants={rollVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {roll}
          </motion.div>
        )}

        {/* Outcome overlay: flash for MISS, slice for HIT */}
        { outcome === "MISS" && (
          <motion.div
            className={`absolute w-20 h-20 bg-sky-500 rounded ${side === 'computer->player' ? 'right-0' : 'left-0'}`}
            variants={flashVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.8, delay: 1.0 }}
          />
        )}
        { outcome === "HIT" && (
<motion.div
    className="absolute h-2 bg-red-600"
    variants={sliceVariant2}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.8, delay: 1.0 }}
    style={{
      width: '60%',
      top: '50%',
      left: side === 'computer->player' ? 'auto' : '20%',
      right: side === 'computer->player' ? '20%' : 'auto',
    }}          />
        )}
      </div>
      
      {/* Animated outcome text */}
      { outcome === "HIT" ? (
        <motion.div
          className="mt-2 text-4xl font-extrabold text-red-600"
          variants={outcomeTextHitVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          HIT!
        </motion.div>
      ) : (
        <motion.div
          className="mt-2 text-4xl font-extrabold text-green-600"
          variants={outcomeTextMissVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          MISS!
        </motion.div>
      )}

      {/* Display additional info */}
      <div className="mt-4 text-center">
        <p className="text-sm">
          Threshold: <span className="font-semibold">{threshold}</span>
        </p>
        <p className="text-sm">
          Protection:{" "}
          {isProtected ? (
            <span className="font-semibold text-green-600">
              Protected by {defender.name}
            </span>
          ) : (
            <span className="font-semibold text-red-600">Not Protected</span>
          )}
        </p>
        <p className="text-sm">
          Outcome: <span className="font-semibold">{outcome}</span>
        </p>
      </div>
    </div>
  );
};
