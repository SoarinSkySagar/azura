import React from 'react';
import { motion } from 'framer-motion';
import Square from './Square';
import { useTheme } from '../../components/ThemeProvider';

interface GameBoardProps {
  squares: (string | null)[];
  onClick: (i: number) => void;
  winner?: { line?: number[] } | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ squares, onClick, winner }) => {
  const { theme } = useTheme();

  const getBoardStyles = () => {
    if (theme === 'vanilla') {
      return {
        className: "grid grid-cols-9 gap-1 mb-8",
        style: {}
      };
    }

    return {
      className: "grid grid-cols-9 gap-1 mb-8 p-4 rounded-lg",
      style: {
        backgroundColor: 'var(--board-bg)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    };
  };

  const boardStyles = getBoardStyles();

  return (
    <motion.div
      className={boardStyles.className}
      style={boardStyles.style}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {squares.map((square, i) => (
        <Square
          key={i}
          value={square}
          onClick={() => onClick(i)}
          winningSquare={winner?.line?.includes(i) ?? false}
        />
      ))}
    </motion.div>
  );
};

export default GameBoard;