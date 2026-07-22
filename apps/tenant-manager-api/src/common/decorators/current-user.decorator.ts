import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  roleId: string;
  email: string;
  permissions: string[];
}

/**
 * Extrai o usuário autenticado (populado pelo JwtStrategy) direto no handler:
 *   findAll(@CurrentUser() user: AuthenticatedUser)
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
