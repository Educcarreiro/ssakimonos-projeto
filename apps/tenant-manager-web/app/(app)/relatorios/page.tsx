"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge, Button, Card } from "@/components/ui";

interface Row {
  sku: string;
  productName: string;
  category: string | null;
  color: string | null;
  size: string | null;
  stock: number;
  minStock: number;
  sold30d: number;
  coverageDays: number | null;
  status: "SEM_ESTOQUE" | "ABAIXO_DO_MINIMO" | "RUPTURA_IMINENTE" | "SAUDAVEL";
}

const STATUS_LABEL: Record<Row["status"], { label: string; tone: "good" | "warn" | "crit" }> = {
  SEM_ESTOQUE: { label: "Sem estoque", tone: "crit" },
  ABAIXO_DO_MINIMO: { label: "Abaixo do mínimo", tone: "crit" },
  RUPTURA_IMINENTE: { label: "Ruptura em breve", tone: "warn" },
  SAUDAVEL: { label: "Saudável", tone: "good" },
};

type ExportKind = "vendas" | "estoque" | "completo";

const EXPORT_CONFIG: Record<ExportKind, { title: string; head: string[]; row: (r: Row) => (string | number)[] }> = {
  vendas: {
    title: "Relatório de vendas — últimos 30 dias",
    head: ["Produto", "SKU", "Vendido (30d)"],
    row: (r) => [`${r.productName} ${[r.color, r.size].filter(Boolean).join("/")}`.trim(), r.sku, r.sold30d],
  },
  estoque: {
    title: "Relatório de estoque",
    head: ["Produto", "SKU", "Estoque", "Mínimo", "Status"],
    row: (r) => [
      `${r.productName} ${[r.color, r.size].filter(Boolean).join("/")}`.trim(),
      r.sku,
      r.stock,
      r.minStock,
      STATUS_LABEL[r.status].label,
    ],
  },
  completo: {
    title: "Relatório de vendas × estoque",
    head: ["Produto", "SKU", "Vendido (30d)", "Estoque", "Cobertura", "Status"],
    row: (r) => [
      `${r.productName} ${[r.color, r.size].filter(Boolean).join("/")}`.trim(),
      r.sku,
      r.sold30d,
      r.stock,
      r.coverageDays !== null ? `${r.coverageDays} dias` : "—",
      STATUS_LABEL[r.status].label,
    ],
  },
};

export default function ReportsPage() {
  const { apiFetch } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [exporting, setExporting] = useState<ExportKind | null>(null);

  useEffect(() => {
    apiFetch<Row[]>("/reports/sales-vs-stock").then(setRows);
  }, [apiFetch]);

  async function exportPdf(kind: ExportKind) {
    if (!rows) return;
    setExporting(kind);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const config = EXPORT_CONFIG[kind];

      const doc = new jsPDF();
      doc.setFontSize(15);
      doc.setTextColor(179, 13, 36);
      doc.text("SSA Fight Wear", 14, 17);
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(config.title, 14, 25);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 31);

      autoTable(doc, {
        startY: 37,
        head: [config.head],
        body: rows.map(config.row),
        headStyles: { fillColor: [179, 13, 36] },
        styles: { fontSize: 8.5 },
      });

      doc.save(`ssa-relatorio-${kind}-${Date.now()}.pdf`);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-black">Relatório: vendas × estoque</h1>
          <p className="text-[13.5px] text-text-secondary">
            Por SKU: quanto vendeu nos últimos 30 dias, quanto tem hoje e para quantos dias esse estoque cobre no
            ritmo atual — o que tem, o que não tem e o que vai faltar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={!rows || exporting !== null} onClick={() => exportPdf("vendas")}>
            {exporting === "vendas" ? "Gerando…" : "Exportar vendas (PDF)"}
          </Button>
          <Button variant="secondary" disabled={!rows || exporting !== null} onClick={() => exportPdf("estoque")}>
            {exporting === "estoque" ? "Gerando…" : "Exportar estoque (PDF)"}
          </Button>
          <Button disabled={!rows || exporting !== null} onClick={() => exportPdf("completo")}>
            {exporting === "completo" ? "Gerando…" : "Exportar completo (PDF)"}
          </Button>
        </div>
      </div>

      {rows && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Vendido (30d)</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Cobertura</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sku} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {r.productName}{" "}
                    <span className="text-text-muted">{[r.color, r.size].filter(Boolean).join(" / ")}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px]">{r.sku}</td>
                  <td className="px-4 py-3 tabular-nums">{r.sold30d}</td>
                  <td className="px-4 py-3 tabular-nums">{r.stock}</td>
                  <td className="px-4 py-3 tabular-nums text-text-secondary">
                    {r.coverageDays !== null ? `${r.coverageDays} dias` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_LABEL[r.status].tone}>{STATUS_LABEL[r.status].label}</Badge>
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
