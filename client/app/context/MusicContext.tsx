"use client"; 

import React, { createContext, useState, useContext } from "react";


interface MusicContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
  musicPath: string;
}


const MusicContext = createContext<MusicContextType | undefined>(undefined);


export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const musicPath = "/audio/music-for-puzzle-game-146738.mp3"; 


  const toggleMusic = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic, musicPath }}>
      
      <audio src={musicPath} autoPlay loop muted={!isPlaying} />
      {children}
    </MusicContext.Provider>
  );
};


export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
