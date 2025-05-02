"use client";

import React, { createContext, useState, useContext } from "react";
import ConnectWalletModal from "../components/ConnectWalletModal";

interface WalletContextType {
  openWalletModal: () => void;
  closeWalletModal: () => void;
  isWalletModalOpen: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const openWalletModal = () => {
    setIsWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
  };

  return (
    <WalletContext.Provider value={{ openWalletModal, closeWalletModal, isWalletModalOpen }}>
      {children}
      <ConnectWalletModal 
        isOpen={isWalletModalOpen} 
        onClose={closeWalletModal} 
      />
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
