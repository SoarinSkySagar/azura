"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { FriendRequest, useFriends } from "../hooks/useFriends";

type FriendRequestsProps = {
  requests: FriendRequest[];
};

export default function FriendRequests({ requests }: FriendRequestsProps) {
  const { acceptRequest, rejectRequest } = useFriends();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {requests.map((request) => (
        <motion.div
          key={request.id}
          variants={item}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-sm hover:border hover:border-cosmic-purple-300 dark:hover:border-cosmic-purple-700 transition-all"
        >
          <div className="flex items-center space-x-3">
            <img
              src={request.avatar}
              alt={`${request.username}'s avatar`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                {request.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sent request {request.requestDate}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => acceptRequest(request.id)}
              className="p-2 bg-cosmic-purple-600 hover:bg-cosmic-purple-700 text-white rounded-full transition-colors"
              aria-label="Accept friend request"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => rejectRequest(request.id)}
              className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
              aria-label="Reject friend request"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
