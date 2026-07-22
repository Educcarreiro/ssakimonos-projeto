"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Badge, Card } from "@/components/ui";
import { BackLink } from "@/components/back-link";

interface OrderDetail {
  id: string;
  status: string;
  subtotal: string;
  discount: string;
  shipping: string;
  total: string;
  notes: string | null;
  internalNotes: string | null;
  customer: { name: string; email: string; phone: string | null };
  items: Array<{ id: string; quantity: number; unitPrice: string; variant: { sku: string; product: { name: string } } }>;
  payments: Array<{ gateway: string; method: string | null; status: string; amount: string }>;
  shipments: Array<{ carrier: string | null; trackingCode: string | null; status: string }>;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { apiFetch } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    apiFetch<OrderDetail>(`/orders/${id}`).then(setOrder);
  }, [apiFetch, id]);

  if (!order) return <div className="text-text-muted">Carregando…</div>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <BackLink href="/pedidos" label="Pedidos" />
          <h1 className="font-mono text-[22px] font-black">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-[13.5px] text-text-secondary">{order.customer.name} · {order.customer.email}</p>
        </div>
        <Badge tone="info">{order.status.replaceAll("_", " ")}</Badge>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Qtd.</th>
              <th className="px-4 py-3">Preço unit.</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{item.variant.product.name}</td>
                <td className="px-4 py-3 font-mono text-[12px]">{item.variant.sku}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3 tabular-nums">
                  {Number(item.unitPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-[11px] font-bold uppercase text-text-muted">Subtotal</div>
          <div className="text-[18px] font-black tabular-nums">
            {Number(order.subtotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </Card>
        <Card>
          <div className="text-[11px] font-bold uppercase text-text-muted">Frete</div>
          <div className="text-[18px] font-black tabular-nums">
            {Number(order.shipping).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </Card>
        <Card>
          <div className="text-[11px] font-bold uppercase text-text-muted">Total</div>
          <div className="text-[18px] font-black tabular-nums">
            {Number(order.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </Card>
      </div>

      {order.notes && (
        <Card>
          <div className="mb-1 text-[11px] font-bold uppercase text-text-muted">Observações do cliente</div>
          <p className="text-[13px] text-text-secondary">{order.notes}</p>
        </Card>
      )}
    </div>
  );
}
