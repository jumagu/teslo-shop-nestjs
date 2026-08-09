import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { CommonModule } from './common/common.module';
import { ProductModule } from './product/product.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.STAGE === 'prod',
    }),
    CommonModule,
    ProductModule,
    AuthModule,
    FileModule,
    SeedModule,
    MessagingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
