"use client";
import { useMusic } from "../context/MusicContext";
import { PauseCircle, PlayCircle, } from "lucide-react";

const MusicToggleButton = () => {
  const { isPlaying, toggleMusic } = useMusic();

  return (
    <button onClick={toggleMusic}>
      {isPlaying ?  <PauseCircle /> :  <PlayCircle/> }
     
    </button>
  );
};

export default MusicToggleButton;
