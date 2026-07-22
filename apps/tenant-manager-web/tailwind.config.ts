import type { Config } from "tailwindcss";

// Paleta da marca SSA Fight Wear — a mesma usada no blueprint de produto.
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-glass": "var(--surface-glass)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        "accent-tint": "var(--accent-tint)",
        "accent-ring": "var(--accent-ring)",
        good: "var(--good)",
        "good-tint": "var(--good-tint)",
        warn: "var(--warn)",
        "warn-tint": "var(--warn-tint)",
        crit: "var(--crit)",
        "crit-tint": "var(--crit-tint)",
        info: "var(--info)",
        "info-tint": "var(--info-tint)",
      },
      borderRadius: {
        s: "6px",
        m: "10px",
        l: "16px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
