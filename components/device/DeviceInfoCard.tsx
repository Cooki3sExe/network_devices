"use client";
// components/device/DeviceInfoCard.tsx — Static identity info grid for a network device

import { NetworkDevice, MetricRecord } from "@/types";
import { deviceStyles as S } from "@/styles/device";
import { shared } from "@/styles/shared";
import { formatBytes, formatUptime, isRecent, formatTimeAgo } from "@/lib/utils";

interface Props {
  device: NetworkDevice;
  latestMetric?: MetricRecord | null;
}

export default function DeviceInfoCard({ device, latestMetric }: Props) {
  const online = isRecent(device.last_seen);
  const timeAgo = formatTimeAgo(device.last_seen);

  const fields = [
    { label: "IP Address",     value: latestMetric?.ip_address ?? "—", mono: true },
    { label: "Uptime",         value: formatUptime(latestMetric?.uptime ?? null) },
    { label: "Serial Number",  value: device.serial_number,        mono: true  },
    { label: "MAC Address",    value: device.mac_address ?? "—",   mono: true  },
    { label: "Dominio",        value: device.domain ?? "—"                     },
    { label: "IOS / Firmware", value: device.ios_version ?? "—",   mono: true, small: true },
    { label: "Boot Image",     value: device.boot_image ?? "—",    mono: true, small: true },
    { label: "RAM Total",      value: formatBytes(device.ram_total)             },
    { label: "Disco Total",    value: formatBytes(device.disk_total)            },
    { 
      label: "Última vez visto", 
      value: `${device.last_seen ?? "—"} (${timeAgo})`, 
      customColor: online ? "#4ade80" : "#f87171",
      span2: true 
    },
  ];

  return (
    <div style={shared.card}>
      <div style={shared.sectionTitle}>Información del Dispositivo</div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={S.deviceTitle}>{device.hostname}</div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.25rem 0.6rem",
          borderRadius: "6px",
          border: online ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
          background: online ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.05)",
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: online ? "#10b981" : "#ef4444",
            boxShadow: online ? "0 0 8px rgba(16,185,129,0.4)" : "none",
          }} />
          <span style={{
            fontSize: "0.75rem",
            fontWeight: "600",
            color: online ? "#6ee7b7" : "#fca5a5",
          }}>
            {online ? "ONLINE" : "OFFLINE"} — {timeAgo}
          </span>
        </div>
      </div>

      <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.5rem" }}>
        {device.vendor && <span style={S.badge}>{device.vendor}</span>}
        {device.model && <span style={S.badge}>{device.model}</span>}
      </div>

      <div style={S.infoGrid}>
        {fields.map(({ label, value, mono, small, customColor, span2 }) => (
          <div 
            key={label} 
            style={{ 
              ...S.infoItem,
              gridColumn: span2 ? "span 2" : "span 1"
            }}
          >
            <div style={S.infoLabel}>{label}</div>
            <div style={{
              ...(mono  ? S.infoValueMono : S.infoValue),
              ...(small ? { fontSize: "0.72rem" } : {}),
              ...(customColor ? { color: customColor } : {}),
              whiteSpace: "nowrap",
              wordBreak: "normal"
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
