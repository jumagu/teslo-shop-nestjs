import {
  Logger,
  Injectable,
  HttpException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { CreateProductDto, FindAllProductsDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('ProductService', { timestamp: true });

  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleTypeormError(error);
    }
  }

  async findAll(findAllProductsDto: FindAllProductsDto) {
    const { limit = 10, offset = 0 } = findAllProductsDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
    });

    return products;
  }

  async findOne(term: string) {
    // const product = await this.productRepository.findOne({
    //   where: isUUID(term) ? { id: term } : { slug: term },
    // });

    let product: Product | null;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('LOWER(title)=:title or slug=:slug', { title: term.toLowerCase(), slug: term })
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with id, name or slug '${term}' not found.`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const updatedProduct = await this.productRepository.preload({
        id,
        ...updateProductDto,
      });

      if (!updatedProduct) {
        throw new NotFoundException(`Product with id '${id}' not found.`);
      }

      await this.productRepository.save(updatedProduct);

      return updatedProduct;
    } catch (error) {
      this.handleTypeormError(error);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.productRepository.delete({ id });

      if (result.affected === 0) {
        throw new NotFoundException(`Product with id '${id}' not found.`);
      }

      return {
        ok: true,
        message: 'Product successfully deleted.',
      };
    } catch (error) {
      this.handleTypeormError(error);
    }
  }

  private handleTypeormError(error: any): never {
    // ? Duplicate key error
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error instanceof HttpException) throw error;

    this.logger.error(error);
    throw new InternalServerErrorException('Operation could not be completed. Please contact the administrator.');
  }
}
