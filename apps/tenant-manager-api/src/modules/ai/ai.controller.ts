import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AiService } from "./ai.service";
import { ConfirmInvoiceDto } from "./dto/confirm-invoice.dto";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { CurrentUser, AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("invoice-import")
  @RequirePermission("products.create")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 15 * 1024 * 1024 } }))
  importInvoice(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("Envie um arquivo XML ou PDF no campo 'file'.");
    return this.aiService.importInvoice(user.tenantId, file.buffer, file.originalname, file.mimetype);
  }

  @Post("invoice-import/confirm")
  @RequirePermission("products.create")
  confirmInvoiceImport(@CurrentUser() user: AuthenticatedUser, @Body() dto: ConfirmInvoiceDto) {
    return this.aiService.confirmInvoiceImport(user.tenantId, dto);
  }

  @Post("copilot/chat")
  @RequirePermission("dashboard.view")
  copilotChat(@Body() body: { question: string }) {
    return this.aiService.copilotChat(body.question);
  }
}
