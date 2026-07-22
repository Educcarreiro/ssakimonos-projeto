"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button, Card } from "@/components/ui";
import { IconUserCog } from "@/components/icons";
import { BackLink } from "@/components/back-link";

interface Role {
  id: string;
  name: string;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER_ADMIN: "Owner / Admin",
  FINANCEIRO: "Financeiro",
  ESTOQUE: "Estoque",
  ATENDIMENTO: "Atendimento",
  MARKETING: "Marketing",
  AUDITOR: "Auditor (só leitura)",
};

export default function NewUserPage() {
  const { apiFetch } = useAuth();
  const router = useRouter();

  const [roles, setRoles] = useState<Role[] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Role[]>("/rbac/roles").then((data) => {
      setRoles(data);
      if (data.length > 0) setRoleId(data[0].id);
    });
  }, [apiFetch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password, roleId }),
      });
      router.push("/config/usuarios");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-6">
      <div className="animate-fade-up w-full max-w-lg">
        <BackLink href="/config/usuarios" label="Usuários" />
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-tint text-accent">
            <IconUserCog className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-[32px] font-black tracking-tight">Novo usuário</h1>
          <p className="mx-auto max-w-sm text-[14.5px] leading-relaxed text-text-secondary">
            Cada papel já vem com um conjunto de permissões pronto — dá pra ajustar módulo a módulo depois.
          </p>
        </div>

        <Card className="p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                Nome
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Camila Duarte"
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                E-mail
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="camila@ssafightwear.com.br"
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                Senha provisória
              </label>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 8 caracteres"
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                Papel
              </label>
              <select
                required
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-ring"
              >
                {!roles && <option>Carregando…</option>}
                {roles?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {ROLE_LABELS[r.name] ?? r.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-lg border border-crit bg-crit-tint px-3.5 py-2.5 text-[13px] font-medium text-crit">
                {error}
              </p>
            )}

            <Button type="submit" disabled={saving || !roleId} className="mt-2 py-3 text-[14.5px]">
              {saving ? "Criando…" : "Criar usuário"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
