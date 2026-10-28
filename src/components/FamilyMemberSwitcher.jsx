import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { IconSun, IconMoon, IconType } from "./Icons";
import { PinModal } from "./PinModal";

export const FamilyMemberSwitcher = () => {
  const { currentUser, members, switchMember, lockProfile, toggleSimpleMode, resetAllData } = useAuth();
  const { theme, toggleTheme, cycleFontSize, fontSize } = useTheme();
  const [memberToUnlock, setMemberToUnlock] = useState(null);

  const handleMemberClick = (member) => {
    if (member.id === currentUser?.id) return;
    // Pedir PIN para cambiar a otra persona
    setMemberToUnlock(member);
  };

  const handlePinSuccess = (member) => {
    switchMember(member.id);
    setMemberToUnlock(null);
  };

  return (
    <aside aria-label="Selector de familiar y perfil" className="tester-bar">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text-muted)" }}>
          👤 Perfil activo:
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "nowrap" }}>
        {members.map(member => {
          const isActive = member.id === currentUser?.id;
          return (
            <button
              key={member.id}
              onClick={() => handleMemberClick(member)}
              className="btn btn-tonal"
              style={{
                minHeight: "38px",
                padding: "0.35rem 0.75rem",
                fontSize: "0.85rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: isActive ? member.color : "var(--bg-surface)",
                color: isActive ? "#FFFFFF" : "var(--text-primary)",
                border: isActive ? `2px solid ${member.color}` : "1.5px solid var(--border-subtle)",
                fontWeight: isActive ? 800 : 600,
                boxShadow: isActive ? "var(--shadow-sm)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
              title={isActive ? `Tu perfil actual (${member.fullName})` : `Cambiar a ${member.name} (requiere PIN 🔒)`}
            >
              <span>{member.avatar}</span>
              <span>{member.name}</span>
              {!isActive && <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>🔒</span>}
              {member.simpleMode && <span style={{ fontSize: "0.7rem", opacity: 0.9 }}>👵</span>}
            </button>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        {/* Botón Bloquear Perfil */}
        <button
          onClick={lockProfile}
          className="btn btn-tonal"
          style={{
            minHeight: "36px",
            padding: "0.25rem 0.75rem",
            fontSize: "0.8rem",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1.5px solid var(--border-subtle)",
            fontWeight: 700
          }}
          title="Bloquear perfil para que otra persona ingrese su PIN"
        >
          <span>🔒 Bloquear</span>
        </button>

        {/* Toggle Modo Sencillo */}
        <button
          onClick={toggleSimpleMode}
          className="btn btn-tonal"
          style={{
            minHeight: "36px",
            padding: "0.25rem 0.65rem",
            fontSize: "0.8rem",
            backgroundColor: currentUser?.simpleMode ? "var(--balance-favor-bg)" : "transparent",
            color: currentUser?.simpleMode ? "var(--balance-favor-text)" : "var(--text-muted)",
            border: "1px solid var(--border-subtle)"
          }}
          title="Modo sencillo para personas mayores o poco familiarizadas con tecnología"
        >
          <span>{currentUser?.simpleMode ? "👵 Modo sencillo: Sí" : "👵 Modo sencillo: NO"}</span>
        </button>

        {/* Tamaño de letra */}
        <button
          onClick={cycleFontSize}
          className="btn btn-tonal"
          style={{ minHeight: "36px", padding: "0.25rem 0.65rem", fontSize: "0.8rem" }}
          title={`Tamaño de letra: ${fontSize === "normal" ? "Normal" : fontSize === "large" ? "Grande" : "Muy grande"}`}
        >
          <IconType size={16} />
          <span>{fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++"}</span>
        </button>

        {/* Tema claro / oscuro */}
        <button
          onClick={toggleTheme}
          className="btn btn-tonal"
          style={{ minHeight: "36px", padding: "0.25rem 0.65rem", fontSize: "0.8rem" }}
          title={theme === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
        >
          {theme === "light" ? <IconMoon size={16} /> : <IconSun size={16} />}
        </button>

        {/* Restablecer datos iniciales */}
        <button
          onClick={() => {
            if (window.confirm("¿Deseas reiniciar a los datos iniciales de la Familia Agustín?")) {
              resetAllData();
            }
          }}
          className="btn btn-tonal"
          style={{ minHeight: "36px", padding: "0.25rem 0.65rem", fontSize: "0.8rem", color: "var(--text-muted)" }}
          title="Reiniciar datos iniciales"
        >
          🔄 Reiniciar
        </button>
      </div>

      {/* Modal de PIN para cambio de familiar */}
      <PinModal
        isOpen={!!memberToUnlock}
        member={memberToUnlock}
        onClose={() => setMemberToUnlock(null)}
        onSuccess={handlePinSuccess}
      />
    </aside>
  );
};
