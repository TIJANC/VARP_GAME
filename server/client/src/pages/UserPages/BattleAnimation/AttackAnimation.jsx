import React from 'react';
import { motion } from 'framer-motion';
import { GiBrokenShield, GiEdgedShield, GiSkullBolt, GiShamrock } from 'react-icons/gi';

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

  // Variants for the attacker card.
  const attackerVariants = {
    initial: { x: side === 'computer->player' ? -200 : 200, opacity: 0, scale: 0.8 },
    animate: { 
      x: 0, 
      opacity: 1, 
      scale: [1.0, 1.1, 1.0],
      rotate: [0, side === 'computer->player' ? -15 : 15, 0],
    }
  };

  // Variants for the defender card.
  const defenderVariants = {
    initial: { x: side === 'computer->player' ? 200 : -200, opacity: 0, scale: 0.8 },
    animate: { 
      x: 0, 
      opacity: 1, 
      scale: [1.0, 1.05, 1.0],
    }
  };

  // Variant for the roll display.
  const rollVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  // Icon fade variant.
  const outcomeIconVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  // Normalize outcome for consistent comparison.
  const normalizedOutcome = outcome.toUpperCase();

  // Determine which icon to display based on scenario.
  let outcomeIcon;
  if (isProtected) {
    // Vaccinated scenario.
    outcomeIcon = normalizedOutcome === "HIT" 
      ? <GiBrokenShield className="text-red-600 text-[70px] sm:text-[90px]" /> 
      : <GiEdgedShield className="text-green-600 text-[70px] sm:text-[120px]" />;
  } else {
    // Not vaccinated scenario.
    outcomeIcon = normalizedOutcome === "HIT" 
      ? <GiSkullBolt className="text-red-600 text-[70px] sm:text-[90px]" /> 
      : <GiShamrock className="text-green-600 text-[70px] sm:text-[90px]" />;
  }

  return (
    <div className="relative w-full sm:w-1/2 h-72 flex flex-col items-center justify-center bg-[#0B0C10]">
      {/* Round indicator */}
      {round && (
        <motion.div
          className="absolute top-4 text-3xl font-bold text-[#66FCF1]"
          variants={roundIndicatorVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8 }}
        >
          Round {round}
        </motion.div>
      )}

      {/* Animated cards container */}
      <div className="relative w-full h-48 flex items-center justify-center">
        {/* Attacker card */}
        <motion.img
          src={attacker.image}
          alt={attacker.name}
          className={`w-16 h-18 sm:w-48 sm:h-50 object-cover rounded absolute ${side === 'computer->player' ? 'left-0' : 'right-0'}`}
          variants={attackerVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 1.2 }}
        />
        
        {isProtected ? (
          <motion.img
            src={defender.image}
            alt={defender.name}
            className={`w-16 h-18 sm:w-48 sm:h-50 object-cover rounded absolute ${side === 'computer->player' ? 'right-0' : 'left-0'}`}
            variants={defenderVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 1.2, delay: 0.4 }}
          />
        ) : (
          <motion.div
            className="absolute text-white text-2xl"
            variants={rollVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {roll}
          </motion.div>
        )}
      </div>
      
      {/* Outcome Icon */}
      <motion.div
        className="mt-2"
        variants={outcomeIconVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        {outcomeIcon}
      </motion.div>

      {/* Additional info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-white">
          Damage: <span className="font-semibold">{threshold}</span>
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
        <p className="text-sm text-white">
          Outcome: <span className="font-semibold">{outcome}</span>
        </p>
      </div>
    </div>
  );
};
