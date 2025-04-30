// // app/friends/components/FriendsList.tsx
// import { useState } from "react";
// import { User, UserPlus, MoreHorizontal, MessageCircle } from "lucide-react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import EmptyState from "./EmptyState";

// interface Friend {
//   id: string;
//   username: string;
//   avatar: string;
//   status: "online" | "offline" | "away" | "busy";
// }

// interface FriendsListProps {
//   friends: Friend[];
//   emptyStateMessage: string;
// }

// export default function FriendsList({
//   friends,
//   emptyStateMessage,
// }: FriendsListProps) {
//   if (friends.length === 0) {
//     return <EmptyState message={emptyStateMessage} icon={<User size={48} />} />;
//   }

//   return (
//     <div className="space-y-4">
//       {friends.map((friend) => (
//         <FriendCard key={friend.id} friend={friend} />
//       ))}
//     </div>
//   );
// }

// function FriendCard({ friend }: { friend: Friend }) {
//   const statusColors = {
//     online: "bg-green-500",
//     offline: "bg-gray-400",
//     away: "bg-yellow-500",
//     busy: "bg-red-500",
//   };

//   const statusLabels = {
//     online: "Online",
//     offline: "Offline",
//     away: "Away",
//     busy: "Do Not Disturb",
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700">
//       <div className="flex items-center space-x-4">
//         <div className="relative">
//           <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
//             {friend.avatar ? (
//               <Image
//                 src={friend.avatar}
//                 alt={friend.username}
//                 width={48}
//                 height={48}
//                 className="object-cover"
//               />
//             ) : (
//               <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
//                 <User size={24} className="text-gray-500" />
//               </div>
//             )}
//           </div>
//           <span
//             className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${
//               statusColors[friend.status]
//             } ring-2 ring-white dark:ring-gray-800`}
//           />
//         </div>
//         <div>
//           <h3 className="font-medium text-gray-900 dark:text-gray-100">
//             {friend.username}
//           </h3>
//           <Badge variant="outline" className="text-xs font-normal mt-1">
//             {statusLabels[friend.status]}
//           </Badge>
//         </div>
//       </div>

//       <div className="flex space-x-2">
//         <Button variant="ghost" size="icon" className="rounded-full">
//           <MessageCircle size={20} />
//         </Button>
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" size="icon" className="rounded-full">
//               <MoreHorizontal size={20} />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuItem>View Profile</DropdownMenuItem>
//             <DropdownMenuItem className="text-red-500">
//               Remove Friend
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { MoreHorizontal, MessageCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Friend } from "../hooks/useFriends";

type FriendsListProps = {
  friends: Friend[];
  searchQuery: string;
};

export default function FriendsList({
  friends,
  searchQuery,
}: FriendsListProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleActionMenu = (friendId: string) => {
    if (actionMenuOpen === friendId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(friendId);
    }
  };

  const getStatusIndicatorColor = (status: Friend["status"]) => {
    switch (status) {
      case "online":
        return "bg-cosmic-purple-500 animate-pulse-slow";
      case "away":
        return "bg-cosmic-purple-300";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

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

  if (filteredFriends.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No friends match your search
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {filteredFriends.map((friend) => (
        <motion.div
          key={friend.id}
          variants={item}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-sm hover:border hover:border-cosmic-purple-300 dark:hover:border-cosmic-purple-700 transition-all "
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={friend.avatar}
                alt={`${friend.username}'s avatar`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusIndicatorColor(
                  friend.status
                )}`}
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                {friend.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {friend.status === "online"
                  ? "Online"
                  : friend.status === "away"
                  ? "Away"
                  : `Last seen ${friend.lastSeen}`}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => toggleActionMenu(friend.id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            {actionMenuOpen === friend.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-cosmic-purple-200 dark:border-cosmic-purple-800">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                  <MessageCircle className="mr-2 w-4 h-4" />
                  Message
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                  <Trash2 className="mr-2 w-4 h-4" />
                  Remove Friend
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
