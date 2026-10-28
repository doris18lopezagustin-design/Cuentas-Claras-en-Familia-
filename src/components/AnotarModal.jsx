import React, { useState, useEffect, useRef } from "react";
import { 
  CATEGORIES_LIST, 
  IconX, 
  IconCheck, 
  IconCoins,
  IconCamera,
  IconTrash,
  IconRepeat
} from "./Icons";
import { 
  formatMoney, 
  distributeEqualSplit, 
  round2,
  generateMovementSummaryText 
} from "../services/balanceCalculator";
import { compressImageFile } from "../services/imageService";
import { dataService } from "../services/dataService";
import { DuplicateWarningModal } from "./DuplicateWarningModal";

export const AnotarModal = ({ isOpen, onClose, onSave, currentUser, members, preselectedOtherUser }) => {
  if (!isOpen) return null;

  // Estados del flujo rápido
  const [category, setCategory] = useState("comida");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("GTQ");
  const [paidBy, setPaidBy] = useState(currentUser?.id || "user-mama");
  const [includePayerInSplit, setIncludePayerInSplit] = useState(true);
  
  // Beneficiarios seleccionados
  const [selectedBeneficiaryIds, setSelectedBeneficiaryIds] = useState(() => {
    if (preselectedOtherUser) {
      return [preselectedOtherUser.id];
    }
    return members.map(m => m.id);
  });

  // Modo avanzado "Más detalles"
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [customSplits, setCustomSplits] = useState({});
  const [useCustomSplits, setUseCustomSplits] = useState(false);
  const [isLoan, setIsLoan] = useState(false);
  const [agreedDate, setAgreedDate] = useState("");

  // Fase 2: Comprobante fotográfico
  const [receiptImage, setReceiptImage] = useState(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Fase 2: Gastos que se repiten
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(new Date().getDate());
  const [alternatePayer, setAlternatePayer] = useState(false);

  // Fase 2: Detección de duplicados
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateMovement, setDuplicateMovement] = useState(null);
  const [duplicateWarningDismissed, setDuplicateWarningDismissed] = useState(false);

  // Pantalla de confirmación previa
  const [step, setStep] = useState("form"); // "form" | "confirm"
  const [validationError, setValidationError] = useState("");

  const amountInputRef = useRef(null);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setValidationError("");
      setDuplicateWarningDismissed(false);
      setReceiptImage(null);
      if (amountInputRef.current) {
        amountInputRef.current.focus();
      }
    }
  }, [isOpen]);

  const membersMap = members.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});

  // Al seleccionar "Préstamo", ajustar automáticamente
  const handleCategorySelect = (catId) => {
    setCategory(catId);
    if (catId === "prestamo") {
      setIsLoan(true);
      setIncludePayerInSplit(false);
      if (preselectedOtherUser) {
        setSelectedBeneficiaryIds([preselectedOtherUser.id]);
      } else {
        const other = members.find(m => m.id !== paidBy) || members[0];
        setSelectedBeneficiaryIds([other.id]);
      }
    } else {
      setIsLoan(false);
    }
  };

  // Manejo de participantes efectivos
  const effectiveParticipants = (() => {
    if (isLoan) {
      return selectedBeneficiaryIds.filter(id => id !== paidBy);
    }
    const set = new Set(selectedBeneficiaryIds);
    if (includePayerInSplit) {
      set.add(paidBy);
    } else {
      set.delete(paidBy);
    }
    return Array.from(set);
  })();

  // Cálculo de división de montos
  const effectiveSplits = (() => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0 || effectiveParticipants.length === 0) return [];

    if (useCustomSplits) {
      return effectiveParticipants.map(id => ({
        userId: id,
        amount: parseFloat(customSplits[id]) || 0
      }));
    }

    return distributeEqualSplit(numAmount, paidBy, effectiveParticipants);
  })();

  const toggleBeneficiary = (memberId) => {
    if (isLoan) {
      setSelectedBeneficiaryIds([memberId]);
      return;
    }
    if (selectedBeneficiaryIds.includes(memberId)) {
      if (selectedBeneficiaryIds.length === 1 && !includePayerInSplit) {
        return;
      }
      setSelectedBeneficiaryIds(selectedBeneficiaryIds.filter(id => id !== memberId));
    } else {
      setSelectedBeneficiaryIds([...selectedBeneficiaryIds, memberId]);
    }
  };

  // Procesar carga de foto de comprobante
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingImage(true);
      const compressedDataUrl = await compressImageFile(file, 1000, 0.75);
      setReceiptImage(compressedDataUrl);
    } catch (err) {
      console.error("Error al procesar foto:", err);
      setValidationError("No se pudo cargar la imagen. Intenta con otra foto.");
    } finally {
      setIsCompressingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Crear objeto borrador de movimiento
  const buildMovementDraft = () => {
    const defaultNote = CATEGORIES_LIST.find(c => c.id === category)?.label || "Gasto";
    return {
      type: isLoan ? "prestamo" : (effectiveSplits.length === 1 && effectiveSplits[0].userId !== paidBy ? "pago_por_otro" : "gasto_compartido"),
      category,
      note: note.trim() || defaultNote,
      amount: round2(parseFloat(amount)),
      currency,
      date,
      paidBy,
      splits: effectiveSplits,
      participants: effectiveParticipants,
      isLoan,
      agreedDate: isLoan && agreedDate ? agreedDate : null,
      status: "sin_confirmar",
      createdBy: currentUser.id,
      receiptImage: receiptImage || null,
      isRecurring,
      recurringDay: parseInt(recurringDay) || new Date().getDate(),
      alternatePayer
    };
  };

  // Validaciones antes de pasar a confirmación
  const handleProceedToConfirm = () => {
    setValidationError("");
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError("Escribe un monto mayor a cero.");
      return;
    }

    if (!paidBy) {
      setValidationError("Elige quién pagó.");
      return;
    }

    if (effectiveSplits.length === 0) {
      setValidationError("Elige al menos a una persona para quién es el movimiento.");
      return;
    }

    // Regla de privacidad: quien anota debe participar como pagador o como beneficiario
    const currentUserParticipates = paidBy === currentUser.id || effectiveSplits.some(s => s.userId === currentUser.id && s.amount > 0);
    if (!currentUserParticipates) {
      setValidationError("Solo puedes anotar movimientos en los que tú participas (como quien pagó o como beneficiario).");
      return;
    }

    // Validación de suma de partes
    const sumSplits = round2(effectiveSplits.reduce((acc, s) => acc + s.amount, 0));
    if (Math.abs(sumSplits - round2(numAmount)) > 0.05) {
      setValidationError(`La suma de las partes es ${formatMoney(sumSplits, currency)} y el total es ${formatMoney(numAmount, currency)}. Revisa los montos para que cuadren.`);
      return;
    }

    // FASE 2: Comprobación de duplicados
    const draft = buildMovementDraft();
    if (!duplicateWarningDismissed) {
      const dupCheck = dataService.checkDuplicate(draft);
      if (dupCheck.isDuplicate) {
        setDuplicateMovement(dupCheck.duplicateMovement);
        setIsDuplicateModalOpen(true);
        return;
      }
    }

    setStep("confirm");
  };

  const handleConfirmAsDifferent = () => {
    setDuplicateWarningDismissed(true);
    setIsDuplicateModalOpen(false);
    setStep("confirm");
  };

  const handleFinalSave = () => {
    const draft = buildMovementDraft();
    onSave(draft);
  };

  // Texto del resumen en lenguaje natural
  const summaryText = generateMovementSummaryText(
    {
      amount: parseFloat(amount) || 0,
      currency,
      paidBy,
      note: note || CATEGORIES_LIST.find(c => c.id === category)?.label,
      splits: effectiveSplits,
      type: isLoan ? "prestamo" : "gasto_compartido"
    },
    currentUser.id,
    membersMap
  );
  return (
    <>
      <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <div 
          className="modal-sheet" 
          onClick={e => e.stopPropagation()}
          style={{ padding: "1.5rem", maxWidth: "600px" }}
        >
          {/* Encabezado del diálogo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>
                {step === "form" ? "Anotar en la libreta" : "Revisar antes de guardar"}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {step === "form" ? "Responde rápido: ¿quién pagó?, ¿cuánto? y ¿para quién?" : "Verifica que el resumen exprese exactamente lo que pasó"}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="btn btn-tonal"
              style={{ minHeight: "40px", padding: "0.4rem", borderRadius: "50%" }}
              aria-label="Cerrar"
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Alertas de Validación */}
          {validationError && (
            <div style={{
              backgroundColor: "var(--balance-pendiente-bg)",
              color: "var(--balance-pendiente-text)",
              border: "1.5px solid var(--balance-pendiente-border)",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              fontSize: "0.9rem",
              fontWeight: 700
            }}>
              ⚠️ {validationError}
            </div>
          )}

          {step === "form" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* 1. Categoría */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  ¿Qué tipo de gasto o movimiento es?
                </label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(105px, 1fr))",
                  gap: "0.5rem"
                }}>
                  {CATEGORIES_LIST.map(cat => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`btn ${isSelected ? "btn-primary" : "btn-tonal"}`}
                        style={{
                          flexDirection: "column",
                          padding: "0.6rem 0.4rem",
                          minHeight: "68px",
                          gap: "0.25rem",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.8rem",
                          fontWeight: 700
                        }}
                      >
                        <span style={{ fontSize: "1.25rem" }}>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Monto y Moneda */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                  ¿Cuánto fue en total?
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <div style={{ display: "flex", border: "2px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden", backgroundColor: "var(--bg-surface)" }}>
                    <button
                      type="button"
                      onClick={() => setCurrency("GTQ")}
                      style={{
                        padding: "0 0.85rem",
                        fontWeight: 800,
                        fontSize: "1rem",
                        backgroundColor: currency === "GTQ" ? "var(--primary)" : "transparent",
                        color: currency === "GTQ" ? "#FFFFFF" : "var(--text-primary)",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      Q (GTQ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency("USD")}
                      style={{
                        padding: "0 0.85rem",
                        fontWeight: 800,
                        fontSize: "1rem",
                        backgroundColor: currency === "USD" ? "var(--primary)" : "transparent",
                        color: currency === "USD" ? "#FFFFFF" : "var(--text-primary)",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      US$
                    </button>
                  </div>

                  <input
                    ref={amountInputRef}
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="input"
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      letterSpacing: "0.02em"
                    }}
                    required
                  />
                </div>
              </div>

              {/* 3. Quién pagó */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                  ¿Quién lo pagó?
                </label>
                <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.3rem" }}>
                  {members.map(member => {
                    const isSelected = paidBy === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setPaidBy(member.id)}
                        className="btn"
                        style={{
                          flex: "1 0 auto",
                          padding: "0.5rem 0.85rem",
                          backgroundColor: isSelected ? "var(--primary)" : "var(--bg-surface)",
                          color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                          border: isSelected ? "2px solid var(--border-color)" : "1.5px solid var(--border-subtle)"
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>{member.avatar}</span>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                          {member.id === currentUser.id ? "Yo (" + member.name + ")" : member.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              
              {/* FASE 3: FECHA ACORDADA EN PRÉSTAMOS */}
              {isLoan && (
                <div style={{
                  backgroundColor: "var(--bg-surface-variant)",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-md)"
                }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                    📅 Fecha acordada de devolución (opcional):
                  </label>
                  <input
                    type="date"
                    value={agreedDate}
                    onChange={e => setAgreedDate(e.target.value)}
                    className="input"
                    style={{ minHeight: "42px" }}
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                    Para recordar amablemente cuándo acordaron devolver el dinero, sin presiones ni cobros.
                  </p>
                </div>
              )}

              {/* 4. Para quién */} 
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                    {isLoan ? "¿A quién le prestó el dinero?" : "¿Para quiénes fue el gasto?"}
                  </label>
                  {!isLoan && (
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={includePayerInSplit}
                        onChange={e => setIncludePayerInSplit(e.target.checked)}
                        style={{ accentColor: "var(--primary)" }}
                      />
                      <span>{membersMap[paidBy]?.name || "El que pagó"} también participó</span>
                    </label>
                  )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {members.map(member => {
                    const isSelected = selectedBeneficiaryIds.includes(member.id);
                    const splitItem = effectiveSplits.find(s => s.userId === member.id);

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleBeneficiary(member.id)}
                        className="btn"
                        style={{
                          flex: "1 1 120px",
                          minHeight: "54px",
                          padding: "0.5rem 0.75rem",
                          backgroundColor: isSelected ? "var(--balance-favor-bg)" : "var(--bg-surface)",
                          color: isSelected ? "var(--balance-favor-text)" : "var(--text-muted)",
                          border: isSelected ? "2px solid var(--balance-favor-border)" : "1.5px solid var(--border-subtle)",
                          justifyContent: "space-between"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontSize: "1.3rem" }}>{member.avatar}</span>
                          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{member.name}</span>
                        </div>
                        {splitItem && (
                          <span style={{ fontWeight: 800, fontSize: "0.85rem" }}>
                            {formatMoney(splitItem.amount, currency)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Botón "Más detalles" */}
              <div style={{ borderTop: "1.5px solid var(--border-subtle)", paddingTop: "0.85rem" }}>
                <button
                  type="button"
                  onClick={() => setShowMoreDetails(!showMoreDetails)}
                  className="btn btn-tonal"
                  style={{ width: "100%", justifyContent: "center", minHeight: "44px" }}
                >
                  <span>{showMoreDetails ? "▲ Menos detalles" : "▼ Más detalles (foto comprobante, repetir cada mes, fecha)"}</span>
                </button>

                {showMoreDetails && (
                  <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Nota */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                        Nota o descripción:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Pizza familiar, gasolina de la moto, súper..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        className="input"
                      />
                    </div>

                    {/* Fecha */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                        Fecha:
                      </label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => setDate(new Date().toISOString().split("T")[0])}
                          className="btn btn-tonal"
                          style={{ flex: 1, minHeight: "42px", fontSize: "0.85rem" }}
                        >
                          Hoy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const y = new Date(Date.now() - 86400000).toISOString().split("T")[0];
                            setDate(y);
                          }}
                          className="btn btn-tonal"
                          style={{ flex: 1, minHeight: "42px", fontSize: "0.85rem" }}
                        >
                          Ayer
                        </button>
                        <input
                          type="date"
                          value={date}
                          onChange={e => setDate(e.target.value)}
                          className="input"
                          style={{ flex: 1.5, minHeight: "42px", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>

                    {/* FASE 2: FOTO DEL COMPROBANTE */}
                    <div style={{
                      backgroundColor: "var(--bg-surface-variant)",
                      padding: "0.9rem",
                      borderRadius: "var(--radius-md)"
                    }}>
                      <label style={{ display: "block", fontWeight: 800, fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                        📷 Foto del comprobante o factura (Fase 2):
                      </label>
                      
                      {receiptImage ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <img 
                            src={receiptImage} 
                            alt="Comprobante" 
                            style={{ 
                              width: "70px", 
                              height: "70px", 
                              objectFit: "cover", 
                              borderRadius: "var(--radius-md)",
                              border: "2px solid var(--border-color)" 
                            }} 
                          />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                              ✓ Foto adjunta lista
                            </span>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              Comprimida automáticamente para no gastar datos
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptImage(null)}
                            className="btn btn-tonal"
                            style={{ padding: "0.4rem 0.6rem", color: "#EF4444" }}
                            title="Quitar foto"
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoUpload}
                            style={{ display: "none" }}
                            id="anotar-photo-input"
                          />
                          <label
                            htmlFor="anotar-photo-input"
                            className="btn btn-outline"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              cursor: "pointer",
                              padding: "0.5rem 0.85rem",
                              fontSize: "0.85rem",
                              fontWeight: 700
                            }}
                          >
                            <IconCamera size={18} />
                            <span>{isCompressingImage ? "Comprimiendo..." : "Tomar foto o subir comprobante"}</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* FASE 2: GASTO QUE SE REPITE CADA MES */}
                    <div style={{
                      backgroundColor: "var(--bg-surface-variant)",
                      padding: "0.9rem",
                      borderRadius: "var(--radius-md)"
                    }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isRecurring}
                          onChange={e => setIsRecurring(e.target.checked)}
                          style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <IconRepeat size={16} />
                          <span>Es un gasto que se repite cada mes (plataforma o servicio)</span>
                        </div>
                      </label>

                      {isRecurring && (
                        <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem", paddingLeft: "1.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Día del mes que se anota:</span>
                            <input
                              type="number"
                              min="1"
                              max="31"
                              value={recurringDay}
                              onChange={e => setRecurringDay(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                              className="input"
                              style={{ width: "70px", textAlign: "center", padding: "0.3rem" }}
                            />
                          </div>

                          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={alternatePayer}
                              onChange={e => setAlternatePayer(e.target.checked)}
                              style={{ accentColor: "var(--primary)" }}
                            />
                            <span>Alternar quién paga cada mes (un mes uno, otro mes el otro)</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* División en montos distintos */}
                    <div style={{
                      backgroundColor: "var(--bg-surface-variant)",
                      padding: "0.85rem",
                      borderRadius: "var(--radius-md)"
                    }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "0.85rem", marginBottom: "0.5rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={useCustomSplits}
                          onChange={e => setUseCustomSplits(e.target.checked)}
                          style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                        />
                        <span>Dividir en montos distintos (no iguales)</span>
                      </label>

                      {useCustomSplits && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                          {selectedBeneficiaryIds.map(userId => (
                            <div key={userId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                              <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                                {membersMap[userId]?.avatar} {membersMap[userId]?.name}:
                              </span>
                              <div style={{ width: "130px" }}>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={customSplits[userId] || ""}
                                  onChange={e => setCustomSplits({ ...customSplits, [userId]: e.target.value })}
                                  className="input"
                                  style={{ minHeight: "40px", textAlign: "right" }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Siguiente / Continuar a confirmación */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProceedToConfirm}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  <span>Revisar antes de guardar</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          ) : (
            /* PASO 2: RESUMEN EN LENGUAJE NATURAL ANTES DE GUARDAR */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "center", padding: "1rem 0" }}>
              <div style={{
                backgroundColor: "var(--balance-favor-bg)",
                border: "2px solid var(--balance-favor-border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                textAlign: "left"
              }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--balance-favor-text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Resumen del movimiento
                </span>
                <p style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "var(--balance-favor-text)",
                  marginTop: "0.6rem",
                  lineHeight: 1.4
                }}>
                  {summaryText}
                </p>
                {receiptImage && (
                  <p style={{ fontSize: "0.85rem", color: "var(--balance-favor-text)", marginTop: "0.5rem", fontWeight: 700 }}>
                    📷 Incluye comprobante fotográfico adjunto
                  </p>
                )}
                {isRecurring && (
                  <p style={{ fontSize: "0.85rem", color: "var(--balance-favor-text)", marginTop: "0.3rem", fontWeight: 700 }}>
                    🔄 Configurado para repetirse el día {recurringDay} de cada mes
                  </p>
                )}
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.85rem 1rem",
                backgroundColor: "var(--bg-surface-variant)",
                borderRadius: "var(--radius-md)"
              }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 600 }}>Total anotado:</span>
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  {formatMoney(parseFloat(amount) || 0, currency)}
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="btn btn-outline"
                  style={{ flex: 1, minHeight: "52px" }}
                >
                  Cambiar algo
                </button>
                <button
                  type="button"
                  onClick={handleFinalSave}
                  className="btn btn-primary"
                  style={{ flex: 1.5, minHeight: "52px", fontSize: "1.1rem" }}
                >
                  <IconCheck size={22} />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Advertencia de Duplicado (Fase 2) */}
      <DuplicateWarningModal
        isOpen={isDuplicateModalOpen}
        onClose={() => {
          setIsDuplicateModalOpen(false);
          onClose();
        }}
        onConfirmAsDifferent={handleConfirmAsDifferent}
        duplicateMovement={duplicateMovement}
        membersMap={membersMap}
      />
    </>
  );
};
