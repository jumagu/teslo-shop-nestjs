import { JwtService } from '@nestjs/jwt';
import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import type { Server, Socket } from 'socket.io';

import { ClientMessageDto } from './dto';
import { MessagingService } from './messaging.service';

import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true }) // This will be the default namespace
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server; // WSS = WebSocket Server

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagingService: MessagingService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.token as string;
    let jwtPayload: JwtPayload;

    try {
      jwtPayload = this.jwtService.verify<JwtPayload>(token);
      await this.messagingService.registerClient(client, jwtPayload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss.emit('clients-updated', this.messagingService.connectedClientIds);
  }

  handleDisconnect(client: Socket) {
    this.messagingService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagingService.connectedClientIds);
  }

  @SubscribeMessage('client-message-sent')
  handleClientMessage(client: Socket, payload: ClientMessageDto) {
    // ? Client emits the message to itself.
    // client.emit('client-message-received', {
    //   fullName: 'Juan',
    //   message: payload.message || 'no-message',
    // });

    // ? Emits to the rest of the clients, but not to itself.
    // client.broadcast.emit('client-message-received', {
    //   fullName: 'Juan',
    //   message: payload.message || 'no-message',
    // });

    // ? Emits the message to itself and to the rest of the clients.
    this.wss.emit('client-message-received', {
      fullName: this.messagingService.getUserFullName(client.id),
      message: payload.message || 'no-message',
    });
  }
}
