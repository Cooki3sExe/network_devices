"use client";
// hooks/useDevices.ts — Encapsulates fetch + state for the full device list

import { useEffect, useState } from "react";
import { fetchDevices } from "@/lib/api";
import { DevicesResponse } from "@/types";

export function useDevices() {
  const [data, setData] = useState<DevicesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const load = () => {
    fetchDevices()
      .then((json) => { setData(json); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      load();
      setTick(t => t + 1); // Forzar re-render para etiquetas de tiempo relativo
    }, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}
