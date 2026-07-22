"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Badge, Button, Card, EmptyState } from "@/components/ui";

interface UserRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: { name: string };
}

export default function UsersPage() {
  const { apiFetch, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    apiFetch<UserRow[]>("/users").then(setUsers);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDeactivate(id: string) {
    setBusyId(id);
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-black">Usuários</h1>
          <p className="text-[13.5px] text-text-secondary">RBAC granular — cada papel vê só o que precisa.</p>
        </div>
        <Link href="/config/usuarios/novo">
          <Button>Novo usuário</Button>
        </Link>
      </div>

      {users && users.length === 0 && (
        <EmptyState title="Nenhum usuário cadastrado" description="Convide o primeiro membro da equipe para acessar o painel." />
      )}

      {users && users.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase text-text-muted">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">{u.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone="info">{u.role.name.replaceAll("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.isActive ? "good" : "neutral"}>{u.isActive ? "Ativo" : "Inativo"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.isActive && u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeactivate(u.id)}
                        disabled={busyId === u.id}
                        className="text-[12.5px] font-semibold text-crit hover:underline disabled:opacity-50"
                      >
                        {busyId === u.id ? "Desativando…" : "Desativar"}
                      </button>
                    )}
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
