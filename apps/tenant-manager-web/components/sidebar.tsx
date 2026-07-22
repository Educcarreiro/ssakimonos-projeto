"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  IconBarChart,
  IconBox,
  IconCart,
  IconChevronLeft,
  IconFileText,
  IconGrid,
  IconLayers,
  IconLogout,
  IconMegaphone,
  IconPlug,
  IconSparkles,
  IconUserCog,
  IconUsers,
  IconWallet,
} from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/lib/use-theme";

const NAV_GROUPS = [
  {
    label: "Produto",
    items: [
      { href: "/", label: "Dashboard", icon: IconGrid },
      { href: "/produtos", label: "Produtos", icon: IconBox },
      { href: "/estoque", label: "Estoque", icon: IconLayers },
    ],
  },
  {
    label: "Comercial",
    items: [
      { href: "/pedidos", label: "Pedidos", icon: IconCart },
      { href: "/clientes", label: "Clientes", icon: IconUsers },
      { href: "/marketing", label: "Marketing", icon: IconMegaphone },
    ],
  },
  {
    label: "Retaguarda",
    items: [
      { href: "/financeiro", label: "Financeiro", icon: IconWallet },
      { href: "/fiscal", label: "Fiscal", icon: IconFileText },
      { href: "/relatorios", label: "Relatórios", icon: IconBarChart },
    ],
  },
  {
    label: "Governança",
    items: [
      { href: "/config/usuarios", label: "Usuários", icon: IconUserCog },
      { href: "/config/integracoes", label: "Integrações", icon: IconPlug },
      { href: "/ia", label: "Copiloto IA", icon: IconSparkles },
    ],
  },
];

const STORAGE_KEY = "ssa-sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    setMounted(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col justify-between overflow-y-auto border-r border-border bg-surface-glass py-5 backdrop-blur-xl transition-[width] duration-200 ${
        collapsed ? "w-[68px] px-2" : "w-64 px-3"
      } ${mounted ? "" : "duration-0"}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
        style={{ background: "radial-gradient(220px 140px at 30% 0%, rgba(255,51,70,0.12), transparent 70%)" }}
      />

      <div className="relative">
        <div
          className={`mb-8 flex items-center px-2 ${
            collapsed ? "flex-col gap-2 px-0" : "justify-between gap-2"
          }`}
        >
          <div className={`flex min-w-0 items-center gap-2.5 ${collapsed ? "flex-col" : ""}`}>
            {theme === "light" ? (
              <div className="flex shrink-0 items-center justify-center rounded-md bg-[#0b0a0c] px-1.5 py-1">
                <Image src="/logo.png" alt="SSA Fight Wear" width={32} height={20} unoptimized className="h-auto w-8" />
              </div>
            ) : (
              <Image
                src="/logo.png"
                alt="SSA Fight Wear"
                width={40}
                height={25}
                unoptimized
                className="h-auto w-10 shrink-0 drop-shadow-[0_2px_8px_rgba(255,51,70,0.45)]"
              />
            )}
            {!collapsed && (
              <div className="min-w-0 overflow-hidden whitespace-nowrap">
                <div className="text-[14.5px] font-black leading-tight tracking-tight text-text-primary">
                  Sistema Interno
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-strong">
                  SSA Fight Wear
                </div>
              </div>
            )}
          </div>

          {/* botão de recolher/expandir — sempre no fluxo normal, nunca posicionado fora da caixa */}
          <button
            type="button"
            onClick={toggle}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-2 text-text-secondary shadow-sm transition-colors hover:border-accent hover:text-accent"
          >
            <IconChevronLeft className={`h-4 w-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex flex-col gap-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted">
                  {group.label}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-2.5 rounded-s py-[7px] text-[13px] font-medium transition-colors duration-150 ${
                        collapsed ? "justify-center px-0" : "px-2.5"
                      } ${
                        active
                          ? "bg-surface-2 text-text-primary"
                          : "text-text-secondary hover:bg-surface-2/60 hover:text-text-primary"
                      }`}
                    >
                      {active && (
                        <span
                          className={`absolute top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_rgba(255,51,70,0.7)] ${collapsed ? "left-0" : "left-0"}`}
                        />
                      )}
                      <Icon
                        className={`h-[16px] w-[16px] shrink-0 transition-colors ${
                          active ? "text-accent-strong" : "text-text-muted group-hover:text-text-secondary"
                        }`}
                      />
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="relative border-t border-border pt-3.5">
        <div className={`mb-2.5 flex items-center gap-2.5 px-1 ${collapsed ? "justify-center px-0" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-strong to-accent text-[11px] font-black text-white">
            {initials}
          </div>
          {!collapsed && <div className="truncate text-[12px] font-medium text-text-secondary">{user?.email}</div>}
        </div>
        <div className="mb-1.5">
          <ThemeToggle collapsed={collapsed} />
        </div>
        <button
          onClick={() => logout()}
          title={collapsed ? "Sair" : undefined}
          className={`flex w-full items-center gap-2 rounded-s border border-border py-1.5 text-left text-[12.5px] font-semibold text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-text-primary ${
            collapsed ? "justify-center px-0" : "px-3"
          }`}
        >
          <IconLogout className="h-[14px] w-[14px] shrink-0" />
          {!collapsed && "Sair"}
        </button>
      </div>
    </aside>
  );
}
