"use client";
// components/inventory/DeviceCards.tsx — Vista de tarjetas para los dispositivos

import { NetworkDevice } from "@/types";
import { isRecent, formatTimeAgo, formatBytes } from "@/lib/utils";

interface Props {
  devices: NetworkDevice[];
  onCardClick: (serial: string) => void;
}

export default function DeviceCards({ devices, onCardClick }: Props) {
  if (devices.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "3rem",
        color: "#a5b4fc", background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px",
      }}>
        No hay dispositivos para mostrar.
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
      gap: "1rem",
    }}>
      {devices.map(device => {
        const online = isRecent(device.last_seen);
        return (
          <div
            key={device.serial_number}
            onClick={() => onCardClick(device.serial_number)}
            style={{
              background:    "rgba(255,255,255,0.03)",
              border:        `1px solid ${online ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.15)"}`,
              borderRadius:  "14px",
              padding:       "1.25rem",
              cursor:        "pointer",
              transition:    "transform 0.15s, box-shadow 0.15s",
              boxShadow:     "0 4px 16px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
            }}
          >
            {/* Header de la card */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "1rem", marginBottom: "0.15rem" }}>
                  {device.hostname}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.72rem", fontFamily: "monospace" }}>
                  {device.serial_number}
                </div>
              </div>
              {/* Punto de estado online/offline */}
              <div title={online ? "Online" : "Offline"} style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: online ? "#10b981" : "#ef4444",
                marginTop: "4px", flexShrink: 0,
              }} />
            </div>

            {/* Vendor badge */}
            {device.vendor && (
              <span style={{
                display: "inline-block", padding: "0.15rem 0.55rem",
                borderRadius: "999px", fontSize: "0.7rem",
                background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)",
                color: "#a5b4fc", marginBottom: "0.9rem",
              }}>
                {device.vendor}
              </span>
            )}

            {/* Info rápida */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.8rem", color: "#94a3b8" }}>
              {device.model     && <div>📦 {device.model}</div>}
              {device.ram_total && <div>💾 RAM: {formatBytes(device.ram_total)}</div>}
              {device.mac_address && (
                <div style={{ fontFamily: "monospace", fontSize: "0.73rem" }}>
                  🔗 {device.mac_address}
                </div>
              )}
              <div style={{ color: online ? "#4ade80" : "#f87171", fontWeight: 500, marginTop: "0.25rem" }}>
                🕐 {formatTimeAgo(device.last_seen)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
