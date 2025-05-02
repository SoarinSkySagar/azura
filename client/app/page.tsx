"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useClientOnly } from "./hooks/useClientOnly";
import MusicToggleButton from "./components/MusicToggle";
import { JoinRoomModal } from "./components/JoinRoomModal";
import { useRouter } from "next/navigation";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { useWallet } from "./context/WalletContext";

export default function TicTacToeLanding() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const router = useRouter();

  const { client } = useDojoSDK();
  const { account } = useAccount();
  const { openWalletModal } = useWallet();

  const handleCreateGame = useCallback(async () => {
    console.log("Create custom game clicked");
    setCreateError(null);

    if (!client || !account) {
      console.error("Dojo client or account not available");
      openWalletModal();
      return;
    }

    setIsCreatingGame(true);

    try {
      console.log("Executing start_start transaction...");
      console.log("client.actions: ", client);
      const tx = await client.start.start(account);

      console.log("Waiting for transaction confirmation:", tx.transaction_hash);
      if (client.provider) {
        await client.provider.waitForTransaction(tx.transaction_hash);
        console.log("Transaction confirmed!");
      } else {
        console.warn("Provider not found on client, skipping wait for transaction confirmation.");
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log("Assuming transaction confirmed after timeout.");
      }

      console.log("Game created or joined successfully! Transaction hash:", tx.transaction_hash);
      router.push('/play');

    } catch (error) {
      console.error("Failed to create game:", error);
      setCreateError(`Failed to create game: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCreatingGame(false);
    }
  }, [client, account, router, openWalletModal]);

  const handleJoinGame = () => {
    setJoinError(null);
    setIsJoinModalOpen(true);
  };

  const handleJoinRoomSubmit = useCallback(async (roomId: string) => {
    console.log("Joining room:", roomId);
    setJoinError(null);

    if (!client || !account) {
      console.error("Dojo client or account not available");
      openWalletModal();
      return;
    }

    if (!roomId || isNaN(parseInt(roomId))) {
        setJoinError("Invalid Room ID. Please enter a number.");
        return;
    }

    setIsJoiningGame(true);

    try {
      console.log(`Executing start.join transaction for match ID: ${roomId}...`);
      const tx = await client.start.join(account, BigInt(roomId));

      console.log("Waiting for join transaction confirmation:", tx.transaction_hash);
      if (client.provider) {
        await client.provider.waitForTransaction(tx.transaction_hash);
        console.log("Join transaction confirmed!");
      } else {
        console.warn("Provider not found on client, skipping wait for transaction confirmation.");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log("Joined game successfully! Transaction hash:", tx.transaction_hash);
      setIsJoinModalOpen(false);
      router.push('/play');

    } catch (error) {
      console.error("Failed to join game:", error);
      setJoinError(`Failed to join game: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsJoiningGame(false);
    }
  }, [client, account, router, openWalletModal]);

  const handleRandomMatch = () => {
    console.log("Random matchmaking");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#1a0b2e] to-[#2c1250] text-white flex flex-col md:flex-row items-center justify-center p-4 md:space-x-12 lg:space-x-44 relative overflow-hidden">
      <ParticleBackground />
      <GameBoard />
      <GameControls
        handleCreateGame={handleCreateGame}
        handleJoinGame={handleJoinGame}
        handleRandomMatch={handleRandomMatch}
        isCreatingGame={isCreatingGame}
        createError={createError}
        isJoiningGame={isJoiningGame}
        joinError={joinError}
      />
      <MusicToggleButton />
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => { setIsJoinModalOpen(false); setJoinError(null); }}
        onJoin={handleJoinRoomSubmit}
        isLoading={isJoiningGame}
        error={joinError}
      />
    </div>
  );
}

function GameBoard() {
  return (
    <div className="relative">
      <CircularGlowingEffect />
      <motion.div
        className="mt-12 relative w-64 h-64 z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
      >
        <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4 bg-opacity-20 bg-purple-900 backdrop-blur-sm rounded-xl shadow-2xl">
          {[...Array(9)].map((_, index) => (
            <GameCell key={index} index={index} />
          ))}
        </div>
        <WinningLine />
      </motion.div>
    </div>
  );
}

function CircularGlowingEffect() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full blur-3xl opacity-30 animate-pulse-glow" />
    </div>
  );
}

function GameCell({ index }: { index: number }) {
  const cellContent = [0, 4, 5, 7, 8].includes(index)
    ? "X"
    : [1, 2, 3, 6].includes(index)
    ? "O"
    : "";
  const cellColor = cellContent === "X" ? "text-red-400" : "text-pink-400";

  return (
    <motion.div
      className={`flex items-center justify-center text-5xl font-bold ${cellColor} bg-opacity-20 bg-purple-800 rounded-lg shadow-inner`}
      initial={{ scale: 0, rotateY: -180 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ delay: 1.3 + index * 0.1, duration: 0.5, type: "spring" }}
    >
      {cellContent}
    </motion.div>
  );
}

function WinningLine() {
  return (
    <motion.div
      className="absolute top-0 left-0 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3.2, duration: 0.5 }}
    >
      <svg className="w-full h-full">
        <motion.line
          x1="0"
          y1="0"
          x2="100%"
          y2="100%"
          stroke="#4ade80"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 3.2, duration: 1.2, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

function GameControls({
  handleCreateGame,
  handleJoinGame,
  handleRandomMatch,
  isCreatingGame,
  createError,
  isJoiningGame,
  joinError,
}: {
  handleCreateGame: () => void;
  handleJoinGame: () => void;
  handleRandomMatch: () => void;
  isCreatingGame: boolean;
  createError: string | null;
  isJoiningGame: boolean;
  joinError: string | null;
}) {
  const router = useRouter();

  const commonButtonProps = {
    disabled: isCreatingGame || isJoiningGame,
  };

  return (
    <div className="mt-8 md:mt-0 z-10 w-full max-w-md flex flex-col items-center md:items-start">
      <motion.h1
        className="text-5xl sm:text-7xl font-bold mb-4 text-center md:text-left "
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
          Tic-Tac-Toe
        </span>
      </motion.h1>

      <motion.p
        className="text-xl sm:text-2xl mb-8 text-purple-300 text-center md:text-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Classic game, modern twist
      </motion.p>

      {(createError || joinError) && (
        <motion.p
          className="text-red-400 text-sm text-center w-full mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {createError || joinError}
        </motion.p>
      )}

      <div className="space-y-4 w-full">
        <GameButton
          onClick={handleCreateGame}
          className={`bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          aria-label="Create Room"
          disabled={commonButtonProps.disabled}
        >
          {isCreatingGame ? "Creating..." : "Create Room"}
        </GameButton>

        <GameButton
          onClick={handleJoinGame}
          className="bg-pink-600 hover:bg-pink-700"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          aria-label="Join Room"
          disabled={commonButtonProps.disabled}
        >
          Join Room
        </GameButton>

        <GameButton
          onClick={handleRandomMatch}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          aria-label="Play Random Match"
          disabled={commonButtonProps.disabled}
        >
          Play
        </GameButton>

        <GameButton
          onClick={() => router.push('/stake')}
          className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          aria-label="Stake STRK Tokens"
          disabled={commonButtonProps.disabled}
        >
          Stake STRK
        </GameButton>
      </div>
    </div>
  );
}

function GameButton({
  children,
  className,
  disabled,
  onClick,
  initial,
  animate,
  transition,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animate?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transition?: any;
  "aria-label"?: string;
}) {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className="w-full"
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-3 px-6 text-white rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 font-bold text-xl shadow-lg ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    </motion.div>
  );
}

function ParticleBackground() {
  const isClient = useClientOnly();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {isClient && [...Array(50)].map((_, i) => (
        <Particle key={i} />
      ))}
    </div>
  );
}

function Particle() {
  const randomPosition = useCallback(() => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0 };
    }
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    }
  }, []);

  const [position, setPosition] = useState(() => randomPosition());

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const interval = setInterval(() => {
          setPosition(randomPosition());
        }, Math.random() * 10000 + 5000);

        return () => clearInterval(interval);
    }
  }, [randomPosition]);

  const isClient = useClientOnly();
  if (!isClient) {
     return null;
  }

  return (
    <motion.div
      className="absolute w-1 h-1 bg-white rounded-full"
      initial={{
        x: position.x,
        y: position.y,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        x: position.x,
        y: position.y,
        scale: [1, 1.5, 1],
        opacity: [0.2, 0.8, 0.2],
      }}
      transition={{
        x: { duration: Math.random() * 5 + 5, ease: "linear" },
        y: { duration: Math.random() * 5 + 5, ease: "linear" },
        scale: { duration: Math.random() * 2 + 1, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: Math.random() * 2 + 1, repeat: Infinity, ease: "easeInOut" }
      }}
    />
  );
}