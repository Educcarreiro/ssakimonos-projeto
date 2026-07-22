import Link from "next/link";
import { IconArrowLeft } from "@/components/icons";

/** Link de "voltar" consistente no topo de toda tela que não é uma lista raiz. */
export function BackLink({ href, label = "Voltar" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-text-muted transition-colors hover:text-text-primary"
    >
      <IconArrowLeft className="h-[14px] w-[14px]" />
      {label}
    </Link>
  );
}
