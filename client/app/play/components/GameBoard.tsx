import React from 'react';
import { motion } from 'framer-motion';
import Square from './Square';

interface GameBoardProps {
  squares: (string | null)[];
  onClick: (i: number) => void;
  winner?: { line?: number[] } | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ squares, onClick, winner }) => (
  <motion.div
    className="grid grid-cols-3 gap-2 mb-8"
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

export default GameBoard;