"use client";
// components/inventory/DeviceTable.tsx — Tabla con búsqueda, filtros, ordenación, paginación y exportación

import { useState, useMemo } from "react";
import { inventoryStyles as S } from "@/styles/inventory";
import { shared } from "@/styles/shared";
import { NetworkDevice } from "@/types";
import { formatBytes, isRecent, formatTimeAgo } from "@/lib/utils";

interface Props {
  devices:    NetworkDevice[];
  onRowClick: (serial: string) => void;
}

const ROWS_OPTIONS  = [10, 25, 50, 100];
const VENDOR_CHIPS  = ["Todos", "cisco", "mikrotik", "generic_snmp"];
const STATUS_CHIPS  = ["Todos", "Online", "Offline"];

export default function DeviceTable({ devices, onRowClick }: Props) {
  // ── Filtros y búsqueda ──────────────────────────────────────────────────
  const [search,       setSearch]       = useState("");
  const [vendorFilter, setVendorFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  // ── Ordenación ──────────────────────────────────────────────────────────
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // ── Paginación ──────────────────────────────────────────────────────────
  const [page,        setPage]        = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // ── Datos filtrados + ordenados + paginados ─────────────────────────────
  const filtered = useMemo(() => {
    let d = devices;

    // Búsqueda de texto
    if (search.trim()) {
      const q = search.toLowerCase();
      d = d.filter(dev =>
        dev.hostname.toLowerCase().includes(q)                  ||
        dev.serial_number.toLowerCase().includes(q)             ||
        (dev.model       ?? "").toLowerCase().includes(q)       ||
        (dev.mac_address ?? "").toLowerCase().includes(q)
      );
    }

    // Filtro por vendor
    if (vendorFilter !== "Todos") {
      d = d.filter(dev => dev.vendor === vendorFilter);
    }

    // Filtro por estado
    if (statusFilter === "Online")  d = d.filter(dev =>  isRecent(dev.last_seen));
    if (statusFilter === "Offline") d = d.filter(dev => !isRecent(dev.last_seen));

    // Ordenación por columna
    if (sortCol) {
      d = [...d].sort((a, b) => {
        const va = String((a as any)[sortCol] ?? "");
        const vb = String((b as any)[sortCol] ?? "");
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }

    return d;
  }, [devices, search, vendorFilter, statusFilter, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const pageStart  = (safePage - 1) * rowsPerPage;
  const paged      = filtered.slice(pageStart, pageStart + rowsPerPage);

  const resetPage  = () => setPage(1);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
    resetPage();
  };

  // ── Exportación ─────────────────────────────────────────────────────────
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const cols = ["hostname", "serial_number", "vendor", "model", "mac_address", "ios_version", "ram_total", "disk_total", "last_seen"];
    const rows = devices.map(d => cols.map(c => `"${(d as any)[c] ?? ""}"`).join(","));
    downloadFile([cols.join(","), ...rows].join("\n"), "inventario.csv", "text/csv");
  };

  const exportJSON = () => {
    downloadFile(JSON.stringify(devices, null, 2), "inventario.json", "application/json");
  };

  // ── Columna ordenable ───────────────────────────────────────────────────
  const SortTh = ({ col, label }: { col: string; label: string }) => (
    <th
      style={{ ...S.th, cursor: "pointer", userSelect: "none" as const }}
      onClick={() => toggleSort(col)}
      title={`Ordenar por ${label}`}
    >
      {label}
      <span style={{ marginLeft: "4px", opacity: sortCol === col ? 1 : 0.3, fontSize: "0.7rem" }}>
        {sortCol === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </th>
  );

  if (devices.length === 0) {
    return (
      <div style={{ ...shared.errorBox, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
        No hay dispositivos registrados. Ejecuta un escaneo primero.
      </div>
    );
  }

  return (
    <div>
      {/* ── Barra de herramientas ──────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginBottom: "1rem", alignItems: "center" }}>

        {/* Búsqueda */}
        <input
          id="device-search"
          value={search}
          onChange={e => { setSearch(e.target.value); resetPage(); }}
          placeholder="🔍  Buscar hostname, serial, modelo, MAC…"
          style={{
            flex: "2 1 220px", padding: "0.5rem 0.85rem",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "8px", color: "#e2e8f0", fontSize: "0.88rem", outline: "none",
          }}
        />

        {/* Chips de vendor */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {VENDOR_CHIPS.map(v => (
            <button
              key={v}
              onClick={() => { setVendorFilter(v); resetPage(); }}
              style={chipStyle(v === vendorFilter)}
            >
              {v === "generic_snmp" ? "Genérico" : v === "Todos" ? "Todos" : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Chips de estado */}
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {STATUS_CHIPS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); resetPage(); }}
              style={chipStyle(
                s === statusFilter,
                s === "Online" ? "#16a34a" : s === "Offline" ? "#dc2626" : undefined
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Botones de exportación */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
          <button id="export-csv-btn"  onClick={exportCSV}  style={exportBtnStyle}>⬇ CSV</button>
          <button id="export-json-btn" onClick={exportJSON} style={exportBtnStyle}>⬇ JSON</button>
        </div>
      </div>

      {/* ── Tabla ──────────────────────────────────────────────────────────── */}
      <div style={{ overflowX: "auto" }}>
        <div style={S.tableWrapper} className="responsive-table-wrapper">
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <SortTh col="hostname"      label="Hostname" />
                <SortTh col="serial_number" label="Serial" />
                <SortTh col="vendor"        label="Vendor" />
                <SortTh col="model"         label="Modelo" />
                <th style={S.th}>MAC</th>
                <th style={S.th}>IOS / Firmware</th>
                <SortTh col="ram_total"  label="RAM Total" />
                <SortTh col="disk_total" label="Disco Total" />
                <SortTh col="last_seen"  label="Última vez visto" />
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ ...S.td, textAlign: "center", color: "#64748b", padding: "2rem" }}>
                    No hay resultados para los filtros seleccionados.
                  </td>
                </tr>
              ) : paged.map((device, idx) => {
                const online = isRecent(device.last_seen);
                return (
                  <tr
                    key={device.serial_number}
                    onClick={() => onRowClick(device.serial_number)}
                    style={{
                      background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    title={`Ver detalles de ${device.hostname}`}
                  >
                    <td style={S.tdHostname}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div title={online ? "Online" : "Offline"} style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: online ? "#10b981" : "#ef4444", flexShrink: 0,
                        }} />
                        {device.hostname}
                      </div>
                    </td>
                    <td style={S.tdSerial}>{device.serial_number}</td>
                    <td style={S.td}>
                      {device.vendor
                        ? <span style={S.vendorBadge}>{device.vendor}</span>
                        : <span style={shared.nullCell}>—</span>}
                    </td>
                    <td style={S.td}>{device.model ?? <span style={shared.nullCell}>—</span>}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {device.mac_address ?? <span style={shared.nullCell}>—</span>}
                    </td>
                    <td style={{ ...S.td, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {device.ios_version ?? <span style={shared.nullCell}>—</span>}
                    </td>
                    <td style={S.td}>{formatBytes(device.ram_total)}</td>
                    <td style={S.td}>{formatBytes(device.disk_total)}</td>
                    <td style={S.td}>
                      {device.last_seen ? (
                        <span style={{
                          ...S.lastSeenBadge,
                          background: online ? "rgba(74,222,128,0.1)"  : "rgba(239,68,68,0.1)",
                          border:     online ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(239,68,68,0.2)",
                          color:      online ? "#4ade80" : "#f87171",
                        }}>
                          {formatTimeAgo(device.last_seen)}
                        </span>
                      ) : <span style={shared.nullCell}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Paginación ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ color: "#64748b", fontSize: "0.83rem" }}>
          Mostrando {filtered.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + rowsPerPage, filtered.length)} de {filtered.length} dispositivo(s)
          {filtered.length !== devices.length && ` (filtrado de ${devices.length})`}
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            value={rowsPerPage}
            onChange={e => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
            style={selectStyle}
          >
            {ROWS_OPTIONS.map(n => <option key={n} value={n}>{n} por página</option>)}
          </select>
          <button
            id="page-prev-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            style={pageBtn(safePage <= 1)}
          >←</button>
          <span style={{ color: "#94a3b8", fontSize: "0.85rem", minWidth: "60px", textAlign: "center" }}>
            {safePage} / {totalPages}
          </span>
          <button
            id="page-next-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            style={pageBtn(safePage >= totalPages)}
          >→</button>
        </div>
      </div>
    </div>
  );
}

// ── Estilos inline reutilizables ──────────────────────────────────────────

const chipStyle = (active: boolean, color?: string): React.CSSProperties => ({
  padding:      "0.3rem 0.7rem",
  borderRadius: "999px",
  border:       `1px solid ${active ? (color ?? "rgba(99,102,241,0.6)") : "rgba(255,255,255,0.1)"}`,
  background:   active ? (color ? `${color}22` : "rgba(99,102,241,0.15)") : "transparent",
  color:        active ? (color ?? "#a5b4fc") : "#64748b",
  cursor:       "pointer",
  fontSize:     "0.78rem",
  fontWeight:   active ? 600 : 400,
  transition:   "all 0.15s",
  whiteSpace:   "nowrap" as const,
});

const exportBtnStyle: React.CSSProperties = {
  padding:      "0.35rem 0.75rem",
  borderRadius: "8px",
  border:       "1px solid rgba(99,102,241,0.3)",
  background:   "rgba(99,102,241,0.08)",
  color:        "#a5b4fc",
  cursor:       "pointer",
  fontSize:     "0.8rem",
  fontWeight:   500,
};

const selectStyle: React.CSSProperties = {
  background:   "rgba(255,255,255,0.05)",
  border:       "1px solid rgba(99,102,241,0.25)",
  borderRadius: "8px",
  color:        "#94a3b8",
  padding:      "0.3rem 0.5rem",
  fontSize:     "0.82rem",
};

const pageBtn = (disabled: boolean): React.CSSProperties => ({
  padding:      "0.3rem 0.7rem",
  borderRadius: "8px",
  border:       "1px solid rgba(255,255,255,0.1)",
  background:   disabled ? "transparent" : "rgba(99,102,241,0.12)",
  color:        disabled ? "#374151" : "#a5b4fc",
  cursor:       disabled ? "not-allowed" : "pointer",
  fontSize:     "0.9rem",
});
