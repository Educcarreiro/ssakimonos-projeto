"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Badge, Card, EmptyState } from "@/components/ui";

interface OrderRow {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  customer: { name: string; email: string };
}

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

export default function OrdersPage() {
  const { apiFetch } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    apiFetch<OrderRow[]>("/orders").then(setOrders);
  }, [apiFetch]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-black">Pedidos</h1>
        <p className="text-[13.5px] text-text-secondary">Do aguardando pagamento ao entregue, sem zona cinzenta.</p>
      </div>

      {orders && orders.length === 0 && (
        <EmptyState title="Nenhum pedido ainda" description="Pedidos do storefront e vendas manuais aparecem aqui." />
      )}

      {orders && orders.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <Link href={`/pedidos/${o.id}`} className="font-mono text-[12px] font-semibold hover:text-accent">
                      #{o.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.customer.name}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {Number(o.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[o.status] ?? "neutral"}>{o.status.replaceAll("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
