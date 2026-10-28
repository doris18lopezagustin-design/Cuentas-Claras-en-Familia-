import React, { useState, useEffect, useRef } from "react";
import { dataService } from "../services/dataService";

export const PinModal = ({ 
  isOpen, 
  member, 
  onClose, 
  onSuccess,
  title = "Ingresar a tu perfil" 
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError("");
      setIsShaking(false);
      setIsSuccess(false);
      // Auto-focus en el campo de texto
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, member?.id]);

  const handleValidateAndSubmit = (pinToTest) => {
    const code = String(pinToTest || pin).trim();
    if (!code) {
      setError("Por favor escribe tu PIN de 4 dígitos.");
      return;
    }

    const isValid = dataService.verifyPin(member.id, code);
    if (isValid) {
      setIsSuccess(true);
      setError("");
      setTimeout(() => {
        onSuccess(member);
      }, 300);
    } else {
      setIsShaking(true);
      setError("PIN incorrecto. Intenta de nuevo (PIN inicial: 1234)");
      setTimeout(() => {
        setIsShaking(false);
        setPin("");
        if (inputRef.current) inputRef.current.focus();
      }, 600);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleValidateAndSubmit(pin);
  };

  const handleDigitPress = (digit) => {
    if (pin.length >= 4 || isSuccess) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError("");

    // Si completa los 4 dígitos, enfocar y validar
    if (nextPin.length === 4) {
      handleValidateAndSubmit(nextPin);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(prev => prev.slice(0, -1));
      setError("");
    }
  };

  const handleClear = () => {
    setPin("");
    setError("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleUseDefaultPin = () => {
    setPin("1234");
    handleValidateAndSubmit("1234");
  };

  if (!isOpen || !member) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem"
      }}
    >
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--bg-surface)",
          borderRadius: "var(--radius-xl)",
          padding: "1.75rem",
          boxShadow: "var(--shadow-xl)",
          border: "1.5px solid var(--border-subtle)",
          textAlign: "center"
        }}
      >
        <form onSubmit={handleFormSubmit}>
          {/* Avatar del Integrante */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: "0.5rem" }}>
            <div 
              className="avatar avatar-xl" 
              style={{ 
                backgroundColor: member.color || "#0D9488", 
                margin: "0 auto",
                width: "68px",
                height: "68px",
                fontSize: "2.1rem",
                border: `3px solid ${member.color || "#0D9488"}`
              }}
            >
              {member.avatar || "👤"}
            </div>
            <span 
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "50%",
                padding: "2px",
                fontSize: "1rem",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              🔒
            </span>
          </div>

          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Perfil de {member.name}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.15rem", marginBottom: "1rem" }}>
            Familia Agustín • Escribe tu PIN para entrar
          </p>

          {/* Campo de Entrada de PIN Visible con soporte para Enter */}
          <div style={{ marginBottom: "1rem", animation: isShaking ? "pinShake 0.4s ease-in-out" : "none" }}>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(val);
                setError("");
                if (val.length === 4) {
                  handleValidateAndSubmit(val);
                }
              }}
              placeholder="••••"
              className="input"
              style={{
                textAlign: "center",
                fontSize: "2rem",
                letterSpacing: "0.5em",
                fontWeight: 800,
                height: "56px",
                maxWidth: "240px",
                margin: "0 auto",
                backgroundColor: "var(--bg-surface-variant)",
                border: isShaking 
                  ? "2px solid #DC2626" 
                  : isSuccess 
                    ? "2px solid #059669" 
                    : "2px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                color: "var(--text-primary)"
              }}
              autoComplete="off"
            />
          </div>

          {/* Mensaje de Error o Éxito */}
          <div style={{ minHeight: "24px", marginBottom: "0.75rem" }}>
            {error && (
              <span style={{ fontSize: "0.85rem", color: "#DC2626", fontWeight: 700 }}>
                {error}
              </span>
            )}
            {isSuccess && (
              <span style={{ fontSize: "0.9rem", color: "#059669", fontWeight: 700 }}>
                ✓ PIN correcto. Accediendo...
              </span>
            )}
          </div>

          {/* BOTÓN PRINCIPAL PARA ENTRAR */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              minHeight: "50px",
              fontSize: "1.05rem",
              fontWeight: 800,
              borderRadius: "var(--radius-lg)",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <span>Entrar al perfil</span>
            <span>➔</span>
          </button>

          {/* Teclado Numérico Táctil */}
          <div 
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.5rem",
              maxWidth: "280px",
              margin: "0 auto 1rem auto"
            }}
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitPress(num)}
                className="btn btn-tonal"
                style={{
                  height: "50px",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-surface-variant)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)"
                }}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="btn btn-tonal"
              style={{
                height: "50px",
                fontSize: "0.8rem",
                fontWeight: 700,
                borderRadius: "var(--radius-md)",
                backgroundColor: "transparent",
                color: "var(--text-muted)"
              }}
              title="Borrar todo"
            >
              Borrar
            </button>

            <button
              type="button"
              onClick={() => handleDigitPress("0")}
              className="btn btn-tonal"
              style={{
                height: "50px",
                fontSize: "1.35rem",
                fontWeight: 700,
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-surface-variant)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)"
              }}
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-tonal"
              style={{
                height: "50px",
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: "var(--radius-md)",
                backgroundColor: "transparent",
                color: "var(--text-muted)"
              }}
              title="Borrar último dígito"
            >
              ⌫
            </button>
          </div>

          {/* Acceso Rápido con PIN por defecto 1234 */}
          <div style={{
            backgroundColor: "var(--bg-surface-variant)",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            marginBottom: "0.75rem"
          }}>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
              💡 PIN inicial por defecto: <strong>1234</strong>
            </p>
            <button
              type="button"
              onClick={handleUseDefaultPin}
              className="btn btn-tonal"
              style={{
                fontSize: "0.8rem",
                padding: "0.3rem 0.75rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                fontWeight: 700,
                color: "var(--primary)"
              }}
            >
              Usar PIN por defecto (1234) y entrar
            </button>
          </div>

          {/* Botón Cancelar */}
          <div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                padding: "0.35rem"
              }}
            >
              Elegir a otro familiar / Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
