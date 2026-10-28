import React from "react";
import { formatMoney } from "../services/balanceCalculator";
import { IconCheck, IconX } from "./Icons";

export const DuplicateWarningModal = ({ 
  isOpen, 
  onClose, 
  onConfirmAsDifferent, 
  duplicateMovement, 
  membersMap 
}) => {
  if (!isOpen || !duplicateMovement) return null;

  const payer = membersMap[duplicateMovement.paidBy]?.name || "Alguien";
  const note = duplicateMovement.note || "un movimiento";
  const formatted = formatMoney(duplicateMovement.amount, duplicateMovement.currency);

  // Formato de día (ej. "el martes", "ayer", "hoy")
  const getFriendlyDay = (dateStr) => {
    if (!dateStr) return "recientemente";
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (dateStr === today) return "hoy";
    if (dateStr === yesterday) return "ayer";
    const dateObj = new Date(dateStr + "T12:00:00");
    const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    return `el ${days[dateObj.getDay()]}`;
  };

  const friendlyDay = getFriendlyDay(duplicateMovement.date);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-sheet" 
        onClick={e => e.stopPropagation()}
        style={{ padding: "1.75rem", maxWidth: "520px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "2.75rem", marginBottom: "0.5rem" }}>
            🔍
          </div>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>
            ¿Es el mismo que anotó {payer} {friendlyDay}?
          </h3>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", marginTop: "0.5rem" }}>
            ({formatted}, {note.toLowerCase()})
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Detectamos un movimiento muy parecido con las mismas personas y fecha similar.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-tonal"
            style={{ width: "100%", justifyContent: "center", minHeight: "52px", fontSize: "1.05rem" }}
          >
            <span>✓ Sí, es el mismo (no guardar)</span>
          </button>

          <button
            type="button"
            onClick={onConfirmAsDifferent}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", minHeight: "52px", fontSize: "1.05rem" }}
          >
            <span>No, es otro (guardar de todos modos)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
