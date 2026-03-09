"use client";
// components/ui/StatusBadge.tsx — Animated "SNMP Inventory" badge with pulsing dot

import { shared } from "@/styles/shared";

export default function StatusBadge() {
  return (
    <span style={shared.badge}>
      <span style={shared.dot} />
      SNMP Inventory
    </span>
  );
}
