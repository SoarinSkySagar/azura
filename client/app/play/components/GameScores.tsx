import React from 'react';
import { motion } from 'framer-motion';

interface GameScoresProps {
  xScore: number;
  oScore: number;
}

const GameScores: React.FC<GameScoresProps> = ({ xScore, oScore }) => (
  <motion.div className="flex justify-center space-x-8 mb-8">
    <div className="text-center">
      <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
        X Score:
      </span>
      <motion.span
        key={xScore}
        className="ml-2 text-2xl"
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {xScore}
      </motion.span>
    </div>
    <div className="text-center">
      <span className="text-xl font-bold text-red-700 dark:text-red-400">
        O Score:
      </span>
      <motion.span
        key={oScore}
        className="ml-2 text-2xl"
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {oScore}
      </motion.span>
    </div>
  </motion.div>
);

export default GameScores;