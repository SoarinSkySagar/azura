"use client";

import { useState } from "react";
import FriendsList from "./components/FriendsList";
import FriendRequests from "./components/FriendRequests";
import SearchBar from "./components/SearchBar";
import EmptyState from "./components/EmptyState";
import LoadingState from "./components/LoadingState";
import { useFriends } from "./hooks/useFriends";
import { CircularGlowingEffect, ParticleBackground } from "../page";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const { friends, requests, isLoading, searchQuery, setSearchQuery } =
    useFriends();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <CircularGlowingEffect />
      <ParticleBackground />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Friends</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your connections and friend requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "friends"
              ? "border-b-2 border-cosmic-purple-600 text-cosmic-purple-600 dark:text-cosmic-purple-400 dark:border-cosmic-purple-400"
              : "text-gray-500 dark:text-gray-400"
          } relative`}
          onClick={() => handleTabChange("friends")}
        >
          Friends {friends.length > 0 && `(${friends.length})`}
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "requests"
              ? "border-b-2 border-cosmic-purple-600 text-cosmic-purple-600 dark:text-cosmic-purple-400 dark:border-cosmic-purple-400"
              : "text-gray-500 dark:text-gray-400"
          } relative`}
          onClick={() => handleTabChange("requests")}
        >
          Requests
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-cosmic-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse-slow">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {activeTab === "friends" && (
            <>
              {friends.length > 0 ? (
                <FriendsList friends={friends} searchQuery={searchQuery} />
              ) : (
                <EmptyState
                  title="No friends yet"
                  description="Search for users to add them as friends or accept pending requests."
                  icon="users"
                />
              )}
            </>
          )}
          {activeTab === "requests" && (
            <>
              {requests.length > 0 ? (
                <FriendRequests requests={requests} />
              ) : (
                <EmptyState
                  title="No pending requests"
                  description="When someone sends you a friend request, it will appear here."
                  icon="userPlus"
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
