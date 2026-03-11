"use client";
// hooks/useDeviceDetail.ts — Encapsulates the two parallel fetches for device + metrics

import { useEffect, useState } from "react";
import { fetchDeviceDetail, fetchDeviceMetrics } from "@/lib/api";
import { NetworkDevice, MetricRecord } from "@/types";

export function useDeviceDetail(serial: string) {
  const [device, setDevice] = useState<NetworkDevice | null>(null);
  const [metrics, setMetrics] = useState<MetricRecord[]>([]);
  const [loadingDevice, setLoadingDevice] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const loadAll = () => {
    fetchDeviceDetail(serial)
      .then((json) => { setDevice(json); setLoadingDevice(false); })
      .catch((err) => { setError(err.message); setLoadingDevice(false); });

    fetchDeviceMetrics(serial, 200)
      .then((json) => {
        setMetrics([...json.metrics].reverse());
        setLoadingMetrics(false);
      })
      .catch(() => setLoadingMetrics(false));
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(() => {
      loadAll();
      setTick(t => t + 1);
    }, 60000); 
    return () => clearInterval(interval);
  }, [serial]);

  const loading = loadingDevice || loadingMetrics;
  return { device, metrics, loading, error };
}
