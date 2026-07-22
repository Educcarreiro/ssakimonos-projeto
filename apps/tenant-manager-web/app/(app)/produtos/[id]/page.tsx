"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Badge, Button, Card } from "@/components/ui";
import { ChipInput } from "@/components/chip-input";
import { BackLink } from "@/components/back-link";

interface Variant {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  model: string | null;
  material: string | null;
  stock: number;
  minStock: number;
  price: string | null;
  isActive: boolean;
}

interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  price: string;
  variants: Variant[];
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { apiFetch } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [skuPrefix, setSkuPrefix] = useState("");
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function load() {
    const data = await apiFetch<ProductDetail>(`/products/${id}`);
    setProduct(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setFeedback(null);
    try {
      const result = await apiFetch<{ createdCount: number; skippedCount: number }>(
        `/products/${id}/variants/generate`,
        { method: "POST", body: JSON.stringify({ colors, sizes, skuPrefix, defaultMinStock: 5 }) },
      );
      setFeedback(
        `${result.createdCount} variação(ões) criada(s)` +
          (result.skippedCount ? `, ${result.skippedCount} já existiam e foram ignoradas.` : "."),
      );
      await load();
    } catch (err) {
      setFeedback((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function updateStock(variantId: string, stock: number) {
    await apiFetch(`/products/${id}/variants`, {
      method: "POST",
      body: JSON.stringify({ sku: product!.variants.find((v) => v.id === variantId)!.sku, stock }),
    });
    await load();
  }

  if (!product) return <div className="text-text-muted">Carregando…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/produtos" label="Produtos" />
        <h1 className="text-[26px] font-black">{product.name}</h1>
        <p className="text-[13.5px] text-text-secondary">{product.description}</p>
      </div>

      <Card>
        <h2 className="mb-1 text-[15px] font-bold">Gerar matriz de variações</h2>
        <p className="mb-4 text-[12.8px] text-text-secondary">
          Preencha cor e/ou tamanho — o sistema combina tudo automaticamente e nunca duplica uma combinação já
          existente.
        </p>
        <form onSubmit={handleGenerate} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ChipInput label="Cores" values={colors} onChange={setColors} placeholder="Branco, Enter" />
            <ChipInput label="Tamanhos" values={sizes} onChange={setSizes} placeholder="A1, Enter" />
          </div>
          <div className="max-w-xs">
            <label className="mb-1 block text-[12px] font-semibold text-text-secondary">Prefixo do SKU</label>
            <input
              required
              value={skuPrefix}
              onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
              placeholder="KC"
              className="w-full rounded-s border border-border bg-bg px-3 py-2 text-[13.5px] outline-none focus:border-accent"
            />
          </div>
          {feedback && <p className="text-[12.5px] font-medium text-text-secondary">{feedback}</p>}
          <div>
            <Button type="submit" disabled={generating}>
              {generating ? "Gerando…" : "Gerar variações"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Cor</th>
              <th className="px-4 py-3">Tamanho</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Mínimo</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-[12px]">{v.sku}</td>
                <td className="px-4 py-3 text-text-secondary">{v.color ?? "—"}</td>
                <td className="px-4 py-3 text-text-secondary">{v.size ?? "—"}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    defaultValue={v.stock}
                    onBlur={(e) => updateStock(v.id, Number(e.target.value))}
                    className="w-20 rounded-s border border-border bg-bg px-2 py-1 text-[13px] tabular-nums outline-none focus:border-accent"
                  />
                </td>
                <td className="px-4 py-3 tabular-nums text-text-secondary">{v.minStock}</td>
                <td className="px-4 py-3">
                  <Badge tone={v.stock === 0 ? "crit" : v.stock <= v.minStock ? "warn" : "good"}>
                    {v.stock === 0 ? "Sem estoque" : v.stock <= v.minStock ? "Estoque baixo" : "Saudável"}
                  </Badge>
                </td>
              </tr>
            ))}
            {product.variants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Nenhuma variação ainda — gere a matriz acima.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
