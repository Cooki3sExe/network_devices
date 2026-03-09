"use client";
// app/devices/[serial]/page.tsx — Device detail page (thin orchestrator)

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { globalStyles, shared } from "@/styles/shared";
import { deviceStyles as S } from "@/styles/device";
import { useDeviceDetail } from "@/hooks/useDeviceDetail";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorBox from "@/components/ui/ErrorBox";
import DeviceInfoCard from "@/components/device/DeviceInfoCard";

// Recharts components must be loaded client-side only (no SSR)
const CpuChart = dynamic(() => import("@/components/device/CpuChart"), { ssr: false });
const RamChart = dynamic(() => import("@/components/device/RamChart"), { ssr: false });
const DiskChart = dynamic(() => import("@/components/device/DiskChart"), { ssr: false });
const UptimeChart = dynamic(() => import("@/components/device/UptimeChart"), { ssr: false });
const MetricsTable = dynamic(() => import("@/components/device/MetricsTable"), { ssr: false });

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serial = decodeURIComponent(params.serial as string);

  const { device, metrics, loading, error } = useDeviceDetail(serial);

  return (
    <>
      <style>{globalStyles + `tr:hover td { background: rgba(99,102,241,0.05) !important; }`}</style>
      <div style={shared.page}>

        <button style={S.backBtn} onClick={() => router.push("/")}>
          ← Volver al inventario
        </button>

        {/* State feedback */}
        {loading && <LoadingSpinner message="Cargando datos del dispositivo…" />}
        {error && !loading && <ErrorBox title="Error al cargar el dispositivo" detail={error} />}

        {/* Content — only rendered when both fetches are done */}
        {!loading && device && (
          <>
            <DeviceInfoCard device={device} />
            <CpuChart metrics={metrics} />
            <RamChart metrics={metrics} />
            <DiskChart metrics={metrics} />
            <UptimeChart metrics={metrics} />
            <MetricsTable metrics={metrics} />
          </>
        )}

      </div>
    </>
  );
}
