import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __ssaPrisma__: PrismaClient | undefined;
}

// Singleton — evita esgotar conexões em hot-reload de desenvolvimento.
export const prisma = global.__ssaPrisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__ssaPrisma__ = prisma;
}

export * from "@prisma/client";
