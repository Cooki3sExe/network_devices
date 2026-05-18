"use client";
// components/ui/Toast.tsx — Notificaciones temporales tipo snackbar

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface Props {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: Props) {
  // Se cierra solo después de 4 segundos
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const style = {
    success: { bg: "rgba(22,163,74,0.15)",   border: "rgba(22,163,74,0.4)",   color: "#4ade80", icon: "✅" },
    error:   { bg: "rgba(220,38,38,0.15)",   border: "rgba(220,38,38,0.4)",   color: "#f87171", icon: "❌" },
    info:    { bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.4)", color: "#a5b4fc", icon: "ℹ️" },
  }[type];

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div style={{
        position:       "fixed",
        bottom:         "1.5rem",
        right:          "1.5rem",
        background:     style.bg,
        border:         `1px solid ${style.border}`,
        borderRadius:   "10px",
        padding:        "0.85rem 1.25rem",
        color:          style.color,
        fontSize:       "0.9rem",
        fontWeight:     500,
        backdropFilter: "blur(8px)",
        zIndex:         9999,
        display:        "flex",
        alignItems:     "center",
        gap:            "0.6rem",
        boxShadow:      "0 8px 32px rgba(0,0,0,0.4)",
        maxWidth:       "380px",
        animation:      "slideIn 0.3s ease",
      }}>
        {style.icon} {message}
        <button
          onClick={onClose}
          style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}
        >×</button>
      </div>
    </>
  );
}
