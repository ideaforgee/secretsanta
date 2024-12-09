import React, { createContext, useContext, useState, useEffect } from "react";
import { setupInterceptors } from '../services/axionsInstance';
import { LOADING_CONTEXT_ERROR } from '../constants/secretSantaConstants';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = (show) => {
    if (show) {
      setIsLoading(true);
    }
  };

  const stopLoading = (show) => {
    if (show) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setupInterceptors(startLoading, stopLoading);
  }, []);

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error(LOADING_CONTEXT_ERROR);
  }
  return context;
};
