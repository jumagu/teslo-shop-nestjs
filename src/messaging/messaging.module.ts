import { Module } from '@nestjs/common';

import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';

import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [MessagingGateway, MessagingService],
})
export class MessagingModule {}
