"use client";
// components/device/DeviceInfoCard.tsx — Static identity info grid for a network device

import { useState } from "react";
import { NetworkDevice, MetricRecord } from "@/types";
import { deviceStyles as S } from "@/styles/device";
import { shared } from "@/styles/shared";
import { formatBytes, formatUptime, isRecent, formatTimeAgo } from "@/lib/utils";
import { API_BASE, API_HEADERS } from "@/lib/api";

interface Props {
  device: NetworkDevice;
  latestMetric?: MetricRecord | null;
}

export default function DeviceInfoCard({ device, latestMetric }: Props) {
  const online = isRecent(device.last_seen);
  const timeAgo = formatTimeAgo(device.last_seen);

  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ alive: boolean, message: string } | null>(null);

  const handlePing = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const res = await fetch(`${API_BASE}/devices/${device.serial_number}/ping`, { 
        method: "POST",
        headers: API_HEADERS
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Error en ping");
      }
      const data = await res.json();
      setPingResult({ alive: data.alive, message: data.message });
    } catch (e: any) {
      setPingResult({ alive: false, message: e.message });
    } finally {
      setPinging(false);
    }
  };

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
        
        {/* Botón Ping Interactivo */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {pingResult && (
            <span style={{ fontSize: "0.8rem", color: pingResult.alive ? "#4ade80" : "#f87171" }}>
              {pingResult.alive ? "✅ Responde" : "❌ No responde"}
            </span>
          )}
          <button
            onClick={handlePing}
            disabled={pinging || !latestMetric?.ip_address}
            title={!latestMetric?.ip_address ? "IP no disponible" : "Verificar conexión ahora"}
            style={{
              background: pinging ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.4)",
              color: "#a5b4fc",
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              cursor: pinging || !latestMetric?.ip_address ? "not-allowed" : "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "background 0.2s"
            }}
          >
            {pinging ? (
              <>
                <span style={{
                  display: "inline-block", width: "12px", height: "12px",
                  border: "2px solid rgba(165,180,252,0.3)", borderTopColor: "#a5b4fc",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite"
                }} />
                Pinging...
              </>
            ) : "📡 Hacer Ping"}
          </button>
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
