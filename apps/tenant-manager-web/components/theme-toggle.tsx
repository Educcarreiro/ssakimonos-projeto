"use client";

import { useTheme } from "@/lib/use-theme";
import { IconMoon, IconSun } from "@/components/icons";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className={`flex w-full items-center gap-2 rounded-s border border-border py-1.5 text-left text-[12.5px] font-semibold text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-text-primary ${
        collapsed ? "justify-center px-0" : "px-3"
      }`}
    >
      {isDark ? <IconMoon className="h-[14px] w-[14px] shrink-0" /> : <IconSun className="h-[14px] w-[14px] shrink-0" />}
      {!collapsed && (isDark ? "Modo escuro" : "Modo claro")}
    </button>
  );
}
