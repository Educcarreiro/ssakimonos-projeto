import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { PrismaService } from "../../prisma/prisma.service";

interface JwtPayload {
  sub: string; // userId
  tenantId: string;
  roleId: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateCredentials(email: string, password: string) {
    const user = await this.prisma.client.user.findFirst({
      where: { email, isActive: true },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    if (!user) throw new UnauthorizedException("E-mail ou senha inválidos");

    const passwordMatches = await argon2.verify(user.passwordHash, password);
    if (!passwordMatches) throw new UnauthorizedException("E-mail ou senha inválidos");

    return user;
  }

  private buildPayload(user: { id: string; tenantId: string; roleId: string; email: string }): JwtPayload {
    return { sub: user.id, tenantId: user.tenantId, roleId: user.roleId, email: user.email };
  }

  private async issueTokens(user: { id: string; tenantId: string; roleId: string; email: string }) {
    const payload = this.buildPayload(user);

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m",
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d",
    });

    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.prisma.client.user.update({
      where: { id: user.id },
      data: { refreshTokenHash, lastLoginAt: new Date() },
    });

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.validateCredentials(email, password);
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Sessão expirada, faça login novamente");
    }

    const user = await this.prisma.client.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash) throw new UnauthorizedException("Sessão inválida");

    const matches = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!matches) throw new UnauthorizedException("Sessão inválida");

    // Rotação: todo refresh usado invalida o anterior.
    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}
