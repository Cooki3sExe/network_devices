"use client";
// components/device/RamChart.tsx — RAM usage line chart (KB → MB)

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

export default function RamChart({ metrics }: Props) {
  const ramData = metrics.map((m) => ({
    time: shortTimestamp(m.timestamp),
    RAM: m.ram_used !== null ? parseFloat((m.ram_used / 1024).toFixed(1)) : 0,
  }));

  return (
    <div style={shared.card}>
      <div style={shared.sectionTitle}>💾 RAM Usada (MB)</div>
      {ramData.length === 0 ? (
        <div style={{ color: "#334155", fontStyle: "italic", padding: "2rem 0", textAlign: "center" }}>
          Sin datos de RAM disponibles
        </div>
      ) : (
        <div style={{ width: "100%" }}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={ramData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                unit=" MB"
              />
              <Tooltip content={<ChartTooltip unit="MB" />} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "0.8rem" }} />
              <Line
                type="monotone"
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
