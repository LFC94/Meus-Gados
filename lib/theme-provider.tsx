import { StatusBar } from "expo-status-bar";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";

import { SchemeColors, type ColorScheme } from "@/constants/theme";
import { preferencesStorage, type Theme } from "@/lib/preferences";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);
  const [themePreference, setThemePreference] = useState<Theme>("system");
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferência de tema ao montar
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const theme = await preferencesStorage.getTheme();
        setThemePreference(theme);
      } catch (error) {
        console.error("Error loading theme preference:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  // Determinar o esquema de cores baseado na preferência
  useEffect(() => {
    if (isLoading) return;

    let scheme: ColorScheme = systemScheme;
    if (themePreference === "dark") {
      scheme = "dark";
    } else if (themePreference === "light") {
      scheme = "light";
    }
    // Se for "system", usa o systemScheme já definido

    setColorSchemeState(scheme);
  }, [themePreference, systemScheme, isLoading]);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value as string);
      });
    }
  }, []);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setColorSchemeState(scheme);
      applyScheme(scheme);
    },
    [applyScheme]
  );

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemePreference(newTheme);
    try {
      await preferencesStorage.updateTheme(newTheme);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  }, []);

  useEffect(() => {
    applyScheme(colorScheme);
  }, [applyScheme, colorScheme]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme]
  );

  const value = useMemo(
    () => ({
      theme: themePreference,
      setTheme,
      colorScheme,
      setColorScheme,
    }),
    [themePreference, setTheme, colorScheme, setColorScheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
