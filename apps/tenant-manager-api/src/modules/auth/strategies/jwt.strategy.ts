import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../../prisma/prisma.service";
import { AuthenticatedUser } from "../../../common/decorators/current-user.decorator";

interface JwtPayload {
  sub: string;
  tenantId: string;
  roleId: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_ACCESS_SECRET") ?? "dev-secret",
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    if (!user || !user.isActive) throw new UnauthorizedException("Usuário inativo ou removido");

    return {
      id: user.id,
      tenantId: user.tenantId,
      roleId: user.roleId,
      email: user.email,
      permissions: user.role.permissions.map((rp) => rp.permission.code),
    };
  }
}
