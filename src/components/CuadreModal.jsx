import React, { useState, useMemo } from "react";
import { IconX, IconCheck, IconScale, CATEGORY_ICONS } from "./Icons";
import { formatMoney, calculatePairwiseBalance, round2 } from "../services/balanceCalculator";
import { dataService } from "../services/dataService";
import { generateCuadrePDF } from "../services/pdfService";

export const CuadreModal = ({ 
  isOpen, 
  onClose, 
  userA, 
  userB, 
  movements, 
  membersMap, 
  onCuadreCreated, 
  onCuadreAccepted,
  existingCuadre = null 
}) => {
  if (!isOpen || !userA || !userB) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split("T")[0];
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split("T")[0];

  const lastClosed = useMemo(() => {
    return dataService.getLastClosedCuadre(userA.id, userB.id);
  }, [userA.id, userB.id]);

  const [rangePreset, setRangePreset] = useState("ultimo_mes");
  const [startDate, setStartDate] = useState(() => {
    if (existingCuadre) return existingCuadre.startDate;
    if (lastClosed) return lastClosed.endDate;
    return lastMonthStart;
  });
  const [endDate, setEndDate] = useState(() => {
    if (existingCuadre) return existingCuadre.endDate;
    return todayStr;
  });

  const [error, setError] = useState("");

  // Atajos de rango
  const handlePresetSelect = (preset) => {
    setRangePreset(preset);
    setError("");
    const now = new Date();
    if (preset === "ultimo_mes") {
      setStartDate(lastMonthStart);
      setEndDate(lastMonthEnd);
    } else if (preset === "ultimos_2_meses") {
      const d2 = new Date(Date.now() - 86400000 * 60);
      setStartDate(d2.toISOString().split("T")[0]);
      setEndDate(todayStr);
    } else if (preset === "ultimos_6_meses") {
      const d6 = new Date(Date.now() - 86400000 * 180);
      setStartDate(d6.toISOString().split("T")[0]);
      setEndDate(todayStr);
    } else if (preset === "desde_ultimo_cuadre") {
      if (lastClosed) {
        setStartDate(lastClosed.endDate);
      } else {
        setStartDate("2026-01-01");
      }
      setEndDate(todayStr);
    }
  };

  // Movimientos entre ambas personas en este rango de fechas
  const periodMovements = useMemo(() => {
    return (movements || []).filter(m => {
      if (m.status === "quitado") return false;
      if (m.date < startDate || m.date > endDate) return false;

      const isAtoB = m.paidBy === userA.id && (m.splits || []).some(s => s.userId === userB.id);
      const isBtoA = m.paidBy === userB.id && (m.splits || []).some(s => s.userId === userA.id);
      const isAbono = m.type === "abono" && (
        (m.paidBy === userA.id && m.recipientId === userB.id) ||
        (m.paidBy === userB.id && m.recipientId === userA.id)
      );

      return isAtoB || isBtoA || isAbono;
    });
  }, [movements, startDate, endDate, userA.id, userB.id]);

  // RF-11.3: Movimientos en revisión
  const revisionMovements = useMemo(() => {
    return periodMovements.filter(m => m.status === "en_revision");
  }, [periodMovements]);

  // Saldo inicial (si hubo cuadre previo cerrado)
  const initialBalGTQ = existingCuadre ? (existingCuadre.initialBalanceGTQ || 0) : (lastClosed ? lastClosed.finalBalanceGTQ : 0);
  const initialBalUSD = existingCuadre ? (existingCuadre.initialBalanceUSD || 0) : (lastClosed ? lastClosed.finalBalanceUSD : 0);

  // Saldos finales calculados
  const finalBalGTQ = useMemo(() => {
    if (existingCuadre) return existingCuadre.finalBalanceGTQ;
    return calculatePairwiseBalance(userA.id, userB.id, periodMovements, "GTQ", initialBalGTQ);
  }, [existingCuadre, userA.id, userB.id, periodMovements, initialBalGTQ]);

  const finalBalUSD = useMemo(() => {
    if (existingCuadre) return existingCuadre.finalBalanceUSD;
    return calculatePairwiseBalance(userA.id, userB.id, periodMovements, "USD", initialBalUSD);
  }, [existingCuadre, userA.id, userB.id, periodMovements, initialBalUSD]);

  // Subtotales por categoría
  const categorySubtotals = useMemo(() => {
    const map = {};
    for (const m of periodMovements) {
      const cat = m.category || "otro";
      map[cat] = (map[cat] || 0) + (Number(m.amount) || 0);
    }
    return map;
  }, [periodMovements]);
  const handlePropose = (e) => {
    e.preventDefault();
    setError("");

    if (startDate > endDate) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    // RF-11.3: Bloqueo si hay movimientos en revisión
    if (revisionMovements.length > 0) {
      setError("No se puede cerrar un cuadre con movimientos en revisión. Primero revisen o resuelvan las correcciones pendientes.");
      return;
    }

    try {
      const newCuadre = onCuadreCreated({
        userA: userA.id,
        userB: userB.id,
        startDate,
        endDate,
        initialBalanceGTQ: initialBalGTQ,
        initialBalanceUSD: initialBalUSD,
        finalBalanceGTQ: finalBalGTQ,
        finalBalanceUSD: finalBalUSD,
        movementIds: periodMovements.map(m => m.id),
        subtotalsByCategory: categorySubtotals,
        proposedBy: userA.id,
        note: `Cuadre del ${startDate} al ${endDate}`
      });
      onClose();
    } catch (err) {
      setError(err.message || "Error al proponer cuadre.");
    }
  };

  const handleDownloadPDF = () => {
    const dataToExport = existingCuadre || {
      startDate,
      endDate,
      initialBalanceGTQ: initialBalGTQ,
      initialBalanceUSD: initialBalUSD,
      finalBalanceGTQ: finalBalGTQ,
      finalBalanceUSD: finalBalUSD,
      movementIds: periodMovements.map(m => m.id),
      status: "borrador"
    };
    generateCuadrePDF(dataToExport, userA, userB, movements, membersMap);
  };

  const isClosed = existingCuadre?.status === "cerrado";
  const canAccept = existingCuadre && !isClosed && !existingCuadre.acceptedBy?.includes(userA.id);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-sheet" 
        onClick={e => e.stopPropagation()}
        style={{ padding: "1.75rem", maxWidth: "640px" }}
      >
        {/* Encabezado */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
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
              <IconScale size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
                {existingCuadre ? "Detalle del Cuadre" : "Hacer Cuadre de Cuentas"}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Entre {userA.name} y {userB.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-tonal" style={{ minHeight: "40px", padding: "0.4rem", borderRadius: "50%" }}>
            <IconX size={20} />
          </button>
        </div>

        {/* Estado actual si ya existe */}
        {existingCuadre && (
          <div style={{
            backgroundColor: isClosed ? "var(--balance-favor-bg)" : "var(--badge-en-revision-bg)",
            color: isClosed ? "var(--balance-favor-text)" : "var(--badge-en-revision-text)",
            border: `1.5px solid ${isClosed ? "var(--balance-favor-border)" : "#F59E0B"}`,
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}>
            <strong>{isClosed ? "✓ Cuadre Cerrado de Mutuo Acuerdo" : "⏳ Esperando confirmación de ambas partes"}</strong>
            <p style={{ marginTop: "0.25rem", fontSize: "0.85rem" }}>
              {isClosed 
                ? `Cerrado el ${new Date(existingCuadre.closedAt).toLocaleDateString("es-GT")}. Los movimientos de este periodo son inmutables.` 
                : `Aceptado por ${existingCuadre.acceptedBy?.map(id => membersMap[id]?.name).join(", ")}. Falta que la otra parte confirme.`}
            </p>
          </div>
        )}

        {/* Alerta de Error o Regla RF-11.3 */}
        {error && (
          <div style={{
            backgroundColor: "var(--balance-pendiente-bg)",
            color: "var(--balance-pendiente-text)",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "1rem"
          }}>
            ⚠️ {error}
          </div>
        )}

        {revisionMovements.length > 0 && !existingCuadre && (
          <div style={{
            backgroundColor: "var(--badge-en-revision-bg)",
            color: "var(--badge-en-revision-text)",
            border: "1.5px solid #F59E0B",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "1rem"
          }}>
            ⚠️ Hay {revisionMovements.length} movimiento(s) en revisión en este periodo. No se puede cerrar el cuadre hasta que ambos resuelvan las correcciones.
          </div>
        )}

        {/* Rango de Fechas con Atajos */}
        {!existingCuadre && (
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.4rem" }}>
              Rango del periodo a cuadrar:
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
              {[
                { id: "ultimo_mes", label: "Último mes" },
                { id: "ultimos_2_meses", label: "Últimos 2 meses" },
                { id: "ultimos_6_meses", label: "Últimos 6 meses" },
                { id: "desde_ultimo_cuadre", label: "Desde último cuadre" },
                { id: "personalizado", label: "Personalizado" }
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`btn ${rangePreset === preset.id ? "btn-primary" : "btn-tonal"}`}
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", minHeight: "36px" }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Desde:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    setRangePreset("personalizado");
                  }}
                  className="input"
                  style={{ marginTop: "0.2rem" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>Hasta:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => {
                    setEndDate(e.target.value);
                    setRangePreset("personalizado");
                  }}
                  className="input"
                  style={{ marginTop: "0.2rem" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Saldo Inicial y Final */}
        <div style={{
          backgroundColor: "var(--bg-surface-variant)",
          padding: "1rem",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "1rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700 }}>
            <span>Saldo inicial del periodo:</span>
            <span>{formatMoney(initialBalGTQ, "GTQ")}  |  {formatMoney(initialBalUSD, "USD")}</span>
          </div>

          <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "0.6rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 800 }}>Saldo final resultante:</span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>
                {formatMoney(finalBalGTQ, "GTQ")}
              </div>
              {finalBalUSD !== 0 && (
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                  {formatMoney(finalBalUSD, "USD")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Movimientos del Periodo */}
        <div style={{ marginBottom: "1.25rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Movimientos comprendidos ({periodMovements.length}):
          </span>

          {periodMovements.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "1rem" }}>
              No hay movimientos registrados entre ambos en este rango de fechas.
            </p>
          ) : (
            <div style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.35rem", paddingRight: "0.25rem" }}>
              {periodMovements.map(m => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem"
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700 }}>{m.note || m.type}</span>
                    <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem", fontSize: "0.75rem" }}>
                      ({m.date})
                    </span>
                  </div>
                  <span style={{ fontWeight: 800 }}>
                    {formatMoney(m.amount, m.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="btn btn-tonal"
            style={{ flex: 1, minHeight: "48px" }}
          >
            <span>📥 Descargar PDF</span>
          </button>

          {!existingCuadre ? (
            <button
              type="button"
              onClick={handlePropose}
              disabled={revisionMovements.length > 0 || periodMovements.length === 0}
              className="btn btn-primary"
              style={{ flex: 1.5, minHeight: "48px" }}
            >
              <IconCheck size={20} />
              <span>Proponer cuadre</span>
            </button>
          ) : canAccept ? (
            <button
              type="button"
              onClick={() => {
                onCuadreAccepted(existingCuadre.id);
                onClose();
              }}
              className="btn btn-primary"
              style={{ flex: 1.5, minHeight: "48px" }}
            >
              <IconCheck size={20} />
              <span>Estamos de acuerdo ✓</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
