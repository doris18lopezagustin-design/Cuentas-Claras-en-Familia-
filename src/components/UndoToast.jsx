import React, { useEffect, useState } from "react";
import { IconUndo, IconCheck } from "./Icons";

export const UndoToast = ({ movement, onUndo, onDismiss }) => {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (!movement) return;
    setSecondsLeft(10);

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [movement, onDismiss]);

  if (!movement) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "84px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "var(--text-primary)",
        color: "var(--bg-app)",
        borderRadius: "var(--radius-xl)",
        padding: "0.85rem 1.4rem",
        boxShadow: "var(--shadow-sheet)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        zIndex: 200,
        maxWidth: "92vw",
        width: "480px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
        <IconCheck size={20} style={{ color: "#34D399" }} />
        <span style={{ fontSize: "0.95rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          Anotado ({secondsLeft}s)
        </span>
      </div>

      <button
        onClick={() => onUndo(movement.id)}
        className="btn"
        style={{
          minHeight: "40px",
          padding: "0.35rem 0.9rem",
          backgroundColor: "#F59E0B",
          color: "#0F172A",
          fontSize: "0.9rem",
          fontWeight: 800,
          borderRadius: "var(--radius-md)"
        }}
      >
        <IconUndo size={18} />
        <span>Deshacer</span>
      </button>
    </div>
  );
};
