"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge, Card, EmptyState } from "@/components/ui";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: string;
  isActive: boolean;
  usedCount: number;
  usageLimit: number | null;
}

export default function MarketingPage() {
  const { apiFetch } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);

  useEffect(() => {
    apiFetch<Coupon[]>("/marketing/coupons").then(setCoupons);
  }, [apiFetch]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-black">Marketing</h1>
        <p className="text-[13.5px] text-text-secondary">Cupons, promoções e campanhas — publicados sem depender de deploy.</p>
      </div>

      {coupons && coupons.length === 0 && (
        <EmptyState title="Nenhum cupom criado" description="Crie o primeiro cupom via API para vê-lo listado aqui." />
      )}

      {coupons && coupons.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Uso</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.type.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 tabular-nums">{c.value}</td>
                  <td className="px-4 py-3 tabular-nums text-text-secondary">
                    {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={c.isActive ? "good" : "neutral"}>{c.isActive ? "Ativo" : "Inativo"}</Badge>
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
