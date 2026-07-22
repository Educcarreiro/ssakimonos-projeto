import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Client Prisma próprio da API (instanciado direto de @prisma/client, gerado
 * a partir do schema em packages/database — a mesma fonte da verdade usada
 * pelo worker de seed/migração, só que sem depender de runtime cross-package
 * de um .ts fora do rootDir do Nest).
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client = new PrismaClient();

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
