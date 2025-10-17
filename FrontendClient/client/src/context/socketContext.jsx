// context/socketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null); // Initialize with null

export const useSocket = () => {
  const context = useContext(SocketContext);
  // Return the context (which could be null) instead of throwing error
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only create socket connection in browser environment
    if (typeof window !== 'undefined') {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        autoConnect: true
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};