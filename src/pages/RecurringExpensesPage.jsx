import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { dataService } from "../services/dataService";
import { formatMoney } from "../services/balanceCalculator";
import { 
  IconRepeat, 
  IconPlus, 
  IconCheck, 
  CATEGORY_ICONS 
} from "../components/Icons";

export const RecurringExpensesPage = ({ onOpenAnotar }) => {
  const { currentUser, membersMap } = useAuth();
  const [recurringList, setRecurringList] = useState(() => dataService.getRecurringExpenses());
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setRecurringList(dataService.getRecurringExpenses());
    });
    return unsub;
  }, []);

  const handleToggleStatus = (rec) => {
    const newStatus = rec.status === "activo" ? "pausado" : "activo";
    dataService.updateRecurringExpense(rec.id, { status: newStatus });
    setSuccessMessage(`Gasto ${rec.name} ahora está ${newStatus}.`);
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleForceGenerate = (rec) => {
    // Generar movimiento manual de prueba
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const monthLabel = monthNames[new Date().getMonth()];

    dataService.addMovement({
      type: "gasto_compartido",
      category: rec.category || "plataformas",
      note: `${rec.name} • ${monthLabel}`,
      amount: rec.amount,
      currency: rec.currency,
      date: new Date().toISOString().split("T")[0],
      paidBy: rec.paidBy,
      splits: rec.splits || [],
      participants: rec.participants || [],
      status: "sin_confirmar",
      createdBy: currentUser.id,
      isRecurringInstance: true
    });

    dataService.updateRecurringExpense(rec.id, {
      lastGeneratedMonth: currentMonthKey
    });

    setSuccessMessage(`✓ Se anotó el movimiento de ${rec.name} para este mes en la libreta.`);
    setTimeout(() => setSuccessMessage(""), 4000);
  };
  return (
    <div className="content-wrapper">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800 }}>
            Gastos que se repiten
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Mensualidades y plataformas compartidas de la familia
          </p>
        </div>

        {onOpenAnotar && (
          <button
            onClick={() => onOpenAnotar()}
            className="btn btn-primary"
            style={{ fontSize: "0.9rem" }}
          >
            <IconPlus size={18} />
            <span>+ Anotar nuevo gasto</span>
          </button>
        )}
      </div>

      {/* Mensaje de confirmación */}
      {successMessage && (
        <div style={{
          backgroundColor: "var(--balance-favor-bg)",
          color: "var(--balance-favor-text)",
          border: "1.5px solid var(--balance-favor-border)",
          padding: "0.85rem 1rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.25rem",
          fontSize: "0.9rem",
          fontWeight: 700
        }}>
          {successMessage}
        </div>
      )}

      {/* Tarjeta explicativa de confianza */}
      <div className="card" style={{
        padding: "1.25rem",
        backgroundColor: "var(--bg-surface-variant)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.85rem"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "var(--primary)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          <IconRepeat size={20} />
        </div>
        <div>
          <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Anotación automática cada mes
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.4 }}>
            Las mensualidades compartidas (como Netflix o el internet) se anotan solitas en la libreta el día acordado de cada mes. Así nadie tiene que acordarse de cobrar ni anotar a mano.
          </p>
        </div>
      </div>

      {/* Lista de gastos recurrentes */}
      {recurringList.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
          <span style={{ fontSize: "3rem" }}>🔄</span>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "0.5rem" }}>
            No hay gastos repetidos configurados
          </h3>
          <p style={{ fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Al anotar un gasto puedes marcar la opción de repetir cada mes.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {recurringList.map(rec => {
            const CatIcon = CATEGORY_ICONS[rec.category] || CATEGORY_ICONS.plataformas || CATEGORY_ICONS.otro;
            const payer = membersMap[rec.paidBy] || { name: "Alguien", avatar: "👤" };
            const isActive = rec.status === "activo";

            return (
              <div
                key={rec.id}
                className="card"
                style={{
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  opacity: isActive ? 1 : 0.65
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-surface-variant)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary)"
                    }}>
                      <CatIcon size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                        {rec.name}
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Día {rec.dayOfMonth} de cada mes • Pagado por {payer.name}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      {formatMoney(rec.amount, rec.currency)}
                    </span>
                    <div>
                      <span style={{
                        display: "inline-block",
                        marginTop: "0.25rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        backgroundColor: isActive ? "#DCFCE7" : "#F1F5F9",
                        color: isActive ? "#166534" : "#64748B"
                      }}>
                        {isActive ? "✓ Activo" : "Pausado"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desglose de beneficiarios y turno alterno */}
                <div style={{
                  backgroundColor: "var(--bg-surface-variant)",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      Reparto mensual:
                    </span>
                    {rec.alternatePayer && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)" }}>
                        🔄 Turnos alternos activados
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    {(rec.splits || []).map(split => {
                      const m = membersMap[split.userId] || { name: "Alguien", avatar: "👤" };
                      return (
                        <span key={split.userId} style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                          {m.avatar} {m.name}: {formatMoney(split.amount, rec.currency)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Botones de acción */}
                <div style={{ display: "flex", gap: "0.75rem", borderTop: "1.5px solid var(--border-subtle)", paddingTop: "0.85rem" }}>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(rec)}
                    className="btn btn-tonal"
                    style={{ flex: 1, minHeight: "42px", fontSize: "0.85rem" }}
                  >
                    <span>{isActive ? "Pausar recurrencia" : "Reactivar"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleForceGenerate(rec)}
                    className="btn btn-outline"
                    style={{ flex: 1.5, minHeight: "42px", fontSize: "0.85rem" }}
                  >
                    <span>Anotar este mes ahora</span>
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
