"use client";
// components/inventory/ScanPanel.tsx — Panel de escaneo: modo único y modo continuo

import { useState, useEffect, useRef } from "react";
import { API_BASE, API_HEADERS } from "@/lib/api";
import { ToastType } from "@/components/ui/Toast";

interface ScanResult {
  message: string;
  devices_count: number;
}

interface ScannerStatus {
  running: boolean;
  network: string | null;
  interval: number;
  last_scan: string | null;
  devices_found: number | null;
}

export default function ScanPanel({
  onScanComplete,
  onToast,
}: {
  onScanComplete: () => void;
  onToast?: (message: string, type: ToastType) => void;
}) {
  // Campos del formulario
  const [network, setCidr]     = useState("172.20.10.0/24");
  const [community, setCom]    = useState("public");
  const [interval, setInterval_] = useState(30);

  // Estado del scan único
  const [loadingSingle, setLoadingSingle] = useState(false);
  const [singleResult, setSingleResult]   = useState<ScanResult | null>(null);
  const [singleError, setSingleError]     = useState<string | null>(null);

  // Estado del scanner continuo (viene del backend)
  const [status, setStatus] = useState<ScannerStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Consulta el estado del scanner continuo cada 10 segundos
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/scanner/status`, { headers: API_HEADERS });
      if (res.ok) {
        const data: ScannerStatus = await res.json();
        setStatus(data);
        // Si el scanner está corriendo, refrescamos la tabla también
        if (data.running) onScanComplete();
      }
    } catch {
      // Si falla silenciosamente no pasa nada
    }
  };

  // Al montar, consultamos el estado inicial y arrancamos el polling
  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 10_000); // cada 10 segundos
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // ── Scan único (con Job Queue) ────────────────────────────────────────────
  const handleSingleScan = async () => {
    setLoadingSingle(true);
    setSingleResult(null);
    setSingleError(null);

    try {
      // 1. Iniciar el job
      const res = await fetch(`${API_BASE}/scan`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...API_HEADERS },
        body:    JSON.stringify({ network, community }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Error iniciando escaneo");
      }

      const { job_id } = await res.json();
      
      // 2. Polling del estado del job
      const pollJob = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_BASE}/scan/${job_id}`, { headers: API_HEADERS });
          if (!statusRes.ok) return;
          
          const jobData = await statusRes.json();
          if (jobData.status === "done") {
            clearInterval(pollJob);
            setSingleResult({ message: "Escaneo completado", devices_count: jobData.devices_count });
            onScanComplete();
            onToast?.(`✅ Scan completado — ${jobData.devices_count} dispositivo(s) encontrado(s)`, "success");
            setLoadingSingle(false);
          } else if (jobData.status === "failed") {
            clearInterval(pollJob);
            setSingleError(jobData.error ?? "Falló el escaneo");
            onToast?.(jobData.error ?? "Falló el escaneo", "error");
            setLoadingSingle(false);
          }
        } catch (e) {
          // Ignorar errores de red temporales en el polling
        }
      }, 2000); // Polling cada 2 segundos

    } catch (err: any) {
      setSingleError(err.message);
      onToast?.(err.message, "error");
      setLoadingSingle(false);
    }
  };

  // ── Scanner continuo ──────────────────────────────────────────────────────
  const handleStartContinuous = async () => {
    try {
      await fetch(`${API_BASE}/scanner/start`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...API_HEADERS },
        body:    JSON.stringify({ network, community, interval }),
      });
      await fetchStatus(); // refrescamos el estado inmediatamente
    } catch (err: any) {
      setSingleError(err.message);
    }
  };

  const handleStop = async () => {
    try {
      await fetch(`${API_BASE}/scanner/stop`, { method: "POST", headers: API_HEADERS });
      await fetchStatus();
    } catch {}
  };

  // Formatea el timestamp ISO para mostrarlo legible
  const formatLastScan = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const isRunning = status?.running ?? false;

  return (
    <div style={{
      background:   "rgba(99,102,241,0.08)",
      border:       "1px solid rgba(99,102,241,0.25)",
      borderRadius: "12px",
      padding:      "1.25rem 1.5rem",
      marginBottom: "1.5rem",
    }}>

      {/* Fila de campos */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "1rem" }}>

        {/* Red CIDR */}
        <div style={{ flex: 2, minWidth: "180px" }}>
          <label style={labelStyle}>Red (CIDR)</label>
          <input
            id="scan-network"
            value={network}
            onChange={e => setCidr(e.target.value)}
            placeholder="ej: 172.20.10.0/24"
            disabled={loadingSingle || isRunning}
            style={inputStyle(loadingSingle || isRunning)}
          />
        </div>

        {/* Community */}
        <div style={{ flex: 2, minWidth: "160px" }}>
          <label style={labelStyle}>Community SNMP</label>
          <input
            id="scan-community"
            value={community}
            onChange={e => setCom(e.target.value)}
            type="password"
            placeholder="community"
            disabled={loadingSingle || isRunning}
            style={inputStyle(loadingSingle || isRunning)}
          />
        </div>

        {/* Intervalo */}
        <div style={{ flex: 1, minWidth: "110px" }}>
          <label style={labelStyle}>Intervalo (seg)</label>
          <input
            id="scan-interval"
            type="number"
            value={interval}
            onChange={e => setInterval_(Math.max(10, Number(e.target.value)))}
            min={10}
            max={3600}
            disabled={loadingSingle || isRunning}
            style={inputStyle(loadingSingle || isRunning)}
          />
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {/* Scan único */}
          <button
            id="scan-single-btn"
            onClick={handleSingleScan}
            disabled={loadingSingle || isRunning || !network || !community}
            style={btnStyle(loadingSingle || isRunning, "#4f46e5")}
          >
            {loadingSingle ? "⏳ Escaneando..." : "🔍 Scan Único"}
          </button>

          {/* Iniciar / Detener continuo */}
          {!isRunning ? (
            <button
              id="scan-start-continuous-btn"
              onClick={handleStartContinuous}
              disabled={loadingSingle || !network || !community}
              style={btnStyle(loadingSingle, "#16a34a")}
            >
              ▶ Iniciar Continuo
            </button>
          ) : (
            <button
              id="scan-stop-btn"
              onClick={handleStop}
              style={btnStyle(false, "#dc2626")}
            >
              ⏹ Detener
            </button>
          )}
        </div>
      </div>

      {/* Indicador de estado del scanner continuo */}
      {isRunning && (
        <div style={{
          marginTop:    "0.9rem",
          padding:      "0.6rem 0.9rem",
          background:   "rgba(22,163,74,0.1)",
          border:       "1px solid rgba(22,163,74,0.3)",
          borderRadius: "8px",
          display:      "flex",
          alignItems:   "center",
          gap:          "0.75rem",
          flexWrap:     "wrap",
        }}>
          {/* Punto parpadeante */}
          <span style={{ display: "inline-block", width: "10px", height: "10px",
            borderRadius: "50%", background: "#4ade80", animation: "pulse 1.5s infinite" }} />
          <span style={{ color: "#4ade80", fontSize: "0.85rem", fontWeight: 600 }}>
            Scanner activo — {status?.network} — cada {status?.interval}s
          </span>
          {status?.last_scan && (
            <span style={{ color: "#86efac", fontSize: "0.8rem" }}>
              Último scan: {formatLastScan(status.last_scan)}
              {status.devices_found !== null && ` · ${status.devices_found} dispositivo(s)`}
            </span>
          )}
        </div>
      )}

      {/* Feedback scan único */}
      {loadingSingle && (
        <p style={{ marginTop: "0.6rem", color: "#94a3b8", fontSize: "0.82rem" }}>
          Escaneando {network}… puede tardar varios minutos en redes grandes.
        </p>
      )}
      {singleResult && !loadingSingle && (
        <p style={{ marginTop: "0.6rem", color: "#4ade80", fontSize: "0.85rem" }}>
          ✅ {singleResult.message} — {singleResult.devices_count} dispositivo(s) encontrado(s)
        </p>
      )}
      {singleError && (
        <p style={{ marginTop: "0.6rem", color: "#f87171", fontSize: "0.85rem" }}>
          ❌ {singleError}
        </p>
      )}

      {/* CSS para la animación del punto */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// ── Estilos reutilizables ─────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.35rem",
};

const inputStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%", boxSizing: "border-box",
  background:   disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
  border:       "1px solid rgba(99,102,241,0.3)",
  borderRadius: "8px",
  padding:      "0.5rem 0.75rem",
  color:        "#e2e8f0",
  fontSize:     "0.9rem",
  cursor:       disabled ? "not-allowed" : "text",
  opacity:      disabled ? 0.6 : 1,
});

const btnStyle = (disabled: boolean, color: string): React.CSSProperties => ({
  background:   disabled ? "rgba(100,100,100,0.3)" : `${color}cc`,
  color:        "white",
  border:       "none",
  borderRadius: "8px",
  padding:      "0.55rem 1.1rem",
  cursor:       disabled ? "not-allowed" : "pointer",
  fontWeight:   600,
  fontSize:     "0.88rem",
  whiteSpace:   "nowrap",
  transition:   "background 0.2s",
  opacity:      disabled ? 0.6 : 1,
});
