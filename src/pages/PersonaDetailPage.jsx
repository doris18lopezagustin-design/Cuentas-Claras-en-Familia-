import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  getPairwiseSummary, 
  formatMoney 
} from "../services/balanceCalculator";
import { filterMovementsBetweenPair } from "../services/privacyService";
import { dataService } from "../services/dataService";
import { MovementCard } from "../components/MovementCard";
import { 
  IconArrowLeft, 
  IconCoins, 
  IconHandshake, 
  IconScale, 
  IconWhatsApp, 
  IconSearch, 
  IconFilter,
  IconPlus,
  IconX
} from "../components/Icons";

export const PersonaDetailPage = ({ 
  otherMember, 
  movements, 
  onBack, 
  onOpenAnotarWithMember, 
  onOpenAbono, 
  onOpenQuedarAMano,
  onOpenCuadre,
  onSelectMovement 
}) => {
  const { currentUser, membersMap } = useAuth();
  
  // Filtros
  const [searchText, setSearchText] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("TODAS"); // TODAS | GTQ | USD
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [selectedStatus, setSelectedStatus] = useState("TODOS");

  // Movimientos únicamente entre estas dos personas
  const pairwiseMovements = useMemo(() => {
    return filterMovementsBetweenPair(movements, currentUser.id, otherMember.id);
  }, [movements, currentUser.id, otherMember.id]);

  // Saldo par a par actual
  const activeLoans = useMemo(() => {
    return dataService.getActiveLoansBetween(currentUser.id, otherMember.id);
  }, [movements, currentUser.id, otherMember.id]);

  const pairwiseSummary = useMemo(() => {
    return getPairwiseSummary(currentUser.id, otherMember, pairwiseMovements);
  }, [currentUser.id, otherMember, pairwiseMovements]);

  // Filtrado de movimientos
  const filteredMovements = useMemo(() => {
    return pairwiseMovements.filter(m => {
      // Búsqueda por texto en la nota
      if (searchText.trim()) {
        const query = searchText.toLowerCase();
        const noteMatch = (m.note || "").toLowerCase().includes(query);
        const catMatch = (m.category || "").toLowerCase().includes(query);
        if (!noteMatch && !catMatch) return false;
      }

      // Filtro de moneda
      if (selectedCurrency !== "TODAS" && m.currency !== selectedCurrency) {
        return false;
      }

      // Filtro de categoría
      if (selectedCategory !== "TODAS" && m.category !== selectedCategory) {
        return false;
      }

      // Filtro de estado
      if (selectedStatus !== "TODOS" && m.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [pairwiseMovements, searchText, selectedCurrency, selectedCategory, selectedStatus]);

  // Mensaje para WhatsApp
  const handleAvisarWhatsApp = () => {
    let msg = `Hola ${otherMember.name} 😊 te escribo para revisar nuestras cuentas en Cuentas Claras.`;
    if (pairwiseSummary.balanceGTQ > 0) {
      msg = `Hola ${otherMember.name} 😊 cuando puedas le das un vistazo a la app de Cuentas Claras, tenemos ${formatMoney(pairwiseSummary.balanceGTQ, "GTQ")} pendientes por cuadrar. ¡Un abrazo!`;
    } else if (pairwiseSummary.balanceGTQ < 0) {
      msg = `Hola ${otherMember.name} 😊 vi en la app de Cuentas Claras que tengo ${formatMoney(Math.abs(pairwiseSummary.balanceGTQ), "GTQ")} pendientes contigo, avisame cuando puedas para hacerte un abono 🙌`;
    } else {
      msg = `Hola ${otherMember.name} 😊 en la app de Cuentas Claras estamos al día y a mano 🤝`;
    }

    const phone = otherMember.phone || "";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const cardStyle = pairwiseSummary.statusGTQ === "a_favor" 
    ? "card-saldo-favor" 
    : pairwiseSummary.statusGTQ === "pendiente" 
    ? "card-saldo-pendiente" 
    : "card-saldo-mano";

  return (
    <div className="content-wrapper">
      {/* Botón de regreso */}
      <button 
        onClick={onBack}
        className="btn btn-tonal"
        style={{ minHeight: "44px", padding: "0.5rem 1rem", marginBottom: "1rem" }}
      >
        <IconArrowLeft size={20} />
        <span>Regresar al Inicio</span>
      </button>

      {/* Encabezado con Familiar y Saldo Par a Par */}
      <div 
        className={`card ${cardStyle}`}
        style={{ padding: "1.5rem", marginBottom: "1.25rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="avatar avatar-lg" style={{ backgroundColor: otherMember.color }}>
            {otherMember.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85 }}>
              Cuentas con {otherMember.fullName || otherMember.name}
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.25rem", lineHeight: 1.25 }}>
              {pairwiseSummary.phraseGTQ}
            </h2>
            {pairwiseSummary.hasUSDActivity && (
              <p style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.4rem", opacity: 0.9 }}>
                {pairwiseSummary.phraseUSD}
              </p>
            )}
          </div>
        </div>

        {/* Botones de acción principales */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.65rem",
          marginTop: "1.25rem",
          paddingTop: "1rem",
          borderTop: "1.5px solid rgba(0,0,0,0.08)"
        }}>
          <button
            onClick={() => onOpenAbono(otherMember, "GTQ")}
            className="btn btn-primary"
            style={{ fontSize: "0.95rem" }}
          >
            <IconCoins size={20} />
            <span>Registrar abono</span>
          </button>

          <button
            onClick={() => onOpenQuedarAMano(otherMember, pairwiseSummary.balanceGTQ, pairwiseSummary.balanceUSD)}
            className="btn btn-tonal"
            style={{ fontSize: "0.95rem" }}
          >
            <IconHandshake size={20} />
            <span>Quedar a mano</span>
          </button>

          {onOpenCuadre && (
            <button
              onClick={() => onOpenCuadre(otherMember)}
              className="btn btn-tonal"
              style={{ fontSize: "0.95rem" }}
            >
              <IconScale size={20} />
              <span>Hacer cuadre</span>
            </button>
          )}

          <button
            onClick={handleAvisarWhatsApp}
            className="btn btn-whatsapp"
            style={{ fontSize: "0.95rem" }}
          >
            <IconWhatsApp size={20} />
            <span>Avisar por WhatsApp</span>
          </button>

          <button
            onClick={() => onOpenAnotarWithMember(otherMember)}
            className="btn btn-tonal"
            style={{ fontSize: "0.95rem" }}
          >
            <IconPlus size={20} />
            <span>+ Anotar con {otherMember.name}</span>
          </button>
        </div>
      </div>

            {/* FASE 3: PRÉSTAMOS ACTIVOS ENTRE AMBOS */}
      {activeLoans.length > 0 && (
        <div className="card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.6rem" }}>
            🤝 Préstamos con ${otherMember.name}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {activeLoans.map(loan => (
              <div key={loan.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1rem",
                backgroundColor: "var(--bg-surface-variant)",
                borderRadius: "var(--radius-md)"
              }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>{loan.note}</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    Total: {formatMoney(loan.amount, loan.currency)} {loan.paidSoFar > 0 ? ` • Abonado: ${formatMoney(loan.paidSoFar, loan.currency)}` : ""}
                    {loan.agreedDate ? ` • Acordado: ${loan.agreedDate}` : ""}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: loan.isFullyPaid ? "#166534" : "var(--primary)" }}>
                    {loan.isFullyPaid ? "✓ Liquidado" : `Faltan ${formatMoney(loan.remainingAmount, loan.currency)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="card" style={{ padding: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Buscador */}
          <div style={{ flex: "1 1 240px", position: "relative" }}>
            <input
              type="text"
              placeholder="Buscar en la nota..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="input"
              style={{ paddingLeft: "2.4rem", minHeight: "44px" }}
            />
            <IconSearch size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            {searchText && (
              <button 
                onClick={() => setSearchText("")}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <IconX size={16} />
              </button>
            )}
          </div>

          {/* Filtro por Moneda */}
          <select
            value={selectedCurrency}
            onChange={e => setSelectedCurrency(e.target.value)}
            className="select"
            style={{ width: "auto", minHeight: "44px", fontWeight: 700 }}
          >
            <option value="TODAS">Todas las monedas</option>
            <option value="GTQ">Solo Quetzales (Q)</option>
            <option value="USD">Solo Dólares (US$)</option>
          </select>

          {/* Filtro por Estado */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="select"
            style={{ width: "auto", minHeight: "44px", fontWeight: 700 }}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="sin_confirmar">Sin confirmar</option>
            <option value="confirmado">Confirmado</option>
            <option value="en_revision">En revisión</option>
            <option value="quitado">Quitado</option>
          </select>
        </div>
      </div>

      {/* Lista de Movimientos */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
            Historial de movimientos ({filteredMovements.length})
          </h3>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Del más reciente al más antiguo
          </span>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "2.5rem" }}>🕊️</span>
            <h4 style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "0.5rem" }}>
              No hay movimientos que mostrar con estos filtros
            </h4>
            <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Puedes anotar uno nuevo usando el botón de arriba.
            </p>
          </div>
        ) : (
          <div>
            {filteredMovements.map(mov => (
              <MovementCard
                key={mov.id}
                movement={mov}
                currentUserId={currentUser.id}
                otherUserId={otherMember.id}
                membersMap={membersMap}
                onClick={() => onSelectMovement(mov)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
