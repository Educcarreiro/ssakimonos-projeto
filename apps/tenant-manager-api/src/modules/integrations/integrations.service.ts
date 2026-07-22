import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface IntegrationStatus {
  key: string;
  name: string;
  configured: boolean;
}

@Injectable()
export class IntegrationsService {
  constructor(private readonly config: ConfigService) {}

  list(): IntegrationStatus[] {
    const check = (key: string) => Boolean(this.config.get<string>(key));

    return [
      { key: "MERCADO_PAGO_ACCESS_TOKEN", name: "Mercado Pago", configured: check("MERCADO_PAGO_ACCESS_TOKEN") },
      { key: "STRIPE_SECRET_KEY", name: "Stripe", configured: check("STRIPE_SECRET_KEY") },
      { key: "MELHOR_ENVIO_TOKEN", name: "Melhor Envio", configured: check("MELHOR_ENVIO_TOKEN") },
      { key: "RESEND_API_KEY", name: "Resend (e-mail)", configured: check("RESEND_API_KEY") },
      { key: "OPENAI_API_KEY", name: "OpenAI", configured: check("OPENAI_API_KEY") },
      { key: "ANTHROPIC_API_KEY", name: "Claude (Anthropic)", configured: check("ANTHROPIC_API_KEY") },
    ];
  }
}
