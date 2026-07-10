import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductImage } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}
