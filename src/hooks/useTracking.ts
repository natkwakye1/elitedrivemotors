// src/hooks/useTracking.ts
// WebSocket hook for real-time vehicle location updates.

"use client";

import { useEffect, useRef, useState } from "react";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export interface LiveLocation {
  lat:       number;
  lng:       number;
  speed_kmh: number;
  heading:   number | null;
  state:     "moving" | "parked" | "idle" | "offline";
  timestamp: string;
}

export function useTracking(carId: string | null) {
  const wsRef                       = useRef<WebSocket | null>(null);
  const pingRef                     = useRef<ReturnType<typeof setInterval> | null>(null);
  const [location, setLocation]     = useState<LiveLocation | null>(null);
  const [connected, setConnected]   = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    if (!carId) return;

    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      const ws = new WebSocket(`${WS_BASE}/ws/tracking/${carId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (destroyed) { ws.close(); return; }
        setConnected(true);
        setReconnecting(false);
        // keepalive ping every 20s
        pingRef.current = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send("ping"), 20_000);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.event === "location_update") {
            setLocation(msg.data);
          }
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        if (pingRef.current) clearInterval(pingRef.current);
        if (!destroyed) {
          setReconnecting(true);
          setTimeout(connect, 3000); // auto-reconnect
        }
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      destroyed = true;
      if (pingRef.current) clearInterval(pingRef.current);
      wsRef.current?.close();
    };
  }, [carId]);

  return { location, connected, reconnecting };
}
