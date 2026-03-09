"use client";
// app/page.tsx — Inventory page (thin orchestrator, ~40 lines)

import { useRouter } from "next/navigation";
import { globalStyles, shared } from "@/styles/shared";
import { inventoryStyles as S } from "@/styles/inventory";
import { useDevices } from "@/hooks/useDevices";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorBox from "@/components/ui/ErrorBox";
import StatsRow from "@/components/inventory/StatsRow";
import DeviceTable from "@/components/inventory/DeviceTable";

export default function Home() {
  const router = useRouter();
  const { data, loading, error } = useDevices();

  return (
    <>
      <style>{globalStyles + `tr:hover td, tr:hover th { background: rgba(99,102,241,0.06) !important; }`}</style>
      <div style={shared.page}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <StatusBadge />
            </div>
            <h1 style={S.title}>Network Devices</h1>
            <p style={S.subtitle}>Datos en tiempo real desde <code>GET /devices</code></p>
          </div>
        </div>

        {/* Stats */}
        {data && <StatsRow total={data.total} devices={data.devices} />}

        {/* State feedback */}
        {loading && <LoadingSpinner message="Conectando con la API…" />}
        {error   && (
          <ErrorBox
            title="Error al conectar con la API"
            detail={error}
            hint="Verifica que el servidor FastAPI esté corriendo en http://localhost:8000"
          />
        )}

        {/* Device table */}
        {data && (
          <DeviceTable
            devices={data.devices}
            onRowClick={(serial) => router.push(`/devices/${encodeURIComponent(serial)}`)}
          />
        )}

      </div>
    </>
  );
}
