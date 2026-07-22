import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthenticatedUser } from "../decorators/current-user.decorator";

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/**
 * Grava em audit_logs toda escrita relevante: quem, quando, em qual módulo e o
 * que voltou como resposta. Nunca bloqueia a requisição — falha de auditoria
 * não pode derrubar uma venda.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    if (!MUTATING_METHODS.has(request.method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((result) => {
        const user: AuthenticatedUser | undefined = request.user;
        if (!user) return;

        const [, module] = request.route?.path?.split("/") ?? [];

        this.prisma.client.auditLog
          .create({
            data: {
              tenantId: user.tenantId,
              userId: user.id,
              action: `${module ?? "unknown"}.${request.method.toLowerCase()}`,
              module: module ?? "unknown",
              entityId: (result as { id?: string })?.id ?? request.params?.id ?? null,
              after: (result as object) ?? undefined,
              ip: request.ip,
            },
          })
          .catch(() => {
            /* auditoria nunca deve derrubar a requisição principal */
          });
      }),
    );
  }
}
