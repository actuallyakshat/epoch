import React, { createContext, useContext, useState, useEffect } from "react";
import { getTheme, getThemeNames } from "../themes";
import type { Theme } from "../types/theme";
import { useStorage } from "./StorageContext";

interface ThemeContextType {
  theme: Theme;
  themeName: string;
  setTheme: (name: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = "dark",
}) => {
  const { data, save } = useStorage();
  const [themeName, setThemeName] = useState(initialTheme);
  const theme = getTheme(themeName);

  // Load theme from storage when data is available
  useEffect(() => {
    if (data?.settings?.theme) {
      setThemeName(data.settings.theme);
    }
  }, [data?.settings?.theme]);

  const handleSetTheme = (name: string) => {
    if (getThemeNames().includes(name)) {
      setThemeName(name);

      // Save theme to storage
      if (data) {
        save({
          ...data,
          settings: {
            ...data.settings,
            theme: name,
          },
        });
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName,
        setTheme: handleSetTheme,
        availableThemes: getThemeNames(),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
