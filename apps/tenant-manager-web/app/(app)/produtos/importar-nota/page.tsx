"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Badge, Button, Card } from "@/components/ui";
import { BackLink } from "@/components/back-link";

interface Match {
  variantId: string;
  sku: string;
  productName: string;
  currentStock: number;
}

interface PreviewItem {
  code: string;
  barcode?: string;
  name: string;
  ncm?: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  match: Match | null;
  suggestedAction: "UPDATE_STOCK" | "CREATE_NEW";
}

interface PreviewResponse {
  supplierName?: string;
  supplierDocument?: string;
  sourceType: "XML" | "PDF";
  warnings: string[];
  items: PreviewItem[];
}

interface RowState extends PreviewItem {
  action: "CREATE" | "UPDATE" | "SKIP";
  price: number;
}

const currency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ImportInvoicePage() {
  const { apiFetch } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<"idle" | "uploading" | "review" | "confirming" | "done">("idle");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [rows, setRows] = useState<RowState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ createdCount: number; updatedCount: number; skippedCount: number } | null>(
    null,
  );

  async function handleFile(file: File) {
    setError(null);
    setStage("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiFetch<PreviewResponse>("/ai/invoice-import", { method: "POST", body: formData });
      setPreview(data);
      setRows(
        data.items.map((item) => ({
          ...item,
          action: item.match ? "UPDATE" : "CREATE",
          price: Math.round(item.unitValue * 2 * 100) / 100,
        })),
      );
      setStage("review");
    } catch (err) {
      setError((err as Error).message);
      setStage("idle");
    }
  }

  function updateRow(index: number, patch: Partial<RowState>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleConfirm() {
    setStage("confirming");
    setError(null);
    try {
      const result = await apiFetch<{ createdCount: number; updatedCount: number; skippedCount: number }>(
        "/ai/invoice-import/confirm",
        {
          method: "POST",
          body: JSON.stringify({
            supplierName: preview?.supplierName,
            items: rows.map((r) => ({
              action: r.action,
              variantId: r.match?.variantId,
              name: r.name,
              code: r.code,
              barcode: r.barcode,
              ncm: r.ncm,
              quantity: r.quantity,
              unitValue: r.unitValue,
              price: r.price,
            })),
          }),
        },
      );
      setSummary(result);
      setStage("done");
    } catch (err) {
      setError((err as Error).message);
      setStage("review");
    }
  }

  function reset() {
    setStage("idle");
    setPreview(null);
    setRows([]);
    setSummary(null);
    setError(null);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <BackLink href="/produtos" label="Produtos" />
        <h1 className="mb-1.5 text-[27px] font-black tracking-tight">Cadastro inteligente — nota fiscal</h1>
        <p className="text-[13.5px] text-text-secondary">
          Suba o XML ou o PDF da nota de compra do fornecedor. O sistema lê os itens, casa com o catálogo já
          existente e sugere o que atualizar ou criar — nada é gravado até você confirmar.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-crit bg-crit-tint px-4 py-3 text-[13px] font-medium text-crit">
          {error}
        </div>
      )}

      {stage === "idle" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`animate-fade-up flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-10 py-16 text-center transition-colors ${
            dragOver ? "border-accent bg-accent-tint" : "border-border-strong bg-surface-glass hover:border-accent"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-tint text-accent">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="m7 8 5-5 5 5" />
              <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
            </svg>
          </div>
          <div className="text-[15px] font-bold text-text-primary">Arraste a nota aqui ou clique para escolher</div>
          <div className="text-[12.5px] text-text-muted">Aceita XML de NF-e (recomendado) ou PDF</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,.pdf,application/xml,text/xml,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {stage === "uploading" && (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
          <p className="text-[13.5px] text-text-secondary">Lendo o arquivo e cruzando com o catálogo…</p>
        </Card>
      )}

      {stage === "review" && preview && (
        <>
          <Card className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <Badge tone="info">{preview.sourceType}</Badge>
              {preview.supplierName && <span className="font-semibold text-text-primary">{preview.supplierName}</span>}
              {preview.supplierDocument && <span className="text-text-muted">{preview.supplierDocument}</span>}
              <span className="text-text-muted">· {rows.length} item(ns) encontrado(s)</span>
            </div>
            {preview.warnings.map((w, i) => (
              <p key={i} className="mt-1 text-[12.5px] text-warn">
                ⚠ {w}
              </p>
            ))}
          </Card>

          <Card className="overflow-x-auto p-0">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Qtd.</th>
                  <th className="px-4 py-3">Custo unit.</th>
                  <th className="px-4 py-3">Correspondência</th>
                  <th className="px-4 py-3">Ação</th>
                  <th className="px-4 py-3">Preço de venda</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-text-primary">{row.name}</div>
                      <div className="text-[11px] text-text-muted">
                        {row.code && `cód. ${row.code}`} {row.barcode && `· ${row.barcode}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{row.quantity}</td>
                    <td className="px-4 py-3 tabular-nums">{currency(row.unitValue)}</td>
                    <td className="px-4 py-3">
                      {row.match ? (
                        <span className="text-text-secondary">
                          {row.match.productName}{" "}
                          <span className="text-text-muted">
                            ({row.match.sku}, estoque {row.match.currentStock})
                          </span>
                        </span>
                      ) : (
                        <span className="text-text-muted">Nenhuma — vira produto novo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.action}
                        onChange={(e) => updateRow(i, { action: e.target.value as RowState["action"] })}
                        className="rounded-s border border-border bg-bg px-2 py-1.5 text-[12.5px] outline-none focus:border-accent"
                      >
                        {row.match && <option value="UPDATE">Atualizar estoque</option>}
                        <option value="CREATE">Criar produto novo</option>
                        <option value="SKIP">Ignorar</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {row.action === "CREATE" ? (
                        <input
                          type="number"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => updateRow(i, { price: Number(e.target.value) })}
                          className="w-24 rounded-s border border-border bg-bg px-2 py-1.5 text-[12.5px] tabular-nums outline-none focus:border-accent"
                        />
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={reset}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>Confirmar importação</Button>
          </div>
        </>
      )}

      {stage === "confirming" && (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
          <p className="text-[13.5px] text-text-secondary">Gravando produtos e movimentações de estoque…</p>
        </Card>
      )}

      {stage === "done" && summary && (
        <Card className="animate-fade-up flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-good-tint text-good">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <p className="text-[16px] font-bold">Importação concluída</p>
          <p className="text-[13.5px] text-text-secondary">
            {summary.createdCount} produto(s) criado(s), {summary.updatedCount} atualizado(s)
            {summary.skippedCount > 0 && `, ${summary.skippedCount} ignorado(s)`}.
          </p>
          <div className="mt-2 flex gap-3">
            <Button variant="secondary" onClick={reset}>
              Importar outra nota
            </Button>
            <Link href="/produtos">
              <Button>Ver catálogo</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
