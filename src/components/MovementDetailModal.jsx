import React, { useState } from "react";
import { IconX, IconCheck, CATEGORY_ICONS, IconHistory, IconCamera, IconImage } from "./Icons";
import { StatusBadge } from "./StatusBadge";
import { formatMoney } from "../services/balanceCalculator";

export const MovementDetailModal = ({ 
  movement, 
  isOpen, 
  onClose, 
  onRemove, 
  onOpenCorrection,
  onAcceptCorrection,
  currentUser, 
  membersMap 
}) => {
  if (!isOpen || !movement) return null;

  const [isQuitarMode, setIsQuitarMode] = useState(false);
  const [quitarReason, setQuitarReason] = useState("Lo anoté dos veces");
  const [customReason, setCustomReason] = useState("");
  const [isReceiptZoomed, setIsReceiptZoomed] = useState(false);

  const CategoryIcon = CATEGORY_ICONS[movement.category] || CATEGORY_ICONS.otro;
  const payer = membersMap[movement.paidBy] || { name: "Alguien", avatar: "👤" };

  // Opciones de motivo según el requerimiento:
  // "opciones rápidas: 'Lo anoté dos veces', 'Me equivoqué', 'Ya no aplica', 'Otro'"
  const REASONS = [
    "Lo anoté dos veces",
    "Me equivoqué",
    "Ya no aplica",
    "Otro"
  ];

  const handleConfirmQuitar = () => {
    const finalReason = quitarReason === "Otro" ? (customReason.trim() || "Otro motivo") : quitarReason;
    onRemove(movement.id, finalReason);
    onClose();
  };

  const formatFriendlyTimestamp = (isoStr) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      return `${day} ${month}, ${hours}:${mins}`;
    } catch {
      return isoStr;
    }
  };

  const getActionBadge = (action) => {
    switch(action) {
      case "creado":
        return { label: "Anotado", bg: "#DCFCE7", text: "#166534" };
      case "editado":
        return { label: "Editado", bg: "#DBEAFE", text: "#1E40AF" };
      case "propuesta_correccion":
        return { label: "Propuesta de corrección", bg: "#FEF3C7", text: "#92400E" };
      case "correccion_aceptada":
        return { label: "Corrección aceptada", bg: "#D1FAE5", text: "#065F46" };
      case "quitado":
        return { label: "Quitado", bg: "#FEE2E2", text: "#991B1B" };
      default:
        return { label: action, bg: "#F1F5F9", text: "#475569" };
    }
  };
  return (
    <>
      <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <div 
          className="modal-sheet" 
          onClick={e => e.stopPropagation()}
          style={{ padding: "1.5rem", maxWidth: "600px" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                width: "42px",
                height: "42px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-surface-variant)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)"
              }}>
                <CategoryIcon size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                  {movement.note || "Detalle del movimiento"}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Fecha: {movement.date}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn btn-tonal" style={{ minHeight: "40px", padding: "0.4rem", borderRadius: "50%" }} aria-label="Cerrar">
              <IconX size={20} />
            </button>
          </div>

          {/* Si ya está quitado */}
          {movement.status === "quitado" && (
            <div style={{
              backgroundColor: "var(--badge-quitado-bg)",
              color: "var(--badge-quitado-text)",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              fontSize: "0.9rem"
            }}>
              <strong>✕ Este movimiento fue quitado</strong>
              <p style={{ marginTop: "0.2rem" }}>
                Por {membersMap[movement.removedBy]?.name || "alguien"} • Motivo: "{movement.removeReason || "Ya no aplica"}"
              </p>
            </div>
          )}

          {/* Si está en revisión por corrección propuesta */}
          {movement.status === "en_revision" && movement.pendingCorrection && (
            <div style={{
              backgroundColor: "var(--badge-en-revision-bg)",
              color: "var(--badge-en-revision-text)",
              border: "1.5px solid #F59E0B",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              fontSize: "0.9rem"
            }}>
              <strong>⚠️ Propuesta de corrección en revisión</strong>
              <p style={{ marginTop: "0.25rem" }}>
                {membersMap[movement.pendingCorrection.proposedBy]?.name || "Alguien"} propuso cambiar el monto a <strong>{formatMoney(movement.pendingCorrection.amount, movement.currency)}</strong>.
              </p>
              {movement.pendingCorrection.comment && (
                <p style={{ marginTop: "0.2rem", fontStyle: "italic" }}>
                  "{movement.pendingCorrection.comment}"
                </p>
              )}
              {onAcceptCorrection && (
                <button
                  type="button"
                  onClick={() => {
                    onAcceptCorrection(movement.id);
                    onClose();
                  }}
                  className="btn btn-primary"
                  style={{ marginTop: "0.75rem", width: "100%", justifyContent: "center", minHeight: "42px", fontSize: "0.95rem" }}
                >
                  <IconCheck size={18} />
                  <span>Aceptar propuesta de corrección</span>
                </button>
              )}
            </div>
          )}

          {/* Flujo para Quitar */}
          {isQuitarMode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{
                backgroundColor: "var(--balance-pendiente-bg)",
                color: "var(--balance-pendiente-text)",
                border: "1.5px solid var(--balance-pendiente-border)",
                padding: "1rem",
                borderRadius: "var(--radius-md)"
              }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 800 }}>
                  ¿Deseas quitar este movimiento?
                </h4>
                <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  El movimiento dejará de contar en los saldos, pero quedará visible tachado en el historial de ambos con quién lo quitó y el motivo.
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.4rem" }}>
                  Elige el motivo:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {REASONS.map(reason => (
                    <label
                      key={reason}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: quitarReason === reason ? "var(--bg-surface-variant)" : "transparent",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: 700
                      }}
                    >
                      <input
                        type="radio"
                        name="quitar_reason"
                        checked={quitarReason === reason}
                        onChange={() => setQuitarReason(reason)}
                        style={{ accentColor: "var(--primary)" }}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                {quitarReason === "Otro" && (
                  <input
                    type="text"
                    placeholder="Escribe el motivo..."
                    value={customReason}
                    onChange={e => setCustomReason(e.target.value)}
                    className="input"
                    style={{ marginTop: "0.5rem" }}
                    autoFocus
                  />
                )}
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsQuitarMode(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmQuitar}
                  className="btn btn-tonal"
                  style={{ flex: 1.5, backgroundColor: "#E2E8F0", color: "#334155" }}
                >
                  Confirmar y quitar
                </button>
              </div>
            </div>
          ) : (
            /* Vista normal de detalles */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Monto y Estado */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                backgroundColor: "var(--bg-surface-variant)",
                borderRadius: "var(--radius-lg)"
              }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Monto total:</span>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {formatMoney(movement.amount, movement.currency)}
                  </div>
                </div>
                <StatusBadge status={movement.status} />
              </div>

              {/* Quién pagó */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="avatar" style={{ backgroundColor: payer.color }}>
                  {payer.avatar}
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Pagado por:</span>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                    {movement.paidBy === currentUser.id ? "Tú (" + payer.name + ")" : payer.name}
                  </h4>
                </div>
              </div>

              
              {/* FASE 3: DETALLES DE PRÉSTAMOS, FECHA ACORDADA Y TIPO DE CAMBIO */}
              {(movement.agreedDate || movement.isCrossCurrency || movement.linkedLoanId) && (
                <div style={{
                  backgroundColor: "var(--bg-surface-variant)",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  fontSize: "0.85rem"
                }}>
                  {movement.agreedDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 800 }}>📅 Fecha acordada de devolución:</span>
                      <span>{movement.agreedDate}</span>
                    </div>
                  )}

                  {movement.isCrossCurrency && (
                    <div>
                      <span style={{ fontWeight: 800 }}>💱 Conversión acordada:</span>
                      <p style={{ marginTop: "0.2rem", color: "var(--primary)", fontWeight: 700 }}>
                        Pagado en Quetzales a tipo de cambio Q{movement.exchangeRate} por US$1.00 (descuenta US{formatMoney(movement.targetAmount, "USD")} del saldo en dólares).
                      </p>
                    </div>
                  )}

                  {movement.linkedLoanId && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 800 }}>🤝 Abono vinculado a préstamo específico</span>
                    </div>
                  )}
                </div>
              )}

              {/* Desglose de la división */}
              <div>
                <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  División entre beneficiarios:
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {(movement.splits || []).map(split => {
                    const member = membersMap[split.userId] || { name: "Alguien", avatar: "👤" };
                    const isMe = split.userId === currentUser.id;
                    return (
                      <div
                        key={split.userId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.6rem 0.85rem",
                          backgroundColor: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-md)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "1.2rem" }}>{member.avatar}</span>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                            {isMe ? "Tú (" + member.name + ")" : member.name}
                          </span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: "1rem" }}>
                          {formatMoney(split.amount, movement.currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FASE 2: COMPROBANTE FOTOGRÁFICO */}
              {movement.receiptImage && (
                <div style={{
                  backgroundColor: "var(--bg-surface-variant)",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-md)"
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                    <IconCamera size={18} />
                    <span>Comprobante o factura adjunta:</span>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <img
                      src={movement.receiptImage}
                      alt="Comprobante"
                      onClick={() => setIsReceiptZoomed(true)}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        border: "2px solid var(--border-color)",
                        boxShadow: "var(--shadow-sm)"
                      }}
                      title="Haz clic para ampliar"
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                        Evidencia guardada
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsReceiptZoomed(true)}
                        className="btn btn-tonal"
                        style={{ marginTop: "0.3rem", padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                      >
                        <IconImage size={16} />
                        <span>Ver foto completa</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FASE 2: HISTORIAL DE CAMBIOS Y AUDITORÍA */}
              {Array.isArray(movement.history) && movement.history.length > 0 && (
                <div style={{
                  borderTop: "1.5px solid var(--border-subtle)",
                  paddingTop: "1rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem" }}>
                    <IconHistory size={18} />
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                      Historial de cambios ({movement.history.length}):
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {movement.history.map((entry, idx) => {
                      const badge = getActionBadge(entry.action);
                      const user = membersMap[entry.userId] || { name: "Alguien" };
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: "0.6rem 0.75rem",
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                            fontSize: "0.85rem"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                            <span style={{
                              backgroundColor: badge.bg,
                              color: badge.text,
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              padding: "0.15rem 0.5rem",
                              borderRadius: "999px"
                            }}>
                              {badge.label}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {formatFriendlyTimestamp(entry.timestamp)}
                            </span>
                          </div>
                          <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            {entry.details || `Acción realizada por ${user.name}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              {movement.status !== "quitado" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "1rem" }}>
                  {onOpenCorrection && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCorrection(movement);
                      }}
                      className="btn btn-outline"
                      style={{ width: "100%", justifyContent: "center", minHeight: "44px", fontSize: "0.95rem" }}
                    >
                      <span>Proponer corrección (algo no coincide)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsQuitarMode(true)}
                    className="btn btn-tonal"
                    style={{ width: "100%", justifyContent: "center", minHeight: "44px", color: "var(--text-muted)" }}
                  >
                    <span>Quitar este movimiento</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para ampliar foto de comprobante */}
      {isReceiptZoomed && movement.receiptImage && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsReceiptZoomed(false)}
          style={{ zIndex: 1100, backgroundColor: "rgba(0,0,0,0.85)" }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: "90vw", 
              maxHeight: "90vh", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center" 
            }}
          >
            <img
              src={movement.receiptImage}
              alt="Comprobante en detalle"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "var(--radius-md)"
              }}
            />
            <button
              onClick={() => setIsReceiptZoomed(false)}
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
            >
              Cerrar vista previa
            </button>
          </div>
        </div>
      )}
    </>
  );
};
