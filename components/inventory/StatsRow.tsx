"use client";
// components/inventory/StatsRow.tsx — KPI cards: total, online, offline, vendors, CPU avg, último scan

import { inventoryStyles as S } from "@/styles/inventory";
import { NetworkDevice } from "@/types";
import { isRecent } from "@/lib/utils";
import { API_BASE, API_HEADERS } from "@/lib/api";
import { useState, useEffect } from "react";

interface Props {
  total:   number;
  devices: NetworkDevice[];
}

export default function StatsRow({ total, devices }: Props) {
  const online  = devices.filter(d => isRecent(d.last_seen)).length;
  const offline = total - online;
  const vendors = [...new Set(devices.map(d => d.vendor).filter(Boolean))].length;

  const [avgCpu,     setAvgCpu]     = useState<number | null>(null);
  const [lastScan,   setLastScan]   = useState<string | null>(null);
  const [cpuAlerts,  setCpuAlerts]  = useState<number>(0);
  const [ramAlerts,  setRamAlerts]  = useState<number>(0);

  useEffect(() => {
    // Traemos las métricas recientes para calcular el CPU promedio y alertas
    fetch(`${API_BASE}/metrics?limit=1000`, { headers: API_HEADERS })
      .then(r => r.json())
      .then(data => {
        // Por cada dispositivo nos quedamos solo con su registro más reciente
        const latestMetricsByDevice = new Map<string, any>();
        for (const m of data.metrics) {
          if (!latestMetricsByDevice.has(m.device_serial)) {
            latestMetricsByDevice.set(m.device_serial, m);
          }
        }
        
        let totalCpu = 0;
        let countCpu = 0;
        let alertsC = 0;
        let alertsR = 0;

        for (const [serial, m] of latestMetricsByDevice.entries()) {
          // CPU
          if (m.cpu_load !== null) {
            totalCpu += m.cpu_load;
            countCpu++;
            if (m.cpu_load > 80) alertsC++;
          }
          // RAM
          if (m.ram_used !== null) {
            // Buscamos el ram_total del dispositivo en la lista props.devices
            const dev = devices.find(d => d.serial_number === serial);
            if (dev && dev.ram_total && dev.ram_total > 0) {
              const ramPct = (m.ram_used / dev.ram_total) * 100;
              if (ramPct > 90) alertsR++;
            }
          }
        }

        if (countCpu > 0) setAvgCpu(Math.round(totalCpu / countCpu));
        setCpuAlerts(alertsC);
        setRamAlerts(alertsR);
      })
      .catch(() => {});

    // Traemos el estado del scanner para mostrar cuándo fue el último scan
    fetch(`${API_BASE}/scanner/status`, { headers: API_HEADERS })
      .then(r => r.json())
      .then(data => setLastScan(data.last_scan))
      .catch(() => {});
  }, [devices]); // se re-ejecuta cada vez que la lista de dispositivos cambia

  const formatLastScan = (iso: string | null) => {
    if (!iso) return "—";
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60)   return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
    return new Date(iso).toLocaleTimeString("es-ES");
  };

  return (
    <div style={{ ...S.statsRow, flexWrap: "wrap" }} className="responsive-stats">
      <StatCard label="Total dispositivos" value={String(total)}   color="#a5b4fc" />
      <StatCard label="Online"             value={String(online)}  color="#4ade80" />
      <StatCard label="Offline"            value={String(offline)} color={offline > 0 ? "#f87171" : "#64748b"} />
      <StatCard label="Vendors"            value={String(vendors)} color="#a5b4fc" />
      {avgCpu !== null && (
        <StatCard
          label="CPU avg"
          value={`${avgCpu}%`}
          color={avgCpu > 80 ? "#f87171" : avgCpu > 60 ? "#fbbf24" : "#4ade80"}
        />
      )}
      <StatCard 
        label="CPU > 80%" 
        value={String(cpuAlerts)} 
        color={cpuAlerts > 0 ? "#f87171" : "#4ade80"} 
      />
      <StatCard 
        label="RAM > 90%" 
        value={String(ramAlerts)} 
        color={ramAlerts > 0 ? "#f87171" : "#4ade80"} 
      />
      <StatCard label="Último scan" value={formatLastScan(lastScan)} color="#64748b" small />
    </div>
  );
}

// Tarjeta individual reutilizable
function StatCard({ label, value, color, small = false }: {
  label: string; value: string; color: string; small?: boolean;
}) {
  return (
    <div style={S.statCard}>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statValue, color, fontSize: small ? "1rem" : "1.75rem" }}>{value}</div>
    </div>
  );
}
