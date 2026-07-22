"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge, Card, EmptyState, KpiTile } from "@/components/ui";

interface Entry {
  id: string;
  type: "RECEITA" | "DESPESA";
  category: string;
  description: string | null;
  amount: string;
  dueDate: string;
  status: string;
}

interface Forecast {
  projectedBalance: number;
}

export default function FinancePage() {
  const { apiFetch } = useAuth();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);

  useEffect(() => {
    apiFetch<Entry[]>("/finance/entries").then(setEntries);
    apiFetch<Forecast>("/finance/cash-flow-forecast").then(setForecast);
  }, [apiFetch]);

  const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-black">Financeiro</h1>
        <p className="text-[13.5px] text-text-secondary">Fluxo de caixa é o pulso do negócio — sem planilha paralela.</p>
      </div>

      {forecast && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiTile label="Saldo projetado (30 dias)" value={currency(forecast.projectedBalance)} />
        </div>
      )}

      {entries && entries.length === 0 && (
        <EmptyState title="Nenhum lançamento" description="Receitas e despesas lançadas manualmente ou geradas por venda aparecem aqui." />
      )}

      {entries && entries.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{e.category}</td>
                  <td className="px-4 py-3">
                    <Badge tone={e.type === "RECEITA" ? "good" : "crit"}>{e.type}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{currency(Number(e.amount))}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(e.dueDate).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <Badge tone={e.status === "PAGO" ? "good" : "warn"}>{e.status}</Badge>
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
