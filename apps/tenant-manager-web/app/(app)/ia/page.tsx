"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button, Card } from "@/components/ui";

interface ChatEntry {
  question: string;
  answer: string;
}

export default function CopilotPage() {
  const { apiFetch } = useAuth();
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch<{ answer: string }>("/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      setHistory((h) => [...h, { question, answer: res.answer }]);
      setQuestion("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-black">Copiloto IA</h1>
        <p className="text-[13.5px] text-text-secondary">
          Pergunte sobre o negócio — "quais produtos têm estoque mas zero venda em 60 dias?".
        </p>
      </div>

      <Card>
        <form onSubmit={ask} className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Faça uma pergunta…"
            className="flex-1 rounded-s border border-border bg-bg px-3 py-2 text-[13.5px] outline-none focus:border-accent"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "…" : "Perguntar"}
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {history.map((entry, i) => (
          <Card key={i}>
            <p className="mb-2 text-[13px] font-semibold">{entry.question}</p>
            <p className="text-[13px] text-text-secondary">{entry.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
