import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameStatusProps {
  winner?: { winner?: string } | null;
  isDraw: boolean;
  xIsNext: boolean;
  showWinnerAlert: string | null;
}

const GameStatus: React.FC<GameStatusProps> = ({ 
  winner, 
  isDraw, 
  xIsNext, 
  showWinnerAlert 
}) => (
  <>
    <AnimatePresence mode="wait">
      {showWinnerAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-orange-500 dark:bg-red-600 text-gray-800 dark:text-gray-100 py-2 px-4 rounded-lg mb-4 font-bold text-lg shadow-lg"
        >
          {showWinnerAlert}
        </motion.div>
      )}
    </AnimatePresence>

    <motion.div
      className="h-8 text-xl text-gray-100"
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
  </>
);

export default GameStatus;