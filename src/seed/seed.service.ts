import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Product } from 'src/product/entities';
import { SEED_PRODUCTS } from './data/products.data';

@Injectable()
export class SeedService {
  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {}

  async execute() {
    await this.insertProducts();
    return 'SEED EXECUTED';
  }

  private async insertProducts() {
    try {
      // Delete all products first
      await this.productRepository.deleteAll();

      // Insert all products
      await this.productRepository.save(SEED_PRODUCTS);

      return true;
    } catch (error) {
      return false;
    }
  }
}
