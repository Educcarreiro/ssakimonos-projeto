"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge, Card, EmptyState } from "@/components/ui";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isVip: boolean;
  createdAt: string;
}

export default function CustomersPage() {
  const { apiFetch } = useAuth();
  const [customers, setCustomers] = useState<CustomerRow[] | null>(null);

  useEffect(() => {
    apiFetch<CustomerRow[]>("/customers").then(setCustomers);
  }, [apiFetch]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-black">Clientes</h1>
        <p className="text-[13.5px] text-text-secondary">Histórico, segmentação e relação — não só um endereço de entrega.</p>
      </div>

      {customers && customers.length === 0 && (
        <EmptyState title="Nenhum cliente ainda" description="Clientes do storefront e cadastros manuais aparecem aqui." />
      )}

      {customers && customers.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Segmento</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">{c.isVip && <Badge tone="warn">VIP</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
