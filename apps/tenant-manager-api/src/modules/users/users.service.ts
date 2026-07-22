import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

// Nunca devolver passwordHash / refreshTokenHash / twoFactorSecret pra fora da API.
const SAFE_SELECT = {
  id: true,
  tenantId: true,
  roleId: true,
  name: true,
  email: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true } },
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.client.user.findMany({
      where: { tenantId },
      select: SAFE_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.client.user.findFirst({
      where: { id, tenantId },
      select: SAFE_SELECT,
    });
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return user;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.prisma.client.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (existing) throw new ConflictException("Já existe um usuário com este e-mail");

    const passwordHash = await argon2.hash(dto.password);

    return this.prisma.client.user.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        roleId: dto.roleId,
        passwordHash,
      },
      select: SAFE_SELECT,
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.user.update({
      where: { id },
      data: { isActive: false, refreshTokenHash: null },
      select: SAFE_SELECT,
    });
  }
}
