// lib/api.ts — API base URL and typed fetch functions

import { DevicesResponse, NetworkDevice, MetricsResponse } from "@/types";

export const API_BASE = "http://localhost:8000";

// ngrok-skip-browser-warning needed when tunneling via ngrok
export const API_HEADERS = { 
  "ngrok-skip-browser-warning": "true",
  "X-API-Key": "tesis_secret_123" 
};

export async function fetchDevices(): Promise<DevicesResponse> {
  const res = await fetch(`${API_BASE}/devices`, { headers: API_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchDeviceDetail(serial: string): Promise<NetworkDevice> {
  const res = await fetch(`${API_BASE}/devices/${encodeURIComponent(serial)}`, { headers: API_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchDeviceMetrics(serial: string, limit = 200): Promise<MetricsResponse> {
  const res = await fetch(
    `${API_BASE}/devices/${encodeURIComponent(serial)}/metrics?limit=${limit}`,
    { headers: API_HEADERS }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
