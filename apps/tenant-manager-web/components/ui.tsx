import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-m border border-border bg-surface-glass p-5 shadow-[0_1px_0_rgba(255,255,255,0.02)_inset,0_12px_28px_-16px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors duration-200 hover:border-border-strong ${className}`}
    >
      {children}
    </div>
  );
}

const BADGE_TONES: Record<string, string> = {
  good: "bg-good-tint text-good",
  warn: "bg-warn-tint text-warn",
  crit: "bg-crit-tint text-crit",
  info: "bg-info-tint text-info",
  neutral: "bg-surface-2 text-text-secondary border border-border",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof BADGE_TONES; children: ReactNode }) {
  const pulsing = tone === "good";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${BADGE_TONES[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${pulsing ? "animate-pulse-dot" : ""}`} />
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "destructive" }) {
  const base =
    "relative overflow-hidden rounded-s px-4 py-2 text-[13.5px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  const variants = {
    primary:
      "bg-gradient-to-b from-accent-strong to-accent text-white shadow-[0_8px_20px_-8px_rgba(255,51,70,0.55)] hover:shadow-[0_10px_26px_-6px_rgba(255,51,70,0.7)] hover:-translate-y-px",
    secondary: "border border-border bg-surface text-text-primary hover:bg-surface-2 hover:border-border-strong",
    destructive: "bg-gradient-to-b from-crit to-[#c8102e] text-white hover:brightness-110",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function KpiTile({
  label,
  value,
  delta,
  positive = true,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <Card className="group flex flex-col gap-1.5 transition-transform duration-200 hover:-translate-y-0.5">
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-text-muted">{label}</span>
      <span className="text-[23px] font-black tabular-nums tracking-tight text-text-primary">{value}</span>
      {delta && (
        <span className={`text-[11px] font-bold ${positive ? "text-good" : "text-crit"}`}>
          {positive ? "↑" : "↓"} {delta}
        </span>
      )}
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="flex flex-col items-center gap-1.5 py-14 text-center">
      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint text-accent">
        <span className="h-2 w-2 rounded-full bg-current" />
      </div>
      <span className="text-[14px] font-bold text-text-primary">{title}</span>
      <span className="max-w-sm text-[13px] text-text-secondary">{description}</span>
    </Card>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-s ${className}`} />;
}
