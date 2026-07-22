import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { RbacModule } from "./modules/rbac/rbac.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { ProductsModule } from "./modules/products/products.module";
import { TaxonomiesModule } from "./modules/taxonomies/taxonomies.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { FiscalModule } from "./modules/fiscal/fiscal.module";
import { MarketingModule } from "./modules/marketing/marketing.module";
import { AiModule } from "./modules/ai/ai.module";
import { IntegrationsModule } from "./modules/integrations/integrations.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AuditModule } from "./modules/audit/audit.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { AuditInterceptor } from "./common/interceptors/audit.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Governança
    AuthModule,
    UsersModule,
    RbacModule,
    AuditModule,
    // Produto
    DashboardModule,
    ProductsModule,
    TaxonomiesModule,
    InventoryModule,
    // Comercial
    OrdersModule,
    CustomersModule,
    MarketingModule,
    // Retaguarda
    FinanceModule,
    FiscalModule,
    ReportsModule,
    // Plataforma
    AiModule,
    IntegrationsModule,
    NotificationsModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
})
export class AppModule {}
