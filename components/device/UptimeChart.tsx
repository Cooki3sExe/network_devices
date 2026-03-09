"use client";
// components/device/UptimeChart.tsx — Uptime line chart (SNMP ticks → hours)

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

export default function UptimeChart({ metrics }: Props) {
  const uptimeData = metrics.map((m) => ({
    time: shortTimestamp(m.timestamp),
    Uptime: m.uptime !== null ? parseFloat((m.uptime / 100 / 3600).toFixed(2)) : 0,
  }));

  // Dynamic Y-axis domain with padding
  const values = uptimeData.map((d) => d.Uptime);
  const dataMax = values.length ? Math.max(...values) : 10;
  const dataMin = values.length ? Math.min(...values) : 0;
  const padding = Math.max(0.1, (dataMax - dataMin) * 0.25);
  const yMin = Math.max(0, parseFloat((dataMin - padding).toFixed(2)));
  const yMax = parseFloat((dataMax + padding).toFixed(2));

  return (
    <div style={shared.card}>
      <div style={shared.sectionTitle}>⏱️ Uptime (horas)</div>
      {uptimeData.length === 0 ? (
        <div style={{ color: "#334155", fontStyle: "italic", padding: "2rem 0", textAlign: "center" }}>
          Sin datos de uptime disponibles
        </div>
      ) : (
        <div style={{ width: "100%" }}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={uptimeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                unit="h"
              />
              <Tooltip content={<ChartTooltip unit="h" />} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "0.8rem" }} />
              <Line
                type="monotone"
                dataKey="Uptime"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#c4b5fd" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
