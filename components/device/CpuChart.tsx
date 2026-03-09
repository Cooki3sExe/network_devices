"use client";
// components/device/CpuChart.tsx — CPU usage line chart

import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { MetricRecord } from "@/types";
import { shared } from "@/styles/shared";
import { shortTimestamp } from "@/lib/utils";
import ChartTooltip from "./ChartTooltip";

interface Props {
  metrics: MetricRecord[];
}

export default function CpuChart({ metrics }: Props) {
  const cpuData = metrics.map((m) => ({
    time: shortTimestamp(m.timestamp),
    CPU: m.cpu_load ?? 0,
  }));

  // Calculate a tight Y-axis domain from actual data
  const cpuValues = cpuData.map((d) => d.CPU);
  const dataMax = cpuValues.length ? Math.max(...cpuValues) : 100;
  const dataMin = cpuValues.length ? Math.min(...cpuValues) : 0;
  const padding  = Math.max(1, Math.ceil((dataMax - dataMin) * 0.25));
  const yMin = Math.max(0,   Math.floor(dataMin - padding));
  const yMax = Math.min(100, Math.ceil(dataMax  + padding));

  return (
    <div style={shared.card}>
      <div style={shared.sectionTitle}>🖥️ CPU Usage (%)</div>
      {cpuData.length === 0 ? (
        <div style={{ color: "#334155", fontStyle: "italic", padding: "2rem 0", textAlign: "center" }}>
          Sin datos de CPU disponibles
        </div>
      ) : (
        <div style={{ width: "100%" }}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={cpuData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                domain={[yMin, yMax]}
                unit="%"
              />
              <Tooltip content={<ChartTooltip unit="%" />} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "0.8rem" }} />
              <Line
                type="monotone"
                dataKey="CPU"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#a5b4fc" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
