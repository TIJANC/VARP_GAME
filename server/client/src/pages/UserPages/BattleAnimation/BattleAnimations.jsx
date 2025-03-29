// BattleAnimations.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Animation variants for battle log entries.
export const battleLogVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Animated component for a single battle log entry.
export const BattleLogEntry = ({ entry, index }) => {
  return (
    <motion.div
      variants={battleLogVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, delay: index * 0.3 }}
      className="border-b pb-2"
    >
      <p className="text-sm">{entry}</p>
    </motion.div>
  );
};

// Animated component for the battle outcome.
export const OutcomeAnimation = ({ outcome }) => {
  const outcomeVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <motion.div
      variants={outcomeVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
      className={`mt-6 text-center text-2xl font-bold ${
        outcome.includes('won') ? 'text-green-600' : 'text-red-600'
      }`}
    >
      {outcome}
    </motion.div>
  );
};
