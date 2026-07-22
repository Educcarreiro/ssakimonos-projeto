import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Marca uma rota como isenta do JwtAuthGuard global — usado em login, refresh
 * e nos endpoints públicos consumidos pelo storefront (read-only).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
