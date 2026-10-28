import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { dataService } from "../services/dataService";
import { formatMoney } from "../services/balanceCalculator";
import { generateCuadrePDF } from "../services/pdfService";
import { IconScale, IconCheck, IconPlus, IconX } from "../components/Icons";

export const CuadresPage = ({ onOpenNewCuadre, onInspectCuadre, movements }) => {
  const { currentUser, members, membersMap } = useAuth();
  const [cuadres, setCuadres] = useState(() => dataService.getCuadres());
  const [selectedMemberFilter, setSelectedMemberFilter] = useState("TODOS");

  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setCuadres(dataService.getCuadres());
    });
    return unsub;
  }, []);

  // Filtrar solo los cuadres donde participa el usuario actual
  const myCuadres = cuadres.filter(c => c.userA === currentUser.id || c.userB === currentUser.id);

  const filteredCuadres = myCuadres.filter(c => {
    if (selectedMemberFilter === "TODOS") return true;
    const otherId = c.userA === currentUser.id ? c.userB : c.userA;
    return otherId === selectedMemberFilter;
  });

  const pendingCuadres = filteredCuadres.filter(c => c.status !== "cerrado");
  const closedCuadres = filteredCuadres.filter(c => c.status === "cerrado");

  const handleAcceptAgreement = (cuadreId) => {
    dataService.acceptCuadre(cuadreId, currentUser.id);
  };
  return (
    <div className="content-wrapper">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800 }}>
            Cuadres de cuentas
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Cierres periódicos de mutuo acuerdo y descarga en PDF
          </p>
        </div>

        <button
          onClick={() => onOpenNewCuadre()}
          className="btn btn-primary"
          style={{ fontSize: "0.9rem" }}
        >
          <IconPlus size={18} />
          <span>+ Hacer nuevo cuadre</span>
        </button>
      </div>

      {/* Explicación cálida */}
      <div className="card" style={{
        padding: "1.25rem",
        backgroundColor: "var(--bg-surface-variant)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "1.25rem",
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
          <IconScale size={20} />
        </div>
        <div>
          <h4 style={{ fontSize: "1rem", fontWeight: 800 }}>
            Cierre transparente y en paz
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.4 }}>
            Al cuadrar un periodo (mes o quincena) ambas personas revisan que todo coincida y tocan "Estamos de acuerdo". Una vez cerrado, el saldo pasa como saldo inicial del siguiente mes y nadie puede alterar ese pasado.
          </p>
        </div>
      </div>

      {/* Filtro por familiar */}
      {members.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>Ver con:</span>
          <select
            value={selectedMemberFilter}
            onChange={e => setSelectedMemberFilter(e.target.value)}
            className="input"
            style={{ width: "auto", minHeight: "38px", fontWeight: 700 }}
          >
            <option value="TODOS">Todos los familiares</option>
            {members.filter(m => m.id !== currentUser.id).map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* 1. Cuadres en espera de acuerdo */}
      {pendingCuadres.length > 0 && (
        <div style={{ marginBottom: "1.75rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem", color: "#D97706" }}>
            ⏳ Esperando acuerdo ({pendingCuadres.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {pendingCuadres.map(c => {
              const otherId = c.userA === currentUser.id ? c.userB : c.userA;
              const other = membersMap[otherId] || { name: "Familiar", avatar: "👤" };
              const hasAccepted = (c.acceptedBy || []).includes(currentUser.id);

              return (
                <div
                  key={c.id}
                  className="card"
                  style={{
                    padding: "1.25rem",
                    border: "2px solid #F59E0B",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.85rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "1.4rem" }}>{other.avatar}</span>
                      <div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                          Cuadre con {other.name}
                        </h4>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          Periodo: {c.startDate} al {c.endDate}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                        {formatMoney(c.finalBalanceGTQ, "GTQ")}
                      </span>
                      {c.finalBalanceUSD !== 0 && (
                        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                          {formatMoney(c.finalBalanceUSD, "USD")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => onInspectCuadre(c)}
                      className="btn btn-outline"
                      style={{ flex: 1, minHeight: "42px", fontSize: "0.85rem" }}
                    >
                      <span>Ver detalle y PDF</span>
                    </button>

                    {!hasAccepted && (
                      <button
                        type="button"
                        onClick={() => handleAcceptAgreement(c.id)}
                        className="btn btn-primary"
                        style={{ flex: 1.5, minHeight: "42px", fontSize: "0.85rem" }}
                      >
                        <IconCheck size={18} />
                        <span>Estamos de acuerdo ✓</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Cuadres cerrados de mutuo acuerdo */}
      <div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
          Historial de cuadres cerrados ({closedCuadres.length})
        </h3>

        {closedCuadres.length === 0 && pendingCuadres.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "3rem" }}>⚖️</span>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "0.5rem" }}>
              Aún no hay cuadres registrados
            </h3>
            <p style={{ fontSize: "0.95rem", marginTop: "0.25rem" }}>
              Toca "+ Hacer nuevo cuadre" para cerrar un periodo formalmente con cualquier familiar.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {closedCuadres.map(c => {
              const otherId = c.userA === currentUser.id ? c.userB : c.userA;
              const other = membersMap[otherId] || { name: "Familiar", avatar: "👤" };

              return (
                <div
                  key={c.id}
                  className="card"
                  style={{
                    padding: "1rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "var(--radius-lg)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.4rem" }}>{other.avatar}</span>
                    <div>
                      <h4 style={{ fontSize: "1rem", fontWeight: 800 }}>
                        {other.name} — {c.startDate} al {c.endDate}
                      </h4>
                      <p style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 700 }}>
                        ✓ Cerrado de mutuo acuerdo ({new Date(c.closedAt).toLocaleDateString("es-GT")})
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                        {formatMoney(c.finalBalanceGTQ, "GTQ")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onInspectCuadre(c)}
                      className="btn btn-tonal"
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem", minHeight: "38px" }}
                    >
                      <span>Detalle / PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
