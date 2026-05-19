import { useEffect, useRef, useState } from "react";

// Read WebSocket connection base URL from environment configuration or default to localhost:3000
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

/** Max reconnection delay in ms (capped at 10 seconds to keep connection attempts responsive) */
const MAX_DELAY = 10_000;

/**
 * A custom React hook that establishes and maintains a resilient real-time WebSocket connection.
 * Features automated lifecycle management: clean-up on unmount, active retry prevention,
 * and automatic exponential backoff reconnection when network state degrades.
 * 
 * @returns {WebSocket | null} The active socket connection or null if connecting/offline.
 */
export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  // Track reconnection retry count to compute exponential backoff times
  const retriesRef = useRef(0);
  
  // Hold a reference to the active reconnect timer to cancel it if the component unmounts
  const timerRef = useRef<number | null>(null);
  
  // Track whether the hook has unmounted to prevent updating state or launching timers asynchronously
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    /**
     * Recursively creates a new WebSocket connection and hooks up connectivity listeners.
     */
    function connect() {
      if (unmountedRef.current) return;

      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        // Guard against race condition if component unmounts during active socket handshake
        if (unmountedRef.current) { 
          ws.close(); 
          return; 
        }
        
        // Reset retry index to immediately attempt fast reconnection on next connection drop
        retriesRef.current = 0; 
        setSocket(ws);
      };

      ws.onclose = () => {
        // Prevent launching reconnection sequences if component is unmounted
        if (unmountedRef.current) return;
        
        // Clear active socket reference from state to alert UI of offline status
        setSocket(null);

        // Exponential backoff strategy: 1s, 2s, 4s, 8s, up to MAX_DELAY (10s)
        // Helps avoid DDOSing our own server when under high load or network outage
        const delay = Math.min(1000 * 2 ** retriesRef.current, MAX_DELAY);
        retriesRef.current++;
        
        timerRef.current = window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // According to WebSocket specification, onerror is immediately followed by onclose.
        // We close explicitly here to force-trigger the onclose event handler.
        ws.close();
      };
    }

    connect();

    // Cleanup hook on unmount
    return () => {
      unmountedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      
      // Close active socket session to free resources and notify the server immediately
      setSocket((prev) => {
        if (prev && prev.readyState === WebSocket.OPEN) prev.close();
        return null;
      });
    };
  }, []);

  return socket;
};