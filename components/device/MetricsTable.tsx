"use client";
// components/device/MetricsTable.tsx — Historical metrics table with expansion logic

import { useState } from "react";
import { MetricRecord } from "@/types";
import { deviceStyles as S } from "@/styles/device";
import { shared } from "@/styles/shared";
import { formatBytes, formatUptime } from "@/lib/utils";

interface Props {
  metrics: MetricRecord[];
}

export default function MetricsTable({ metrics }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Limit to max 20 records and newest first
  const allRecords = [...metrics].reverse().slice(0, 20);
  
  // Initially show only 5, or all if expanded
  const visibleCount = expanded ? allRecords.length : 5;
  const displayed = allRecords.slice(0, visibleCount);
  
  const hasMore = allRecords.length > 5;

  return (
    <div style={shared.card}>
      <div style={shared.sectionTitle}>
        📊 Historial de Métricas ({allRecords.length === 20 ? "Últimos 20" : `Mostrando ${allRecords.length}`} registros)
      </div>
      
      {allRecords.length === 0 ? (
        <div style={{ color: "#334155", fontStyle: "italic", padding: "1rem 0", textAlign: "center" }}>
          Sin datos disponibles
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={S.metricsTable}>
              <thead>
                <tr>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Timestamp</th>
                  <th style={S.th}>IP Address</th>
                  <th style={S.th}>CPU Load</th>
                  <th style={S.th}>RAM Used</th>
                  <th style={S.th}>Uptime</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((m, idx) => (
                  <tr
                    key={m.id}
                    style={{ background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}
                  >
                    <td style={S.tdMono}>{idx + 1}</td>
                    <td style={S.tdMono}>{m.timestamp}</td>
                    <td style={S.tdMono}>{m.ip_address ?? "—"}</td>
                    <td style={S.tdMono}>{m.cpu_load ?? "—"}%</td>
                    <td style={S.tdMono}>{formatBytes(m.ram_used)}</td>
                    <td style={S.tdMono}>{formatUptime(m.uptime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button 
                onClick={() => setExpanded(!expanded)}
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: "6px",
                  padding: "0.4rem 1.25rem",
                  color: "#a5b4fc",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {expanded ? "Ver menos" : `Ver más (${allRecords.length - 5} adicionales)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
