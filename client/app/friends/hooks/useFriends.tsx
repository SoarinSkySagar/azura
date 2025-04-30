"use client";

import { useState, useEffect } from "react";

export type Friend = {
  id: string;
  username: string;
  avatar: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
};

export type FriendRequest = {
  id: string;
  username: string;
  avatar: string;
  requestDate: string;
};

// Sample data: normally from API
const MOCK_FRIENDS: Friend[] = [
  {
    id: "1",
    username: "alex gaming",
    avatar:
      "https://img.freepik.com/premium-photo/computer-programmer-web-app-programming-technology_1002866-288.jpg",
    status: "online",
  },
  {
    id: "2",
    username: "crypto sarah",
    avatar: "https://abrv.in/jbkH",
    status: "away",
    lastSeen: "10 minutes ago",
  },
  {
    id: "3",
    username: "blockchain dev",
    avatar:
      "https://cdn2.iconfinder.com/data/icons/professional-avatar-9/64/38-512.png",
    status: "offline",
    lastSeen: "2 hours ago",
  },
  {
    id: "4",
    username: "nft collector",
    avatar: "https://abrv.in/anwA",
    status: "online",
  },
  {
    id: "5",
    username: "jude gaming",
    avatar: "https://abrv.in/jdkt",
    status: "online",
  },
  {
    id: "6",
    username: "crypto racheal",
    avatar:
      "https://contentstatic.techgig.com/thumb/msid-84018246,width-800,height-600,resizemode-4/84018246.jpg",
    status: "away",
    lastSeen: "10 minutes ago",
  },
  {
    id: "7",
    username: "blockchain player",
    avatar: "https://hardcode.pro/images/profile.png",
    status: "offline",
    lastSeen: "2 hours ago",
  },
  {
    id: "8",
    username: "nft producer",
    avatar: "https://unavatar.io/github/yr-coder",
    status: "online",
  },
];

const MOCK_REQUESTS: FriendRequest[] = [
  {
    id: "9",
    username: "metaverse gamer",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFJMwaoZKgELcMEldf9WDVLeLoFJWZqneX-hOC2XEEBsTClvyd2fmv2-Qs8dao35oImz5HfA&s",
    requestDate: "2 days ago",
  },
  {
    id: "10",
    username: "web3 enthusiast",
    avatar: "https://abrv.in/gckD",
    requestDate: "1 week ago",
  },
  {
    id: "11",
    username: "metaverse coder",
    avatar:
      "https://miro.medium.com/v2/resize:fit:1187/1*0FqDC0_r1f5xFz3IywLYRA.jpeg",
    requestDate: "2 days ago",
  },
  {
    id: "12",
    username: "web3 teacher",
    avatar:
      "https://img.freepik.com/premium-photo/programmer-generative-ai_860599-3057.jpg",
    requestDate: "1 week ago",
  },
];

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        // API integration here: For now just dummy data implementation
        setTimeout(() => {
          setFriends(MOCK_FRIENDS);
          setRequests(MOCK_REQUESTS);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching friends data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const acceptRequest = (requestId: string) => {
    // Find the request
    const request = requests.find((req) => req.id === requestId);
    if (!request) return;

    // Convert to friend
    const newFriend: Friend = {
      id: request.id,
      username: request.username,
      avatar: request.avatar,
      status: "online",
    };

    // Add to friends, remove from requests
    setFriends((prev) => [...prev, newFriend]);
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const rejectRequest = (requestId: string) => {
    // Remove from requests
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const removeFriend = (friendId: string) => {
    // Remove from friends
    setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
  };

  return {
    friends,
    requests,
    isLoading,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchQuery,
    setSearchQuery,
  };
}
