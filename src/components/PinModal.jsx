import React, { useState, useEffect, useCallback } from "react";
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
  const [showForgotTip, setShowForgotTip] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError("");
      setIsShaking(false);
      setIsSuccess(false);
      setShowForgotTip(false);
    }
  }, [isOpen, member?.id]);

  const handleDigit = useCallback((digit) => {
    if (pin.length >= 4 || isSuccess) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError("");

    if (nextPin.length === 4) {
      const isValid = dataService.verifyPin(member.id, nextPin);
      if (isValid) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess(member);
        }, 300);
      } else {
        setIsShaking(true);
        setError("PIN incorrecto. Intenta de nuevo.");
        setTimeout(() => {
          setIsShaking(false);
          setPin("");
        }, 600);
      }
    }
  }, [pin, isSuccess, member, onSuccess]);

  const handleDelete = useCallback(() => {
    if (pin.length > 0) {
      setPin(prev => prev.slice(0, -1));
      setError("");
    }
  }, [pin]);

  const handleClear = useCallback(() => {
    setPin("");
    setError("");
  }, []);

  // Escuchar teclado físico
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleDigit, handleDelete, onClose]);

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
          maxWidth: "380px",
          backgroundColor: "var(--bg-surface)",
          borderRadius: "var(--radius-xl)",
          padding: "1.75rem",
          boxShadow: "var(--shadow-xl)",
          border: "1.5px solid var(--border-subtle)",
          textAlign: "center"
        }}
      >
        {/* Encabezado y Avatar */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: "0.75rem" }}>
          <div 
            className="avatar avatar-xl" 
            style={{ 
              backgroundColor: member.color || "#0D9488", 
              margin: "0 auto",
              width: "72px",
              height: "72px",
              fontSize: "2.2rem",
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
          {member.name}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
          Familia Agustín • Ingresa tu PIN de 4 dígitos
        </p>

        {/* Puntos Indicadores del PIN */}
        <div 
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            margin: "1.5rem 0 1rem 0",
            animation: isShaking ? "pinShake 0.4s ease-in-out" : "none"
          }}
        >
          {[0, 1, 2, 3].map(index => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: isShaking 
                    ? "2px solid #DC2626" 
                    : isSuccess 
                      ? "2px solid #059669" 
                      : isFilled 
                        ? `2px solid ${member.color || "var(--primary)"}` 
                        : "2px solid var(--border-subtle)",
                  backgroundColor: isShaking 
                    ? "#DC2626" 
                    : isSuccess 
                      ? "#059669" 
                      : isFilled 
                        ? (member.color || "var(--primary)") 
                        : "transparent",
                  transition: "all 0.15s ease",
                  transform: isFilled ? "scale(1.15)" : "scale(1)"
                }}
              />
            );
          })}
        </div>

        {/* Mensaje de Error o Éxito */}
        <div style={{ minHeight: "24px", marginBottom: "0.75rem" }}>
          {error && (
            <span style={{ fontSize: "0.85rem", color: "#DC2626", fontWeight: 700 }}>
              {error}
            </span>
          )}
          {isSuccess && (
            <span style={{ fontSize: "0.85rem", color: "#059669", fontWeight: 700 }}>
              ✓ PIN correcto. Accediendo...
            </span>
          )}
        </div>

        {/* Teclado Numérico Táctil */}
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.6rem",
            maxWidth: "280px",
            margin: "0 auto 1.25rem auto"
          }}
        >
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="btn btn-tonal"
              style={{
                height: "56px",
                fontSize: "1.45rem",
                fontWeight: 700,
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--bg-surface-variant)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)"
              }}
            >
              {num}
            </button>
          ))}

          {/* Botón Borrar Todo */}
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-tonal"
            style={{
              height: "56px",
              fontSize: "0.85rem",
              fontWeight: 700,
              borderRadius: "var(--radius-lg)",
              backgroundColor: "transparent",
              color: "var(--text-muted)"
            }}
            title="Borrar todo"
          >
            Borrar
          </button>

          {/* Botón 0 */}
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="btn btn-tonal"
            style={{
              height: "56px",
              fontSize: "1.45rem",
              fontWeight: 700,
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--bg-surface-variant)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)"
            }}
          >
            0
          </button>

          {/* Botón Retroceso */}
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-tonal"
            style={{
              height: "56px",
              fontSize: "1.2rem",
              fontWeight: 700,
              borderRadius: "var(--radius-lg)",
              backgroundColor: "transparent",
              color: "var(--text-muted)"
            }}
            title="Borrar último"
          >
            ⌫
          </button>
        </div>

        {/* Ayuda y Recordatorio del PIN */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            💡 PIN inicial por defecto: <strong>1234</strong>
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setShowForgotTip(!showForgotTip)}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                padding: "0.25rem"
              }}
            >
              ¿Olvidaste tu PIN?
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                padding: "0.25rem"
              }}
            >
              Cancelar
            </button>
          </div>

          {showForgotTip && (
            <div style={{
              backgroundColor: "var(--bg-surface-variant)",
              padding: "0.6rem 0.75rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              marginTop: "0.5rem",
              textAlign: "left"
            }}>
              Si no lo has cambiado, tu PIN es <strong>1234</strong>. Puedes cambiarlo en cualquier momento desde la sección <strong>Mi Cuenta</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
