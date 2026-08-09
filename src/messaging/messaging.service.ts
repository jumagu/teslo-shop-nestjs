import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import type { Socket } from 'socket.io';

import { User } from 'src/auth/entities';

@Injectable()
export class MessagingService {
  private _connectedClients: Record<string, { socket: Socket; user: User }> = {};

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  get connectedClientIds(): string[] {
    return Object.keys(this._connectedClients);
  }

  async registerClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new Error('User not found.');
    if (!user.isActive) throw new Error('The user is not active.');

    this.checkUserIsAlreadyConnected(user);

    this._connectedClients[client.id] = {
      socket: client,
      user,
    };
  }

  removeClient(clientId: string) {
    delete this._connectedClients[clientId];
  }

  getUserFullName(clientId: string) {
    return this._connectedClients[clientId].user.fullName;
  }

  private checkUserIsAlreadyConnected(user: User) {
    for (const clientId of Object.keys(this._connectedClients)) {
      const connectedClient = this._connectedClients[clientId];

      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
