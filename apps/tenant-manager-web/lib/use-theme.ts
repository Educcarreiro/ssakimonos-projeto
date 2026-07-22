"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";
const STORAGE_KEY = "ssa-theme";

/**
 * O painel roda em dark por padrão (identidade da marca) — light é opt-in.
 * O login nunca muda: só o app depois de autenticado respeita essa escolha.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // Lê o que o script inline (no <head>) já aplicou, pra não haver flash/descompasso.
    const applied = document.documentElement.getAttribute("data-theme") as Theme | null;
    setThemeState(applied ?? "dark");
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}
