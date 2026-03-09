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

  useEffect(() => {
    fetchDeviceDetail(serial)
      .then((json) => { setDevice(json); setLoadingDevice(false); })
      .catch((err) => { setError(err.message); setLoadingDevice(false); });
  }, [serial]);

  useEffect(() => {
    fetchDeviceMetrics(serial, 200)
      .then((json) => {
        // Reverse so charts read oldest → newest (left → right)
        setMetrics([...json.metrics].reverse());
        setLoadingMetrics(false);
      })
      .catch(() => setLoadingMetrics(false));
  }, [serial]);

  const loading = loadingDevice || loadingMetrics;
  return { device, metrics, loading, error };
}
