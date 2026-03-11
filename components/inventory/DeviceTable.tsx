"use client";
// components/inventory/DeviceTable.tsx — Clickable table of all discovered network devices

import { inventoryStyles as S } from "@/styles/inventory";
import { shared } from "@/styles/shared";
import { NetworkDevice } from "@/types";
import { formatBytes, isRecent, formatTimeAgo } from "@/lib/utils";

interface Props {
  devices: NetworkDevice[];
  onRowClick: (serial: string) => void;
}

export default function DeviceTable({ devices, onRowClick }: Props) {
  if (devices.length === 0) {
    return (
      <div style={{
        ...shared.errorBox,
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(99,102,241,0.2)",
        color: "#a5b4fc",
      }}>
        No hay dispositivos registrados. Ejecuta un escaneo primero.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={S.tableWrapper}>
        <table style={S.table}>
          <thead style={S.thead}>
            <tr>
              <th style={S.th}>Hostname</th>
              <th style={S.th}>Serial</th>
              <th style={S.th}>Vendor</th>
              <th style={S.th}>Modelo</th>
              <th style={S.th}>MAC</th>
              <th style={S.th}>IOS / Firmware</th>
              <th style={S.th}>RAM Total</th>
              <th style={S.th}>Disco Total</th>
              <th style={S.th}>Última vez visto</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, idx) => {
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
                      <div 
                        title={formatTimeAgo(device.last_seen)}
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: online ? "#10b981" : "#ef4444",
                          flexShrink: 0
                        }} 
                      />
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
                    {device.last_seen
                      ? (
                        <span style={{
                          ...S.lastSeenBadge,
                          background: online ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.1)",
                          border: online ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(239,68,68,0.2)",
                          color: online ? "#4ade80" : "#f87171",
                        }}>
                          {formatTimeAgo(device.last_seen)}
                        </span>
                      )
                      : <span style={shared.nullCell}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
