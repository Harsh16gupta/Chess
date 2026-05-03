import { useEffect, useRef, useState } from "react";

const WS_URL = "ws://localhost:8080";

/** Max reconnection delay in ms */
const MAX_DELAY = 10_000;

/**
 * WebSocket hook with automatic reconnection.
 * Returns the socket (null while connecting) and connection status.
 */
export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    function connect() {
      if (unmountedRef.current) return;

      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        if (unmountedRef.current) { ws.close(); return; }
        retriesRef.current = 0; // reset backoff on success
        setSocket(ws);
      };

      ws.onclose = () => {
        if (unmountedRef.current) return;
        setSocket(null);

        // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
        const delay = Math.min(1000 * 2 ** retriesRef.current, MAX_DELAY);
        retriesRef.current++;
        timerRef.current = window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // onerror is always followed by onclose, so reconnect happens there
        ws.close();
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      // Close any open socket
      setSocket((prev) => {
        if (prev && prev.readyState === WebSocket.OPEN) prev.close();
        return null;
      });
    };
  }, []);

  return socket;
};