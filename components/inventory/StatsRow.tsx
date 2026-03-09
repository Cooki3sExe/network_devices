"use client";
// components/inventory/StatsRow.tsx — Summary stat cards (total devices, unique vendors)

import { inventoryStyles as S } from "@/styles/inventory";
import { NetworkDevice } from "@/types";

interface Props {
  total: number;
  devices: NetworkDevice[];
}

export default function StatsRow({ total, devices }: Props) {
  const vendors = [...new Set(devices.map((d) => d.vendor).filter(Boolean))].length;

  return (
    <div style={S.statsRow}>
      <div style={S.statCard}>
        <div style={S.statLabel}>Total dispositivos</div>
        <div style={S.statValue}>{total}</div>
      </div>
      <div style={S.statCard}>
        <div style={S.statLabel}>Vendors únicos</div>
        <div style={S.statValue}>{vendors}</div>
      </div>
    </div>
  );
}
