import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema Interno — SSA Fight Wear",
  description: "Painel administrativo da SSA Fight Wear",
};

// Aplica o tema salvo antes da primeira pintura — evita flash de tema errado.
const THEME_INIT_SCRIPT = `
  try {
    var theme = localStorage.getItem("ssa-theme") || "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
