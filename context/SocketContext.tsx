import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ConnectionStatus } from '../types';

interface SocketContextType {
    socket: Socket | null;
    connectionStatus: ConnectionStatus;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connectionStatus: ConnectionStatus.DISCONNECTED
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
        ConnectionStatus.DISCONNECTED
    );

    useEffect(() => {
        // Build the server URL: Use env var if provided, otherwise default to current origin in prod or localhost in dev
        const isProd = (import.meta as any).env?.PROD;
        const serverUrl = (import.meta as any).env?.VITE_SERVER_URL ||
            (isProd ? window.location.origin : 'http://localhost:3001');

        setConnectionStatus(ConnectionStatus.CONNECTING);
        const newSocket = io(serverUrl);

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setConnectionStatus(ConnectionStatus.CONNECTED);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setConnectionStatus(ConnectionStatus.DISCONNECTED);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnectionStatus(ConnectionStatus.ERROR);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connectionStatus }}>
            {children}
        </SocketContext.Provider>
    );
};
