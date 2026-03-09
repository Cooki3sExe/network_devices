"use client";
// components/ui/ErrorBox.tsx

import { shared } from "@/styles/shared";

interface Props {
  title: string;
  detail?: string;
  hint?: string;
}

export default function ErrorBox({ title, detail, hint }: Props) {
  return (
    <div style={shared.errorBox}>
      <strong>⚠ {title}</strong>
      {detail && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#f87171" }}>{detail}</p>
      )}
      {hint && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>{hint}</p>
      )}
    </div>
  );
}
