import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const WS_URL = "ws://localhost:8080";
const MAX_DELAY = 10_000;

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const retriesRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    function connect() {
      if (unmountedRef.current) return;

      const token = localStorage.getItem("token");
      // Pass the JWT in the URL query parameters so the server can validate it during connection handshake.
      const url = token ? `${WS_URL}?token=${token}` : WS_URL;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (unmountedRef.current) {
          ws.close();
          return;
        }
        retriesRef.current = 0;
        setSocket(ws);
        setIsConnected(true);
      };

      ws.onclose = () => {
        if (unmountedRef.current) return;
        setSocket(null);
        setIsConnected(false);

        // Exponential backoff to avoid flooding the server on disconnect
        const delay = Math.min(1000 * 2 ** retriesRef.current, MAX_DELAY);
        retriesRef.current++;
        timerRef.current = window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setSocket((prev) => {
        if (prev && prev.readyState === WebSocket.OPEN) {
          prev.close();
        }
        return null;
      });
      setIsConnected(false);
    };
  }, [user]); // Automatically reconnects with credentials when the user logs in or out.

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
