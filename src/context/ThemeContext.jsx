import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cuentas_claras_theme") || "light";
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("cuentas_claras_font_size") || "normal";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cuentas_claras_theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", fontSize);
    localStorage.setItem("cuentas_claras_font_size", fontSize);
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const cycleFontSize = () => {
    setFontSize(prev => {
      if (prev === "normal") return "large";
      if (prev === "large") return "xlarge";
      return "normal";
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        fontSize,
        setFontSize,
        cycleFontSize
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
