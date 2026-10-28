import React from "react";
import { 
  IconHome, 
  IconPlus, 
  IconCheckSquare, 
  IconRepeat, 
  IconScale, 
  IconUser,
  IconShare
} from "./Icons";
import { useAuth } from "../context/AuthContext";

export const Sidebar = ({ currentTab, onSelectTab, onOpenAnotar, pendingReviewCount = 0 }) => {
  const { currentUser, currentFamily } = useAuth();
  const isSimple = currentUser?.simpleMode;

  return (
    <aside className="sidebar">
      {/* Encabezado con Nombre de la App y Familia */}
      <div style={{ padding: "0.5rem 0.5rem 1rem 0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
          <span style={{ fontSize: "1.75rem" }}>📖</span>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Cuentas Claras
          </h1>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
          {currentFamily?.name || "Familia"}
        </p>
      </div>

      {/* Botón "+ Anotar" Destacado */}
      <button 
        onClick={onOpenAnotar}
        className="btn btn-anotar"
        style={{ width: "100%", justifyContent: "center" }}
      >
        <IconPlus size={22} />
        <span>+ Anotar</span>
      </button>

      {/* Navegación Principal */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem", flex: 1 }}>
        <button
          onClick={() => onSelectTab("inicio")}
          className={`sidebar-nav-item ${currentTab === "inicio" ? "active" : ""}`}
        >
          <IconHome size={22} />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => onSelectTab("por_revisar")}
          className={`sidebar-nav-item ${currentTab === "por_revisar" ? "active" : ""}`}
        >
          <IconCheckSquare size={22} />
          <span style={{ flex: 1 }}>Por revisar</span>
          {pendingReviewCount > 0 && (
            <span style={{
              backgroundColor: "var(--badge-sin-confirmar-bg)",
              color: "var(--badge-sin-confirmar-text)",
              padding: "0.15rem 0.6rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: 800
            }}>
              {pendingReviewCount}
            </span>
          )}
        </button>

        {/* En Modo Sencillo, se ocultan Gastos repetidos y Cuadres avanzados */}
        {!isSimple && (
          <>
            <button
              onClick={() => onSelectTab("gastos_repetidos")}
              className={`sidebar-nav-item ${currentTab === "gastos_repetidos" ? "active" : ""}`}
            >
              <IconRepeat size={22} />
              <span>Gastos que se repiten</span>
            </button>

            <button
              onClick={() => onSelectTab("cuadres")}
              className={`sidebar-nav-item ${currentTab === "cuadres" ? "active" : ""}`}
            >
              <IconScale size={22} />
              <span>Cuadres</span>
            </button>
          </>
        )}

        <button
          onClick={() => onSelectTab("mi_cuenta")}
          className={`sidebar-nav-item ${currentTab === "mi_cuenta" ? "active" : ""}`}
        >
          <IconUser size={22} />
          <span>Mi cuenta</span>
        </button>
      </nav>

      {/* Perfil del Usuario Activo */}
      <div 
        onClick={() => onSelectTab("mi_cuenta")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.75rem",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--bg-surface-variant)",
          cursor: "pointer",
          border: "1.5px solid var(--border-subtle)"
        }}
      >
        <div className="avatar" style={{ backgroundColor: currentUser?.color }}>
          {currentUser?.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentUser?.name}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {currentUser?.simpleMode ? "🌸 Modo sencillo activo" : "Configurar perfil"}
          </div>
        </div>
      </div>
    </aside>
  );
};
