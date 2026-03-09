"use client";
// hooks/useDevices.ts — Encapsulates fetch + state for the full device list

import { useEffect, useState } from "react";
import { fetchDevices } from "@/lib/api";
import { DevicesResponse } from "@/types";

export function useDevices() {
  const [data, setData] = useState<DevicesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices()
      .then((json) => { setData(json); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  return { data, loading, error };
}
