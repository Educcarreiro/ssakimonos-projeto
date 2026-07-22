"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge, Card } from "@/components/ui";

interface VariantRow {
  id: string;
  sku: string;
  stock: number;
  minStock: number;
  color: string | null;
  size: string | null;
  product: { name: string };
}

export default function InventoryPage() {
  const { apiFetch } = useAuth();
  const [variants, setVariants] = useState<VariantRow[] | null>(null);

  useEffect(() => {
    apiFetch<VariantRow[]>("/inventory/overview").then(setVariants);
  }, [apiFetch]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-black">Estoque</h1>
        <p className="text-[13.5px] text-text-secondary">
          Físico, reservado e disponível — ordenado do mais crítico para o mais saudável.
        </p>
      </div>

      {variants && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Cor / Tamanho</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Mínimo</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{v.product.name}</td>
                  <td className="px-4 py-3 font-mono text-[12px]">{v.sku}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {[v.color, v.size].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{v.stock}</td>
                  <td className="px-4 py-3 tabular-nums text-text-secondary">{v.minStock}</td>
                  <td className="px-4 py-3">
                    <Badge tone={v.stock === 0 ? "crit" : v.stock <= v.minStock ? "warn" : "good"}>
                      {v.stock === 0 ? "Sem estoque" : v.stock <= v.minStock ? "Baixo" : "Saudável"}
                    </Badge>
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
