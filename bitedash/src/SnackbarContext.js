import React, { createContext, useState, useCallback } from 'react';

export const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const openSnackbar = useCallback((message) => {
    setMessage(message);
    setOpen(true);
  }, []);

  const closeSnackbar = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <SnackbarContext.Provider value={{ openSnackbar, closeSnackbar, open, message }}>
      {children}
    </SnackbarContext.Provider>
  );
};
