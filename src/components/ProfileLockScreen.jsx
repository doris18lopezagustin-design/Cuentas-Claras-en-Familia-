import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { PinModal } from "./PinModal";
import { IconMoon, IconSun } from "./Icons";

export const ProfileLockScreen = () => {
  const { members, currentFamily, switchMember } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedMemberForPin, setSelectedMemberForPin] = useState(null);

  const handleMemberClick = (member) => {
    setSelectedMemberForPin(member);
  };

  const handlePinSuccess = (member) => {
    // Entrar inmediatamente al perfil
    switchMember(member.id);
    setSelectedMemberForPin(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      backgroundColor: "var(--bg-app)",
      position: "relative"
    }}>
      {/* Botón de tema en la esquina */}
      <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem" }}>
        <button
          onClick={toggleTheme}
          className="btn btn-tonal"
          style={{ width: "42px", height: "42px", borderRadius: "50%", padding: 0 }}
          title={theme === "light" ? "Tema oscuro" : "Tema claro"}
        >
          {theme === "light" ? <IconMoon size={18} /> : <IconSun size={18} />}
        </button>
      </div>

      <div style={{
        width: "100%",
        maxWidth: "540px",
        textAlign: "center"
      }}>
        {/* Encabezado */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "68px",
            height: "68px",
            borderRadius: "22px",
            backgroundColor: "var(--primary-light)",
            color: "var(--primary-text)",
            fontSize: "2.4rem",
            marginBottom: "1rem",
            boxShadow: "var(--shadow-sm)"
          }}>
            📖
          </div>
          <h1 style={{
            fontSize: "1.85rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em"
          }}>
            Cuentas Claras en Familia
          </h1>
          <p style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "var(--primary)",
            marginTop: "0.25rem"
          }}>
            {currentFamily?.name || "Familia Agustín"}
          </p>
          <p style={{
            fontSize: "0.95rem",
            color: "var(--text-secondary)",
            marginTop: "0.4rem"
          }}>
            Toca tu nombre para entrar a tu perfil
          </p>
        </div>

        {/* Tarjetas de Miembros de la Familia */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
          {members.map(member => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleMemberClick(member)}
              className="btn btn-tonal"
              style={{
                flexDirection: "column",
                padding: "1.5rem 1rem",
                borderRadius: "var(--radius-xl)",
                backgroundColor: "var(--bg-surface)",
                border: "2px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.2s ease",
                cursor: "pointer",
                height: "auto",
                minHeight: "150px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = member.color;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                <div
                  className="avatar avatar-lg"
                  style={{
                    backgroundColor: member.color,
                    width: "60px",
                    height: "60px",
                    fontSize: "1.85rem",
                    border: `2.5px solid ${member.color}`
                  }}
                >
                  {member.avatar}
                </div>
                <span style={{
                  position: "absolute",
                  bottom: "-4px",
                  right: "-4px",
                  backgroundColor: "var(--bg-surface)",
                  borderRadius: "50%",
                  padding: "2px",
                  fontSize: "0.9rem",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  🔒
                </span>
              </div>

              <span style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "var(--text-primary)"
              }}>
                {member.name}
              </span>

              <span style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginTop: "0.2rem"
              }}>
                {member.simpleMode ? "Modo sencillo 👵" : "Perfil protegido"}
              </span>
            </button>
          ))}
        </div>

        {/* Botón directo de entrar como Mamá si alguien tiene prisa */}
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => switchMember("user-mama")}
            className="btn btn-tonal"
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--bg-surface)",
              border: "1.5px solid var(--border-subtle)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--text-secondary)"
            }}
          >
            ⚡ Entrar directamente como Mamá
          </button>
        </div>

        <div style={{
          backgroundColor: "var(--bg-surface-variant)",
          padding: "0.85rem 1.25rem",
          borderRadius: "var(--radius-lg)",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          border: "1px solid var(--border-subtle)"
        }}>
          🛡️ <strong>Seguridad por perfil:</strong> Cada integrante cuenta con su PIN para proteger sus saldos y movimientos.
        </div>
      </div>

      {/* Modal de PIN */}
      <PinModal
        isOpen={!!selectedMemberForPin}
        member={selectedMemberForPin}
        onClose={() => setSelectedMemberForPin(null)}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
};
