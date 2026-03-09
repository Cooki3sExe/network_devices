"use client";
// components/device/DeviceInfoCard.tsx — Static identity info grid for a network device

import { NetworkDevice } from "@/types";
import { deviceStyles as S } from "@/styles/device";
import { shared } from "@/styles/shared";
import { formatBytes } from "@/lib/utils";

interface Props {
  device: NetworkDevice;
}

export default function DeviceInfoCard({ device }: Props) {
  const fields = [
    { label: "Serial Number", value: device.serial_number,        mono: true  },
    { label: "MAC Address",   value: device.mac_address ?? "—",   mono: true  },
    { label: "Dominio",       value: device.domain ?? "—"                     },
    { label: "IOS / Firmware",value: device.ios_version ?? "—",   mono: true, small: true },
    { label: "Boot Image",    value: device.boot_image ?? "—",    mono: true, small: true },
    { label: "RAM Total",     value: formatBytes(device.ram_total)             },
    { label: "Disco Total",   value: formatBytes(device.disk_total)            },
    { label: "Último visto",  value: device.last_seen ?? "—",     green: true },
  ];

  return (
    <div style={shared.card}>
      <div style={shared.sectionTitle}>📡 Información del Dispositivo</div>
      <div style={S.deviceTitle}>{device.hostname}</div>

      <div style={{ marginTop: "0.4rem" }}>
        {device.vendor && <span style={S.badge}>{device.vendor}</span>}
        {device.model && (
          <span style={{
            ...S.badge,
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            color: "#6ee7b7",
          }}>
            {device.model}
          </span>
        )}
      </div>

      <div style={S.infoGrid}>
        {fields.map(({ label, value, mono, small, green }) => (
          <div key={label} style={S.infoItem}>
            <div style={S.infoLabel}>{label}</div>
            <div style={{
              ...(mono  ? S.infoValueMono : S.infoValue),
              ...(small ? { fontSize: "0.72rem" } : {}),
              ...(green ? { color: "#4ade80" } : {}),
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
