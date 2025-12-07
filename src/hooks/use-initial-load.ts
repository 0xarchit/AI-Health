import { useState, useEffect } from 'react';

interface LoadingState {
  key: string;
  isLoading: boolean;
  message?: string;
}

export function useInitialLoad(loadingStates: LoadingState[], minDuration = 1000) {
  const [isReady, setIsReady] = useState(false);
  const [startTime] = useState(Date.now());
  const [currentMessage, setCurrentMessage] = useState("INITIALIZING...");

  useEffect(() => {
    const activeLoading = loadingStates.find(state => state.isLoading);
    
    if (activeLoading) {
      setCurrentMessage(activeLoading.message || "LOADING...");
      setIsReady(false);
    } else {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDuration - elapsedTime);

      const timer = setTimeout(() => {
        setIsReady(true);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [loadingStates, startTime, minDuration]);

  return {
    isLoading: !isReady,
    message: currentMessage
  };
}
