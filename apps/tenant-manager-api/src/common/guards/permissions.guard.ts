import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "../decorators/require-permission.decorator";
import { AuthenticatedUser } from "../decorators/current-user.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (!user) return false;

    const hasPermission = required.every((permission) => user.permissions.includes(permission));

    if (!hasPermission) {
      throw new ForbiddenException(
        `Seu papel não tem a permissão necessária: ${required.join(", ")}`,
      );
    }

    return true;
  }
}
