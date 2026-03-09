"use client";
// components/device/MetricsTable.tsx — Historical metrics table with color-coded CPU

import { MetricRecord } from "@/types";
import { deviceStyles as S } from "@/styles/device";
import { shared } from "@/styles/shared";
import { formatBytes } from "@/lib/utils";

interface Props {
  metrics: MetricRecord[];
}

export default function MetricsTable({ metrics }: Props) {
  // Display newest first (metrics prop is oldest→newest for charts)
  const sorted = [...metrics].reverse();

  return (
    <div style={shared.card}>
      <div style={shared.sectionTitle}>📊 Datos Crudos de la API (Mostrando {sorted.length} registros)</div>
      {sorted.length === 0 ? (
        <div style={{ color: "#334155", fontStyle: "italic", padding: "1rem 0", textAlign: "center" }}>
          Sin datos disponibles
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={S.metricsTable}>
            <thead>
              <tr>
                <th style={S.th}>#</th>
                <th style={S.th}>Timestamp</th>
                <th style={S.th}>CPU Load</th>
                <th style={S.th}>RAM Used (KB)</th>
                <th style={S.th}>Disk Used (KB)</th>
                <th style={S.th}>Uptime (Ticks)</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m, idx) => (
                <tr
                  key={m.id}
                  style={{ background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}
                >
                  <td style={S.tdMono}>{idx + 1}</td>
                  <td style={S.tdMono}>{m.timestamp}</td>
                  <td style={S.tdMono}>{m.cpu_load ?? "—"}</td>
                  <td style={S.tdMono}>{m.ram_used ?? "—"}</td>
                  <td style={S.tdMono}>{m.disk_used ?? "—"}</td>
                  <td style={S.tdMono}>{m.uptime ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
