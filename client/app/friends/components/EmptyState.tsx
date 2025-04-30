"use client";

import { Users, UserPlus, Search } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon: "users" | "userPlus" | "search";
};

export default function EmptyState({
  title,
  description,
  icon,
}: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case "users":
        return (
          <Users className="w-12 h-12 text-cosmic-purple-500 animate-float" />
        );
      case "userPlus":
        return (
          <UserPlus className="w-12 h-12 text-cosmic-purple-500 animate-float" />
        );
      case "search":
        return (
          <Search className="w-12 h-12 text-cosmic-purple-500 animate-float" />
        );
      default:
        return (
          <Users className="w-12 h-12 text-cosmic-purple-500 animate-float" />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-10 text-center border border-gray-200 dark:border-gray-700">
      <div className="bg-cosmic-purple-100 dark:bg-cosmic-purple-900/30 p-4 rounded-full mb-4 animate-pulse-glow">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {description}
      </p>
    </div>
  );
}
