"use client";
// components/device/DiskChart.tsx — Disk used line chart (KB → MB)

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

export default function DiskChart({ metrics }: Props) {
  const diskData = metrics.map((m) => ({
    time: shortTimestamp(m.timestamp),
    Disco: (m.disk_used !== null && m.disk_used !== undefined) ? parseFloat((m.disk_used / 1024).toFixed(1)) : 0,
  }));

  // Dynamic Y-axis domain with padding
  const values = diskData.map((d) => d.Disco);
  const dataMax = values.length ? Math.max(...values) : 100;
  const dataMin = values.length ? Math.min(...values) : 0;
  const padding = Math.max(0.5, (dataMax - dataMin) * 0.25);
  const yMin = Math.max(0, parseFloat((dataMin - padding).toFixed(1)));
  const yMax = parseFloat((dataMax + padding).toFixed(1));

  return (
    <div style={shared.card}>
      <div style={shared.sectionTitle}>💿 Disco Usado (MB)</div>
      {diskData.length === 0 ? (
        <div style={{ color: "#334155", fontStyle: "italic", padding: "2rem 0", textAlign: "center" }}>
          Sin datos de disco disponibles
        </div>
      ) : (
        <div style={{ width: "100%" }}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={diskData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                unit=" MB"
              />
              <Tooltip content={<ChartTooltip unit="MB" />} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "0.8rem" }} />
              <Line
                type="monotone"
                dataKey="Disco"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#fbbf24" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
