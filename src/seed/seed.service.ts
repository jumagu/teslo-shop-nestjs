import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import type { Repository } from 'typeorm';

import { SEED_USERS, SEED_PRODUCTS } from './data';

import { User } from 'src/auth/entities';
import { Product } from 'src/product/entities';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
  ) {}

  async execute() {
    try {
      // Delete all products and users first
      await this.productRepository.deleteAll();
      await this.userRepository.deleteAll();

      const user = await this.insertUsers();

      await this.insertProducts(user);

      return 'SEED EXECUTED';
    } catch (e) {
      throw new BadRequestException('Something went wrong. Please try again.');
    }
  }

  private async insertUsers() {
    const seedUsers = structuredClone(SEED_USERS);

    // Insert all users
    const users = await this.userRepository.save(seedUsers);

    return users[0];
  }

  private async insertProducts(user: User) {
    const seedProducts = structuredClone(SEED_PRODUCTS);

    // Set products user
    const products = seedProducts.map((product) => {
      product.user = user;
      return product;
    });

    // Insert all products
    await this.productRepository.save(products);
  }
}
