"use client";
// components/inventory/DeviceTable.tsx — Clickable table of all discovered network devices

import { inventoryStyles as S } from "@/styles/inventory";
import { shared } from "@/styles/shared";
import { NetworkDevice } from "@/types";
import { formatBytes } from "@/lib/utils";

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
              <th style={S.th}>Último visto</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, idx) => (
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
                <td style={S.tdHostname}>{device.hostname}</td>
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
                    ? <span style={S.lastSeenBadge}>{device.last_seen}</span>
                    : <span style={shared.nullCell}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
