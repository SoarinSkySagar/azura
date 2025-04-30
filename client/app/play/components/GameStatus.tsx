import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../components/ThemeProvider';

interface GameStatusProps {
  winner?: { winner?: string } | null;
  isDraw: boolean;
  xIsNext: boolean;
  showWinnerAlert: string | null;
  timeLeft?: number
}

const GameStatus: React.FC<GameStatusProps> = ({ 
  winner, 
  isDraw, 
  xIsNext, 
  showWinnerAlert,
  timeLeft,
}) => {
  const { theme } = useTheme();

  const getAlertStyles = () => {
    if (theme === 'vanilla') {
      return {
        className: "bg-orange-500 dark:bg-red-600 text-gray-800 dark:text-gray-100 py-2 px-4 rounded-lg mb-4 font-bold text-lg shadow-lg",
        style: {}
      };
    }

    return {
      className: "py-2 px-4 rounded-lg mb-4 font-bold text-lg shadow-lg",
      style: {
        backgroundColor: 'var(--board-bg)',
        color: 'var(--foreground)',
        border: '1px solid var(--square-border)'
      }
    };
  };

  const getStatusStyles = () => {
    if (theme === 'vanilla') {
      return {
        className: "h-8 text-xl text-gray-800 dark:text-gray-100",
        style: {}
      };
    }

    return {
      className: "h-8 text-xl",
      style: {
        color: 'var(--foreground)'
      }
    };
  };

  const getTimerStyles = () => {
    if (theme === 'vanilla') {
      return {
        className: "h-6 text-base text-gray-800 dark:text-gray-100",
        style: {}
      };
    }

    return {
      className: "h-6 text-sm",
      style: {
        color: 'var(--foreground)'
      }
    };
  };

  const alertStyles = getAlertStyles();
  const statusStyles = getStatusStyles();
  const timerStyles = getTimerStyles();

  return (
    <>
      <AnimatePresence mode="wait">
        {showWinnerAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={alertStyles.className}
            style={alertStyles.style}
          >
            {showWinnerAlert}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={statusStyles.className}
        style={statusStyles.style}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={winner?.winner || isDraw ? "result" : "next"}
      >
        {winner
          ? `Winner: ${winner.winner}`
          : isDraw
          ? "Draw!"
          : `Next player: ${xIsNext ? "X" : "O"}`}
      </motion.div>

      <motion.p className={timerStyles.className} style={timerStyles.style}>
        {xIsNext ? "X" : "O"}&apos;s Turn — Time Left: {timeLeft}s
      </motion.p>
    </>
  );
};

export default GameStatus;