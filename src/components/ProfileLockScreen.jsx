import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { PinModal } from "./PinModal";
import { IconMoon, IconSun } from "./Icons";

export const ProfileLockScreen = () => {
  const { members, currentFamily, unlockProfileWithPin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedMemberForPin, setSelectedMemberForPin] = useState(null);

  const handleMemberClick = (member) => {
    setSelectedMemberForPin(member);
  };

  const handlePinSuccess = (member) => {
    // Desbloquear sesión para este usuario
    unlockProfileWithPin(member.id, member.pin || "1234");
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
            ¿Quién está usando la app hoy? Toca tu perfil e ingresa tu PIN.
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

        {/* Nota informativa */}
        <div style={{
          backgroundColor: "var(--bg-surface-variant)",
          padding: "0.85rem 1.25rem",
          borderRadius: "var(--radius-lg)",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          border: "1px solid var(--border-subtle)"
        }}>
          🛡️ <strong>Seguridad por perfil:</strong> Cada integrante tiene su propio PIN de seguridad para que nadie más pueda ver sus saldos privados ni registrar movimientos en su nombre.
        </div>
      </div>

      {/* Modal de PIN para ingresar */}
      <PinModal
        isOpen={!!selectedMemberForPin}
        member={selectedMemberForPin}
        onClose={() => setSelectedMemberForPin(null)}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
};
