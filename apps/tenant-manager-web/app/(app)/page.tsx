"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge, Card, KpiTile, Skeleton } from "@/components/ui";
import { IconCart, IconLayers } from "@/components/icons";

interface Overview {
  revenueToday: number;
  revenueMonth: number;
  ordersToday: number;
  ordersMonth: number;
  averageTicket: number;
  lowStockProducts: Array<{ variantId: string; sku: string; productName: string; stock: number; minStock: number }>;
  recentOrders: Array<{ id: string; customerName: string; total: number; status: string; createdAt: string }>;
}

const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_TONE: Record<string, "good" | "warn" | "crit" | "info" | "neutral"> = {
  PAGO: "good",
  ENTREGUE: "good",
  ENVIADO: "info",
  EM_SEPARACAO: "info",
  AGUARDANDO_PAGAMENTO: "warn",
  CANCELADO: "crit",
  DEVOLVIDO: "crit",
  REEMBOLSADO: "crit",
};

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="mb-2 h-7 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { apiFetch } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Overview>("/dashboard/overview").then(setData).catch((e) => setError(e.message));
  }, [apiFetch]);

  if (error) return <Card>Erro ao carregar dashboard: {error}</Card>;
  if (!data) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[27px] font-black tracking-tight">Visão geral</h1>
          <p className="text-[13.5px] text-text-secondary">Hoje, {new Date().toLocaleDateString("pt-BR")}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-glass px-3 py-1.5 text-[11px] font-bold text-good">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-good" />
          Ao vivo
        </div>
      </div>

      <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <KpiTile label="Receita hoje" value={currency(data.revenueToday)} />
        <KpiTile label="Receita no mês" value={currency(data.revenueMonth)} />
        <KpiTile label="Pedidos hoje" value={String(data.ordersToday)} />
        <KpiTile label="Pedidos no mês" value={String(data.ordersMonth)} />
        <KpiTile label="Ticket médio" value={currency(data.averageTicket)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="animate-fade-up">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-info-tint text-info">
              <IconCart className="h-[15px] w-[15px]" />
            </div>
            <h2 className="text-[13.5px] font-bold">Últimos pedidos</h2>
          </div>
          <div className="flex flex-col">
            {data.recentOrders.length === 0 && (
              <p className="py-6 text-center text-[13px] text-text-muted">Sem pedidos ainda.</p>
            )}
            {data.recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-[13px] transition-colors last:border-0 hover:bg-surface-2/50"
              >
                <span className="truncate text-text-primary">{o.customerName}</span>
                <span className="tabular-nums text-text-secondary">{currency(o.total)}</span>
                <Badge tone={STATUS_TONE[o.status] ?? "neutral"}>{o.status.replaceAll("_", " ")}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="animate-fade-up">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-warn-tint text-warn">
              <IconLayers className="h-[15px] w-[15px]" />
            </div>
            <h2 className="text-[13.5px] font-bold">Alertas de estoque</h2>
          </div>
          <div className="flex flex-col">
            {data.lowStockProducts.length === 0 && (
              <p className="py-6 text-center text-[13px] text-text-muted">Nenhum SKU abaixo do mínimo agora.</p>
            )}
            {data.lowStockProducts.map((p) => (
              <div
                key={p.variantId}
                className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-[13px] transition-colors last:border-0 hover:bg-surface-2/50"
              >
                <span className="truncate text-text-primary">
                  {p.productName} <span className="text-text-muted">({p.sku})</span>
                </span>
                <Badge tone={p.stock === 0 ? "crit" : "warn"}>
                  {p.stock} / mín. {p.minStock}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
