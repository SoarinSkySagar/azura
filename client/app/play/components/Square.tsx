import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../components/ThemeProvider';

interface SquareProps {
  value: string | null;
  onClick: () => void;
  winningSquare: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, winningSquare }) => {
  const { theme } = useTheme();

  const getSquareStyles = () => {
    if (theme === 'vanilla') {
      return {
        className: `w-8 h-8 md:w-10 md:h-10 border-2 text-lg font-bold flex items-center justify-center rounded-md shadow-md ${
          winningSquare
            ? "bg-yellow-300 border-yellow-500 text-orange-700 dark:bg-gray-900 dark:border-slate-300 dark:text-orange-200"
            : "bg-white border-orange-500 hover:bg-orange-100 dark:bg-[#0a192f] dark:border-red-700 dark:hover:bg-gray-800"
        }`,
        style: {}
      };
    }

    return {
      className: "w-8 h-8 md:w-10 md:h-10 text-lg font-bold flex items-center justify-center rounded-md",
      style: {
        backgroundColor: winningSquare ? 'var(--hover-bg)' : 'var(--square-bg)',
        border: `2px solid ${winningSquare ? 'var(--x-color)' : 'var(--square-border)'}`,
        color: 'var(--foreground)',
        boxShadow: '0 2px 3px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)'
      }
    };
  };

  const getSymbolStyles = () => {
    if (theme === 'vanilla') {
      return {
        className: value === "X"
          ? "text-blue-600 dark:text-blue-400 text-sm md:text-base"
          : "text-red-600 dark:text-red-400 text-sm md:text-base",
        style: {}
      };
    }

    return {
      className: "text-sm md:text-base",
      style: {
        color: value === 'X' ? 'var(--x-color)' : 'var(--o-color)'
      }
    };
  };

  const squareStyles = getSquareStyles();
  const symbolStyles = getSymbolStyles();

  return (
    <motion.button
      onClick={onClick}
      className={squareStyles.className}
      style={squareStyles.style}
      whileHover={theme === 'vanilla' ? { scale: 1.05 } : {
        scale: 1.05,
        backgroundColor: 'var(--hover-bg)'
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {value && (
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className={symbolStyles.className}
          style={symbolStyles.style}
        >
          {value}
        </motion.span>
      )}
    </motion.button>
  );
};

export default Square;