import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { IconCheck, IconShare, IconUser } from "../components/Icons";
import { PinModal } from "../components/PinModal";

export const AuthPage = () => {
  const { members, switchMember, loginWithGoogle, loginWithEmailCode, joinFamilyByCode } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [selectedMemberForPin, setSelectedMemberForPin] = useState(null);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    const user = loginWithEmailCode(email, name || "Familiar");
    if (user) {
      setMessage(`¡Bienvenido/a, ${user.name}!`);
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMemberForPin(member);
  };

  const handlePinSuccess = (member) => {
    switchMember(member.id);
    setSelectedMemberForPin(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      backgroundColor: "var(--bg-app)"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "520px",
        backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--radius-xl)",
        padding: "2rem",
        border: "1.5px solid var(--border-subtle)",
        boxShadow: "var(--shadow-lg)"
      }}>
        {/* Encabezado */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <span style={{ fontSize: "3rem" }}>📖</span>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.5rem", letterSpacing: "-0.02em" }}>
            Cuentas Claras en Familia
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
            La libreta compartida para que la <strong>Familia Agustín</strong> anote gastos y préstamos sin enredos.
          </p>
        </div>

        {/* Acceso por Perfil de la Familia Agustín */}
        <div style={{
          backgroundColor: "var(--bg-surface-variant)",
          padding: "1.25rem",
          borderRadius: "var(--radius-lg)",
          marginBottom: "1.5rem"
        }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.75rem" }}>
            🔒 Elige tu perfil (requiere PIN):
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {members.map(member => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleMemberClick(member)}
                className="btn btn-tonal"
                style={{
                  justifyContent: "flex-start",
                  minHeight: "52px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1.5px solid var(--border-subtle)",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>{member.avatar}</span>
                <span style={{ fontWeight: 800, fontSize: "1rem" }}>
                  Entrar como {member.name} {member.simpleMode ? "(Modo sencillo 👵)" : ""}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  🔒
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* O entrar con cuenta propia */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            type="button"
            onClick={loginWithGoogle}
            className="btn btn-tonal"
            style={{ width: "100%", justifyContent: "center", minHeight: "50px" }}
          >
            <span>🌐 Entrar con mi cuenta de Google</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>o por correo</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
          </div>

          <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              type="email"
              placeholder="Escribe tu correo..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              required
            />
            {isNewUser && (
              <input
                type="text"
                placeholder="Tu nombre corto (ej. Mamá, Carlos)..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                required
              />
            )}
            <button type="submit" className="btn btn-primary" style={{ width: "100%", minHeight: "50px" }}>
              <span>Entrar sin contraseña</span>
            </button>
          </form>
        </div>
      </div>

      {/* Modal de PIN para ingresar desde AuthPage */}
      <PinModal
        isOpen={!!selectedMemberForPin}
        member={selectedMemberForPin}
        onClose={() => setSelectedMemberForPin(null)}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
};
