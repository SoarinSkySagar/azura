"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
// import Square from './Square';
import GameBoard from './components/GameBoard';
import GameScores from './components/GameScores';
import GameStatus from './components/GameStatus';

const TicTacToe = () => {
  const [squares, setSquares] = useState<(string | null)[]>(
    Array(9).fill(null)
  );
  const [xIsNext, setXIsNext] = useState(true);
  const [xScore, setXScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showWinnerAlert, setShowWinnerAlert] = useState<string | null>(null);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    return null;
  };

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every((square) => square !== null);

  const handleClick = (i: number) => {
    if (squares[i] || winner) return;

    const newSquares = squares.slice();
    newSquares[i] = xIsNext ? "X" : "O";
    setSquares(newSquares);
    setXIsNext(!xIsNext);

    const gameWinner = calculateWinner(newSquares);
    if (gameWinner) {
      setShowWinnerAlert(`Winner: ${gameWinner.winner}`);
      if (gameWinner.winner === "X") {
        setXScore((prev) => prev + 1);
      } else {
        setOScore((prev) => prev + 1);
      }
    } else if (newSquares.every((square) => square !== null)) {
      setShowWinnerAlert("It's a Draw!");
    }
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setShowWinnerAlert(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);

    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (!showWinnerAlert) return;
    const timeout = setTimeout(() => setShowWinnerAlert(null), 3000);
    return () => clearTimeout(timeout);
  }, [showWinnerAlert]);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-orange-300 via-amber-300 to-yellow-400 dark:from-[#0a192f] dark:via-[#0a192f] dark:to-[#112240] text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-red-500 dark:to-red-700"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Tic Tac Toe
          </motion.h1>

          <GameBoard 
            squares={squares} 
            onClick={handleClick} 
            winner={winner} 
          />

          <GameStatus 
            winner={winner} 
            isDraw={isDraw} 
            xIsNext={xIsNext} 
            showWinnerAlert={showWinnerAlert} 
          />

          <GameScores 
            xScore={xScore} 
            oScore={oScore} 
          />

          <motion.button
            onClick={resetGame}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-red-800 dark:to-red-500 text-white rounded-lg text-lg font-semibold shadow-lg hover:from-orange-600 hover:to-amber-600 dark:hover:from-red-500 dark:hover:to-red-800 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset Game
          </motion.button>

          <motion.button
            onClick={toggleTheme}
            className="mt-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;