import React, { useState } from "react";
import { IconX, IconCheck } from "./Icons";
import { formatMoney } from "../services/balanceCalculator";

export const CorrectionModal = ({ movement, isOpen, onClose, onPropose, membersMap, currentUser }) => {
  if (!isOpen || !movement) return null;

  const [proposedAmount, setProposedAmount] = useState(movement.amount || "");
  const [proposedDate, setProposedDate] = useState(movement.date || "");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const payer = membersMap[movement.paidBy] || { name: "Alguien" };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!comment.trim()) {
      setError("Por favor escribe un comentario breve explicando qué no coincide.");
      return;
    }

    const numAmount = parseFloat(proposedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Ingresa un monto válido mayor a cero.");
      return;
    }

    // Calcular la nueva división proporcional si cambió el monto
    let newSplits = movement.splits;
    if (numAmount !== movement.amount && Array.isArray(movement.splits) && movement.splits.length > 0) {
      const ratio = numAmount / movement.amount;
      newSplits = movement.splits.map(s => ({
        ...s,
        amount: Math.round(s.amount * ratio * 100) / 100
      }));
    }

    onPropose(movement.id, {
      amount: numAmount,
      date: proposedDate,
      splits: newSplits,
      comment: comment.trim()
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-sheet" 
        onClick={e => e.stopPropagation()}
        style={{ padding: "1.75rem", maxWidth: "540px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              Proponer corrección
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {movement.note} · Anotado por {payer.name}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-tonal" style={{ minHeight: "40px", padding: "0.4rem", borderRadius: "50%" }}>
            <IconX size={20} />
          </button>
        </div>

        <div style={{
          backgroundColor: "var(--badge-en-revision-bg)",
          color: "var(--badge-en-revision-text)",
          padding: "0.85rem 1rem",
          borderRadius: "var(--radius-md)",
          fontSize: "0.9rem",
          fontWeight: 600,
          marginBottom: "1.25rem"
        }}>
          💬 Al proponer un cambio, el movimiento pasa a <strong>"en revisión"</strong> y deja de contar en el saldo hasta que ambos estén de acuerdo.
        </div>

        {error && (
          <div style={{
            backgroundColor: "var(--balance-pendiente-bg)",
            color: "var(--balance-pendiente-text)",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "1rem"
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Comentario explicativo */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.35rem" }}>
              ¿Qué es lo que no está bien? (comentario):
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Ej. Yo solo consumí una parte, o el precio final con descuento fue Q50..."
              className="textarea"
              style={{ minHeight: "80px", resize: "vertical" }}
              required
              autoFocus
            />
          </div>

          {/* Proponer nuevo monto */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.35rem" }}>
              Monto propuesto ({movement.currency === "USD" ? "US$" : "Q"}):
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={proposedAmount}
              onChange={e => setProposedAmount(e.target.value)}
              className="input"
              style={{ fontWeight: 800, fontSize: "1.2rem" }}
            />
          </div>

          {/* Proponer nueva fecha */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.35rem" }}>
              Fecha correcta:
            </label>
            <input
              type="date"
              value={proposedDate}
              onChange={e => setProposedDate(e.target.value)}
              className="input"
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              <IconCheck size={20} />
              <span>Enviar propuesta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
