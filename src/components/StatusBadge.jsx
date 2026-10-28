import React from "react";

export const StatusBadge = ({ status = "sin_confirmar" }) => {
  const configs = {
    sin_confirmar: {
      text: "Sin confirmar",
      className: "badge badge-sin_confirmar",
      icon: "⏳"
    },
    confirmado: {
      text: "Confirmado",
      className: "badge badge-confirmado",
      icon: "✓"
    },
    en_revision: {
      text: "En revisión",
      className: "badge badge-en_revision",
      icon: "💬"
    },
    quitado: {
      text: "Quitado",
      className: "badge badge-quitado",
      icon: "✕"
    },
    por_enviar: {
      text: "Por enviar",
      className: "badge badge-por_enviar",
      icon: "📡"
    },
    visto_sin_respuesta: {
      text: "Visto sin respuesta",
      className: "badge badge-sin_confirmar",
      icon: "👁️"
    }
  };

  const config = configs[status] || configs.sin_confirmar;

  return (
    <span className={config.className}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
};
