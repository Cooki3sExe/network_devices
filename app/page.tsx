"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://misadjudicated-debra-indicially.ngrok-free.dev";

interface NetworkDevice {
  serial_number: string;
  hostname: string;
  model: string | null;
  mac_address: string | null;
  vendor: string | null;
  ios_version: string | null;
  boot_image: string | null;
  domain: string | null;
  ram_total: number | null;
  disk_total: number | null;
  last_seen: string | null;
}

interface DevicesResponse {
  total: number;
  devices: NetworkDevice[];
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: "#e2e8f0",
    padding: "2rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.4)",
    borderRadius: "999px",
    padding: "0.25rem 0.75rem",
    fontSize: "0.75rem",
    color: "#a5b4fc",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#4ade80",
    animation: "pulse 2s infinite",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    background: "linear-gradient(90deg, #a5b4fc, #818cf8, #6366f1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#64748b",
    marginTop: "0.25rem",
  },
  statsRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "1rem 1.5rem",
    minWidth: "140px",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
  statValue: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#a5b4fc",
    lineHeight: 1.2,
  },
  tableWrapper: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "0.875rem",
  },
  thead: {
    background: "rgba(99,102,241,0.1)",
  },
  th: {
    padding: "0.875rem 1.25rem",
    textAlign: "left" as const,
    fontWeight: 600,
    fontSize: "0.75rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "#6366f1",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    whiteSpace: "nowrap" as const,
  },
  td: {
    padding: "0.875rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    color: "#cbd5e1",
    verticalAlign: "middle" as const,
  },
  tdHostname: {
    padding: "0.875rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    color: "#f1f5f9",
    fontWeight: 600,
    verticalAlign: "middle" as const,
  },
  tdSerial: {
    padding: "0.875rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    color: "#94a3b8",
    fontFamily: "monospace",
    fontSize: "0.8rem",
    verticalAlign: "middle" as const,
  },
  nullCell: {
    color: "#334155",
    fontStyle: "italic" as const,
    fontSize: "0.8rem",
  },
  vendorBadge: {
    display: "inline-block",
    padding: "0.2rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    background: "rgba(99,102,241,0.2)",
    border: "1px solid rgba(99,102,241,0.3)",
    color: "#a5b4fc",
  },
  lastSeenBadge: {
    display: "inline-block",
    padding: "0.2rem 0.6rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    background: "rgba(74,222,128,0.1)",
    border: "1px solid rgba(74,222,128,0.2)",
    color: "#4ade80",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    gap: "1rem",
    color: "#64748b",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(99,102,241,0.2)",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "12px",
    padding: "1.5rem",
    color: "#fca5a5",
    textAlign: "center" as const,
  },
};

function formatBytes(kb: number | null): string {
  if (kb === null) return "—";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function Home() {
  const [data, setData] = useState<DevicesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/devices`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: DevicesResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const vendors = data
    ? [...new Set(data.devices.map((d) => d.vendor).filter(Boolean))].length
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        tr:hover td, tr:hover th { background: rgba(99,102,241,0.06) !important; }
        ::-webkit-scrollbar { height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
      `}</style>

      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <span style={styles.badge}>
                <span style={styles.dot} />
                SNMP Inventory
              </span>
            </div>
            <h1 style={styles.title}>Network Devices</h1>
            <p style={styles.subtitle}>Datos en tiempo real desde <code>GET /devices</code></p>
          </div>
        </div>

        {/* Stats */}
        {data && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total dispositivos</div>
              <div style={styles.statValue}>{data.total}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Vendors únicos</div>
              <div style={styles.statValue}>{vendors}</div>
            </div>
          </div>
        )}

        {/* States */}
        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <span>Conectando con la API…</span>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <strong>⚠ Error al conectar con la API</strong>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#f87171" }}>{error}</p>
            <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>
              Verifica que el servidor FastAPI esté corriendo en <code>http://localhost:8000</code>
            </p>
          </div>
        )}

        {/* Table */}
        {data && data.devices.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.thead}>
                  <tr>
                    <th style={styles.th}>Hostname</th>
                    <th style={styles.th}>Serial</th>
                    <th style={styles.th}>Vendor</th>
                    <th style={styles.th}>Modelo</th>
                    <th style={styles.th}>MAC</th>
                    <th style={styles.th}>IOS / Firmware</th>
                    <th style={styles.th}>RAM Total</th>
                    <th style={styles.th}>Disco Total</th>
                    <th style={styles.th}>Último visto</th>
                  </tr>
                </thead>
                <tbody>
                  {data.devices.map((device, idx) => (
                    <tr key={device.serial_number} style={{ background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                      <td style={styles.tdHostname}>{device.hostname}</td>
                      <td style={styles.tdSerial}>{device.serial_number}</td>
                      <td style={styles.td}>
                        {device.vendor
                          ? <span style={styles.vendorBadge}>{device.vendor}</span>
                          : <span style={styles.nullCell}>—</span>}
                      </td>
                      <td style={styles.td}>{device.model ?? <span style={styles.nullCell}>—</span>}</td>
                      <td style={{ ...styles.td, fontFamily: "monospace", fontSize: "0.8rem" }}>
                        {device.mac_address ?? <span style={styles.nullCell}>—</span>}
                      </td>
                      <td style={{ ...styles.td, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {device.ios_version ?? <span style={styles.nullCell}>—</span>}
                      </td>
                      <td style={styles.td}>{formatBytes(device.ram_total)}</td>
                      <td style={styles.td}>{formatBytes(device.disk_total)}</td>
                      <td style={styles.td}>
                        {device.last_seen
                          ? <span style={styles.lastSeenBadge}>{device.last_seen}</span>
                          : <span style={styles.nullCell}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data && data.devices.length === 0 && (
          <div style={{ ...styles.errorBox, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
            No hay dispositivos registrados. Ejecuta un escaneo primero.
          </div>
        )}
      </div>
    </>
  );
}
