import React from "react";
import { CATEGORY_ICONS } from "./Icons";
import { StatusBadge } from "./StatusBadge";
import { formatMoney } from "../services/balanceCalculator";

export const MovementCard = ({ movement, currentUserId, otherUserId, membersMap, onClick }) => {
  const { category, note, amount, currency, date, paidBy, splits, status, type } = movement;

  // Ícono de categoría
  const CategoryIconComponent = CATEGORY_ICONS[category] || CATEGORY_ICONS.otro;
  const payer = membersMap[paidBy] || { name: "Alguien" };
  const isPayerMe = paidBy === currentUserId;

  // Calcular la parte que corresponde par a par
  let pairwiseInfo = "";
  if (type === "abono") {
    pairwiseInfo = `Abono directo de ${formatMoney(amount, currency)}`;
  } else if (otherUserId) {
    if (paidBy === currentUserId) {
      const otherSplit = (splits || []).find(s => s.userId === otherUserId);
      if (otherSplit) {
        pairwiseInfo = `Pendiente con ${membersMap[otherUserId]?.name || "él/ella"}: ${formatMoney(otherSplit.amount, currency)}`;
      }
    } else if (paidBy === otherUserId) {
      const mySplit = (splits || []).find(s => s.userId === currentUserId);
      if (mySplit) {
        pairwiseInfo = `Tu parte pendiente: ${formatMoney(mySplit.amount, currency)}`;
      }
    }
  }

  // Formato amigable de fecha
  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return "";
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (dateStr === today) return "Hoy";
    if (dateStr === yesterday) return "Ayer";
    const [y, m, d] = dateStr.split("-");
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
  };

  return (
    <div
      onClick={onClick}
      className={`card card-interactive ${status === "quitado" ? "badge-quitado" : ""}`}
      style={{
        padding: "1rem 1.15rem",
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        opacity: status === "quitado" ? 0.6 : 1,
        marginBottom: "0.65rem"
      }}
    >
      {/* Ícono de Categoría con fondo suave */}
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--bg-surface-variant)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary)",
          flexShrink: 0
        }}
      >
        <CategoryIconComponent size={24} />
      </div>

      {/* Información del movimiento */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
          <h4
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              textDecoration: status === "quitado" ? "line-through" : "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {note || (type === "abono" ? "Abono" : "Gasto")}
          </h4>
          <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)", flexShrink: 0 }}>
            {formatMoney(amount, currency)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginTop: "0.25rem" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isPayerMe ? "Pagaste tú" : `Pagó ${payer.name}`} · {formatFriendlyDate(date)}
            {pairwiseInfo ? ` · ${pairwiseInfo}` : ""}
          </p>
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
};
