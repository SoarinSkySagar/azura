import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Circle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JoinRoomModalProps extends ModalProps {
  onJoin: (roomId: string) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ 
  isOpen, 
  onClose, 
  onJoin 
}) => {
  const [roomId, setRoomId] = useState("");

  const handleClose = () => {
    setRoomId("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() === "") {
      alert("Please enter a valid Room ID");
      return;
    }
    onJoin(roomId);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-[#1a0b2e] to-[#2c1250] opacity-90"></div>

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative z-10 bg-gradient-to-br from-[#1a0b2e] via-[#1a0b2e] to-[#2c1250] rounded-2xl shadow-2xl border-2 border-purple-700 p-8 w-full max-w-md overflow-hidden"
      >
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors group"
          aria-label="Close modal"
        >
          <X size={28} className="group-hover:rotate-180 transition-transform" strokeWidth={2} />
        </button>

        {/* Modal Content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 text-center">
            Join Room
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room ID Input */}
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-purple-300 mb-2">
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter 6-digit room code"
                className="w-full px-4 py-3 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 tracking-wider text-center text-lg"
                required
                maxLength={6}
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <motion.button
                type="button"
                onClick={handleClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 bg-purple-800 text-purple-300 rounded-xl flex items-center justify-center space-x-2 hover:bg-purple-700 transition-colors"
              >
                <X size={20} />
                <span>Cancel</span>
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl flex items-center justify-center space-x-2 hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                <Circle size={20} />
                <span>Join</span>
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};