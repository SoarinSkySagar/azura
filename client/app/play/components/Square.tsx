import React from 'react';
import { motion } from 'framer-motion';

interface SquareProps {
  value: string | null;
  onClick: () => void;
  winningSquare: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, winningSquare }) => (
  <motion.button
    onClick={onClick}
    className={`w-20 h-20 md:w-24 md:h-24 border-4 text-4xl font-bold flex items-center justify-center rounded-lg shadow-lg
      ${
        winningSquare
          ? "bg-yellow-300 border-yellow-500 text-orange-700 dark:bg-gray-900 dark:border-slate-300 dark:text-orange-200"
          : "bg-white border-orange-500 hover:bg-orange-100 dark:bg-[#0a192f] dark:border-red-700 dark:hover:bg-gray-800"
      }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {value && (
      <motion.span
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        className={
          value === "X"
            ? "text-blue-600 dark:text-blue-400"
            : "text-red-600 dark:text-red-400"
        }
      >
        {value}
      </motion.span>
    )}
  </motion.button>
);

export default Square;