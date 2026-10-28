import React from "react";
import { IconHome, IconPlus, IconCheckSquare, IconUser } from "./Icons";

export const BottomNav = ({ currentTab, onSelectTab, onOpenAnotar, pendingReviewCount = 0 }) => {
  return (
    <nav className="bottom-nav">
      <button
        onClick={() => onSelectTab("inicio")}
        className={`bottom-nav-item ${currentTab === "inicio" ? "active" : ""}`}
      >
        <IconHome size={22} />
        <span>Inicio</span>
      </button>

      <button
        onClick={() => onSelectTab("por_revisar")}
        className={`bottom-nav-item ${currentTab === "por_revisar" ? "active" : ""}`}
        style={{ position: "relative" }}
      >
        <IconCheckSquare size={22} />
        <span>Por revisar</span>
        {pendingReviewCount > 0 && (
          <span style={{
            position: "absolute",
            top: "2px",
            right: "22%",
            backgroundColor: "var(--badge-sin-confirmar-text)",
            color: "#FFFFFF",
            fontSize: "0.65rem",
            fontWeight: 800,
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {pendingReviewCount}
          </span>
        )}
      </button>

      {/* Botón Central Grande "+ Anotar" */}
      <button
        onClick={onOpenAnotar}
        className="bottom-nav-anotar"
        aria-label="Anotar un movimiento nuevo"
      >
        <IconPlus size={28} />
      </button>

      <button
        onClick={() => onSelectTab("mi_cuenta")}
        className={`bottom-nav-item ${currentTab === "mi_cuenta" ? "active" : ""}`}
      >
        <IconUser size={22} />
        <span>Mi cuenta</span>
      </button>
    </nav>
  );
};
