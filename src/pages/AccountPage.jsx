import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  IconUser, 
  IconSun, 
  IconMoon, 
  IconType, 
  IconShare, 
  IconCheck, 
  IconHelp 
} from "../components/Icons";

const EMOJI_OPTIONS = ["👩", "👧", "👨", "👩‍🦰", "👧‍🦱", "👦", "👴", "👵", "👶", "🐶", "😺", "🧑‍💼"];
const COLOR_OPTIONS = [
  "#0D9488", // Teal
  "#4338CA", // Índigo
  "#059669", // Esmeralda
  "#2563EB", // Azul
  "#D97706", // Ámbar
  "#9333EA", // Púrpura
  "#DB2777", // Rosa
  "#0284C7"  // Celeste
];

export const AccountPage = ({ onOpenInviteModal }) => {
  const { currentUser, updateCurrentUser, logout, currentFamily, changeCurrentUserPin, lockProfile } = useAuth();
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [pinMessage, setPinMessage] = useState({ text: "", type: "" });
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  const [name, setName] = useState(currentUser?.name || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "👩");
  const [color, setColor] = useState(currentUser?.color || "#0D9488");
  const [simpleMode, setSimpleMode] = useState(!!currentUser?.simpleMode);
  const [savedMessage, setSavedMessage] = useState("");
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [showFaqGuide, setShowFaqGuide] = useState(false);

  
  const handleUpdatePin = (e) => {
    e.preventDefault();
    if (newPinInput !== confirmPinInput) {
      setPinMessage({ text: "Los 4 dígitos del nuevo PIN no coinciden.", type: "error" });
      return;
    }
    const res = changeCurrentUserPin(currentPinInput, newPinInput);
    if (res.success) {
      setPinMessage({ text: "✓ Tu nuevo PIN de seguridad ha sido guardado exitosamente.", type: "success" });
      setCurrentPinInput("");
      setNewPinInput("");
      setConfirmPinInput("");
      setTimeout(() => setPinMessage({ text: "", type: "" }), 3500);
    } else {
      setPinMessage({ text: res.error, type: "error" });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateCurrentUser({
      name: name.trim() || currentUser.name,
      avatar,
      color,
      simpleMode
    });
    setSavedMessage("Tus datos se guardaron correctamente.");
    setTimeout(() => setSavedMessage(""), 2500);
  };

  return (
    <div className="content-wrapper" style={{ maxWidth: "720px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.25rem" }}>
        Mi cuenta
      </h2>

      {savedMessage && (
        <div style={{
          backgroundColor: "var(--balance-favor-bg)",
          color: "var(--balance-favor-text)",
          border: "1.5px solid var(--balance-favor-border)",
          padding: "0.85rem 1rem",
          borderRadius: "var(--radius-md)",
          fontWeight: 700,
          marginBottom: "1rem"
        }}>
          ✓ {savedMessage}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Tarjeta de Perfil */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1rem" }}>
            Datos personales
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div className="avatar avatar-lg" style={{ backgroundColor: color }}>
              {avatar}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Nombre corto:
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                placeholder="Ej. Mamá, Ana, Luis..."
                required
              />
            </div>
          </div>

          {/* Selector de Emoji */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
              Elige tu avatar o emoji:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {EMOJI_OPTIONS.map(emo => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => setAvatar(emo)}
                  className="btn btn-tonal"
                  style={{
                    width: "44px",
                    height: "44px",
                    padding: 0,
                    fontSize: "1.4rem",
                    borderRadius: "50%",
                    border: avatar === emo ? "2.5px solid var(--primary)" : "1.5px solid var(--border-subtle)"
                  }}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Color */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
              Elige tu color distintivo:
            </label>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {COLOR_OPTIONS.map(col => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColor(col)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: col,
                    border: color === col ? "3px solid var(--text-primary)" : "none",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)"
                  }}
                  aria-label={`Color ${col}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Preferencias de Visualización */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1rem" }}>
            Apariencia y facilidad de uso
          </h3>

          {/* Modo sencillo */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem",
            backgroundColor: "var(--bg-surface-variant)",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem"
          }}>
            <div>
              <span style={{ fontSize: "1rem", fontWeight: 800, display: "block" }}>
                🌸 Modo sencillo (para mamá)
              </span>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                Oculta opciones avanzadas, usa letra grande y muestra solo tus saldos y un botón grande para anotar.
              </p>
            </div>
            <input
              type="checkbox"
              checked={simpleMode}
              onChange={e => setSimpleMode(e.target.checked)}
              style={{ width: "24px", height: "24px", accentColor: "var(--primary)", cursor: "pointer" }}
            />
          </div>

          {/* Tamaño de Letra */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
              Tamaño de letra:
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[
                { id: "normal", label: "Normal" },
                { id: "large", label: "Grande" },
                { id: "xlarge", label: "Muy grande" }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFontSize(opt.id)}
                  className="btn btn-tonal"
                  style={{
                    flex: 1,
                    backgroundColor: fontSize === opt.id ? "var(--primary)" : "var(--bg-surface-variant)",
                    color: fontSize === opt.id ? "#FFFFFF" : "var(--text-primary)",
                    fontWeight: 800
                  }}
                >
                  <IconType size={18} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tema Claro / Oscuro */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
              Tema visual:
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className="btn btn-tonal"
                style={{
                  flex: 1,
                  backgroundColor: theme === "light" ? "var(--primary)" : "var(--bg-surface-variant)",
                  color: theme === "light" ? "#FFFFFF" : "var(--text-primary)",
                  fontWeight: 800
                }}
              >
                <IconSun size={20} />
                <span>Tema Claro</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className="btn btn-tonal"
                style={{
                  flex: 1,
                  backgroundColor: theme === "dark" ? "var(--primary)" : "var(--bg-surface-variant)",
                  color: theme === "dark" ? "#FFFFFF" : "var(--text-primary)",
                  fontWeight: 800
                }}
              >
                <IconMoon size={20} />
                <span>Tema Oscuro</span>
              </button>
            </div>
          </div>
        </div>

        {/* Familia y Código de Invitación */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                {currentFamily?.name || "Familia"}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Código de invitación: <strong>{currentFamily?.inviteCode}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenInviteModal}
              className="btn btn-tonal"
            >
              <IconShare size={18} />
              <span>Invitar familiar</span>
            </button>
          </div>
        </div>

        {/* Guías Rápidas e Instalación */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1rem" }}>
            Ayuda e Instalación
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setShowFaqGuide(!showFaqGuide)}
              className="btn btn-tonal"
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <span>📖 Guía breve: ¿Cómo anoto y cómo confirmo?</span>
              <span>{showFaqGuide ? "▲" : "▼"}</span>
            </button>

            {showFaqGuide && (
              <div style={{
                backgroundColor: "var(--bg-surface-variant)",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.95rem",
                lineHeight: 1.6
              }}>
                <h4 style={{ fontWeight: 800, color: "var(--primary)" }}>¿Cómo anoto un movimiento?</h4>
                <p>1. Toca el botón verde <strong>+ Anotar</strong>.</p>
                <p>2. Elige qué pagaste (Pizza, Gasolina, etc.).</p>
                <p>3. Escribe el monto en quetzales o dólares.</p>
                <p>4. Toca las caras de las personas y dale a Guardar.</p>

                <h4 style={{ fontWeight: 800, color: "var(--primary)", marginTop: "1rem" }}>¿Cómo confirmo?</h4>
                <p>Ve a la pestaña <strong>Por revisar</strong>. Toca <strong>Está bien ✓</strong> si estás de acuerdo, o <strong>Corregir</strong> si algo no coincide.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPwaGuide(!showPwaGuide)}
              className="btn btn-tonal"
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <span>📲 Cómo instalar la app en tu teléfono o computadora</span>
              <span>{showPwaGuide ? "▲" : "▼"}</span>
            </button>

            {showPwaGuide && (
              <div style={{
                backgroundColor: "var(--bg-surface-variant)",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.95rem",
                lineHeight: 1.6
              }}>
                <h4 style={{ fontWeight: 800 }}>📱 En Android (Chrome / Edge):</h4>
                <p>Toca los tres puntos (⋮) arriba a la derecha y selecciona <strong>"Agregar a la pantalla principal"</strong> o <strong>"Instalar aplicación"</strong>.</p>

                <h4 style={{ fontWeight: 800, marginTop: "0.85rem" }}>🍎 En iPhone / iPad (Safari):</h4>
                <p>Toca el botón de Compartir (el cuadro con flecha hacia arriba) abajo en Safari y selecciona <strong>"Agregar al inicio"</strong>.</p>

                <h4 style={{ fontWeight: 800, marginTop: "0.85rem" }}>💻 En Computadora (Windows / Mac):</h4>
                <p>En Chrome o Edge, haz clic en el ícono de instalar (🖥️) en la barra de direcciones arriba a la derecha.</p>
              </div>
            )}
          </div>
        </div>

        {/* Botones Guardar y Cerrar Sesión */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 2, minHeight: "52px" }}
          >
            <IconCheck size={20} />
            <span>Guardar cambios</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="btn btn-outline"
            style={{ flex: 1, minHeight: "52px" }}
          >
            Cerrar sesión
          </button>
        </div>
      </form>
    </div>
  );
};
