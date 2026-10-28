import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { IconSun, IconMoon, IconType } from "./Icons";

export const FamilyMemberSwitcher = () => {
  const { currentUser, members, switchMember, toggleSimpleMode, resetAllData } = useAuth();
  const { theme, toggleTheme, cycleFontSize, fontSize } = useTheme();

  return (
    <aside aria-label="Selector de familiar para pruebas" className="tester-bar">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>
          👤 Persona activa:
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "nowrap" }}>
        {members.map(member => {
          const isActive = member.id === currentUser?.id;
          return (
            <button
              key={member.id}
              onClick={() => switchMember(member.id)}
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
                boxShadow: isActive ? "var(--shadow-sm)" : "none"
              }}
              title={`Ver la app como ${member.fullName}`}
            >
              <span>{member.avatar}</span>
              <span>{member.name}</span>
              {member.simpleMode && <span style={{ fontSize: "0.7rem", opacity: 0.9 }}>🌸</span>}
            </button>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
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
          <span>{currentUser?.simpleMode ? "🌸 Modo sencillo: SÍ" : "⚙️ Modo sencillo: NO"}</span>
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
            if (window.confirm("¿Deseas reiniciar a los 7 movimientos de prueba de la familia García?")) {
              resetAllData();
            }
          }}
          className="btn btn-tonal"
          style={{ minHeight: "36px", padding: "0.25rem 0.65rem", fontSize: "0.8rem", color: "var(--text-muted)" }}
          title="Reiniciar datos iniciales"
        >
          🔄 Reiniciar datos
        </button>
      </div>
    </aside>
  );
};
