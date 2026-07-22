"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ParticleField } from "@/components/particle-field";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@ssafightwear.com.br");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050506] px-4">
      {/* fundo: glow radial de marca + partículas */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 520px at 50% 8%, rgba(255,51,70,0.16), transparent 60%), radial-gradient(700px 500px at 85% 90%, rgba(255,51,70,0.08), transparent 60%)",
        }}
      />
      <ParticleField />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,.6) 0 1px, transparent 1px 34px)",
        }}
      />

      {/* cartão */}
      <form
        onSubmit={handleSubmit}
        className="animate-fade-up relative w-full max-w-[400px] rounded-2xl border border-[#242127] bg-[#0f0e11]/80 p-9 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        {/* borda com brilho sutil */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-70"
          style={{
            padding: 1,
            background: "linear-gradient(135deg, rgba(255,51,70,.55), rgba(255,255,255,.08), rgba(255,51,70,.25))",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="SSA Fight Wear"
            width={108}
            height={69}
            priority
            unoptimized
            className="animate-logo-glow mb-4 h-auto w-[108px]"
          />
          <div
            className="text-[20px] font-black leading-none tracking-tight"
            style={{
              backgroundImage: "linear-gradient(180deg, #ffffff 0%, #d6d8dd 45%, #9a9ca4 58%, #f3f4f7 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            SISTEMA INTERNO
          </div>
          <div className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#ff5b6b]">
            SSA Fight Wear
          </div>
        </div>

        <label className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-[#918e96]">
          E-mail
        </label>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-[#242127] bg-[#0a090b] px-3.5 py-2.5 text-[13.5px] text-white outline-none transition focus:border-[#ff3346] focus:ring-2 focus:ring-[#ff3346]/20"
        />

        <label className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-[#918e96]">
          Senha
        </label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border border-[#242127] bg-[#0a090b] px-3.5 py-2.5 text-[13.5px] text-white outline-none transition focus:border-[#ff3346] focus:ring-2 focus:ring-[#ff3346]/20"
        />

        {error && (
          <p className="mb-4 rounded-lg border border-[#3a1319] bg-[#210b0f] px-3 py-2 text-[12.5px] font-medium text-[#ff8b96]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-b from-[#ff3346] to-[#c8102e] px-4 py-2.5 text-[13.5px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(255,51,70,0.6)] transition disabled:opacity-60"
        >
          <span
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            aria-hidden
          />
          <span className="relative">{loading ? "Entrando…" : "Entrar"}</span>
        </button>

        <p className="mt-5 text-center text-[11px] text-[#615e66]">
          Seed padrão: admin@ssafightwear.com.br / trocar123
        </p>
      </form>
    </div>
  );
}
