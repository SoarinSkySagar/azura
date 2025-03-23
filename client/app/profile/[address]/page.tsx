"use client";

/* import { useState, useEffect } from "react"; */
import { useParams } from "next/navigation";
import Link from "next/link";

export default function Profile() {
  const params = useParams();
  const address = params.address;

  // In a real app, you would fetch this data from an API
  // For now, we'll use static data
  const profileData = {
    address: address,
    winnings: 1250,
    points: 7500,
    matchHistory: [
      {
        id: "game1",
        opponent: "0x9876543210abcdef",
        result: "win",
        date: "2025-02-15",
        duration: 120,
      },
      {
        id: "game2",
        opponent: "0xfedcba0987654321",
        result: "loss",
        date: "2025-02-10",
        duration: 90,
      },
      {
        id: "game3",
        opponent: "0x1234567890abcdef",
        result: "draw",
        date: "2025-02-05",
        duration: 150,
      },
    ],
  };

  // Calculate stats
  const totalGames = profileData.matchHistory.length;
  const wins = profileData.matchHistory.filter(
    (game) => game.result === "win"
  ).length;
  const losses = profileData.matchHistory.filter(
    (game) => game.result === "loss"
  ).length;
  const draws = profileData.matchHistory.filter(
    (game) => game.result === "draw"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-300 via-amber-300 to-yellow-400 dark:from-[#0a192f] dark:via-[#0a192f] dark:to-[#112240] text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-16">
        <Link
          href="/play"
          className="cursor-pointer p-2 my-8 inline-flex  items-center text-orange-600 dark:text-orange-400 hover:underline"
        >
          ← Back to Game
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-red-500 dark:to-red-700">
          Player Profile
        </h1>

        <div className="bg-white/80 dark:bg-[#112240]/80 rounded-xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">
            Player Details
          </h2>

          <div className="mb-6">
            <p className="text-lg font-medium">Address:</p>
            <p className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-md mt-1 overflow-x-auto">
              {profileData.address}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-100 dark:bg-[#1d293a] p-4 rounded-lg text-center">
              <p className="text-lg font-semibold">Winnings</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {profileData.winnings}
              </p>
            </div>

            <div className="bg-orange-100 dark:bg-[#1d293a] p-4 rounded-lg text-center">
              <p className="text-lg font-semibold">Points</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {profileData.points}
              </p>
            </div>

            <div className="bg-orange-100 dark:bg-[#1d293a] p-4 rounded-lg text-center">
              <p className="text-lg font-semibold">Win Rate</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-[#112240]/80 rounded-xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">
            Game Statistics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-100 dark:bg-[#1d293a] p-4 rounded-lg text-center">
              <p className="text-lg font-semibold">Total Games</p>
              <p className="text-3xl font-bold">{totalGames}</p>
            </div>

            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center">
              <p className="text-lg font-semibold">Wins</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {wins}
              </p>
            </div>

            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-center">
              <p className="text-lg font-semibold">Losses</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {losses}
              </p>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg text-center">
              <p className="text-lg font-semibold">Draws</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {draws}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-[#112240]/80 rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">
            Match History
          </h2>

          {profileData.matchHistory.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              No games played yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-100 dark:bg-[#1d293a]">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Opponent</th>
                    <th className="px-4 py-2 text-left">Result</th>
                    <th className="px-4 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {profileData.matchHistory.map((game) => {
                    let resultClass;

                    if (game.result === "draw") {
                      resultClass =
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                    } else if (game.result === "win") {
                      resultClass =
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                    } else {
                      resultClass =
                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
                    }

                    return (
                      <tr
                        key={game.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#1a2e4a]"
                      >
                        <td className="px-4 py-3">
                          {new Date(game.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <Link
                            href={`/profile/${game.opponent}`}
                            className="hover:underline text-orange-600 dark:text-orange-400"
                          >
                            {game.opponent.substring(0, 6)}...
                            {game.opponent.substring(game.opponent.length - 4)}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-md text-sm ${resultClass}`}
                          >
                            {game.result.charAt(0).toUpperCase() +
                              game.result.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{game.duration}s</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
