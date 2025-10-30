import { io, Socket } from 'socket.io-client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Socket instance
let socket: Socket | null = null;

export const initializeSocket = (userId: string) => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    
    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    
    // Create new socket connection
    socket = io(BASE_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket?.id);
      
      // Authenticate with the user ID
      if (socket) {
        socket.emit('authenticate', userId);
      }
      console.log('Authentication request sent for user:', userId);
    });
    
    socket.on('authenticated', (data) => {
      console.log('Successfully authenticated:', data);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    return socket;
  };

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
    return socket;
  };

// React context for easier access in components
type SocketContextType = {
  socket: Socket | null;
  initialize: (userId: string) => void;
  disconnect: () => void;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  
  const initialize = (userId: string) => {
    const newSocket = initializeSocket(userId);
    setSocketInstance(newSocket);
  };
  
  const disconnect = () => {
    disconnectSocket();
    setSocketInstance(null);
  };
  
  useEffect(() => {
    return () => {
      // Clean up socket on unmount
      disconnect();
    };
  }, []);
  
  return (
    <SocketContext.Provider
      value={{
        socket: socketInstance,
        initialize,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};