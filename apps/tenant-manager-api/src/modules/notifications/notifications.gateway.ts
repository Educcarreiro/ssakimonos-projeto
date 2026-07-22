import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

/**
 * Um único gateway com salas por assunto ("orders", "stock", "dashboard") em
 * vez de namespaces separados — o front assina só a sala da tela aberta.
 * `emitToTenant` é chamado pelos outros módulos (ex.: InventoryService) para
 * propagar eventos em tempo real sem acoplamento direto.
 */
@WebSocketGateway({ cors: { origin: process.env.WEB_URL ?? "http://localhost:3000", credentials: true } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    client.emit("connected", { message: "Conectado ao canal de notificações do Tenant Manager" });
  }

  handleDisconnect() {
    /* nada a limpar — salas são efêmeras por conexão */
  }

  @SubscribeMessage("subscribe")
  handleSubscribe(client: Socket, room: string) {
    client.join(room);
  }

  emitToTenant(tenantId: string, event: string, payload: unknown) {
    this.server.to(tenantId).emit(event, payload);
  }
}
