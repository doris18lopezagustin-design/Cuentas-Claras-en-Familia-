import React, { useState, useEffect } from "react";
import { IconX, IconCheck, IconCoins, IconHandshake } from "./Icons";
import { formatMoney, round2 } from "../services/balanceCalculator";
import { dataService } from "../services/dataService";

export const AbonoModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentUser, 
  otherUser, 
  currentBalanceGTQ = 0, 
  currentBalanceUSD = 0,
  initialCurrency = "GTQ",
  isQuedarAMano = false 
}) => {
  if (!isOpen || !otherUser) return null;

  const currentBal = initialCurrency === "GTQ" ? currentBalanceGTQ : currentBalanceUSD;
  const absBal = Math.abs(currentBal);

  const [amount, setAmount] = useState(() => {
    if (isQuedarAMano) {
      return absBal > 0 ? absBal.toFixed(2) : "";
    }
    return "";
  });

  const [currency, setCurrency] = useState(initialCurrency);
  const [payerId, setPayerId] = useState(() => {
    if (currentBal < 0) return currentUser.id;
    return otherUser.id;
  });

  const [note, setNote] = useState(() => isQuedarAMano ? "Quedamos a mano" : "Abono");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  // FASE 3: Vincular a préstamo específico
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [activeLoans, setActiveLoans] = useState([]);

  // FASE 3: Pagar dólares con quetzales (conversión con tipo de cambio acordado)
  const [isCrossCurrency, setIsCrossCurrency] = useState(false);
  const [exchangeRate, setExchangeRate] = useState("7.75"); // Tipo de cambio referencial habitual en Guatemala

  useEffect(() => {
    if (isOpen) {
      const loans = dataService.getActiveLoansBetween(currentUser.id, otherUser.id);
      setActiveLoans(loans);
      if (loans.length > 0 && !isQuedarAMano) {
        // Si hay préstamos en dólares y estamos en dólares, o primer préstamo
        const match = loans.find(l => l.currency === currency && !l.isFullyPaid);
        if (match) setSelectedLoanId(match.id);
      }
    }
  }, [isOpen, currency, currentUser.id, otherUser.id]);

  const numAmount = parseFloat(amount) || 0;
  const numRate = parseFloat(exchangeRate) || 0;
  const isPayerMe = payerId === currentUser.id;
  const recipientId = isPayerMe ? otherUser.id : currentUser.id;

  // Cálculo de monto efectivo si es multidivisa (ej. pago Q775 con tasa 7.75 -> descuenta US$100)
  const effectiveTargetCurrency = isCrossCurrency ? "USD" : currency;
  const effectiveTargetAmount = isCrossCurrency 
    ? (numRate > 0 ? round2(numAmount / numRate) : 0)
    : numAmount;

  // Préstamo seleccionado actualmente
  const selectedLoan = activeLoans.find(l => l.id === selectedLoanId);

  // Previsualización de cómo quedará el saldo
  const activeBal = effectiveTargetCurrency === "GTQ" ? currentBalanceGTQ : currentBalanceUSD;
  let remainingPreview = "";

  useEffect(() => {
    setWarningMessage("");
    if (numAmount > 0) {
      let projectedBal = activeBal;
      if (isPayerMe) {
        projectedBal = round2(activeBal + effectiveTargetAmount);
      } else {
        projectedBal = round2(activeBal - effectiveTargetAmount);
      }

      if (projectedBal === 0) {
        remainingPreview = `✓ Con este abono quedarán totalmente a mano en ${effectiveTargetCurrency}.`;
      } else if (projectedBal > 0) {
        remainingPreview = `Quedarán ${formatMoney(projectedBal, effectiveTargetCurrency)} a tu favor.`;
        // RF-9.6: Aviso si el abono supera el saldo
        if (activeBal < 0 && effectiveTargetAmount > Math.abs(activeBal)) {
          const sobrante = round2(effectiveTargetAmount - Math.abs(activeBal));
          setWarningMessage(`⚠️ Con este abono se supera el saldo pendiente (quedarán ${formatMoney(sobrante, effectiveTargetCurrency)} a favor de ${isPayerMe ? "ti" : otherUser.name}).`);
        }
      } else {
        remainingPreview = `Te quedarán ${formatMoney(Math.abs(projectedBal), effectiveTargetCurrency)} pendientes con ${otherUser.name}.`;
      }
    }
  }, [numAmount, effectiveTargetAmount, activeBal, isPayerMe, effectiveTargetCurrency, otherUser.name]);
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (numAmount <= 0) {
      setError("Ingresa un monto mayor a cero.");
      return;
    }

    if (isCrossCurrency) {
      if (!numRate || numRate <= 0) {
        setError("Para pagar dólares con quetzales debes indicar el tipo de cambio acordado.");
        return;
      }
    }

    const defaultNote = isQuedarAMano ? "Quedamos a mano" : (selectedLoan ? `Abono a préstamo: ${selectedLoan.note}` : "Abono");

    const abonoData = {
      type: "abono",
      category: "otro",
      note: note.trim() || defaultNote,
      amount: numAmount,
      currency: isCrossCurrency ? "GTQ" : currency,
      date,
      paidBy: payerId,
      recipientId: recipientId,
      status: "sin_confirmar",
      createdBy: currentUser.id,
      // Fase 3
      linkedLoanId: selectedLoanId || null,
      isCrossCurrency,
      exchangeRate: isCrossCurrency ? numRate : null,
      targetCurrency: isCrossCurrency ? "USD" : currency,
      targetAmount: isCrossCurrency ? effectiveTargetAmount : numAmount
    };

    onSave(abonoData);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-sheet" 
        onClick={e => e.stopPropagation()}
        style={{ padding: "1.75rem", maxWidth: "540px" }}
      >
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
              {isQuedarAMano ? <IconHandshake size={24} /> : <IconCoins size={24} />}
            </div>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
                {isQuedarAMano ? `Quedar a mano con ${otherUser.name}` : `Registrar abono con ${otherUser.name}`}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {isQuedarAMano ? "Liquidación exacta para dejar el saldo en cero" : "Anota pagos parciales o totales de forma clara"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-tonal" style={{ minHeight: "40px", padding: "0.4rem", borderRadius: "50%" }}>
            <IconX size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: "var(--balance-pendiente-bg)",
            color: "var(--balance-pendiente-text)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "1rem"
          }}>
            ⚠️ {error}
          </div>
        )}

        {warningMessage && (
          <div style={{
            backgroundColor: "var(--balance-favor-bg)",
            color: "var(--balance-favor-text)",
            border: "1.5px solid var(--balance-favor-border)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "1rem"
          }}>
            {warningMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {/* Quién entrega el abono */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.4rem" }}>
              ¿Quién entrega el dinero?
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setPayerId(currentUser.id)}
                className={`btn ${isPayerMe ? "btn-primary" : "btn-tonal"}`}
                style={{ flex: 1, minHeight: "48px" }}
              >
                <span>Tú ({currentUser.name})</span>
              </button>
              <button
                type="button"
                onClick={() => setPayerId(otherUser.id)}
                className={`btn ${!isPayerMe ? "btn-primary" : "btn-tonal"}`}
                style={{ flex: 1, minHeight: "48px" }}
              >
                <span>{otherUser.name}</span>
              </button>
            </div>
          </div>

          {/* FASE 3: Vincular a préstamo específico */}
          {activeLoans.length > 0 && !isQuedarAMano && (
            <div style={{
              backgroundColor: "var(--bg-surface-variant)",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)"
            }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.35rem" }}>
                🤝 Asignar a un préstamo específico (opcional):
              </label>
              <select
                value={selectedLoanId}
                onChange={e => setSelectedLoanId(e.target.value)}
                className="input"
                style={{ fontWeight: 700 }}
              >
                <option value="">Ninguno (abono al saldo general)</option>
                {activeLoans.map(loan => (
                  <option key={loan.id} value={loan.id}>
                    {loan.note} — Total: {formatMoney(loan.amount, loan.currency)} (Faltan {formatMoney(loan.remainingAmount, loan.currency)})
                  </option>
                ))}
              </select>
              {selectedLoan && (
                <p style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: 700, marginTop: "0.4rem" }}>
                  Saldo restante de este préstamo: {formatMoney(selectedLoan.remainingAmount, selectedLoan.currency)}
                </p>
              )}
            </div>
          )}

          {/* Monto y Moneda */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.4rem" }}>
              Monto a abonar:
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {!isCrossCurrency && (
                <div style={{ display: "flex", border: "2px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                  <button
                    type="button"
                    onClick={() => setCurrency("GTQ")}
                    style={{
                      padding: "0 0.85rem",
                      fontWeight: 800,
                      backgroundColor: currency === "GTQ" ? "var(--primary)" : "var(--bg-surface)",
                      color: currency === "GTQ" ? "#FFFFFF" : "var(--text-primary)",
                      border: "none"
                    }}
                  >
                    Q
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    style={{
                      padding: "0 0.85rem",
                      fontWeight: 800,
                      backgroundColor: currency === "USD" ? "var(--primary)" : "var(--bg-surface)",
                      color: currency === "USD" ? "#FFFFFF" : "var(--text-primary)",
                      border: "none"
                    }}
                  >
                    US$
                  </button>
                </div>
              )}

              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="input"
                style={{ fontSize: "1.4rem", fontWeight: 800, flex: 1 }}
                required
                autoFocus
              />
            </div>
          </div>

          {/* FASE 3: Pagar dólares con quetzales */}
          {!isQuedarAMano && (
            <div style={{
              backgroundColor: "var(--bg-surface-variant)",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)"
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isCrossCurrency}
                  onChange={e => setIsCrossCurrency(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                />
                <span>💱 Pagar pendiente en dólares con quetzales</span>
              </label>

              {isCrossCurrency && (
                <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "1.5rem" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Tipo de cambio acordado (Q por US$1.00):</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={exchangeRate}
                      onChange={e => setExchangeRate(e.target.value)}
                      className="input"
                      style={{ width: "110px", marginTop: "0.25rem", fontWeight: 800 }}
                      required
                    />
                  </div>

                  {numAmount > 0 && numRate > 0 && (
                    <div style={{
                      backgroundColor: "var(--bg-surface)",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)"
                    }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>
                        Pagas Q{numAmount.toFixed(2)} ➔ descuentan US${effectiveTargetAmount.toFixed(2)} de los pendientes en dólares.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Nota opcional y Fecha */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ flex: 1.5 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Nota (opcional):
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="input"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Fecha:
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Previsualización del saldo restante */}
          {numAmount > 0 && (
            <div style={{
              backgroundColor: "var(--bg-surface-variant)",
              padding: "0.85rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--text-primary)"
            }}>
              {remainingPreview}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1, minHeight: "48px" }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1.5, minHeight: "48px", fontSize: "1.05rem" }}>
              <IconCheck size={20} />
              <span>{isQuedarAMano ? "Confirmar quedar a mano" : "Guardar abono"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
