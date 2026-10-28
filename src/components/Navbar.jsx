import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const Navbar = () => {
  const { currentUser, logout, selectDemoUser, DEMO_USERS } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      borderBottom: "var(--border-width) solid var(--border-color)",
      background: "var(--bg-card)",
      padding: "0.85rem 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "1rem"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{
          width: "42px",
          height: "42px",
          borderRadius: "10px",
          background: "var(--primary)",
          border: "2.5px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "3px 3px 0px var(--shadow-color)",
          fontSize: "1.4rem"
        }}>
          🏠
        </div>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "900", letterSpacing: "-0.02em" }}>
            Expense<span style={{ color: "var(--primary)" }}>Share</span>
          </h1>
          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)" }}>
            Control Colaborativo del Hogar
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        {/* Selector de Usuarios Demo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-muted)" }}>
            DEMO:
          </label>
          <select 
            className="input" 
            style={{ width: "auto", padding: "0.4rem 0.6rem", fontSize: "0.8rem", cursor: "pointer" }}
            value={currentUser?.isDemo ? currentUser.uid : ""}
            onChange={(e) => {
              const u = DEMO_USERS.find(user => user.id === e.target.value);
              if (u) selectDemoUser(u);
            }}
          >
            <option value="" disabled>Alternar perfil demo...</option>
            {DEMO_USERS.map(u => (
              <option key={u.id} value={u.id}>{u.avatar} {u.name} ({u.handle})</option>
            ))}
          </select>
        </div>

        {/* Conmutador de Tema */}
        <button 
          onClick={toggleTheme} 
          className="btn" 
          title="Cambiar tema"
          style={{ padding: "0.45rem 0.8rem", fontSize: "1.1rem" }}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {/* Perfil del Usuario Activo */}
        {currentUser && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "10px",
            border: "2px solid var(--border-color)",
            background: "var(--bg-primary)"
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "0.9rem"
            }}>
              {currentUser.avatar || currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: "800", lineHeight: "1.1" }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)" }}>
                {currentUser.handle}
              </div>
            </div>
            <button 
              onClick={logout} 
              className="btn btn-danger" 
              style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", marginLeft: "0.5rem" }}
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
