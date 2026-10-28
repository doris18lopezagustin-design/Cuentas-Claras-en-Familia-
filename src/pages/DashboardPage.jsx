import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  calculateOverallTotals, 
  getPairwiseSummary, 
  formatMoney 
} from "../services/balanceCalculator";
import { filterMovementsForUser } from "../services/privacyService";
import { MovementCard } from "../components/MovementCard";
import { IconPlus, IconCheckSquare, IconWhatsApp, IconHelp } from "../components/Icons";

export const DashboardPage = ({ 
  movements, 
  onSelectMember, 
  onOpenAnotar, 
  onGoToReview,
  onSelectMovement 
}) => {
  const { currentUser, members, membersMap } = useAuth();
  const isSimple = currentUser?.simpleMode;

  // Filtrar movimientos estrictamente privados donde participa el usuario actual
  const myMovements = useMemo(() => {
    return filterMovementsForUser(movements, currentUser.id);
  }, [movements, currentUser.id]);

  // Otros miembros de la familia
  const otherMembers = useMemo(() => {
    return members.filter(m => m.id !== currentUser.id);
  }, [members, currentUser.id]);

  // Totales globales para el encabezado
  const totals = useMemo(() => {
    return calculateOverallTotals(currentUser.id, otherMembers, myMovements);
  }, [currentUser.id, otherMembers, myMovements]);

  // Movimientos pendientes de revisar para este usuario
  const pendingReviews = useMemo(() => {
    return myMovements.filter(m => 
      m.status === "sin_confirmar" && 
      m.createdBy !== currentUser.id
    );
  }, [myMovements, currentUser.id]);

  // Resumen par a par para cada familiar
  const familySummaries = useMemo(() => {
    return otherMembers.map(member => {
      const summary = getPairwiseSummary(currentUser.id, member, myMovements);
      
      // Buscar la fecha del movimiento más reciente entre ambos para ordenar
      const pairwiseMovs = myMovements.filter(m => 
        (m.paidBy === currentUser.id && (m.splits || []).some(s => s.userId === member.id)) ||
        (m.paidBy === member.id && (m.splits || []).some(s => s.userId === currentUser.id)) ||
        (m.type === "abono" && ((m.paidBy === currentUser.id && m.recipientId === member.id) || (m.paidBy === member.id && m.recipientId === currentUser.id)))
      );

      const latestDate = pairwiseMovs.length > 0 ? pairwiseMovs[0].createdAt || pairwiseMovs[0].date : "";

      return {
        ...summary,
        latestDate
      };
    }).sort((a, b) => (b.latestDate || "").localeCompare(a.latestDate || ""));
  }, [otherMembers, currentUser.id, myMovements]);

  // Enlace para pedir ayuda por WhatsApp (Modo Sencillo)
  const defaultHelper = otherMembers.find(m => m.id === "user-ana") || otherMembers[0];
  const helpWhatsAppUrl = defaultHelper ? `https://wa.me/${defaultHelper.phone || ""}?text=${encodeURIComponent("Hola " + defaultHelper.name + " 😊 necesito ayuda con la app de cuentas.")}` : "#";

  return (
    <div className="content-wrapper">
      {/* 1. MODO SENCILLO (Para Mamá) */}
      {isSimple ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Bienvenida y botón pedir ayuda */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-surface)",
            padding: "1.25rem",
            borderRadius: "var(--radius-lg)",
            border: "1.5px solid var(--border-subtle)"
          }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                ¡Hola, {currentUser.name}! 🌸
              </h2>
              <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Aquí tienes tus cuentas al día de forma fácil.
              </p>
            </div>

            {defaultHelper && (
              <a
                href={helpWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ minHeight: "48px", textDecoration: "none" }}
              >
                <IconWhatsApp size={22} />
                <span>Pedir ayuda a {defaultHelper.name}</span>
              </a>
            )}
          </div>

          {/* Aviso visible si hay cosas por revisar */}
          {pendingReviews.length > 0 && (
            <div
              onClick={onGoToReview}
              className="card card-interactive"
              style={{
                backgroundColor: "var(--badge-sin-confirmar-bg)",
                borderColor: "var(--badge-sin-confirmar-text)",
                padding: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem"
              }}
            >
              <div style={{ fontSize: "2rem" }}>🔔</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--badge-sin-confirmar-text)" }}>
                  Tienes {pendingReviews.length} {pendingReviews.length === 1 ? "cosa" : "cosas"} por revisar
                </h3>
                <p style={{ fontSize: "0.95rem", color: "var(--badge-sin-confirmar-text)", marginTop: "0.2rem" }}>
                  Toca aquí para ver lo que anotaron otros familiares.
                </p>
              </div>
              <span className="btn btn-primary" style={{ minHeight: "42px", padding: "0.5rem 1rem" }}>
                Ver ahora
              </span>
            </div>
          )}

          {/* Botón "+ Anotar" Muy Grande */}
          <button
            onClick={onOpenAnotar}
            className="btn btn-anotar btn-sencillo"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <IconPlus size={28} />
            <span>+ Anotar un gasto o préstamo</span>
          </button>

          {/* Lista de saldos con cada familiar en letra grande */}
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.85rem", color: "var(--text-primary)" }}>
              Tus cuentas con la familia:
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {familySummaries.map(({ otherMember, phraseGTQ, phraseUSD, statusGTQ, hasUSDActivity }) => {
                const cardStyle = statusGTQ === "a_favor" 
                  ? "card-saldo-favor" 
                  : statusGTQ === "pendiente" 
                  ? "card-saldo-pendiente" 
                  : "card-saldo-mano";

                return (
                  <div
                    key={otherMember.id}
                    onClick={() => onSelectMember(otherMember)}
                    className={`card card-interactive ${cardStyle}`}
                    style={{ padding: "1.35rem" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div className="avatar avatar-lg" style={{ backgroundColor: otherMember.color }}>
                        {otherMember.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <h4 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                            {otherMember.name}
                          </h4>
                          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary)" }}>
                            Ver detalles →
                          </span>
                        </div>
                        <p style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "0.4rem", lineHeight: 1.3 }}>
                          {phraseGTQ}
                        </p>
                        {hasUSDActivity && (
                          <p style={{ fontSize: "1.05rem", fontWeight: 600, marginTop: "0.3rem", opacity: 0.9 }}>
                            {phraseUSD}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 2. MODO COMPLETO (Desktop / Móvil estándar) */
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Encabezado con Resumen Global */}
          <div style={{
            backgroundColor: "var(--bg-surface)",
            padding: "1.25rem 1.5rem",
            borderRadius: "var(--radius-lg)",
            border: "1.5px solid var(--border-subtle)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Resumen de tus cuentas
            </span>

            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.4rem", lineHeight: 1.35 }}>
              En total tienes{" "}
              <span style={{ color: "var(--balance-favor-badge)", fontWeight: 800 }}>
                {formatMoney(totals.favorGTQ, "GTQ")} a tu favor
              </span>{" "}
              y{" "}
              <span style={{ color: "var(--balance-pendiente-badge)", fontWeight: 800 }}>
                {formatMoney(totals.pendienteGTQ, "GTQ")} pendientes
              </span>.
            </h2>

            {totals.hasUSD && (
              <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginTop: "0.35rem", fontWeight: 600 }}>
                En dólares: {formatMoney(totals.favorUSD, "USD")} a tu favor y {formatMoney(totals.pendienteUSD, "USD")} pendientes.
              </p>
            )}

            {/* Aviso visible si hay movimientos por revisar */}
            {pendingReviews.length > 0 && (
              <div 
                onClick={onGoToReview}
                style={{
                  marginTop: "1rem",
                  backgroundColor: "var(--badge-sin-confirmar-bg)",
                  color: "var(--badge-sin-confirmar-text)",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>⏳</span>
                  <span>Tienes {pendingReviews.length} {pendingReviews.length === 1 ? "cosa" : "cosas"} por revisar</span>
                </div>
                <span style={{ fontSize: "0.85rem", textDecoration: "underline" }}>
                  Ver ahora →
                </span>
              </div>
            )}
          </div>

          {/* Contenido en dos columnas para computadoras */}
          <div className="dashboard-columns">
            {/* Columna Izquierda: Tarjetas de Familiares */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  Familiares ({otherMembers.length})
                </h3>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Toca una tarjeta para ver el historial
                </span>
              </div>

              <div className="grid-familiares" style={{ display: "grid", gap: "1rem" }}>
                {familySummaries.map(({ otherMember, phraseGTQ, phraseUSD, statusGTQ, hasUSDActivity }) => {
                  const cardStyle = statusGTQ === "a_favor" 
                    ? "card-saldo-favor" 
                    : statusGTQ === "pendiente" 
                    ? "card-saldo-pendiente" 
                    : "card-saldo-mano";

                  return (
                    <div
                      key={otherMember.id}
                      onClick={() => onSelectMember(otherMember)}
                      className={`card card-interactive ${cardStyle}`}
                      style={{ padding: "1.25rem" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        <div className="avatar" style={{ backgroundColor: otherMember.color }}>
                          {otherMember.avatar}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "inherit", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {otherMember.name}
                          </h4>
                          <p style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "0.3rem", lineHeight: 1.3 }}>
                            {phraseGTQ}
                          </p>
                          {hasUSDActivity && (
                            <p style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: "0.25rem", opacity: 0.9 }}>
                              {phraseUSD}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Últimos Movimientos donde participo */}
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.85rem" }}>
                Tus últimos movimientos
              </h3>

              {myMovements.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  <span style={{ fontSize: "2rem" }}>📝</span>
                  <p style={{ marginTop: "0.5rem", fontWeight: 600 }}>Aún no tienes movimientos anotados.</p>
                </div>
              ) : (
                <div>
                  {myMovements.slice(0, 5).map(mov => (
                    <MovementCard
                      key={mov.id}
                      movement={mov}
                      currentUserId={currentUser.id}
                      membersMap={membersMap}
                      onClick={() => onSelectMovement(mov)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
