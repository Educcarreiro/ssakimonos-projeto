"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge, Card } from "@/components/ui";

interface Integration {
  key: string;
  name: string;
  configured: boolean;
}

export default function IntegrationsPage() {
  const { apiFetch } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[] | null>(null);

  useEffect(() => {
    apiFetch<Integration[]>("/integrations").then(setIntegrations);
  }, [apiFetch]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-black">Integrações</h1>
        <p className="text-[13.5px] text-text-secondary">
          Status lido diretamente das variáveis de ambiente da API — preencha o .env para ativar cada conector.
        </p>
      </div>

      {integrations && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {integrations.map((i) => (
            <Card key={i.key} className="flex items-center justify-between">
              <span className="text-[13.5px] font-semibold">{i.name}</span>
              <Badge tone={i.configured ? "good" : "neutral"}>{i.configured ? "Conectado" : "Não configurado"}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
