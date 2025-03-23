"use client";

import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Wallet, Loader2 } from "lucide-react";
import { useConnect, Connector } from "@starknet-react/core";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies?: any;
}

const walletIdToName = new Map([
  ["argentX", "Argent X"],
  ["braavos", "Braavos"],
  ["okx", "OKX"],
  ["bitget", "BitGet"],
  ["argentWebWallet", "Email"],
]);

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ 
  isOpen, 
  onClose,
  policies
}) => {
  const { connectors, connect } = useConnect();
  const [pendingConnectorId, setPendingConnectorId] = useState<string | undefined>(undefined);

  const regularConnectors = useMemo(
    () => connectors.filter((connector) => connector.id !== "argentWebWallet"),
    [connectors],
  );

  const webWalletConnector = useMemo(
    () => connectors.find((connector) => connector.id === "argentWebWallet"),
    [connectors],
  );

  const handleConnect = useCallback(async (connector: Connector) => {
    setPendingConnectorId(connector.id);
    try {
      await connect({ connector });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setPendingConnectorId(undefined);
    }
  }, [connect, onClose]);

  const isWalletConnecting = (connectorId: string) => {
    return pendingConnectorId === connectorId;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-[#1a0b2e] to-[#2c1250] opacity-90"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative z-10 bg-gradient-to-br from-[#1a0b2e] via-[#1a0b2e] to-[#2c1250] rounded-2xl shadow-2xl border-2 border-purple-700 p-8 w-full max-w-md overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors group"
          aria-label="Close modal"
        >
          <X size={28} className="group-hover:rotate-180 transition-transform" strokeWidth={2} />
        </button>

        <div className="relative z-10">
          <div className="mx-auto mb-6 flex justify-center">
            <div className="size-20 rounded-full bg-purple-900 flex items-center justify-center">
              <Wallet size={40} className="text-purple-300" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 text-center">
            Connect Wallet
          </h2>
          
          <div className="mt-4 flex flex-col gap-3.5">
            {regularConnectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                className="relative flex items-center justify-center px-4 py-3 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-xl text-white hover:bg-purple-800 transition-all"
              >
                <div className="absolute left-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm bg-purple-800">
                  {connector.icon && (
                    <img
                      src={typeof connector.icon === 'string' ? connector.icon : connector.icon.dark}
                      className="size-5"
                      alt={`${connector.name}`}
                    />
                  )}
                </div>
                <span>{walletIdToName.get(connector.id) || connector.name}</span>
                {isWalletConnecting(connector.id) && (
                  <Loader2
                    className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin"
                    size={24}
                  />
                )}
              </button>
            ))}
            
            {webWalletConnector && (
              <>
                <div className="flex w-full items-center justify-between gap-3 my-2">
                  <div className="h-px flex-1 bg-purple-700"></div>
                  <p className="flex-shrink-0 font-medium text-purple-300">Or continue with</p>
                  <div className="h-px flex-1 bg-purple-700"></div>
                </div>
                
                <button
                  onClick={() => handleConnect(webWalletConnector)}
                  className="relative flex items-center justify-center px-4 py-3 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-xl text-white hover:bg-purple-800 transition-all"
                >
                  <div className="absolute left-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm bg-purple-800">
                    <Wallet className="size-5" />
                  </div>
                  <div>
                    <p>{walletIdToName.get(webWalletConnector.id) ?? webWalletConnector.name}</p>
                    <p className="mt-1 text-xs text-purple-300">Powered by Argent</p>
                  </div>
                  {isWalletConnecting(webWalletConnector.id) && (
                    <Loader2
                      className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin"
                      size={24}
                    />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConnectWalletModal;
