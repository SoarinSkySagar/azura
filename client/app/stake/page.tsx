"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function StakePage() {
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - In a real application, this would be fetched from the blockchain
  const stakedBalance = "1,250.00";
  const availableBalance = "3,750.00";
  const totalRewards = "125.45";
  const aprRate = "12.5%";

  const handleStake = async () => {
    if (!stakeAmount) return;
    
    setIsLoading(true);
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setStakeAmount("");
    // In a real application, this would call a smart contract to stake
    alert(`Successfully staked ${stakeAmount} STRK`);
  };

  const handleUnstake = async () => {
    if (!unstakeAmount) return;
    
    setIsLoading(true);
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setUnstakeAmount("");
    // In a real application, this would call a smart contract to unstake
    alert(`Successfully unstaked ${unstakeAmount} STRK`);
  };

  const handleClaimRewards = async () => {
    setIsLoading(true);
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    // In a real application, this would call a smart contract to claim rewards
    alert(`Successfully claimed ${totalRewards} STRK rewards`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#1a0b2e] to-[#2c1250] text-white flex flex-col items-center p-4 pt-16">
      <ParticleBackground />

      <motion.h1
        className="text-4xl sm:text-5xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
          STRK Token Staking
        </span>
      </motion.h1>

      <motion.div
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <InfoCard title="Staked" value={`${stakedBalance} STRK`} />
        <InfoCard title="Available Balance" value={`${availableBalance} STRK`} />
        <InfoCard title="Annual APR" value={aprRate} />
      </motion.div>

      <motion.div
        className="w-full max-w-4xl mb-8 bg-opacity-20 bg-purple-900 backdrop-blur-sm rounded-xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-purple-300">Accumulated Rewards</h2>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              {totalRewards} STRK
            </p>
          </div>
          <button
            onClick={handleClaimRewards}
            disabled={isLoading}
            className="mt-4 md:mt-0 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Claim Rewards"}
          </button>
        </div>
      </motion.div>

      <motion.div
        className="w-full max-w-4xl bg-opacity-20 bg-purple-900 backdrop-blur-sm rounded-xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex border-b border-purple-700 mb-6">
          <button
            className={`px-4 py-2 font-medium text-lg ${
              activeTab === "stake"
                ? "text-pink-400 border-b-2 border-pink-400"
                : "text-gray-300 hover:text-white"
            }`}
            onClick={() => setActiveTab("stake")}
          >
            Stake
          </button>
          <button
            className={`px-4 py-2 font-medium text-lg ${
              activeTab === "unstake"
                ? "text-pink-400 border-b-2 border-pink-400"
                : "text-gray-300 hover:text-white"
            }`}
            onClick={() => setActiveTab("unstake")}
          >
            Unstake
          </button>
        </div>

        {activeTab === "stake" && (
          <div className="space-y-6">
            <div>
              <label className="block text-purple-300 mb-2 font-medium">Stake Amount</label>
              <div className="relative">
                <input
                  type="text"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Enter stake amount"
                  className="w-full px-4 py-3 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                />
                <button
                  onClick={() => setStakeAmount(availableBalance.replace(/,/g, ""))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-pink-600 px-2 py-1 rounded text-white"
                >
                  Max
                </button>
              </div>
              <p className="text-sm text-purple-400 mt-2">Available: {availableBalance} STRK</p>
            </div>

            <button
              onClick={handleStake}
              disabled={!stakeAmount || isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 font-bold text-xl shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Stake STRK"}
            </button>
          </div>
        )}

        {activeTab === "unstake" && (
          <div className="space-y-6">
            <div>
              <label className="block text-purple-300 mb-2 font-medium">Unstake Amount</label>
              <div className="relative">
                <input
                  type="text"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="Enter unstake amount"
                  className="w-full px-4 py-3 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                />
                <button
                  onClick={() => setUnstakeAmount(stakedBalance.replace(/,/g, ""))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-pink-600 px-2 py-1 rounded text-white"
                >
                  Max
                </button>
              </div>
              <p className="text-sm text-purple-400 mt-2">Staked: {stakedBalance} STRK</p>
            </div>

            <button
              onClick={handleUnstake}
              disabled={!unstakeAmount || isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 font-bold text-xl shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Unstake STRK"}
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        className="mt-8 text-center text-purple-300 text-sm max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p>Staking STRK tokens earns you platform fee sharing and governance rights. Tokens will be locked during the staking period, with a 3-day cooling period for unstaking.</p>
      </motion.div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-opacity-20 bg-purple-900 backdrop-blur-sm rounded-xl p-6 shadow-xl">
      <h3 className="text-lg font-medium text-purple-300 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <Particle key={i} />
      ))}
    </div>
  );
}

function Particle() {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-white rounded-full"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.2, 0.8, 0.2],
      }}
      transition={{
        duration: Math.random() * 2 + 1,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    />
  );
}
