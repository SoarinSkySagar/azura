"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import GameBoard from './components/GameBoard';
import GameScores from './components/GameScores';
import GameStatus from './components/GameStatus';
import { useTheme } from '../components/ThemeProvider';
import { useAccount } from "@starknet-react/core";
import { dojoConfig } from "../dojo/dojo.config";

const TicTacToe = () => {
  const [squares, setSquares] = useState<(string | null)[]>(
    Array(81).fill(null)
  );
  const [xIsNext, setXIsNext] = useState(true);
  const [xScore, setXScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [showWinnerAlert, setShowWinnerAlert] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<number | null>(null);
  const { theme } = useTheme();
  const { account } = useAccount();

  const [loading, setLoading] = useState(false);

  // Define the PlayerEdge type outside the function to avoid recreation
  type PlayerEdge = {
    node: {
      address: string;
      marks: { i: number; j: number }[];
      turn: boolean;
      match_id: number;
    }
  };

  const fetchPlayerData = useCallback(async () => {
    if (!account?.address) {
      return;
    }

    setLoading(true);

    try {
      const query = `
        query {
          enginePlayerModels {
            edges {
              node {
                address
                marks {
                  i
                  j
                }
                turn
                match_id
              }
            }
          }
        }
      `;

      const response = await fetch(`${dojoConfig.toriiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (result.data?.enginePlayerModels?.edges?.length > 0) {
        const edges = result.data.enginePlayerModels.edges;

        const playerNode = edges.find(
          (edge: PlayerEdge) => edge.node.address === account?.address
        );

        if (playerNode?.node && playerNode.node.match_id !== undefined) {
          setMatchId(Number(playerNode.node.match_id));
        }
      }
    } catch (err) {
      console.error('Error fetching player data:', err);
    } finally {
      setLoading(false);
    }
  }, [account?.address, setLoading, setMatchId]);

  useEffect(() => {
    if (account?.address) {
      fetchPlayerData();
    }
  }, [account?.address, fetchPlayerData]);


  const calculateWinner = (squares: (string | null)[]) => {
    // Rows
    const lines = [];

    // Horizontal lines (rows)
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col <= 4; col++) {
        const start = row * 9 + col;
        lines.push([start, start + 1, start + 2, start + 3, start + 4]);
      }
    }

    // Vertical lines (columns)
    for (let col = 0; col < 9; col++) {
      for (let row = 0; row <= 4; row++) {
        const start = row * 9 + col;
        lines.push([start, start + 9, start + 18, start + 27, start + 36]);
      }
    }

    // Diagonal lines (top-left to bottom-right)
    for (let row = 0; row <= 4; row++) {
      for (let col = 0; col <= 4; col++) {
        const start = row * 9 + col;
        lines.push([start, start + 10, start + 20, start + 30, start + 40]);
      }
    }

    // Diagonal lines (top-right to bottom-left)
    for (let row = 0; row <= 4; row++) {
      for (let col = 4; col < 9; col++) {
        const start = row * 9 + col;
        lines.push([start, start + 8, start + 16, start + 24, start + 32]);
      }
    }

    for (const line of lines) {
      const [a, b, c, d, e] = line;
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c] &&
        squares[a] === squares[d] &&
        squares[a] === squares[e]
      ) {
        return { winner: squares[a], line: [a, b, c, d, e] };
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
    setSquares(Array(81).fill(null));
    setXIsNext(true);
    setShowWinnerAlert(null);
  };

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  useEffect(() => {
    if (!showWinnerAlert) return;
    const timeout = setTimeout(() => setShowWinnerAlert(null), 3000);
    return () => clearTimeout(timeout);
  }, [showWinnerAlert]);

  const getContainerStyles = () => {
    if (theme === 'vanilla') {
      return {
        className: "bg-gradient-to-br from-orange-300 via-amber-300 to-yellow-400 dark:from-[#0a192f] dark:via-[#0a192f] dark:to-[#112240] text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen pt-20",
        style: {}
      };
    }

    return {
      className: "text-foreground transition-colors duration-300 min-h-screen",
      style: {
        background: 'var(--background)',
        color: 'var(--foreground)'
      }
    };
  };

  const getTitleStyles = () => {
    if (theme === 'vanilla') {
      return {
        className: "text-4xl md:text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-red-500 dark:to-red-700",
        style: {}
      };
    }

    return {
      className: "text-4xl md:text-6xl font-bold mb-8",
      style: { color: 'var(--x-color)' }
    };
  };

  const getResetButtonStyles = () => {
    if (theme === 'vanilla') {
      return {
        className: "px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-red-800 dark:to-red-500 text-white rounded-lg text-lg font-semibold shadow-lg hover:from-orange-600 hover:to-amber-600 dark:hover:from-red-500 dark:hover:to-red-800 transition-colors duration-300",
        style: {}
      };
    }

    return {
      className: "px-6 py-3 rounded-lg text-lg font-semibold shadow-lg transition-colors duration-300",
      style: {
        backgroundColor: 'var(--board-bg)',
        color: 'var(--foreground)',
        border: '1px solid var(--square-border)'
      }
    };
  };

  const containerStyles = getContainerStyles();
  const titleStyles = getTitleStyles();
  const resetButtonStyles = getResetButtonStyles();

  return (
    <div className="min-h-screen">
      <div className={containerStyles.className} style={containerStyles.style}>
        <div className="container mx-auto px-4 py-4 flex flex-col items-center justify-center min-h-screen">
          <motion.h1
            className={titleStyles.className}
            style={titleStyles.style}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Tic Tac Toe 9x9
          </motion.h1>

          <p className="text-center mb-4 text-sm md:text-base">
            Get 5 in a row to win!
          </p>

          {matchId !== null && (
            <div className="text-center mb-4 p-2 bg-opacity-80 rounded-lg bg-gray-100 dark:bg-gray-800">
              <p className="font-semibold">Room ID: {matchId}</p>
            </div>
          )}

          {loading && (
            <div className="text-center mb-4">
              <p>Loading room information...</p>
            </div>
          )}

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
            className={resetButtonStyles.className}
            style={resetButtonStyles.style}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset Game
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;