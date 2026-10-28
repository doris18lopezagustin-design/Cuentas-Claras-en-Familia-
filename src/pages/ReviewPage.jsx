import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../services/balanceCalculator";
import { IconCheck, IconX, IconCheckSquare } from "../components/Icons";

export const ReviewPage = ({ movements, onConfirmMovement, onConfirmAll, onCorrectMovement }) => {
  const { currentUser, membersMap } = useAuth();
  const isSimple = currentUser?.simpleMode;

  // Filtrar los movimientos que otros anotaron y donde el usuario actual participa, y están sin confirmar
  const pendingMovements = movements.filter(m => 
    m.status === "sin_confirmar" && 
    m.createdBy !== currentUser.id &&
    (m.paidBy === currentUser.id || (m.splits || []).some(s => s.userId === currentUser.id))
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  // MODO SENCILLO: Muestra un movimiento a la vez en grande
  if (isSimple) {
    if (pendingMovements.length === 0) {
      return (
        <div className="content-wrapper" style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
          <span style={{ fontSize: "3.5rem" }}>🌸</span>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "1rem" }}>
            ¡Todo está al día!
          </h2>
          <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            No tienes movimientos pendientes de revisar en este momento.
          </p>
        </div>
      );
    }

    const currentMov = pendingMovements[currentIndex] || pendingMovements[0];
    const payer = membersMap[currentMov.paidBy] || { name: "Alguien" };
    const myShare = (currentMov.splits || []).find(s => s.userId === currentUser.id)?.amount || currentMov.amount;

    // Frase natural para Mamá
    // Ejemplo: "Luis anotó que pagaste Q200 de su paquete. ¿Está bien?"
    let simplePhrase = "";
    if (currentMov.paidBy === currentUser.id) {
      simplePhrase = `${membersMap[currentMov.createdBy]?.name || "Alguien"} anotó que pagaste ${formatMoney(currentMov.amount, currentMov.currency)} de ${currentMov.note}. ¿Está bien?`;
    } else {
      simplePhrase = `${payer.name} anotó ${formatMoney(currentMov.amount, currentMov.currency)} de ${currentMov.note} (tu parte es ${formatMoney(myShare, currentMov.currency)}). ¿Está bien?`;
    }

    return (
      <div className="content-wrapper" style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div style={{
          backgroundColor: "var(--bg-surface)",
          border: "2px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
          boxShadow: "var(--shadow-md)",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Revisión {currentIndex + 1} de {pendingMovements.length}
          </span>

          <div style={{ fontSize: "3rem", margin: "1rem 0" }}>
            📝
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.4, color: "var(--text-primary)" }}>
            {simplePhrase}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
            <button
              onClick={() => onConfirmMovement(currentMov.id)}
              className="btn btn-primary btn-sencillo"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <IconCheck size={28} />
              <span>Está bien ✓</span>
            </button>

            <button
              onClick={() => onCorrectMovement(currentMov.id)}
              className="btn btn-tonal btn-sencillo"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <span>Algo no está bien</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MODO ESTÁNDAR
  return (
    <div className="content-wrapper">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800 }}>
            Movimientos por revisar ({pendingMovements.length})
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Lo que otros familiares anotaron y te involucra
          </p>
        </div>

        {pendingMovements.length > 1 && (
          <button
            onClick={() => onConfirmAll(pendingMovements.map(m => m.id))}
            className="btn btn-primary"
          >
            <IconCheckSquare size={20} />
            <span>Confirmar todos</span>
          </button>
        )}
      </div>

      {pendingMovements.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 1.5rem", color: "var(--text-muted)" }}>
          <span style={{ fontSize: "3rem" }}>✨</span>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "0.5rem" }}>
            No tienes nada pendiente de revisar
          </h3>
          <p style={{ fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Todos los movimientos están confirmados y al día.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {pendingMovements.map(mov => {
            const payer = membersMap[mov.paidBy] || { name: "Alguien" };
            const isPayerMe = mov.paidBy === currentUser.id;
            const mySplit = (mov.splits || []).find(s => s.userId === currentUser.id);

            return (
              <div 
                key={mov.id} 
                className="card"
                style={{
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="avatar" style={{ backgroundColor: payer.color }}>
                      {payer.avatar}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                        {mov.note || "Gasto"}
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {isPayerMe ? "Anotaron que tú pagaste" : `Pagó ${payer.name}`} · {mov.date}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                      {formatMoney(mov.amount, mov.currency)}
                    </span>
                    {mySplit && !isPayerMe && (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>
                        Tu parte: {formatMoney(mySplit.amount, mov.currency)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botones de Confirmación */}
                <div style={{ display: "flex", gap: "0.75rem", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "0.85rem" }}>
                  <button
                    onClick={() => onCorrectMovement(mov.id)}
                    className="btn btn-tonal"
                    style={{ flex: 1 }}
                  >
                    <span>Corregir</span>
                  </button>

                  <button
                    onClick={() => onConfirmMovement(mov.id)}
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                  >
                    <IconCheck size={20} />
                    <span>Está bien ✓</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
