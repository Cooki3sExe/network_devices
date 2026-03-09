"use client";
// components/device/ChartTooltip.tsx — Custom tooltip shared by CPU and RAM charts

interface Props {
  active?: boolean;
  payload?: { value: number; color: string }[];
  label?: string;
  unit: string;
}

export default function ChartTooltip({ active, payload, label, unit }: Props) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(15,15,26,0.95)",
      border: "1px solid rgba(99,102,241,0.4)",
      borderRadius: "8px",
      padding: "0.5rem 0.75rem",
      fontSize: "0.8rem",
    }}>
      <div style={{ color: "#64748b", marginBottom: "0.25rem" }}>{label}</div>
      <div style={{ color: payload[0].color, fontWeight: 600 }}>
        {payload[0].value} {unit}
      </div>
    </div>
  );
}
