import { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";

const ThemeContext = createContext();

export function useAppTheme() {
  return useContext(ThemeContext);
}

const lightTheme = {
  token: {
    colorPrimary: "#0d6efd",
    colorBgBase: "#ffffff",
    colorTextBase: "#111",
    colorBorder: "#d9d9d9",
  },
};

const darkTheme = {
  token: {
    colorPrimary: "#3b82f6",
    colorBgBase: "#0f172a",
    colorTextBase: "#e5e7eb",
    colorBorder: "#334155",
  },
};

export function AppThemeProvider({ children }) {
  const getSystemTheme = () =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const [mode, setMode] = useState(getSystemTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setMode(e.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const themeConfig = mode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm:
            mode === "dark"
              ? theme.darkAlgorithm
              : theme.defaultAlgorithm,
          ...themeConfig,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}