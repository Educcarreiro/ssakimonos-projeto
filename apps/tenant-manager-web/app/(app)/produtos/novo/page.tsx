"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button, Card } from "@/components/ui";
import { IconBox } from "@/components/icons";
import { BackLink } from "@/components/back-link";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewProductPage() {
  const { apiFetch } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const product = await apiFetch<{ id: string }>("/products", {
        method: "POST",
        body: JSON.stringify({ name, slug: slugify(name), price: Number(price), description }),
      });
      router.push(`/produtos/${product.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-6">
      <div className="animate-fade-up w-full max-w-2xl">
        <BackLink href="/produtos" label="Produtos" />
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-tint text-accent">
            <IconBox className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-[32px] font-black tracking-tight">Novo produto</h1>
          <p className="mx-auto max-w-md text-[14.5px] leading-relaxed text-text-secondary">
            Cadastre o produto-pai primeiro — as variações de cor, tamanho, modelo e material são geradas na
            tela seguinte, todas dentro do mesmo produto.
          </p>
        </div>

        <Card className="p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr,1fr]">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  Nome
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kimono Competidor"
                  className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-ring"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  Preço base (R$)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="549.00"
                  className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-[15px] tabular-nums outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-ring"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Kimono de competição em brim reforçado, corte atlético…"
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-[15px] leading-relaxed outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-ring"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-crit bg-crit-tint px-3.5 py-2.5 text-[13px] font-medium text-crit">
                {error}
              </p>
            )}

            <Button type="submit" disabled={saving} className="mt-2 py-3 text-[14.5px]">
              {saving ? "Salvando…" : "Salvar e continuar"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
