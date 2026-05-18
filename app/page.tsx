"use client";
// app/page.tsx — Inventory page: tabla/cards, KPIs, scan panel, toasts

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { globalStyles, shared } from "@/styles/shared";
import { inventoryStyles as S } from "@/styles/inventory";
import { useDevices } from "@/hooks/useDevices";
import { isRecent } from "@/lib/utils";
import StatusBadge   from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorBox      from "@/components/ui/ErrorBox";
import Toast, { ToastType } from "@/components/ui/Toast";
import StatsRow      from "@/components/inventory/StatsRow";
import DeviceTable   from "@/components/inventory/DeviceTable";
import DeviceCards   from "@/components/inventory/DeviceCards";
import ScanPanel     from "@/components/inventory/ScanPanel";

type ViewMode = "table" | "cards";

export default function Home() {
  const router = useRouter();
  const { data, loading, error, refetch } = useDevices();

  // Vista: tabla o tarjetas
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Toast de notificaciones
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  // Actualizar el título del documento y mostrar alertas de desconexión
  const prevDevicesRef = useRef<any[] | null>(null);

  useEffect(() => {
    if (data) {
      const offlineCount = data.devices.filter(d => !isRecent(d.last_seen)).length;
      document.title = offlineCount > 0
        ? `(${offlineCount}) Network Devices`
        : "Network Devices";

      // Lógica para detectar si alguien se desconectó
      if (prevDevicesRef.current) {
        const prevOnline = new Set(
          prevDevicesRef.current.filter(d => isRecent(d.last_seen)).map(d => d.serial_number)
        );
        const currOnline = new Set(
          data.devices.filter(d => isRecent(d.last_seen)).map(d => d.serial_number)
        );

        for (const serial of prevOnline) {
          if (!currOnline.has(serial)) {
            const dev = data.devices.find(d => d.serial_number === serial);
            if (dev) {
              showToast(`¡Alerta! ${dev.hostname} se ha desconectado.`, "error");
            }
          }
        }
      }
      prevDevicesRef.current = data.devices;
    }
  }, [data]);

  return (
    <>
      <style>{globalStyles + `tr:hover td, tr:hover th { background: rgba(99,102,241,0.06) !important; }`}</style>
      <div style={shared.page} className="responsive-page">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div style={{ ...S.header, justifyContent: "space-between" }} className="responsive-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <StatusBadge />
            </div>
            <h1 style={S.title}>Network Devices</h1>
            <p style={S.subtitle}>Datos en tiempo real desde <code>GET /devices</code></p>
          </div>

          {/* Toggle vista tabla / cards */}
          <div style={{ display: "flex", gap: "0.4rem", alignSelf: "flex-start" }}>
            <button
              id="view-table-btn"
              onClick={() => setViewMode("table")}
              title="Vista tabla"
              style={viewToggleBtn(viewMode === "table")}
            >☰ Tabla</button>
            <button
              id="view-cards-btn"
              onClick={() => setViewMode("cards")}
              title="Vista tarjetas"
              style={viewToggleBtn(viewMode === "cards")}
            >⊞ Cards</button>
          </div>
        </div>

        {/* ── KPI cards ────────────────────────────────────────────────────── */}
        {data && <StatsRow total={data.total} devices={data.devices} />}

        {/* ── Panel de scan ────────────────────────────────────────────────── */}
        <ScanPanel
          onScanComplete={refetch}
          onToast={showToast}
        />

        {/* ── State feedback ───────────────────────────────────────────────── */}
        {loading && <LoadingSpinner message="Conectando con la API…" />}
        {error && (
          <ErrorBox
            title="Error al conectar con la API"
            detail={error}
            hint="Verifica que el servidor FastAPI esté corriendo en http://localhost:8000"
          />
        )}

        {/* ── Contenido principal: tabla o cards ───────────────────────────── */}
        {data && viewMode === "table" && (
          <DeviceTable
            devices={data.devices}
            onRowClick={(serial) => router.push(`/devices/${encodeURIComponent(serial)}`)}
          />
        )}
        {data && viewMode === "cards" && (
          <DeviceCards
            devices={data.devices}
            onCardClick={(serial) => router.push(`/devices/${encodeURIComponent(serial)}`)}
          />
        )}

      </div>

      {/* ── Toast de notificaciones (fuera del div para posición fixed) ───── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────
const viewToggleBtn = (active: boolean): React.CSSProperties => ({
  padding:      "0.4rem 0.85rem",
  borderRadius: "8px",
  border:       `1px solid ${active ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)"}`,
  background:   active ? "rgba(99,102,241,0.2)" : "transparent",
  color:        active ? "#a5b4fc" : "#64748b",
  cursor:       "pointer",
  fontSize:     "0.82rem",
  fontWeight:   active ? 600 : 400,
  transition:   "all 0.15s",
});
