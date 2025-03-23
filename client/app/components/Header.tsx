"use client";

import { motion } from "framer-motion";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchChain,
} from "@starknet-react/core";
import { useState, useRef, useMemo } from "react";
import { constants, num } from "starknet";
import { Chain } from "@starknet-react/chains";
import { ControllerConnector } from "@cartridge/connector";
import { useClickOutside } from '@react-hookz/web';
import { ChevronDown, Wallet } from "lucide-react";
import ConnectWalletModal from "./ConnectWalletModal";

const Header = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain, chains } = useNetwork();
  const { address, status, isConnected } = useAccount();
  const [networkOpen, setNetworkOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { switchChain } = useSwitchChain({
    params: {
      chainId: constants.StarknetChainId.SN_SEPOLIA,
    },
  });

  const networkRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const profileRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  
  const controllerConnector = useMemo(
    () => ControllerConnector.fromConnectors(connectors),
    [connectors],
  );

  useClickOutside(networkRef, () => setNetworkOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  const buttonStyles = "py-2 px-4 text-white rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 font-bold text-base shadow-lg";
  const dropdownButtonStyles = "w-full py-2 px-4 text-left text-white transition-all duration-300 hover:bg-purple-700 border-b border-purple-600 last:border-0";

  return (
    <>
      <header className="w-full absolute top-0 left-0 p-5 flex items-center z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-end h-16">
          <div className="flex items-center gap-3">
            {isConnected && (
              <div className="relative" ref={networkRef}>
                <motion.button
                  onClick={() => {
                    setNetworkOpen(!networkOpen);
                    setProfileOpen(false);
                  }}
                  className={`${buttonStyles} bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    {chain?.network || "Network"}
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${networkOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </motion.button>
                
                {networkOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-purple-800 shadow-xl rounded-lg min-w-[200px] py-1 z-10 border border-purple-600">
                    {chains.map((c: Chain) => (
                      <motion.button
                        key={c.id}
                        className={dropdownButtonStyles}
                        onClick={() => {
                          switchChain({ chainId: num.toHex(c.id) });
                          setNetworkOpen(false);
                        }}
                        whileHover={{ backgroundColor: "#553C9A" }}
                      >
                        {c.network}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isConnected && address ? (
              <div className="relative" ref={profileRef}>
                <motion.button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNetworkOpen(false);
                  }}
                  className={`${buttonStyles} bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <strong className="truncate max-w-[120px]">
                      {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </strong>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </motion.button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-purple-800 shadow-xl rounded-lg min-w-[200px] py-1 z-10 border border-purple-600">
                    <motion.button
                      className={dropdownButtonStyles}
                      onClick={() => {
                        disconnect();
                        setProfileOpen(false);
                      }}
                      whileHover={{ backgroundColor: "#553C9A" }}
                    >
                      Disconnect
                    </motion.button>
                  </div>
                )}
              </div>
            ) : (
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className={`${buttonStyles} bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center gap-2`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === "connecting" || status === "reconnecting"}
              >
                <Wallet size={18} />
                Connect Wallet
              </motion.button>
            )}
          </div>
        </div>
      </header>
      
      <ConnectWalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Header;