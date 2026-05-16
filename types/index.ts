// types/index.ts — Single source of truth for all TypeScript interfaces

export interface NetworkDevice {
  serial_number: string;
  hostname: string;
  model: string | null;
  mac_address: string | null;
  vendor: string | null;
  ios_version: string | null;
  boot_image: string | null;
  domain: string | null;
  ram_total: number | null;
  disk_total: number | null;
  last_seen: string | null;
}

export interface MetricRecord {
  id: number;
  device_serial: string;
  timestamp: string;
  cpu_load: number | null;
  ram_used: number | null;
  uptime: number | null;
  ip_address: string | null;
}

export interface DevicesResponse {
  total: number;
  devices: NetworkDevice[];
}

export interface MetricsResponse {
  serial: string;
  total_records: number;
  metrics: MetricRecord[];
}
