import React, { useState } from "react";
import { IconX, IconWhatsApp, IconShare, IconCheck } from "./Icons";
import { useAuth } from "../context/AuthContext";

export const FamilyInviteModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { currentFamily, joinFamilyByCode } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  const inviteCode = currentFamily?.inviteCode || "FAM789";
  const familyName = currentFamily?.name || "Familia";

  // Enlace y mensaje de WhatsApp
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://cuentasclaras.gt";
  const whatsappText = encodeURIComponent(
    `¡Hola! 😊 Te invito a unirte a nuestra libreta de cuentas de la ${familyName} en Cuentas Claras.\n\nCódigo de familia: ${inviteCode}\n\nIngresa aquí: ${shareUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const res = joinFamilyByCode(joinCode);
    if (res.success) {
      setJoinMessage("¡Te has unido exitosamente a la familia!");
      setTimeout(() => {
        setJoinMessage("");
        onClose();
      }, 1500);
    } else {
      setJoinMessage(res.message || "Código no encontrado.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-sheet" 
        onClick={e => e.stopPropagation()}
        style={{ padding: "1.5rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>
            Invitar a la familia
          </h2>
          <button onClick={onClose} className="btn btn-tonal" style={{ minHeight: "40px", padding: "0.4rem", borderRadius: "50%" }}>
            <IconX size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Tarjeta de Código */}
          <div style={{
            backgroundColor: "var(--bg-surface-variant)",
            padding: "1.25rem",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
            border: "1.5px solid var(--border-subtle)"
          }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700 }}>
              Código de tu familia:
            </span>
            <div style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "var(--primary)",
              margin: "0.5rem 0"
            }}>
              {inviteCode}
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Comparte este código con cualquier miembro para que anoten juntos.
            </p>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-tonal"
                style={{ flex: 1, minHeight: "44px" }}
              >
                {copied ? <IconCheck size={18} /> : <IconShare size={18} />}
                <span>{copied ? "¡Copiado!" : "Copiar código"}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ flex: 1.5, minHeight: "44px", textDecoration: "none" }}
              >
                <IconWhatsApp size={20} />
                <span>Invitar por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Unirse a otra familia */}
          <div style={{ borderTop: "1.5px solid var(--border-subtle)", paddingTop: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              ¿Tienes un código de invitación?
            </h3>
            <form onSubmit={handleJoin} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="Ej. FAM789"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                className="input"
                style={{ flex: 1, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}
              />
              <button type="submit" className="btn btn-primary">
                Unirse
              </button>
            </form>
            {joinMessage && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>
                {joinMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
