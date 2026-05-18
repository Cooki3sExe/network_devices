// styles/shared.ts — Styles and tokens shared across all pages

import React from "react";

export const shared: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    padding: "2rem",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
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
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(99,102,241,0.2)",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
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
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "12px",
    padding: "1.5rem",
    color: "#fca5a5",
    textAlign: "center" as const,
  },
  nullCell: {
    color: "#334155",
    fontStyle: "italic" as const,
    fontSize: "0.8rem",
  },
  sectionTitle: {
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#6366f1",
    marginBottom: "1rem",
  },
};

/** Inject once per page inside a <style> tag */
export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  :root {
    --bg-gradient: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
    --card-bg: rgba(255,255,255,0.03);
    --card-border: rgba(255,255,255,0.08);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --accent: #6366f1;
    --accent-light: #a5b4fc;
    --success: #4ade80;
    --danger: #f87171;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg-gradient);
    color: var(--text-primary);
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    min-height: 100vh;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  
  ::-webkit-scrollbar { height: 6px; width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }

  /* Responsive Utilities */
  @media (max-width: 768px) {
    .responsive-page { padding: 1rem !important; }
    .responsive-header { flex-direction: column; align-items: flex-start !important; gap: 1rem; }
    .responsive-stats { grid-template-columns: 1fr 1fr !important; }
    .responsive-card { padding: 1rem !important; }
    .responsive-table-wrapper { overflow-x: auto; }
  }
`;
