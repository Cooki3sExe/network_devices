"use client";
// components/ui/LoadingSpinner.tsx

import { shared } from "@/styles/shared";

interface Props {
  message?: string;
}

export default function LoadingSpinner({ message = "Cargando…" }: Props) {
  return (
    <div style={shared.loadingState}>
      <div style={shared.spinner} />
      <span>{message}</span>
    </div>
  );
}
