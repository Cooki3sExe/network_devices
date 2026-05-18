"use client";
// components/device/UnifiedChart.tsx — Unified CPU & RAM usage line chart with timeframe selector

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { MetricRecord } from "@/types";
import { shared } from "@/styles/shared";
import { shortTimestamp } from "@/lib/utils";
import ChartTooltip from "./ChartTooltip"; // Usaremos un tooltip custom

interface Props {
  metrics: MetricRecord[];
}

export default function UnifiedChart({ metrics }: Props) {
  const [timeframe, setTimeframe] = useState<"1h" | "24h" | "all">("all");

  const filteredData = useMemo(() => {
    if (!metrics.length) return [];
    
    // El backend ya devuelve del más reciente al más antiguo, así que revertimos
    // para que el gráfico vaya de izquierda (viejo) a derecha (nuevo).
    let data = [...metrics].reverse();
    
    const now = new Date().getTime();
    if (timeframe === "1h") {
      data = data.filter(m => (now - new Date(m.timestamp).getTime()) <= 60 * 60 * 1000);
    } else if (timeframe === "24h") {
      data = data.filter(m => (now - new Date(m.timestamp).getTime()) <= 24 * 60 * 60 * 1000);
    }
    
    return data.map((m) => ({
      time: shortTimestamp(m.timestamp),
      CPU: m.cpu_load ?? 0,
      RAM: m.ram_used !== null ? parseFloat((m.ram_used / 1024).toFixed(1)) : 0,
    }));
  }, [metrics, timeframe]);

  // CPU domain
  const cpuValues = filteredData.map(d => d.CPU);
  const cpuMax = cpuValues.length ? Math.max(...cpuValues) : 100;
  const cpuMin = cpuValues.length ? Math.min(...cpuValues) : 0;
  const cpuPadding = Math.max(1, Math.ceil((cpuMax - cpuMin) * 0.25));
  const yCpuMin = Math.max(0,   Math.floor(cpuMin - cpuPadding));
  const yCpuMax = Math.min(100, Math.ceil(cpuMax  + cpuPadding));

  // RAM domain
  const ramValues = filteredData.map(d => d.RAM);
  const ramMax = ramValues.length ? Math.max(...ramValues) : 100;
  const ramMin = ramValues.length ? Math.min(...ramValues) : 0;
  const ramPadding = Math.max(1, Math.ceil((ramMax - ramMin) * 0.25));
  const yRamMin = Math.max(0, Math.floor(ramMin - ramPadding));
  const yRamMax = Math.ceil(ramMax + ramPadding);

  return (
    <div style={shared.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ ...shared.sectionTitle, marginBottom: 0 }}>📊 Rendimiento (CPU & RAM)</div>
        
        {/* Selector de tiempo */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {(["1h", "24h", "all"] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe === tf ? "rgba(99,102,241,0.2)" : "transparent",
                border: `1px solid ${timeframe === tf ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)"}`,
                color: timeframe === tf ? "#a5b4fc" : "#64748b",
                padding: "0.2rem 0.6rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tf === "1h" ? "Última Hora" : tf === "24h" ? "24 Horas" : "Todo"}
            </button>
          ))}
        </div>
      </div>
      
      {filteredData.length === 0 ? (
        <div style={{ color: "#334155", fontStyle: "italic", padding: "2rem 0", textAlign: "center" }}>
          Sin datos suficientes para este rango temporal
        </div>
      ) : (
        <div style={{ width: "100%", marginTop: "1rem" }}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={filteredData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                domain={[yCpuMin, yCpuMax]}
                unit="%"
                stroke="#818cf8" // Color del label
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                domain={[yRamMin, yRamMax]}
                unit="MB"
                stroke="#34d399"
              />
              <Tooltip 
                contentStyle={{ background: "rgba(15,15,26,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                itemStyle={{ fontSize: "0.85rem" }}
              />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "0.8rem", paddingTop: "1rem" }} />
              <Line
                yAxisId="left"
                type="monotone"
                name="CPU (%)"
                dataKey="CPU"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#a5b4fc" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                name="RAM (MB)"
                dataKey="RAM"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#6ee7b7" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
