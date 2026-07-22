import { SetMetadata } from "@nestjs/common";

export const PERMISSION_KEY = "permission";

/**
 * Declara qual permissão RBAC é exigida para acessar a rota, ex.:
 *   @RequirePermission("orders.refund")
 * Verificado pelo PermissionsGuard no backend — nunca só escondido no front.
 */
export const RequirePermission = (...permissions: string[]) => SetMetadata(PERMISSION_KEY, permissions);
