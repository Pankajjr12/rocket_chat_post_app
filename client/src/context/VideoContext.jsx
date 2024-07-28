// VideoContext.js

import React, { createContext, useContext, useRef } from 'react';

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const videoRefs = useRef([]);

  const pauseAllVideos = () => {
    videoRefs.current.forEach(ref => {
      if (ref && ref.pause) {
        ref.pause();
      }
    });
  };

  const registerVideo = (ref) => {
    if (ref) {
      videoRefs.current.push(ref);
    }
  };

  return (
    <VideoContext.Provider value={{ pauseAllVideos, registerVideo }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => useContext(VideoContext);
