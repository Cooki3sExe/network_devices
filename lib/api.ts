// lib/api.ts — API base URL and typed fetch functions

import { DevicesResponse, NetworkDevice, MetricsResponse } from "@/types";

export const API_BASE = "http://localhost:8000";

// ngrok-skip-browser-warning needed when tunneling via ngrok
const HEADERS = { "ngrok-skip-browser-warning": "true" };

export async function fetchDevices(): Promise<DevicesResponse> {
  const res = await fetch(`${API_BASE}/devices`, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchDeviceDetail(serial: string): Promise<NetworkDevice> {
  const res = await fetch(`${API_BASE}/devices/${encodeURIComponent(serial)}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchDeviceMetrics(serial: string, limit = 200): Promise<MetricsResponse> {
  const res = await fetch(
    `${API_BASE}/devices/${encodeURIComponent(serial)}/metrics?limit=${limit}`,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
