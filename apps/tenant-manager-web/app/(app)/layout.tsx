"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-app-radial">
        <div className="flex items-center gap-2.5 text-[13px] font-medium text-text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
          <span className="ml-1.5">Carregando painel…</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex bg-app-radial">
      <Sidebar />
      <main className="animate-fade-in max-h-screen flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
