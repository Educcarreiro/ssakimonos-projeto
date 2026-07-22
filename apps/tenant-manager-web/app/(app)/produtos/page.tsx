"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Badge, Button, Card, EmptyState } from "@/components/ui";

interface ProductRow {
  id: string;
  name: string;
  price: string;
  isActive: boolean;
  brand: { name: string } | null;
  category: { name: string } | null;
  variants: Array<{ id: string; sku: string; stock: number; minStock: number }>;
}

export default function ProductsPage() {
  const { apiFetch } = useAuth();
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    apiFetch<ProductRow[]>(`/products${query}`).then(setProducts);
  }, [apiFetch, search]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-black">Produtos</h1>
          <p className="text-[13.5px] text-text-secondary">Catálogo, variações e estoque em um só lugar.</p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/produtos/importar-nota">
            <Button variant="secondary">Importar nota fiscal</Button>
          </Link>
          <Link href="/produtos/novo">
            <Button>Novo produto</Button>
          </Link>
        </div>
      </div>

      <input
        placeholder="Buscar por nome…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-72 rounded-s border border-border bg-surface px-3 py-2 text-[13.5px] outline-none focus:border-accent"
      />

      {products && products.length === 0 && (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Cadastre o primeiro produto manualmente ou importe a nota fiscal do fornecedor."
        />
      )}

      {products && products.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Variações</th>
                <th className="px-4 py-3">Estoque total</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                    <td className="px-4 py-3">
                      <Link href={`/produtos/${p.id}`} className="font-semibold text-text-primary hover:text-accent">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{p.brand?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.variants.length}</td>
                    <td className="px-4 py-3 tabular-nums text-text-secondary">{totalStock}</td>
                    <td className="px-4 py-3 tabular-nums text-text-secondary">
                      {Number(p.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={p.isActive ? "good" : "neutral"}>{p.isActive ? "Ativo" : "Inativo"}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
