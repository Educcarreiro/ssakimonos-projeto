"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge, Card, EmptyState } from "@/components/ui";

interface Invoice {
  id: string;
  type: string;
  status: string;
  number: string | null;
}

export default function FiscalPage() {
  const { apiFetch } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);

  useEffect(() => {
    apiFetch<Invoice[]>("/fiscal/invoices").then(setInvoices);
  }, [apiFetch]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-black">Fiscal</h1>
        <p className="text-[13.5px] text-text-secondary">
          NF-e e NFC-e. Este esqueleto modela o fluxo — plugue um provedor (Focus NF-e, eNotas) e o certificado A1
          em cofre de segredos para emissão real.
        </p>
      </div>

      {invoices && invoices.length === 0 && (
        <EmptyState title="Nenhuma nota emitida" description="Notas ficam vinculadas ao pedido de origem." />
      )}

      {invoices && invoices.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{inv.type}</td>
                  <td className="px-4 py-3">{inv.number ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone="info">{inv.status}</Badge>
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
