// app/history/page.tsx
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { CirclePause, ArrowLeft, ArrowRight } from 'lucide-react';

// Define the Match interface
interface Match {
  id: string;
  result: 'win' | 'loss' | 'draw';
  winnings: number;
  points: number;
  opponent: string;
  date: string;
}

// Mock data for demonstration (replace with actual API call)
const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    result: 'win',
    winnings: 250,
    points: 25,
    opponent: 'Player123',
    date: '2025-04-25'
  },
  {
    id: '2',
    result: 'loss',
    winnings: 0,
    points: -15,
    opponent: 'GameMaster88',
    date: '2025-04-23'
  },
  {
    id: '3',
    result: 'draw',
    winnings: 50,
    points: 5,
    opponent: 'ChessWizard',
    date: '2025-04-21'
  },
  {
    id: '4',
    result: 'win',
    winnings: 300,
    points: 30,
    opponent: 'StrategyStar',
    date: '2025-04-19'
  },
  {
    id: '5',
    result: 'loss',
    winnings: 0,
    points: -20,
    opponent: 'GrandMaster42',
    date: '2025-04-17'
  }
];

// Make sure to explicitly define as React Function Component
const HistoryPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const matchesPerPage = 10;

  useEffect(() => {
    // In a real app, you would fetch from your API
    // Example:
    // const fetchMatches = async () => {
    //   try {
    //     const response = await fetch('/api/matches');
    //     const data = await response.json();
    //     setMatches(data.matches);
    //     setTotalPages(Math.ceil(data.total / matchesPerPage));
    //   } catch (error) {
    //     console.error('Failed to fetch match history:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // For now, we'll use mock data
    const loadMockData = () => {
      setTimeout(() => {
        setMatches(MOCK_MATCHES);
        setTotalPages(Math.ceil(MOCK_MATCHES.length / matchesPerPage));
        setLoading(false);
      }, 500); // Simulate loading
    };
    
    loadMockData();
  }, []);

  // Function to get the styling based on match result
  const getResultStyles = (result: string) => {
    switch (result) {
      case 'win':
        return 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500';
      case 'loss':
        return 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500';
      case 'draw':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500';
      default:
        return '';
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <CirclePause className="w-12 h-12 animate-pulse text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold">Loading match history...</h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Match History</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          View all your previous matches and performance
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">No Match History</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            You haven't played any matches yet. Start playing to build your history!
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg shadow">
          {/* Mobile card view (visible on small screens) */}
          <div className="sm:hidden space-y-4">
            {matches.map((match) => (
              <div 
                key={match.id} 
                className={`p-4 rounded-lg shadow ${getResultStyles(match.result)}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium capitalize text-lg">{match.result}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(match.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Opponent</p>
                    <p className="font-medium">{match.opponent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Winnings</p>
                    <p className={match.winnings > 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500"}>
                      {match.winnings > 0 ? `+${match.winnings}` : '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Points</p>
                    <p className={
                      match.points > 0 
                        ? "text-green-600 dark:text-green-400 font-medium" 
                        : match.points < 0 
                        ? "text-red-600 dark:text-red-400 font-medium" 
                        : ""
                    }>
                      {match.points > 0 ? `+${match.points}` : match.points}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table view (visible on larger screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Opponent
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Winnings
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                {matches.map((match) => (
                  <tr 
                    key={match.id} 
                    className={`${getResultStyles(match.result)} hover:opacity-90 transition-all`}
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className="font-medium capitalize">
                        {match.result}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {match.opponent}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {match.winnings > 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          +{match.winnings}
                        </span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {match.points > 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          +{match.points}
                        </span>
                      ) : match.points < 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {match.points}
                        </span>
                      ) : (
                        <span>{match.points}</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {new Date(match.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="mt-4 sm:mt-6 p-4 bg-gray-50 dark:bg-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 order-2 sm:order-1">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 flex items-center text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Prev
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 flex items-center text-sm"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;